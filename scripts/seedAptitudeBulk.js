import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testSets = ['Standard Test', 'TCS NQT Pattern', 'Test 1'];
const categories = ['Quantitative', 'Logical', 'Verbal'];
const levels = ['Easy', 'Medium', 'Hard', 'Hard Core', 'Expert'];

const timerMap = { 'Easy': 60, 'Medium': 90, 'Hard': 120, 'Hard Core': 150, 'Expert': 180 };

let idCounter = 1;
const nextId = (cat, lev, set) => `${cat.slice(0, 3).toUpperCase()}_${lev.replace(/\s/g, '')}_${set.replace(/\s/g, '')}_${String(idCounter++).padStart(3, '0')}`;

// Question banks by category
const quantitativeBank = [
  { q: "What is 15% of 200?", o: ["25", "30", "35", "40"], a: 1 },
  { q: "If 3 workers can complete a job in 10 days, how many days will 5 workers take?", o: ["4", "5", "6", "8"], a: 2 },
  { q: "The average of first 10 even numbers is:", o: ["10", "11", "12", "9"], a: 1 },
  { q: "A man walks at 5 km/h and misses a train by 7 minutes. At 6 km/h he reaches 5 minutes early. Find the distance.", o: ["6 km", "7 km", "8 km", "9 km"], a: 0 },
  { q: "If a number is increased by 20% and then decreased by 20%, the net change is:", o: ["No change", "4% decrease", "4% increase", "2% decrease"], a: 1 },
  { q: "The HCF of two numbers is 12 and their LCM is 360. If one number is 60, find the other.", o: ["72", "60", "48", "84"], a: 0 },
  { q: "In what ratio must water be mixed with milk costing Rs. 60/litre to get a mixture worth Rs. 40/litre?", o: ["1:2", "2:1", "1:1", "3:2"], a: 0 },
  { q: "A sum doubles in 5 years at simple interest. In how many years will it become 4 times?", o: ["10", "15", "20", "25"], a: 1 },
  { q: "The difference between CI and SI on Rs. 5000 for 2 years at 4% per annum is:", o: ["Rs. 8", "Rs. 10", "Rs. 12", "Rs. 16"], a: 0 },
  { q: "A bag contains 4 white, 5 red and 6 blue balls. Probability of drawing a red ball is:", o: ["5/15", "1/3", "1/5", "2/5"], a: 1 },
  { q: "If x + 1/x = 5, find x² + 1/x².", o: ["23", "24", "25", "27"], a: 0 },
  { q: "The area of a square field is 3136 sq m. Find the cost of fencing it at Rs. 15/m.", o: ["Rs. 1680", "Rs. 2240", "Rs. 2520", "Rs. 3360"], a: 1 },
  { q: "Two numbers are in ratio 3:5. If each is increased by 10, the ratio becomes 5:7. Find the numbers.", o: ["6 and 10", "9 and 15", "12 and 20", "15 and 25"], a: 3 },
  { q: "A boat goes 12 km upstream in 3 hours and 18 km downstream in 2 hours. Find the speed of the stream.", o: ["1 km/h", "2 km/h", "3 km/h", "4 km/h"], a: 1 },
  { q: "The number of triangles in a pentagon is:", o: ["5", "10", "3", "7"], a: 2 },
  { q: "If log₁₀2 = 0.3010, how many digits are in 2⁶⁴?", o: ["18", "19", "20", "21"], a: 2 },
  { q: "Find the remainder when 2¹⁰⁰ is divided by 7.", o: ["1", "2", "4", "6"], a: 1 },
  { q: "Solve: 3^(2x-1) = 27^(x-2)", o: ["1", "2", "3", "4"], a: 2 },
  { q: "Two dice are thrown. Probability of getting a sum of 7 is:", o: ["1/6", "1/9", "1/12", "5/36"], a: 0 },
  { q: "The sum of three consecutive multiples of 4 is 48. Find the largest number.", o: ["16", "20", "24", "28"], a: 1 },
];

const logicalBank = [
  { q: "Find the odd one out: 2, 3, 5, 8, 12, 17", o: ["8", "12", "17", "2"], a: 1 },
  { q: "If AU = 21 and BC = 23, what is DG?", o: ["27", "29", "31", "33"], a: 2 },
  { q: "Complete the analogy: Doctor : Hospital :: Teacher : ?", o: ["School", "Class", "Student", "Book"], a: 0 },
  { q: "Find the next term: B2CD, _____, BCD4, B5CD, BC6D", o: ["BC3D", "B2C2D", "BCD7", "B3CD"], a: 3 },
  { q: "Statements: All pens are books. Some books are inks. Conclusions: I. Some pens are inks. II. Some inks are pens.", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], a: 3 },
  { q: "A is father of B. C is daughter of B. D is brother of B. How is D related to A?", o: ["Son", "Daughter", "Nephew", "Cannot say"], a: 0 },
  { q: "In a row of 40 students, A is 15th from left and B is 20th from right. How many students are between them?", o: ["5", "6", "7", "8"], a: 0 },
  { q: "Which number replaces the question mark? 3, 10, 29, 66, 127, ?", o: ["210", "218", "220", "216"], a: 1 },
  { q: "If WATER is coded as YCVGT, then what is the code for SALT?", o: ["UCNV", "UCMV", "TBMV", "UBNV"], a: 0 },
  { q: "Five people P, Q, R, S, T sit in a circle. P is between Q and R. S is to the right of R. Who is opposite P?", o: ["Q", "R", "S", "T"], a: 3 },
  { q: "Statements: No dog is a cat. Some cats are rats. Conclusions: I. No rat is a dog. II. Some rats are not dogs.", o: ["Only I", "Only II", "Both", "Neither"], a: 1 },
  { q: "A + B means A is brother of B. A × B means A is father of B. Which means P is uncle of Q?", o: ["P + R × Q", "P × R + Q", "P + R + Q", "P × R × Q"], a: 0 },
  { q: "Find the missing number: 2, 6, 18, 54, ?, 486", o: ["108", "162", "216", "324"], a: 1 },
  { q: "If 6 * 3 = 18, 9 * 4 = 36, then 12 * 5 = ?", o: ["48", "60", "72", "84"], a: 1 },
  { q: "Which word cannot be formed from 'REPRESENTATION'?", o: ["PRINT", "PATIENT", "TAPER", "SENTENCE"], a: 1 },
  { q: "In a certain code, '247' means 'spread red carpet', '256' means 'dust one carpet', '264' means 'one red carpet'. What is the code for 'dust'?", o: ["2", "5", "6", "4"], a: 1 },
  { q: "Find the next pair: (2, 3), (5, 7), (11, 13), (17, 19), ?", o: ["(23, 29)", "(29, 31)", "(19, 23)", "(31, 37)"], a: 0 },
  { q: "All birds can fly. Ostrich is a bird. Therefore:", o: ["Ostrich can fly", "Ostrich cannot fly", "No conclusion", "Some birds cannot fly"], a: 2 },
  { q: "Monday : Tuesday :: Sunday : ?", o: ["Friday", "Saturday", "Monday", "Wednesday"], a: 2 },
  { q: "Count the number of squares in a 3×3 grid of squares.", o: ["9", "14", "16", "18"], a: 1 },
];

const verbalBank = [
  { q: "Choose the synonym of 'BENEVOLENT'.", o: ["Cruel", "Kind", "Selfish", "Hostile"], a: 1 },
  { q: "Choose the antonym of 'PRudent'.", o: ["Careful", "Rash", "Wise", "Cautious"], a: 1 },
  { q: "Identify the correctly spelt word.", o: ["DEFINately", "DEFInately", "DEFinitely", "DEFinitley"], a: 2 },
  { q: "Fill in the blank: The company decided to _____ production due to low demand.", o: ["increase", "decrease", "accelerate", "expand"], a: 1 },
  { q: "Choose the word that best fits: 'His _____ nature made him popular among his peers.'", o: ["sullen", "affable", "morose", "reserved"], a: 1 },
  { q: "Find the error: 'Each of the students have submitted their assignments.'", o: ["Each of", "the students", "have submitted", "their assignments"], a: 2 },
  { q: "Rearrange: P. The teacher entered. Q. The class stood up. R. She greeted them. S. They sat down.", o: ["PQRS", "PSQR", "QPRS", "PRQS"], a: 0 },
  { q: "One word substitution: 'A person who knows many languages.'", o: ["Polyglot", "Linguist", "Bilingual", "Translator"], a: 0 },
  { q: "Choose the meaning of the idiom: 'To burn the midnight oil.'", o: ["To waste time", "To study late", "To work under pressure", "To be angry"], a: 1 },
  { q: "Fill in the blank: 'Despite his _____ efforts, he failed to win the match.'", o: ["subtle", "valiant", "meager", "casual"], a: 1 },
  { q: "Find the error: 'The sceneries of Kashmir are breathtaking.'", o: ["The sceneries", "of Kashmir", "are", "breathtaking"], a: 0 },
  { q: "Choose the antonym of 'MITIGATE'.", o: ["Alleviate", "Aggravate", "Lessen", "Reduce"], a: 1 },
  { q: "Synonym of 'EPHEMERAL':", o: ["Eternal", "Temporary", "Permanent", "Stable"], a: 1 },
  { q: "Fill in: 'The _____ of the situation left everyone speechless.'", o: ["gravity", "levity", " triviality", "simplicity"], a: 0 },
  { q: "Find the error: 'He is one of the best player in the team.'", o: ["He is", "one of the", "best player", "in the team"], a: 2 },
  { q: "One word: 'Fear of heights.'", o: ["Agoraphobia", "Claustrophobia", "Acrophobia", "Xenophobia"], a: 2 },
  { q: "Idiom: 'To let the cat out of the bag.'", o: ["To reveal a secret", "To cause trouble", "To be clumsy", "To free someone"], a: 0 },
  { q: "Choose the correct sentence.", o: ["He don't like coffee.", "He doesn't likes coffee.", "He doesn't like coffee.", "He not like coffee."], a: 2 },
  { q: "Antonym of 'OSTENTATIOUS':", o: ["Showy", "Modest", "Flamboyant", "Ga ud"], a: 1 },
  { q: "Fill in: 'The novel was so _____ that I finished it in one sitting.'", o: ["tedious", "engrossing", "dull", "boring"], a: 1 },
];

// Generate multiple questions per combination by rotating through banks
function generateQuestions() {
  const all = [];
  const bankMap = { 'Quantitative': quantitativeBank, 'Logical': logicalBank, 'Verbal': verbalBank };

  for (const ts of testSets) {
    for (const cat of categories) {
      for (const lev of levels) {
        const bank = bankMap[cat];
        // Each combo gets 6 questions (pulled round-robin from the bank)
        for (let i = 0; i < 6; i++) {
          const src = bank[(i + levels.indexOf(lev) + categories.indexOf(cat)) % bank.length];
          all.push({
            id: nextId(cat, lev, ts),
            category: cat,
            level: lev,
            testSetName: ts,
            question: src.q,
            options: src.o,
            correctOptionIndex: src.a,
            timerSeconds: timerMap[lev]
          });
        }
      }
    }
  }
  return all;
}

async function seedBulk() {
  console.log("🚀 Generating real aptitude question bulk dataset...\n");

  const questions = generateQuestions();
  console.log(`Generated ${questions.length} questions.`);
  console.log("Distribution check:");
  const comboCounts = {};
  questions.forEach(q => {
    const key = `${q.testSetName} | ${q.category} | ${q.level}`;
    comboCounts[key] = (comboCounts[key] || 0) + 1;
  });
  console.log("Each combination gets:", Object.values(comboCounts)[0], "questions");

  console.log("\n🧹 Deleting ALL existing aptitude_questions first...");
  const existing = await getDocs(collection(db, "aptitude_questions"));
  let deleted = 0;
  for (const docSnap of existing.docs) {
    await deleteDoc(doc(db, "aptitude_questions", docSnap.id));
    deleted++;
  }
  console.log(`Deleted ${deleted} old questions.\n`);

  console.log("🌱 Seeding new questions in batches...");
  let count = 0;
  // Firestore has a 500 op batch limit, use 400 safe
  const BATCH_SIZE = 400;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = questions.slice(i, i + BATCH_SIZE);
    chunk.forEach(q => {
      const ref = doc(db, "aptitude_questions", q.id);
      batch.set(ref, {
        category: q.category,
        level: q.level,
        testSetName: q.testSetName,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        timerSeconds: q.timerSeconds,
        createdAt: new Date().toISOString()
      });
    });
    await batch.commit();
    count += chunk.length;
    console.log(`  Committed ${count}/${questions.length}...`);
  }

  console.log(`\n✅ DONE! Seeded ${count} real aptitude questions.`);
  console.log("\nEvery testSet + category + level combination now has 6 questions.");
  process.exit(0);
}

seedBulk().catch(err => {
  console.error("Bulk seed failed:", err);
  process.exit(1);
});

