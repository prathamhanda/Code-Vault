const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
    id: String,
    code: String
});

const levelSchema = new mongoose.Schema({
    levelNumber: Number,
    variant: { type: Number, default: 0 },
    description: String,
    snippets: [snippetSchema],
    correctSequence: [String],
    expectedOutput: String,

    swappableGroups: {
        type: [[String]], 
        default: []
    }
});

module.exports = mongoose.model('Level', levelSchema);