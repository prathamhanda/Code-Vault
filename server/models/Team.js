const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamId: { type: String, required: true, unique: true },
    pin: { type: String, required: true }, // <--- ADD THIS LINE
    score: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 1 },
    variant: { type: Number, default: 0 },
    violations: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('Team', TeamSchema);