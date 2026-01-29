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
    const { teamId, pin } = req.body;

    if (!pin) return res.status(400).json({ status: 'FAIL', message: 'PIN Required' });

    const sanitizedId = teamId.trim().toLowerCase().replace(/\s+/g, '-');
    const sanitizedPin = pin.trim();

    const team = await Team.findOne({ teamId: sanitizedId });

    if (!team) return res.status(401).json({ status: 'FAIL', message: 'Team ID not found' });
    if (team.pin !== sanitizedPin) return res.status(401).json({ status: 'FAIL', message: 'Incorrect PIN' });

    res.json({ status: 'SUCCESS', teamId: sanitizedId });
});

// STATUS & ADMIN
app.get('/api/game-status', (req, res) => res.json({ status: gameStatus }));
app.post('/api/admin/start', (req, res) => { gameStatus = 'ACTIVE'; res.json({ status: 'SUCCESS', message: 'Game Started' }); });
app.post('/api/admin/stop', (req, res) => { gameStatus = 'PAUSED'; res.json({ status: 'SUCCESS', message: 'Game Paused' }); });
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
    const teams = await Team.find({}, 'teamId score currentLevel violations isLocked');
    teams.sort((a, b) => b.score - a.score || b.currentLevel - a.currentLevel || a.violations - b.violations);
    res.json(teams);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));