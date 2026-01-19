const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamId: { type: String, required: true, unique: true },
    score: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 1 },
    attempts: { type: Number, default: 0 },

    // ➤ NEW SECURITY FIELDS
    violations: { type: Number, default: 0 }, // 0, 1, 2, 3
    isLocked: { type: Boolean, default: false } // Permanent Lock
});

module.exports = mongoose.model('Team', TeamSchema);