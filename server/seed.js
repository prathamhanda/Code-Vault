require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./models/Team');
const Level = require('./models/Level');

// DATABASE CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/code-vault')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error(err));

// 1. THE 7 LEVELS (Strict C Syntax + Swappable Logic)
const LEVELS_DATA = [
    {
        levelNumber: 1,
        description: "Calculate the total weight of the loot data.",
        snippets: [
            { id: "1", code: "#include <stdio.h>" },
            { id: "2", code: "int main() {" },
            { id: "3", code: "    int loot_values[5] = {1, 2, 3, 4, 5};" },
            { id: "4", code: "    int total_data_weight = 0;" },
            { id: "5", code: "    for(int node = 0; node < 5; node++) {" },
            { id: "6", code: "        total_data_weight += loot_values[node];" },
            { id: "7", code: "    }" },
            { id: "8", code: "    printf(\"%d\", total_data_weight);" },
            { id: "9", code: "    return 0;" },
            { id: "10", code: "}" },
            // BLUFFS
            { id: "B1", code: "def main():" },
            { id: "B2", code: "int total_data_weight = 0" },
            { id: "B3", code: "console.log(total_data_weight);" }
        ],
        correctSequence: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        // ALLOW SWAPPING: The array declaration (3) and sum variable (4)
        swappableGroups: [["3", "4"]],
        expectedOutput: "15"
    },
    {
        levelNumber: 2,
        description: "Extract data only if it exceeds the security threshold (> 5).",
        snippets: [
            { id: "20", code: "#include <stdio.h>" },
            { id: "21", code: "int main() {" },
            { id: "22", code: "    int metadata_stream[6] = {3, 8, 2, 12, 5, 9};" },
            { id: "23", code: "    int total_extraction = 0;" },
            { id: "24", code: "    for(int i = 0; i < 6; i++) {" },
            { id: "25", code: "        if(metadata_stream[i] > 5) {" },
            { id: "26", code: "            total_extraction += metadata_stream[i];" },
            { id: "27", code: "        }" },
            { id: "28", code: "    }" },
            { id: "29", code: "    printf(\"TOTAL_VALUE_STOLEN: %d\", total_extraction);" },
            { id: "30", code: "    return 0;" },
            { id: "31", code: "}" },
            // BLUFFS
            { id: "B4", code: "if metadata_stream[i] > 5 then" },
            { id: "B5", code: "print(total_extraction);" }
        ],
        correctSequence: ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
        // ALLOW SWAPPING: Array (22) and Sum (23)
        swappableGroups: [["22", "23"]],
        expectedOutput: "TOTAL_VALUE_STOLEN: 29"
    },
    {
        levelNumber: 3,
        description: "Check for palindrome matches in the key sequence.",
        snippets: [
            { id: "40", code: "#include <stdio.h>" },
            { id: "41", code: "int main() {" },
            { id: "42", code: "    int key_sequence[5] = {1, 2, 3, 2, 1};" },
            { id: "43", code: "    int n = 5, matches = 0;" },
            { id: "44", code: "    for(int node = 0; node < n / 2; node++) {" },
            { id: "45", code: "        if(key_sequence[node] == key_sequence[n - 1 - node]) {" },
            { id: "46", code: "            matches++;" },
            { id: "47", code: "        }" },
            { id: "48", code: "    }" },
            { id: "49", code: "    printf(\"%d\", matches);" },
            { id: "50", code: "    return 0;" },
            { id: "51", code: "}" },
            // BLUFFS
            { id: "B6", code: "if (key_sequence == key_sequence.reverse())" },
            { id: "B7", code: "void main() {" }
        ],
        correctSequence: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51"],
        // ALLOW SWAPPING: Array (42) and Variables (43)
        swappableGroups: [["42", "43"]],
        expectedOutput: "2"
    },
    {
        levelNumber: 4,
        description: "Reverse the audit log using two pointers.",
        snippets: [
            { id: "60", code: "#include <stdio.h>" },
            { id: "61", code: "int main() {" },
            { id: "62", code: "    int audit_log[6] = {1, 2, 3, 4, 5, 6};" },
            { id: "63", code: "    int start = 0, end = 5;" },
            { id: "64", code: "    while(start < end) {" },
            { id: "65", code: "        int temp = audit_log[start];" },
            { id: "66", code: "        audit_log[start] = audit_log[end];" },
            { id: "67", code: "        audit_log[end] = temp;" },
            { id: "68", code: "        start++; end--;" },
            { id: "69", code: "    }" },
            { id: "70", code: "    for(int k = 0; k < 6; k++) printf(\"%d \", audit_log[k]);" },
            { id: "71", code: "    return 0;" },
            { id: "72", code: "}" },
            // BLUFFS
            { id: "B8", code: "audit_log[start], audit_log[end] = audit_log[end], audit_log[start];" },
            { id: "B9", code: "audit_log.reverse();" }
        ],
        correctSequence: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72"],
        // ALLOW SWAPPING: Array (62) and Pointers (63)
        swappableGroups: [["62", "63"]],
        expectedOutput: "6 5 4 3 2 1 "
    },
    {
        levelNumber: 5,
        description: "Calculate security level based on ascending sequences.",
        snippets: [
            { id: "80", code: "#include <stdio.h>" },
            { id: "81", code: "int main() {" },
            { id: "82", code: "    int access_keys[6] = {2, 4, 6, 7, 9, 12};" },
            { id: "83", code: "    int security_level = 0;" },
            { id: "84", code: "    for (int i = 0; i < 5; i++) {" },
            { id: "85", code: "        if (access_keys[i] < access_keys[i+1]) {" },
            { id: "86", code: "            security_level += 10;" },
            { id: "87", code: "        }" },
            { id: "88", code: "    }" },
            { id: "89", code: "    printf(\"%d\", security_level);" },
            { id: "90", code: "    return 0;" },
            { id: "91", code: "}" },
            // BLUFFS
            { id: "B10", code: "foreach (int key in access_keys)" },
            { id: "B11", code: "security_level + 10;" }
        ],
        correctSequence: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91"],
        // ALLOW SWAPPING: Array (82) and Security Level (83)
        swappableGroups: [["82", "83"]],
        expectedOutput: "50"
    },
    {
        levelNumber: 6,
        description: "Find the duplicate ID (The Mole).",
        snippets: [
            { id: "100", code: "#include <stdio.h>" },
            { id: "101", code: "#include <stdbool.h>" },
            { id: "102", code: "int main() {" },
            { id: "103", code: "    int id_vault[6] = {3, 5, 4, 3, 2, 1};" },
            { id: "104", code: "    bool id_cloned = false;" },
            { id: "105", code: "    for (int i = 0; i < 6; i++) {" },
            { id: "106", code: "        for (int j = i + 1; j < 6; j++) {" },
            { id: "107", code: "            if (id_vault[j] == id_vault[i]) {" },
            { id: "108", code: "                printf(\"MOLE_FOUND: ID_%d\", id_vault[i]);" },
            { id: "109", code: "                id_cloned = true; break;" },
            { id: "110", code: "            }" },
            { id: "111", code: "        }" },
            { id: "112", code: "        if (id_cloned) break;" },
            { id: "113", code: "    }" },
            { id: "114", code: "    return 0;" },
            { id: "115", code: "}" },
            // BLUFFS
            { id: "B12", code: "if id_vault[i] in id_vault:" },
            { id: "B13", code: "Set<Integer> seen = new HashSet<>();" }
        ],
        correctSequence: ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115"],
        // ALLOW SWAPPING: 
        // 1. Includes: [100, 101]
        // 2. Variables: [103, 104]
        swappableGroups: [["100", "101"], ["103", "104"]],
        expectedOutput: "MOLE_FOUND: ID_3"
    },
    {
        levelNumber: 7,
        description: "Pointer arithmetic: Double even indices, add 5 to odd.",
        snippets: [
            { id: "120", code: "#include <stdio.h>" },
            { id: "121", code: "int main() {" },
            // Fragmented Array
            { id: "122", code: "    int vault_memory[6] =" },
            { id: "123", code: "    {10, 2, 8, 4, 5, 1};" },
            // Fragmented Pointer & Sum
            { id: "124", code: "    int *ghost_ptr =" },
            { id: "125", code: "    vault_memory;" },
            { id: "126", code: "    int final_vault_sum = 0;" },
            // Loop
            { id: "127", code: "    for (int i = 0; i < 6;" },
            { id: "128", code: "    i++) {" },
            // Logic
            { id: "129", code: "        if (i % 2 == 0) {" },
            { id: "130", code: "            *(ghost_ptr + i)" },
            { id: "131", code: "            *= 2;" },
            { id: "132", code: "        } else {" },
            { id: "133", code: "            *(ghost_ptr + i)" },
            { id: "134", code: "            += 5;" },
            { id: "135", code: "        }" },
            { id: "136", code: "        final_vault_sum += vault_memory[i];" },
            { id: "137", code: "    }" },
            { id: "138", code: "    printf(\"%d\", final_vault_sum);" },
            { id: "139", code: "    return 0; }" },
            // BLUFFS
            { id: "B15", code: "*ghost_ptr + i" },
            { id: "B16", code: "i--) {" },
            { id: "B17", code: "int *ghost_ptr = &vault_memory;" },
            { id: "B18", code: "vault_memory[i] *= 2;" }
        ],
        correctSequence: ["120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139"],
        swappableGroups: [],
        expectedOutput: "68"
    }
];

const seedDB = async () => {
    // 1. Refresh Levels
    await Level.deleteMany({});
    console.log('🗑️  Levels Cleared.');
    await Level.insertMany(LEVELS_DATA);
    console.log('✅ 7 Complete Levels with Swappable Groups Inserted.');

    // 2. Reset Team Mona Lisa
    await Team.deleteOne({ teamId: 'mona-lisa' });
    await Team.create({
        teamId: 'mona-lisa', score: 1000, currentLevel: 1, violations: 0, isLocked: false, attempts: 0
    });
    console.log('✅ Team "mona-lisa" RESET.');
    mongoose.connection.close();
};

seedDB();