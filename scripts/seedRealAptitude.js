import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

const questions = [
  // ==================== QUANTITATIVE ====================
  // Easy
  {
    id: "q_001", category: "Quantitative", level: "Easy", testSetName: "Standard Test", timerSeconds: 60,
    question: "What is 25% of 400?",
    options: ["50", "75", "100", "125"],
    correctOptionIndex: 2
  },
  {
    id: "q_002", category: "Quantitative", level: "Easy", testSetName: "Standard Test", timerSeconds: 60,
    question: "If a shirt costs Rs. 250 after a 20% discount, what was its original price?",
    options: ["Rs. 300", "Rs. 312.50", "Rs. 275", "Rs. 350"],
    correctOptionIndex: 1
  },
  {
    id: "q_003", category: "Quantitative", level: "Easy", testSetName: "Standard Test", timerSeconds: 60,
    question: "The average of 5 numbers is 24. If one number is excluded, the average becomes 22. What is the excluded number?",
    options: ["30", "32", "28", "26"],
    correctOptionIndex: 1
  },
  {
    id: "q_004", category: "Quantitative", level: "Easy", testSetName: "TCS NQT Pattern", timerSeconds: 60,
    question: "A train 150m long crosses a pole in 15 seconds. What is its speed in km/hr?",
    options: ["36 km/hr", "45 km/hr", "54 km/hr", "30 km/hr"],
    correctOptionIndex: 0
  },
  {
    id: "q_005", category: "Quantitative", level: "Easy", testSetName: "TCS NQT Pattern", timerSeconds: 60,
    question: "Find the simple interest on Rs. 5000 at 8% per annum for 3 years.",
    options: ["Rs. 1000", "Rs. 1200", "Rs. 1500", "Rs. 900"],
    correctOptionIndex: 1
  },
  // Medium
  {
    id: "q_006", category: "Quantitative", level: "Medium", testSetName: "Standard Test", timerSeconds: 90,
    question: "Two pipes A and B can fill a tank in 20 minutes and 30 minutes respectively. If both pipes are opened together, how long will it take to fill the tank?",
    options: ["10 minutes", "12 minutes", "15 minutes", "25 minutes"],
    correctOptionIndex: 1
  },
  {
    id: "q_007", category: "Quantitative", level: "Medium", testSetName: "Standard Test", timerSeconds: 90,
    question: "The ratio of present ages of A and B is 4:5. After 5 years, the ratio becomes 5:6. What is B's present age?",
    options: ["20 years", "25 years", "30 years", "35 years"],
    correctOptionIndex: 1
  },
  {
    id: "q_008", category: "Quantitative", level: "Medium", testSetName: "Standard Test", timerSeconds: 90,
    question: "A man bought 15 apples for Rs. 120 and sold them at Rs. 10 each. What is his profit percentage?",
    options: ["20%", "25%", "30%", "15%"],
    correctOptionIndex: 1
  },
  {
    id: "q_009", category: "Quantitative", level: "Medium", testSetName: "TCS NQT Pattern", timerSeconds: 90,
    question: "Find the compound interest on Rs. 10,000 at 10% per annum for 2 years compounded annually.",
    options: ["Rs. 2000", "Rs. 2100", "Rs. 2200", "Rs. 1900"],
    correctOptionIndex: 1
  },
  {
    id: "q_010", category: "Quantitative", level: "Medium", testSetName: "TCS NQT Pattern", timerSeconds: 90,
    question: "If 12 men can complete a work in 18 days, in how many days can 8 men complete the same work?",
    options: ["24 days", "27 days", "30 days", "36 days"],
    correctOptionIndex: 1
  },
  // Hard
  {
    id: "q_011", category: "Quantitative", level: "Hard", testSetName: "Standard Test", timerSeconds: 120,
    question: "A can complete a work in 15 days and B in 20 days. They work together for 4 days, then A leaves. How many more days will B take to finish the remaining work?",
    options: ["8 days", "10 days", "12 days", "14 days"],
    correctOptionIndex: 0
  },
  {
    id: "q_012", category: "Quantitative", level: "Hard", testSetName: "Standard Test", timerSeconds: 120,
    question: "Two trains of length 120m and 180m are running in opposite directions at 60 km/hr and 40 km/hr. How long will they take to cross each other?",
    options: ["10.8 seconds", "12 seconds", "14.4 seconds", "18 seconds"],
    correctOptionIndex: 0
  },
  {
    id: "q_013", category: "Quantitative", level: "Hard", testSetName: "TCS NQT Pattern", timerSeconds: 120,
    question: "At what time between 4 and 5 o'clock will the hands of a clock point in opposite directions?",
    options: ["45 min past 4", "40 min past 4", "54 6/11 min past 4", "50 min past 4"],
    correctOptionIndex: 2
  },
  {
    id: "q_014", category: "Quantitative", level: "Hard", testSetName: "Infosys Alpha", timerSeconds: 120,
    question: "The LCM of two numbers is 480 and their HCF is 16. If one number is 80, find the other number.",
    options: ["96", "84", "72", "64"],
    correctOptionIndex: 0
  },
  // Hard Core
  {
    id: "q_015", category: "Quantitative", level: "Hard Core", testSetName: "Standard Test", timerSeconds: 150,
    question: "A vessel contains 60 litres of milk. 6 litres of milk is taken out and replaced with water. This process is repeated two more times. How much milk is left in the vessel?",
    options: ["42.5 litres", "43.74 litres", "45 litres", "40 litres"],
    correctOptionIndex: 1
  },
  // Expert
  {
    id: "q_016", category: "Quantitative", level: "Expert", testSetName: "Standard Test", timerSeconds: 180,
    question: "If log₂(x) + log₄(x) + log₁₆(x) = 21/4, what is the value of x?",
    options: ["8", "16", "32", "64"],
    correctOptionIndex: 0
  },

  // ==================== LOGICAL ====================
  // Easy
  {
    id: "q_017", category: "Logical", level: "Easy", testSetName: "Standard Test", timerSeconds: 60,
    question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    correctOptionIndex: 2
  },
  {
    id: "q_018", category: "Logical", level: "Easy", testSetName: "Standard Test", timerSeconds: 60,
    question: "If DOCTOR is coded as FQEVQT, how is PATIENT coded?",
    options: ["RCVKGPV", "RCVJGPV", "RCVKGPU", "RCVJGPU"],
    correctOptionIndex: 0
  },
  {
    id: "q_019", category: "Logical", level: "Easy", testSetName: "TCS NQT Pattern", timerSeconds: 60,
    question: "Complete the analogy: Book is to Reading as Fork is to ?",
    options: ["Cooking", "Eating", "Kitchen", "Food"],
    correctOptionIndex: 1
  },
  // Medium
  {
    id: "q_020", category: "Logical", level: "Medium", testSetName: "Standard Test", timerSeconds: 90,
    question: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that code?",
    options: ["EOJDEJFM", "MFEDJJOE", "EOJDJEFM", "MFEJDJOE"],
    correctOptionIndex: 0
  },
  {
    id: "q_021", category: "Logical", level: "Medium", testSetName: "Standard Test", timerSeconds: 90,
    question: "Five friends P, Q, R, S, T are sitting in a row. Q is between P and R. S is to the right of R. T is at the extreme right. Who is sitting in the middle?",
    options: ["P", "Q", "R", "S"],
    correctOptionIndex: 2
  },
  {
    id: "q_022", category: "Logical", level: "Medium", testSetName: "TCS NQT Pattern", timerSeconds: 90,
    question: "SCD, TEF, UGH, _____, WKL. What comes next?",
    options: ["IJT", "VIJ", "CMN", "UJI"],
    correctOptionIndex: 1
  },
  // Hard
  {
    id: "q_023", category: "Logical", level: "Hard", testSetName: "Standard Test", timerSeconds: 120,
    question: "Pointing to a photograph, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to the boy in the photograph?",
    options: ["Brother", "Uncle", "Cousin", "Father"],
    correctOptionIndex: 3
  },
  {
    id: "q_024", category: "Logical", level: "Hard", testSetName: "Standard Test", timerSeconds: 120,
    question: "If A is the brother of B; B is the sister of C; and C is the father of D, how is D related to A?",
    options: ["Brother", "Sister", "Nephew", "Cannot be determined"],
    correctOptionIndex: 3
  },
  // Hard Core
  {
    id: "q_025", category: "Logical", level: "Hard Core", testSetName: "Standard Test", timerSeconds: 150,
    question: "Six persons A, B, C, D, E, and F are sitting around a circular table. A is between B and C. D is between E and F. E is opposite B. Who is sitting to the immediate left of C?",
    options: ["A", "D", "F", "E"],
    correctOptionIndex: 2
  },
  // Expert
  {
    id: "q_026", category: "Logical", level: "Expert", testSetName: "Standard Test", timerSeconds: 180,
    question: "In a row of students, Rahul is 15th from the left and 20th from the right. If 5 new students join at the right end, what is Rahul's new position from the right?",
    options: ["20th", "22nd", "25th", "27th"],
    correctOptionIndex: 2
  },

  // ==================== VERBAL ====================
  // Easy
  {
    id: "q_027", category: "Verbal", level: "Easy", testSetName: "Standard Test", timerSeconds: 45,
    question: "Choose the word which is the exact OPPOSITE of 'ENORMOUS'.",
    options: ["Soft", "Average", "Tiny", "Weak"],
    correctOptionIndex: 2
  },
  {
    id: "q_028", category: "Verbal", level: "Easy", testSetName: "Standard Test", timerSeconds: 45,
    question: "Choose the word most similar in meaning to 'ABANDON'.",
    options: ["Keep", "Forsake", "Cherish", "Embrace"],
    correctOptionIndex: 1
  },
  {
    id: "q_029", category: "Verbal", level: "Easy", testSetName: "TCS NQT Pattern", timerSeconds: 45,
    question: "Identify the correctly spelt word.",
    options: ["Accomodate", "Accommodate", "Acommodation", "Acomodate"],
    correctOptionIndex: 1
  },
  // Medium
  {
    id: "q_030", category: "Verbal", level: "Medium", testSetName: "Standard Test", timerSeconds: 60,
    question: "Find the grammatical error in: 'I have been studying since four hours.'",
    options: ["I have been", "studying", "since four hours", "No error"],
    correctOptionIndex: 2
  },
  {
    id: "q_031", category: "Verbal", level: "Medium", testSetName: "Standard Test", timerSeconds: 60,
    question: "Choose the word most nearly opposite in meaning to 'OBSTINATE'.",
    options: ["Foolish", "Unyielding", "Flexible", "Persistent"],
    correctOptionIndex: 2
  },
  {
    id: "q_032", category: "Verbal", level: "Medium", testSetName: "TCS NQT Pattern", timerSeconds: 60,
    question: "Substitute the phrase: 'A person who renounces the world and practices self-discipline.'",
    options: ["Skeptic", "Ascetic", "Devotee", "Antiquarian"],
    correctOptionIndex: 1
  },
  // Hard
  {
    id: "q_033", category: "Verbal", level: "Hard", testSetName: "Standard Test", timerSeconds: 60,
    question: "Rearrange the sentences to form a meaningful paragraph:\nP. The river overflowed its banks.\nQ. Heavy rains lashed the city for three days.\nR. Thousands were evacuated.\nS. The administration issued a red alert.",
    options: ["QPSR", "QRPS", "QSPR", "PQRS"],
    correctOptionIndex: 0
  },
  {
    id: "q_034", category: "Verbal", level: "Hard", testSetName: "Standard Test", timerSeconds: 60,
    question: "Fill in the blank: 'Despite his repeated attempts, he _____ to clear the examination.'",
    options: ["succeeded", "managed", "failed", "achieved"],
    correctOptionIndex: 2
  },
  // Hard Core
  {
    id: "q_035", category: "Verbal", level: "Hard Core", testSetName: "Standard Test", timerSeconds: 90,
    question: "Read the sentence and choose the best replacement for the underlined part:\n'The manager asked the employee to give a detailed report by the end of the day.'",
    options: ["asked the employee to give", "told the employee that he should give", "requested the employee to submit", "ordered the employee for giving"],
    correctOptionIndex: 2
  },
  // Expert
  {
    id: "q_036", category: "Verbal", level: "Expert", testSetName: "Standard Test", timerSeconds: 120,
    question: "Choose the option that best captures the essence of the paragraph:\n'Technology has transformed education by making learning accessible beyond traditional classrooms. Online platforms offer flexibility, but they also demand self-discipline. The key is to balance digital tools with human interaction for holistic development.'",
    options: [
      "Technology alone can solve all educational challenges.",
      "Online learning requires balance between flexibility and discipline.",
      "Traditional classrooms are no longer necessary.",
      "Self-discipline is the only requirement for online education."
    ],
    correctOptionIndex: 1
  },

  // ==================== TEST SET 1 ====================
  {
    id: "q_037", category: "Quantitative", level: "Easy", testSetName: "Test 1", timerSeconds: 60,
    question: "What is the sum of the first 20 natural numbers?",
    options: ["200", "210", "220", "230"],
    correctOptionIndex: 1
  },
  {
    id: "q_038", category: "Quantitative", level: "Medium", testSetName: "Test 1", timerSeconds: 90,
    question: "A shopkeeper marks his goods 40% above the cost price and allows a discount of 25%. What is his profit percentage?",
    options: ["5%", "10%", "15%", "20%"],
    correctOptionIndex: 0
  },
  {
    id: "q_039", category: "Logical", level: "Easy", testSetName: "Test 1", timerSeconds: 60,
    question: "Complete the series: AZ, BY, CX, DW, ?",
    options: ["EV", "FU", "EV", "EV"],
    correctOptionIndex: 0
  },
  {
    id: "q_040", category: "Logical", level: "Medium", testSetName: "Test 1", timerSeconds: 90,
    question: "All roses are flowers. Some flowers are red. Which conclusion follows?",
    options: ["All roses are red", "Some roses are red", "No conclusion follows", "Some red things are flowers"],
    correctOptionIndex: 3
  },
  {
    id: "q_041", category: "Verbal", level: "Easy", testSetName: "Test 1", timerSeconds: 45,
    question: "Choose the synonym for 'PROMINENT'.",
    options: ["Obscure", "Important", "Hidden", "Minor"],
    correctOptionIndex: 1
  },
  {
    id: "q_042", category: "Verbal", level: "Medium", testSetName: "Test 1", timerSeconds: 60,
    question: "Fill in the blank: 'The committee _____ the proposal after careful deliberation.'",
    options: ["rejected", "accepted", "ignored", "delayed"],
    correctOptionIndex: 1
  }
];

async function seedAptitude() {
  console.log("🚀 Seeding REAL aptitude questions into Firestore...\n");
  let count = 0;

  for (const q of questions) {
    try {
      await setDoc(doc(db, "aptitude_questions", q.id), {
        category: q.category,
        level: q.level,
        testSetName: q.testSetName,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        timerSeconds: q.timerSeconds,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ [${q.category}] [${q.level}] [${q.testSetName}] ${q.id}`);
      count++;
    } catch (err) {
      console.error(`❌ Failed ${q.id}:`, err.message);
    }
  }

  console.log(`\n🎉 Successfully seeded ${count} real aptitude questions!`);
  console.log("\nBreakdown:");
  const cats = {};
  const levels = {};
  const sets = {};
  questions.forEach(q => {
    cats[q.category] = (cats[q.category] || 0) + 1;
    levels[q.level] = (levels[q.level] || 0) + 1;
    sets[q.testSetName] = (sets[q.testSetName] || 0) + 1;
  });
  console.log("  By Category:", cats);
  console.log("  By Level:", levels);
  console.log("  By Test Set:", sets);
  process.exit(0);
}

seedAptitude().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

