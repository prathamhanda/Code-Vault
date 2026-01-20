require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./models/Team');
const Level = require('./models/Level');

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected: Red Notice Protocol Initiated'))
    .catch(err => console.error(err));

// ==========================================
// 1. THE RED NOTICE THEME ENGINE (8 VARIATIONS)
// ==========================================
const generateLevelSet = (variant) => {
    // Ensure we cycle safely through the 8 options
    const v = variant % 8;

    // THE 8 HEIST SCENARIOS
    const themes = [
        // VAR 0: CLEOPATRA'S THIRD EGG
        {
            context: "Calculate total carats of the Third Egg's diamonds.",
            var: "gem_carats",
            arr: "{10, 20, 5, 100, 15}",
            limit: 50,
            ans1: "150"
        },
        // VAR 1: SOTTO VOCE'S BUNKER
        {
            context: "Sum the weight of the Nazi gold bars.",
            var: "bar_weight",
            arr: "{1, 1, 1, 50, 20}",
            limit: 10,
            ans1: "73"
        },
        // VAR 2: THE BISHOP'S CAYMAN ACCOUNT
        {
            context: "Calculate the total millions transferred to the account.",
            var: "transfer_mil",
            arr: "{300, 10, 10, 5, 5}",
            limit: 200,
            ans1: "330"
        },
        // VAR 3: INTERPOL RED NOTICE
        {
            context: "Count active warrants in the Interpol database.",
            var: "warrant_id",
            arr: "{1, 0, 1, 1, 1}", // 1 = Active, 0 = Inactive
            limit: 0,
            ans1: "4"
        },
        // VAR 4: RUSSIAN PRISON ESCAPE
        {
            context: "Calculate remaining distance to the extraction chopper.",
            var: "meters_left",
            arr: "{100, 200, 50, 25, 25}",
            limit: 100,
            ans1: "400"
        },
        // VAR 5: ART FORGERY DETECTION
        {
            context: "Sum the brushstroke errors on the fake painting.",
            var: "errors",
            arr: "{2, 4, 2, 1, 1}",
            limit: 3,
            ans1: "10"
        },
        // VAR 6: HARTLEY'S PROFILE
        {
            context: "Sum the security clearance levels of the team.",
            var: "clearance",
            arr: "{5, 5, 5, 1, 1}",
            limit: 4,
            ans1: "17"
        },
        // VAR 7: THE BULLFIGHT CHASE
        {
            context: "Calculate the speed of the pursuing mine carts.",
            var: "speed_mph",
            arr: "{80, 90, 60, 40, 100}",
            limit: 85,
            ans1: "370"
        }
    ];

    const t = themes[v];

    return [
        // ================= LEVEL 1: ACCUMULATOR =================
        {
            levelNumber: 1, variant: v,
            description: t.context,
            snippets: [
                { id: "1", code: "#include <stdio.h>" },
                { id: "2", code: "int main() {" },
                { id: "3", code: `    int ${t.var}[5] = ${t.arr};` },
                { id: "4", code: "    int total_val = 0;" },
                { id: "5", code: "    for(int i = 0; i < 5; i++) {" },
                { id: "6", code: `        total_val += ${t.var}[i];` },
                { id: "7", code: "    }" },
                { id: "8", code: "    printf(\"%d\", total_val);" },
                { id: "9", code: "    return 0;" },
                { id: "10", code: "}" },
                // BLUFFS
                { id: "B1", code: `total_val = ${t.var};` },
                { id: "B2", code: "if(total_val == 0)" }
            ],
            correctSequence: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            swappableGroups: [["3", "4"]],
            expectedOutput: t.ans1
        },

        // ================= LEVEL 2: FILTERING =================
        {
            levelNumber: 2, variant: v,
            description: `Extract data only if value > ${t.limit} (High Priority).`,
            snippets: [
                { id: "20", code: "#include <stdio.h>" },
                { id: "21", code: "int main() {" },
                { id: "22", code: `    int stream[6] = {10, 50, 5, 100, 200, 1};` },
                { id: "23", code: "    int secure_sum = 0;" },
                { id: "24", code: "    for(int i = 0; i < 6; i++) {" },
                { id: "25", code: `        if(stream[i] > ${t.limit}) {` },
                { id: "26", code: "            secure_sum += stream[i];" },
                { id: "27", code: "        }" },
                { id: "28", code: "    }" },
                { id: "29", code: "    printf(\"SECURE: %d\", secure_sum);" },
                { id: "30", code: "    return 0;" },
                { id: "31", code: "}" },
                // BLUFFS
                { id: "B3", code: `if(stream[i] < ${t.limit}) {` },
                { id: "B4", code: "secure_sum = stream[i];" }
            ],
            correctSequence: ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
            swappableGroups: [["22", "23"]],
            // Dynamic output calculation
            expectedOutput: `SECURE: ${[10, 50, 5, 100, 200, 1].filter(n => n > t.limit).reduce((a, b) => a + b, 0)}`
        },

        // ================= LEVEL 3: COUNTING =================
        {
            levelNumber: 3, variant: v,
            description: "Count the number of flagged items (404 Errors) in the log.",
            snippets: [
                { id: "40", code: "#include <stdio.h>" },
                { id: "41", code: "int main() {" },
                { id: "42", code: `    int logs[6] = {404, 200, 500, 404, 200, 404};` },
                { id: "43", code: "    int flags = 0;" },
                { id: "44", code: "    for(int i = 0; i < 6; i++) {" },
                { id: "45", code: `        if(logs[i] == ${v % 2 == 0 ? 404 : 200}) {` },
                { id: "46", code: "            flags++;" },
                { id: "47", code: "        }" },
                { id: "48", code: "    }" },
                { id: "49", code: "    printf(\"%d\", flags);" },
                { id: "50", code: "    return 0;" },
                { id: "51", code: "}" },
                // BLUFFS
                { id: "B5", code: "flags = logs[i];" },
                { id: "B6", code: "if(logs[i] != 0)" }
            ],
            correctSequence: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51"],
            swappableGroups: [["42", "43"]],
            expectedOutput: (v % 2 === 0) ? "3" : "2"
        },

        // ================= LEVEL 4: REVERSING =================
        {
            levelNumber: 4, variant: v,
            description: "Reverse the GPS coordinates for the escape route.",
            snippets: [
                { id: "60", code: "#include <stdio.h>" },
                { id: "61", code: "int main() {" },
                { id: "62", code: "    int gps[4] = {1, 2, 3, 4};" },
                { id: "63", code: "    int start = 0, end = 3;" },
                { id: "64", code: "    while(start < end) {" },
                { id: "65", code: "        int temp = gps[start];" },
                { id: "66", code: "        gps[start] = gps[end];" },
                { id: "67", code: "        gps[end] = temp;" },
                { id: "68", code: "        start++; end--;" },
                { id: "69", code: "    }" },
                { id: "70", code: "    for(int i=0; i<4; i++) printf(\"%d\", gps[i]);" },
                { id: "71", code: "    return 0;" },
                { id: "72", code: "}" },
                { id: "B7", code: "gps.reverse();" },
                { id: "B8", code: "swap(start, end);" }
            ],
            correctSequence: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72"],
            swappableGroups: [["62", "63"]],
            expectedOutput: "4321"
        },

        // ================= LEVEL 5: SEQUENCE =================
        {
            levelNumber: 5, variant: v,
            description: "Crack the safe tumbler sequence (Ascending Order).",
            snippets: [
                { id: "80", code: "#include <stdio.h>" },
                { id: "81", code: "int main() {" },
                { id: "82", code: `    int pins[5] = {${v}, ${v + 2}, ${v + 4}, ${v + 1}, ${v + 3}};` },
                { id: "83", code: "    int valid = 0;" },
                { id: "84", code: "    for(int i = 0; i < 4; i++) {" },
                { id: "85", code: "        if(pins[i+1] > pins[i]) {" },
                { id: "86", code: "            valid += 10;" },
                { id: "87", code: "        }" },
                { id: "88", code: "    }" },
                { id: "89", code: "    printf(\"%d\", valid);" },
                { id: "90", code: "    return 0;" },
                { id: "91", code: "}" },
                { id: "B9", code: "if(pins[i+1] == pins[i])" },
                { id: "B10", code: "valid = pins[i];" }
            ],
            correctSequence: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91"],
            swappableGroups: [["82", "83"]],
            expectedOutput: "30"
        },

        // ================= LEVEL 6: DUPLICATE =================
        {
            levelNumber: 6, variant: v,
            description: "Find the duplicate Agent ID (The Mole).",
            snippets: [
                { id: "100", code: "#include <stdio.h>" },
                { id: "101", code: "int main() {" },
                { id: "102", code: `    int agents[5] = {10, 20, 30, ${v + 1}, 10};` },
                { id: "103", code: "    int mole = 0;" },
                { id: "104", code: "    for(int i = 0; i < 5; i++) {" },
                { id: "105", code: "        for(int j = i + 1; j < 5; j++) {" },
                { id: "106", code: "            if(agents[i] == agents[j]) {" },
                { id: "107", code: "                mole = agents[i];" },
                { id: "108", code: "            }" },
                { id: "109", code: "        }" },
                { id: "110", code: "    }" },
                { id: "111", code: "    printf(\"MOLE: %d\", mole);" },
                { id: "112", code: "    return 0;" },
                { id: "113", code: "}" },
                { id: "B11", code: "if(agents[i] != agents[j])" },
                { id: "B12", code: "int j = 0;" }
            ],
            correctSequence: ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113"],
            swappableGroups: [["102", "103"]],
            expectedOutput: "MOLE: 10"
        },

        // ================= LEVEL 7: POINTERS =================
        {
            levelNumber: 7, variant: v,
            description: "Modify the final vault key via pointer arithmetic.",
            snippets: [
                { id: "120", code: "#include <stdio.h>" },
                { id: "121", code: "int main() {" },
                { id: "122", code: `    int key = ${v * 2};` },
                { id: "123", code: "    int *ptr = &key;" },
                { id: "124", code: "    if(*ptr % 2 == 0) {" },
                { id: "125", code: "        *ptr += 1;" },
                { id: "126", code: "    }" },
                { id: "127", code: "    printf(\"%d\", key);" },
                { id: "128", code: "    return 0;" },
                { id: "129", code: "}" },
                { id: "B13", code: "ptr += 1;" },
                { id: "B14", code: "key = &ptr;" }
            ],
            correctSequence: ["120", "121", "122", "123", "124", "125", "126", "127", "128", "129"],
            swappableGroups: [],
            expectedOutput: ((v * 2) + 1).toString()
        }
    ];
};

// ==========================================
// 2. THE 30 TEAMS LIST
// ==========================================
const TEAMS_DATA = [
    { teamId: "mona-lisa", index: 0 },
    { teamId: "the-last-supper", index: 1 },
    { teamId: "starry-night", index: 2 },
    { teamId: "the-scream", index: 3 },
    { teamId: "guernica", index: 4 },
    { teamId: "las-meninas", index: 5 },
    { teamId: "composition-8", index: 6 },
    { teamId: "sunflowers", index: 7 },
    { teamId: "water-lilies", index: 8 },
    { teamId: "the-thinker", index: 9 },
    { teamId: "persistence", index: 10 },
    { teamId: "the-hay-wain", index: 11 },
    { teamId: "the-swing", index: 12 },
    { teamId: "no-5-1948", index: 13 },
    { teamId: "olympia", index: 14 },
    { teamId: "irises", index: 15 },
    { teamId: "nighthawk", index: 16 },
    { teamId: "the-gleaners", index: 17 },
    { teamId: "the-blue-boy", index: 18 },
    { teamId: "judith", index: 19 },
    { teamId: "ophelia", index: 20 },
    { teamId: "saturn", index: 21 },
    { teamId: "liberty", index: 22 },
    { teamId: "melancholia", index: 23 },
    { teamId: "venus", index: 24 },
    { teamId: "napoleon", index: 25 },
    { teamId: "salome", index: 26 },
    { teamId: "flora", index: 27 },
    { teamId: "the-dream", index: 28 },
    { teamId: "arnolfini", index: 29 }
];

// ==========================================
// 3. EXECUTE SEEDING
// ==========================================
const seedDB = async () => {
    try {
        await Team.deleteMany({});
        await Level.deleteMany({});
        console.log('🗑️  Old Data Cleared.');

        // ➤ INSERT TEAMS with Indices
        // Team 1 gets Var 0, Team 2 gets Var 1, etc.
        await Team.insertMany(TEAMS_DATA.map(t => ({
            teamId: t.teamId,
            score: 1000,
            currentLevel: 1,
            variant: t.index % 8, // Cycles through 0-7
            violations: 0,
            isLocked: false
        })));
        console.log(`✅ ${TEAMS_DATA.length} Teams Inserted.`);

        // ➤ INSERT ALL 8 VARIATIONS OF LEVELS (56 Levels Total)
        let allLevels = [];
        for (let i = 0; i < 8; i++) {
            const set = generateLevelSet(i);
            allLevels = [...allLevels, ...set];
        }
        await Level.insertMany(allLevels);
        console.log(`✅ ${allLevels.length} Levels Inserted (8 Variations).`);

    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();