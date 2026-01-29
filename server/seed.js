require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./models/Team');
const Level = require('./models/Level');

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code-vault';

mongoose.connect(dbURI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        seedDB();
    })
    .catch(err => {
        console.error('❌ DB Error:', err);
        process.exit(1);
    });

// ==========================================
// 1. THE RED NOTICE ELITE ENGINE (10 LEVELS)
// ==========================================
const generateLevelSet = (variant) => {
    const v = variant % 8; // 0-7 Variations

    return [
        // ================= LEVEL 1: THE THIRD EGG (Conditional Sum) =================
        {
            levelNumber: 1, variant: v,
            description: "The Third Egg's diamonds must be verified. Sum the carats of ONLY the diamonds divisible by 3.",
            snippets: [
                { id: "a1", code: "int main() {" },
                { id: "a2", code: `    int arr[5] = {${3 + v}, ${4 + v}, ${9 + v}, ${10 + v}, ${12 + v}};` },
                { id: "a3", code: "    int sum = 0;" },
                { id: "a4", code: "    for(int i=0; i<5; i++) {" },
                { id: "a5", code: "        if(arr[i] % 3 == 0) {" },
                { id: "a6", code: "            sum += arr[i];" },
                { id: "a7", code: "        }" },
                { id: "a8", code: "    }" },
                { id: "a9", code: "    printf(\"%d\", sum);" },
                { id: "a10", code: "}" },
                // ➤ BLUFFS
                { id: "B1", code: "let sum = 0;" },
                { id: "B2", code: "if arr[i] % 3 == 0:" }
            ],
            correctSequence: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"],
            swappableGroups: [["a2", "a3"]],
            expectedOutput: [3 + v, 4 + v, 9 + v, 10 + v, 12 + v].filter(n => n % 3 === 0).reduce((a, b) => a + b, 0).toString()
        },

        // ================= LEVEL 2: BUNKER BREACH (Threshold Break) =================
        {
            levelNumber: 2, variant: v,
            description: "Scan the gold bars. Find the FIRST bar strictly heavier than 40kg to calibrate the drone.",
            snippets: [
                { id: "b1", code: "int main() {" },
                { id: "b2", code: `    int data[4] = {${10 + v}, ${50 + v}, ${20 + v}, ${100 + v}};` },
                { id: "b3", code: `    int limit = ${40 + v};` },
                { id: "b4", code: "    int found = -1;" },
                { id: "b5", code: "    for(int i=0; i<4; i++) {" },
                { id: "b6", code: "        if(data[i] > limit) {" },
                { id: "b7", code: "            found = data[i];" },
                { id: "b8", code: "            break;" },
                { id: "b9", code: "        }" },
                { id: "b10", code: "    }" },
                { id: "b11", code: "    printf(\"%d\", found);" },
                { id: "b12", code: "}" },
                // ➤ BLUFFS
                { id: "B3", code: "found = data[i]" },
                { id: "B4", code: "console.log(found);" }
            ],
            correctSequence: ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10", "b11", "b12"],
            swappableGroups: [["b2", "b3", "b4"]],
            expectedOutput: [10 + v, 50 + v, 20 + v, 100 + v].find(n => n > 40 + v)?.toString() || "-1"
        },

        // ================= LEVEL 3: CAYMAN GRID (Matrix Diagonal) =================
        {
            levelNumber: 3, variant: v,
            description: "Unlock The Bishop's account. Sum the DIAGONAL nodes of the security grid.",
            snippets: [
                { id: "c1", code: "int main() {" },
                { id: "c2", code: `    int m[2][2] = {{${1 + v}, ${2 + v}}, {${3 + v}, ${4 + v}}};` },
                { id: "c3", code: "    int diagSum = 0;" },
                { id: "c4", code: "    for(int i=0; i<2; i++) {" },
                { id: "c5", code: "        for(int j=0; j<2; j++) {" },
                { id: "c6", code: "            if(i == j) {" },
                { id: "c7", code: "                diagSum += m[i][j];" },
                { id: "c8", code: "            }" },
                { id: "c9", code: "        }" },
                { id: "c10", code: "    }" },
                { id: "c11", code: "    printf(\"%d\", diagSum);" },
                { id: "c12", code: "}" },
                // ➤ BLUFFS
                { id: "B5", code: "foreach(int x in m)" },
                { id: "B6", code: "m[i,j]" }
            ],
            correctSequence: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12"],
            swappableGroups: [["c2", "c3"]],
            expectedOutput: ((1 + v) + (4 + v)).toString()
        },

        // ================= LEVEL 4: THE VAULT SWAP (XOR Swap) =================
        {
            levelNumber: 4, variant: v,
            description: "Swap the digital keys A and B instantly without a trace (No Temp Variable).",
            snippets: [
                { id: "d1", code: "int main() {" },
                { id: "d2", code: `    int a = ${5 + v}, b = ${9 + v};` },
                { id: "d3", code: "    a = a ^ b;" },
                { id: "d4", code: "    b = a ^ b;" },
                { id: "d5", code: "    a = a ^ b;" },
                { id: "d6", code: "    printf(\"%d\", a);" },
                { id: "d7", code: "}" },
                // ➤ BLUFFS
                { id: "B7", code: "a = a XOR b;" },
                { id: "B8", code: "swap(a, b);" }
            ],
            correctSequence: ["d1", "d2", "d3", "d4", "d5", "d6", "d7"],
            swappableGroups: [],
            expectedOutput: (9 + v).toString()
        },

        // ================= LEVEL 5: LASER GRID (Bitmasking) =================
        {
            levelNumber: 5, variant: v,
            description: "Check the status code. Is the 2nd Laser Beam (Bit 2) currently ACTIVE?",
            snippets: [
                { id: "e1", code: "int main() {" },
                { id: "e2", code: `    int status = ${6 + v};` },
                { id: "e3", code: "    int mask = 1 << 1;" },
                { id: "e4", code: "    if(status & mask) {" },
                { id: "e5", code: "        printf(\"1\");" },
                { id: "e6", code: "    } else {" },
                { id: "e7", code: "        printf(\"0\");" },
                { id: "e8", code: "    }" },
                { id: "e9", code: "}" },
                // ➤ BLUFFS
                { id: "B9", code: "if(status and mask)" },
                { id: "B10", code: "bool active = True;" }
            ],
            correctSequence: ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9"],
            swappableGroups: [["e2", "e3"]],
            expectedOutput: ((6 + v) & 2) ? "1" : "0"
        },

        // ================= LEVEL 6: FREQUENCY JAMMING (Nibble Swap) =================
        {
            levelNumber: 6, variant: v,
            description: "Jam the chopper radar. Swap the Upper 4 bits with the Lower 4 bits of the frequency.",
            snippets: [
                { id: "f1", code: "int main() {" },
                { id: "f2", code: `    int val = ${16 + v};` },
                { id: "f3", code: "    int high = (val & 0xF0) >> 4;" },
                { id: "f4", code: "    int low = (val & 0x0F) << 4;" },
                { id: "f5", code: "    int res = high | low;" },
                { id: "f6", code: "    printf(\"%d\", res);" },
                { id: "f7", code: "}" },
                // ➤ BLUFFS
                { id: "B11", code: "int res = val <<< 2;" },
                { id: "B12", code: "int res = val ** 2;" }
            ],
            correctSequence: ["f1", "f2", "f3", "f4", "f5", "f6", "f7"],
            swappableGroups: [["f3", "f4"]],
            expectedOutput: ((((16 + v) & 0xF0) >> 4) | (((16 + v) & 0x0F) << 4)).toString()
        },

        // ================= LEVEL 7: INTERPOL DATABASE (Pointer Scan) =================
        {
            levelNumber: 7, variant: v,
            description: "Scan the Red Notice files. Sum the current ID and the NEXT ID using pointer offsets.",
            snippets: [
                { id: "g1", code: "int main() {" },
                { id: "g2", code: `    int arr[] = {10, 20, 30, ${40 + v}, 50};` },
                { id: "g3", code: "    int *ptr = arr;" },
                { id: "g4", code: "    int total = 0;" },
                { id: "g5", code: "    for(int i=0; i<4; i++) {" },
                { id: "g6", code: "        total += *ptr + *(ptr + 1);" },
                { id: "g7", code: "        ptr++;" },
                { id: "g8", code: "    }" },
                { id: "g9", code: "    printf(\"%d\", total);" },
                { id: "g10", code: "}" },
                // ➤ BLUFFS
                { id: "B13", code: "ptr.next();" },
                { id: "B14", code: "int ptr = &arr;" }
            ],
            correctSequence: ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10"],
            swappableGroups: [["g3", "g4"]],
            expectedOutput: (() => {
                let a = [10, 20, 30, 40 + v, 50];
                let tot = 0;
                for (let i = 0; i < 4; i++) tot += a[i] + a[i + 1];
                return tot.toString();
            })()
        },

        // ================= LEVEL 8: DECRYPT MANIFEST (XOR Loop) =================
        {
            levelNumber: 8, variant: v,
            description: "Decrypt the stolen art manifest using The Bishop's Key (5). Sum the decrypted values.",
            snippets: [
                { id: "h1", code: "int main() {" },
                { id: "h2", code: `    int t[] = {${v + 6}, ${v + 7}, ${v + 8}};` },
                { id: "h3", code: "    int key = 5;" },
                { id: "h4", code: "    int i = 0;" },
                { id: "h5", code: "    while(i < 3) {" },
                { id: "h6", code: "        t[i] = t[i] ^ key;" },
                { id: "h7", code: "        i++;" },
                { id: "h8", code: "    }" },
                { id: "h9", code: "    printf(\"%d\", t[0] + t[1] + t[2]);" },
                { id: "h10", code: "}" },
                // ➤ BLUFFS
                { id: "B15", code: "t[i] = t[i] ** key;" },
                { id: "B16", code: "string key = 5;" }
            ],
            correctSequence: ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10"],
            swappableGroups: [["h2", "h3", "h4"]],
            expectedOutput: (((v + 6) ^ 5) + ((v + 7) ^ 5) + ((v + 8) ^ 5)).toString()
        },

        // ================= LEVEL 9: MINE SHAFT ESCAPE (Power Series) =================
        {
            levelNumber: 9, variant: v,
            description: "Calculate engine thrust. Add 'i * j' to power only when 'i + j' is even.",
            snippets: [
                { id: "i1", code: "int main() {" },
                { id: "i2", code: `    int max = ${3 + (v % 2)};` },
                { id: "i3", code: "    int power = 0;" },
                { id: "i4", code: "    for(int i=1; i<=max; i++) {" },
                { id: "i5", code: "        for(int j=1; j<=max; j++) {" },
                { id: "i6", code: "            if((i + j) % 2 == 0) {" },
                { id: "i7", code: "                power += (i * j);" },
                { id: "i8", code: "            }" },
                { id: "i9", code: "        }" },
                { id: "i10", code: "    }" },
                { id: "i11", code: "    printf(\"%d\", power);" },
                { id: "i12", code: "}" },
                // ➤ BLUFFS
                { id: "B17", code: "if((i + j) / 2 == 0)" },
                { id: "B18", code: "power = i x j;" }
            ],
            correctSequence: ["i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9", "i10", "i11", "i12"],
            swappableGroups: [["i2", "i3"]],
            expectedOutput: (() => {
                let m = 3 + (v % 2); let p = 0;
                for (let i = 1; i <= m; i++) for (let j = 1; j <= m; j++) if ((i + j) % 2 === 0) p += (i * j);
                return p.toString();
            })()
        },

        // ================= LEVEL 10: BOSS - BIOMETRIC OVERRIDE =================
        {
            levelNumber: 10, variant: v,
            description: "BOSS: Override the Core. Use the Triple-Lock Pointer Arithmetic loop.",
            snippets: [
                { id: "j1", code: "int main() {" },
                { id: "j2", code: `    int sector[5] = {${10 + v}, ${20 + v}, ${30 + v}, ${40 + v}, ${50 + v}};` },
                { id: "j3", code: "    int *ptr = sector;" },
                { id: "j4", code: "    int **master = &ptr;" },
                { id: "j5", code: "    int i = 0;" },
                { id: "j6", code: "    *master += 1;" }, // ptr moves to index 1
                { id: "j7", code: "    while(i < 3) {" },
                { id: "j8", code: "        **master += 10;" }, // Modify current
                { id: "j9", code: "        *master += 1;" }, // Move ptr forward
                { id: "j10", code: "        i++;" },
                { id: "j11", code: "    }" },
                { id: "j12", code: "    *master = sector;" }, // Reset ptr
                { id: "j13", code: "    int result = *(ptr + 3) + *(*master + 1);" },
                { id: "j14", code: "    printf(\"%d\", result);" },
                { id: "j15", code: "    return 0;" },
                { id: "j16", code: "}" },
                // ➤ BLUFFS
                { id: "B19", code: "int **master = &&ptr;" },
                { id: "B20", code: "master++;" },
                { id: "B21", code: "def reset(master);" },
                { id: "B22", code: "result := ptr^;" }
            ],
            correctSequence: ["j1", "j2", "j3", "j4", "j5", "j6", "j7", "j8", "j9", "j10", "j11", "j12", "j13", "j14", "j15", "j16"],
            swappableGroups: [["j3", "j4", "j5"]],
            expectedOutput: (() => {
                let arr = [10 + v, 20 + v, 30 + v, 40 + v, 50 + v];
                let ptr = 1; // Line j6
                for (let k = 0; k < 3; k++) {
                    arr[ptr] += 10;
                    ptr++;
                }
                // arr[3] is modified (40+v+10). arr[1] is modified (20+v+10)
                let res = arr[3] + arr[1];
                return res.toString();
            })()
        }
    ];
};

const TEAMS_DATA = [
    { teamId: "mona-lisa", index: 0 }, { teamId: "the-last-supper", index: 1 },
    { teamId: "starry-night", index: 2 }, { teamId: "the-scream", index: 3 },
    { teamId: "guernica", index: 4 }, { teamId: "las-meninas", index: 5 },
    { teamId: "composition-8", index: 6 }, { teamId: "sunflowers", index: 7 },
    { teamId: "water-lilies", index: 8 }, { teamId: "the-thinker", index: 9 },
    { teamId: "persistence", index: 10 }, { teamId: "the-hay-wain", index: 11 },
    { teamId: "the-swing", index: 12 }, { teamId: "no-5-1948", index: 13 },
    { teamId: "olympia", index: 14 }, { teamId: "irises", index: 15 },
    { teamId: "nighthawk", index: 16 }, { teamId: "the-gleaners", index: 17 },
    { teamId: "the-blue-boy", index: 18 }, { teamId: "judith", index: 19 },
    { teamId: "ophelia", index: 20 }, { teamId: "saturn", index: 21 },
    { teamId: "liberty", index: 22 }, { teamId: "melancholia", index: 23 },
    { teamId: "venus", index: 24 }, { teamId: "napoleon", index: 25 },
    { teamId: "salome", index: 26 }, { teamId: "flora", index: 27 },
    { teamId: "the-dream", index: 28 }, { teamId: "arnolfini", index: 29 }
];

const seedDB = async () => {
    try {
        try { await mongoose.connection.collection('levels').drop(); } catch (e) { }
        await Team.deleteMany({});

        // 1. Generate Teams with PINs
        const teamsWithPins = TEAMS_DATA.map(t => ({
            teamId: t.teamId,
            pin: Math.floor(1000 + Math.random() * 9000).toString(),
            score: 1000,
            currentLevel: 1,
            variant: t.index % 8,
            violations: 0,
            isLocked: false
        }));

        await Team.insertMany(teamsWithPins);

        // 2. Insert Levels
        let allLevels = [];
        for (let i = 0; i < 8; i++) {
            allLevels = [...allLevels, ...generateLevelSet(i)];
        }
        await Level.insertMany(allLevels);

        // 3. PRINT THE MASTER LIST
        console.log("\n\n==================================================");
        console.log("🔐  MASTER ADMIN PIN LIST (DO NOT SHARE PUBLICLY)  🔐");
        console.log("==================================================");
        console.table(teamsWithPins.map(t => ({ "Team Name": t.teamId, "ACCESS PIN": t.pin })));
        console.log("==================================================");
        console.log("✅ Database Seeded. Copy the list above.");

    } catch (error) { console.error("❌ Seeding Error:", error); }
    finally { mongoose.connection.close(); }
};