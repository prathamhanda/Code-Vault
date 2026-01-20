require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// IMPORT MODELS
const Team = require('./models/Team');
const Level = require('./models/Level');

const app = express();
app.use(express.json());

if (process.env.CORS_ORIGIN) {
    const allowedOrigins = new Set(
        process.env.CORS_ORIGIN.split(',')
            .map(s => s.trim())
            .filter(Boolean)
    );

    app.use(
        cors({
            origin(origin, callback) {
                if (!origin) return callback(null, true);
                return callback(null, allowedOrigins.has(origin));
            }
        })
    );
} else {
    app.use(cors());
}

app.get(['/health', '/healthz'], (_req, res) => {
    res.status(200).json({ ok: true });
});

app.get('/', (_req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Code Vault API is running. Use /health to validate.'
    });
});

// DATABASE CONNECTION
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code-vault';

if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is required in production.');
    process.exit(1);
} 

mongoose
    .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ DB Error:', err);
        process.exit(1);
    });

// --- GLOBAL STATE ---
let IS_EVENT_ACTIVE = true;
let IS_GAME_STARTED = false;

const ADMIN_ID = (process.env.ADMIN_ID || 'yuvraj').toLowerCase();
const isAdminRequest = (req) => {
    const candidate = req.body?.adminId || req.headers['x-admin-id'];
    if (!candidate) return false;
    return String(candidate).trim().toLowerCase() === ADMIN_ID;
};

// --- ROUTES ---

// 1. TEAM LOGIN
app.post('/api/login', async (req, res) => {
    const { teamId } = req.body;
    if (!IS_EVENT_ACTIVE) return res.status(403).json({ message: 'EVENT CLOSED' });

    const sanitizedId = teamId.trim().toLowerCase().replace(/\s+/g, '-');
    const team = await Team.findOne({ teamId: sanitizedId });

    if (!team) return res.status(401).json({ status: 'FAIL', message: 'INVALID TEAM ID' });

    res.json({ status: 'SUCCESS', teamId: sanitizedId });
});

// 2. CHECK GAME STATUS
app.get('/api/game-status', (req, res) => {
    res.json({ started: IS_GAME_STARTED });
});

// 3. ADMIN: START GAME
app.post('/api/admin/start-game', (req, res) => {
    if (!isAdminRequest(req)) {
        return res.status(403).json({ message: 'ADMIN ACCESS REQUIRED' });
    }
    IS_GAME_STARTED = true;
    console.log('🚀 SYSTEM ALERT: GAME HAS STARTED.');
    res.json({ message: 'GAME STARTED' });
});

// 4. ADMIN: RESET TEAM
app.post('/api/admin/reset-team', async (req, res) => {
    if (!isAdminRequest(req)) {
        return res.status(403).json({ message: 'ADMIN ACCESS REQUIRED' });
    }
    const { teamId, restoreScore } = req.body;
    const team = await Team.findOne({ teamId });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    team.violations = 0;
    team.isLocked = false;
    if (restoreScore) team.score += 200;

    await team.save();
    res.json({ status: 'SUCCESS', message: `Team ${teamId} reset.`, currentScore: team.score });
});

// 4b. ADMIN: RESET GAME (Start Over)
app.post('/api/admin/reset-game', async (req, res) => {
    if (!isAdminRequest(req)) {
        return res.status(403).json({ message: 'ADMIN ACCESS REQUIRED' });
    }

    IS_GAME_STARTED = false;

    const DEFAULT_START_SCORE = Number.parseInt(process.env.DEFAULT_START_SCORE, 10);
    const startScore = Number.isFinite(DEFAULT_START_SCORE) ? DEFAULT_START_SCORE : 1000;

    await Team.updateMany(
        {},
        {
            $set: {
                score: startScore,
                currentLevel: 1,
                attempts: 0,
                violations: 0,
                isLocked: false
            }
        }
    );

    console.log('🔁 SYSTEM RESET: GAME STOPPED + ALL TEAMS RESET.');
    res.json({ status: 'SUCCESS', message: 'GAME RESET', started: IS_GAME_STARTED });
});

// 5. GET GAME DATA
app.get('/api/game-data/:teamId', async (req, res) => {
    const { teamId } = req.params;
    const team = await Team.findOne({ teamId });

    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.isLocked) {
        return res.json({ status: 'LOCKED', message: 'TERMINATED DUE TO VIOLATIONS' });
    }

    const levelData = await Level.findOne({ levelNumber: team.currentLevel });
    if (!levelData) return res.json({ status: 'COMPLETE', message: 'ALL LEVELS COMPLETED!' });

    // Shuffle snippets for the frontend
    const shuffledSnippets = [...levelData.snippets].sort(() => Math.random() - 0.5);

    res.json({
        status: 'SUCCESS',
        level: team.currentLevel,
        score: team.score,
        snippets: shuffledSnippets,
        violations: team.violations,
        isLocked: team.isLocked
    });
});

// 6. REPORT VIOLATION
app.post('/api/report-violation', async (req, res) => {
    const { teamId } = req.body;
    const team = await Team.findOne({ teamId });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    team.violations += 1;

    // Strike 2: Penalty (-200)
    if (team.violations === 2) {
        team.score = Math.max(0, team.score - 200);
    }
    // Strike 3: LOCK
    else if (team.violations >= 3) {
        team.isLocked = true;
    }

    await team.save();
    res.json({ status: 'SUCCESS', violations: team.violations, isLocked: team.isLocked, currentScore: team.score });
});

// 7. SUBMIT CODE (Logic: ID Normalization + Content Comparison)
app.post('/api/submit-code', async (req, res) => {
    const { teamId, submittedOrder } = req.body;
    if (!IS_EVENT_ACTIVE) return res.status(403).json({ message: 'TIME UP' });

    const team = await Team.findOne({ teamId });
    if (team.isLocked) return res.status(403).json({ message: 'LOCKED OUT' });

    const levelData = await Level.findOne({ levelNumber: team.currentLevel });
    if (!levelData) return res.status(400).json({ message: 'Level Error' });

    // --- LOGIC CHECK START ---

    // 1. Flatten User Submission
    let userSequenceIDs = submittedOrder.flat();
    let correctSequenceIDs = levelData.correctSequence;

    // 2. Define Normalization (Fixes Variable Swaps)
    const normalizeSequence = (seq, groups) => {
        let normalized = [...seq];
        groups.forEach(group => {
            const indices = group.map(id => normalized.indexOf(id)).filter(i => i !== -1);
            if (indices.length === group.length) {
                const itemsInSequence = indices.map(i => normalized[i]);
                itemsInSequence.sort(); // Sort alphanumeric (ID match)
                indices.sort((a, b) => a - b);
                indices.forEach((pos, i) => { normalized[pos] = itemsInSequence[i]; });
            }
        });
        return normalized;
    };

    // 3. Apply Normalization (Only adjusts IDs if they are in a Swappable Group)
    if (levelData.swappableGroups && levelData.swappableGroups.length > 0) {
        userSequenceIDs = normalizeSequence(userSequenceIDs, levelData.swappableGroups);
        correctSequenceIDs = normalizeSequence(correctSequenceIDs, levelData.swappableGroups);
    }

    // 4. CONTENT COMPARISON (Fixes "Wrong Curly Brace" Error)
    // Convert the normalized IDs back into their actual Code Strings
    const getCodeFromIds = (idSequence) => {
        return idSequence.map(id => {
            const snippet = levelData.snippets.find(s => s.id === id);
            // Trim whitespace so formatting differences don't fail the check
            return snippet ? snippet.code.trim() : "ERROR";
        });
    };

    const userCodeSequence = getCodeFromIds(userSequenceIDs);
    const correctCodeSequence = getCodeFromIds(correctSequenceIDs);

    // Compare the actual code content, NOT the IDs
    const isCorrect = JSON.stringify(userCodeSequence) === JSON.stringify(correctCodeSequence);

    // --- LOGIC CHECK END ---

    team.attempts += 1;

    if (isCorrect) {
        team.score += 500; // Correct Logic (+500)
        team.attempts = 0;
        await team.save();
        res.json({ status: 'SUCCESS', currentScore: team.score });
    } else {
        // Penalty only on exact 3rd wrong attempt
        if (team.attempts === 3) {
            team.score = Math.max(0, team.score - 100);
        }
        await team.save();
        res.json({
            status: 'FAIL',
            message: 'Logic Incorrect. Check your syntax order.',
            attemptsUsed: team.attempts,
            currentScore: team.score
        });
    }
});

// 8. SUBMIT TERMINAL (One-Shot Logic)
app.post('/api/submit-terminal', async (req, res) => {
    const { teamId, userOutput } = req.body;
    const team = await Team.findOne({ teamId });
    if (team.isLocked) return res.status(403).json({ message: 'LOCKED' });

    const levelData = await Level.findOne({ levelNumber: team.currentLevel });

    // Compare Answer
    const isCorrect = userOutput.trim() === levelData.expectedOutput;

    if (isCorrect) {
        team.score += 200; // Correct Terminal (+200)
    } else {
        team.score = Math.max(0, team.score - 200); // Incorrect Terminal (-200)
    }

    // Advance Level & Reset Attempts (Regardless of terminal success/fail)
    team.currentLevel += 1;
    team.attempts = 0;
    await team.save();

    res.json({
        status: isCorrect ? 'SUCCESS' : 'FAIL',
        message: isCorrect ? 'Output Correct' : 'Output Incorrect',
        currentScore: team.score,
        nextLevel: team.currentLevel
    });
});

// 9. SKIP TERMINAL
app.post('/api/skip-terminal', async (req, res) => {
    const { teamId } = req.body;
    const team = await Team.findOne({ teamId });
    if (team.isLocked) return res.status(403).json({ message: 'LOCKED' });

    team.currentLevel += 1;
    team.attempts = 0;
    await team.save();
    res.json({ status: 'SUCCESS', currentScore: team.score, nextLevel: team.currentLevel });
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        // Fetch specific fields only
        const teams = await Team.find({}, 'teamId score currentLevel violations isLocked attempts');

        // Sorting Logic:
        // 1. Higher Score
        // 2. Higher Level (Tie-breaker)
        // 3. Fewer Violations (Tie-breaker)
        teams.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.currentLevel !== a.currentLevel) return b.currentLevel - a.currentLevel;
            return a.violations - b.violations;
        });

        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: "Leaderboard Error" });
    }
});

const PORT = Number.parseInt(process.env.PORT, 10) || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down...`);
    server.close(async () => {
        try {
            await mongoose.connection.close(false);
        } catch (err) {
            console.error('❌ Error closing Mongo connection:', err);
        } finally {
            process.exit(0);
        }
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
