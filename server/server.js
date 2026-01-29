require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Team = require('./models/Team');
const Level = require('./models/Level');

const app = express();
app.use(express.json());

if (process.env.CORS_ORIGIN) {
    const allowedOrigins = new Set(process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean));
    app.use(cors({ origin(o, c) { if (!o) return c(null, true); return c(null, allowedOrigins.has(o)); } }));
} else { app.use(cors()); }

app.get(['/health', '/healthz'], (_req, res) => res.status(200).json({ ok: true }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code-vault';
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 }).then(() => console.log('✅ Connected to MongoDB')).catch(err => process.exit(1));

let gameStatus = 'WAITING';

// =======================
// LOGIN WITH PIN (STRICT)
// =======================
app.post('/api/login', async (req, res) => {
    const { teamId } = req.body;
    const sanitizedId = teamId.trim().toLowerCase().replace(/\s+/g, '-');
    // Admin login always allowed
    if (sanitizedId === ADMIN_ID) {
        return res.json({ status: 'SUCCESS', teamId: ADMIN_ID, role: 'admin' });
    }
    if (!IS_EVENT_ACTIVE) return res.status(403).json({ status: 'FAIL', message: 'EVENT CLOSED' });
    const team = await Team.findOne({ teamId: sanitizedId });
    if (!team) return res.status(401).json({ status: 'FAIL', message: 'INVALID TEAM ID' });
    res.json({ status: 'SUCCESS', teamId: sanitizedId, role: 'player' });
});

// 2. CHECK GAME STATUS
app.get('/api/game-status', (req, res) => {
    // Allow role-specific info
    const adminId = (req.query.adminId || req.headers['x-admin-id'] || '').toLowerCase();
    const isAdmin = adminId === ADMIN_ID;
    res.json({
        started: IS_GAME_STARTED,
        eventActive: IS_EVENT_ACTIVE,
        role: isAdmin ? 'admin' : 'player'
    });
});

// 3. ADMIN: START GAME
app.post('/api/admin/start-game', (req, res) => {
    if (!isAdminRequest(req)) {
        return res.status(403).json({ message: 'ADMIN ACCESS REQUIRED' });
    }
    // Starting the game should also reopen the event if it was ended.
    IS_EVENT_ACTIVE = true;
    IS_GAME_STARTED = true;
    console.log('🚀 SYSTEM ALERT: GAME HAS STARTED.');
    res.json({ message: 'GAME STARTED' });
});

// 3b. ADMIN: END GAME (Terminate Sequence)
app.post('/api/admin/end-game', (req, res) => {
    if (!isAdminRequest(req)) {
        return res.status(403).json({ message: 'ADMIN ACCESS REQUIRED' });
    }

    IS_GAME_STARTED = false;
    IS_EVENT_ACTIVE = false;

    console.log('🛑 SYSTEM ALERT: EVENT TERMINATED BY ADMIN.');
    res.json({ status: 'SUCCESS', message: 'EVENT TERMINATED', started: IS_GAME_STARTED, eventActive: IS_EVENT_ACTIVE });
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

    try {
        IS_GAME_STARTED = false;
        const { startScore, matched, modified } = await resetAllTeams();

        console.log('🔁 SYSTEM RESET: GAME STOPPED + ALL TEAMS RESET.', { matched, modified, startScore });
        res.json({
            status: 'SUCCESS',
            message: 'GAME RESET',
            started: IS_GAME_STARTED,
            startScore,
            matched,
            modified
        });
    } catch (err) {
        console.error('❌ RESET GAME ERROR:', err);
        res.status(500).json({ status: 'FAIL', message: 'RESET FAILED' });
    }
});

// 4c. ADMIN: RESET (Backward-compatible alias)
app.post('/api/admin/reset', async (req, res) => {
    try { await Team.deleteMany({}); gameStatus = 'WAITING'; res.json({ status: 'SUCCESS' }); }
    catch (e) { res.status(500).json({ status: 'ERROR' }); }
});

// GAME DATA
app.get('/api/game-data/:teamId', async (req, res) => {
    const team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.isLocked) return res.json({ status: 'LOCKED', message: 'TERMINATED' });

    const levelData = await Level.findOne({ levelNumber: team.currentLevel, variant: team.variant });
    if (!levelData) return res.json({ status: 'COMPLETE', message: 'ALL LEVELS COMPLETED!' });

    res.json({
        status: 'SUCCESS', level: team.currentLevel, score: team.score,
        snippets: [...levelData.snippets].sort(() => Math.random() - 0.5),
        violations: team.violations, isLocked: team.isLocked, gameStatus: gameStatus, attempts: team.attempts
    });
});

// SUBMIT CODE (With Logic Fixes)
app.post('/api/submit-code', async (req, res) => {
    if (gameStatus !== 'ACTIVE') return res.json({ status: 'FAIL', message: 'GAME PAUSED' });
    const { teamId, submittedOrder } = req.body;
    const team = await Team.findOne({ teamId });
    if (!team || team.isLocked) return res.status(403).json({ message: 'LOCKED' });

    // ➤ BOSS LEVEL (10) SUDDEN DEATH
    if (team.currentLevel === 10 && team.attempts >= 2) {
        return res.json({ status: 'FAIL', message: '2/2 ATTEMPTS FAILED. LEVEL LOCKED.' });
    }

    const levelData = await Level.findOne({ levelNumber: team.currentLevel, variant: team.variant });
    if (!levelData) return res.status(400).json({ message: 'Level Error' });

    // LOGIC CHECK
    let userSequenceIDs = submittedOrder.flat();
    let correctSequenceIDs = levelData.correctSequence;

    const normalizeSequence = (seq, groups) => {
        let normalized = [...seq];
        groups.forEach(group => {
            const indices = group.map(id => normalized.indexOf(id)).filter(i => i !== -1);
            if (indices.length === group.length) {
                const itemsInSequence = indices.map(i => normalized[i]);
                itemsInSequence.sort();
                indices.sort((a, b) => a - b);
                indices.forEach((pos, i) => { normalized[pos] = itemsInSequence[i]; });
            }
        });
        return normalized;
    };

    if (levelData.swappableGroups && levelData.swappableGroups.length > 0) {
        userSequenceIDs = normalizeSequence(userSequenceIDs, levelData.swappableGroups);
        correctSequenceIDs = normalizeSequence(correctSequenceIDs, levelData.swappableGroups);
    }

    const getCodeFromIds = (idSequence) => idSequence.map(id => levelData.snippets.find(s => s.id === id)?.code.trim());
    const isCorrect = JSON.stringify(getCodeFromIds(userSequenceIDs)) === JSON.stringify(getCodeFromIds(correctSequenceIDs));

    team.attempts++;

    if (isCorrect) {
        team.score += 500;
        team.attempts = 0;
        await team.save();
        res.json({ status: 'SUCCESS', currentScore: team.score });
    } else {
        // ➤ INFINITE PENALTY: Deduct 100 for EVERY fail starting at attempt 3
        if (team.currentLevel < 10) {
            if (team.attempts >= 3) {
                team.score = Math.max(0, team.score - 100);
            }
        }
        await team.save();
        res.json({
            status: 'FAIL',
            message: team.currentLevel === 10 ? `${2 - team.attempts} Attempts Left` : 'Logic Incorrect',
            attemptsUsed: team.attempts,
            currentScore: team.score
        });
    }
});

// TERMINAL (FIXED LOGIC)
app.post('/api/submit-terminal', async (req, res) => {
    if (gameStatus !== 'ACTIVE') return res.json({ status: 'FAIL', message: 'PAUSED' });
    const { teamId, userOutput } = req.body;
    const team = await Team.findOne({ teamId });
    if (team.isLocked) return res.status(403).json({ message: 'LOCKED' });

    if (team.currentLevel === 10 && team.attempts >= 2) return res.json({ status: 'FAIL', message: 'MAX ATTEMPTS' });

    const levelData = await Level.findOne({ levelNumber: team.currentLevel, variant: team.variant });
    const isCorrect = userOutput.trim() === levelData.expectedOutput;

    if (isCorrect) team.score += 200;
    else if (team.currentLevel < 10) team.score = Math.max(0, team.score - 200);

    team.currentLevel++;
    team.attempts = 0;
    await team.save();
    res.json({ status: isCorrect ? 'SUCCESS' : 'FAIL', currentScore: team.score, nextLevel: team.currentLevel });
});

app.post('/api/skip-terminal', async (req, res) => {
    if (gameStatus !== 'ACTIVE') return res.status(403);
    const team = await Team.findOne({ teamId: req.body.teamId });
    team.currentLevel++; team.attempts = 0; await team.save();
    res.json({ status: 'SUCCESS', nextLevel: team.currentLevel });
});

// VIOLATIONS
app.post('/api/report-violation', async (req, res) => {
    const team = await Team.findOne({ teamId: req.body.teamId });
    team.violations++;
    if (team.violations === 2) team.score = Math.max(0, team.score - 200);
    if (team.violations >= 3) team.isLocked = true;
    await team.save();
    res.json({ status: 'SUCCESS', violations: team.violations, isLocked: team.isLocked, currentScore: team.score });
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        // Admin exception: allow access if adminId is provided and matches
        const adminId = (req.query.adminId || req.headers['x-admin-id'] || '').toLowerCase();
        const isAdmin = adminId === ADMIN_ID;
        if (!IS_EVENT_ACTIVE && !isAdmin) {
            return res.status(403).json({ message: 'EVENT CLOSED' });
        }
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));