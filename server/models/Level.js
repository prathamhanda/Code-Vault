const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
    id: String,
    code: String
});

const levelSchema = new mongoose.Schema({
    levelNumber: Number,
    description: String,
    snippets: [snippetSchema],
    correctSequence: [String],
    expectedOutput: String,

    // ➤ IMPORTANT: This field must exist for the swap logic to work
    swappableGroups: {
        type: [[String]], // Array of Arrays of Strings
        default: []
    }
});

module.exports = mongoose.model('Level', levelSchema);