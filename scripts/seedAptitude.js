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

const aptitude_questions = [
  // --- QUANTITATIVE APTITUDE ---
  { 
    id: "apt_q_001", category: "Quantitative", level: "Easy", 
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", 
    options: ["120 metres", "180 metres", "324 metres", "150 metres"], correctOptionIndex: 3, timerSeconds: 60 
  },
  { 
    id: "apt_q_002", category: "Quantitative", level: "Medium", 
    question: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?", 
    options: ["4 years", "8 years", "10 years", "None of these"], correctOptionIndex: 0, timerSeconds: 90 
  },
  { 
    id: "apt_q_003", category: "Quantitative", level: "Hard", 
    question: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:", 
    options: ["1/4", "1/10", "7/15", "8/15"], correctOptionIndex: 3, timerSeconds: 120 
  },
  { 
    id: "apt_q_004", category: "Quantitative", level: "Expert", 
    question: "Two trains of equal length are running on parallel lines in the same direction at 46 km/hr and 36 km/hr. The faster train passes the slower train in 36 seconds. The length of each train is:", 
    options: ["50 m", "72 m", "80 m", "82 m"], correctOptionIndex: 0, timerSeconds: 120 
  },

  // --- LOGICAL REASONING ---
  { 
    id: "apt_l_001", category: "Logical", level: "Easy", 
    question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", 
    options: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"], correctOptionIndex: 1, timerSeconds: 60 
  },
  { 
    id: "apt_l_002", category: "Logical", level: "Medium", 
    question: "If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?", 
    options: ["Brother", "Sister", "Nephew", "Cannot be determined"], correctOptionIndex: 3, timerSeconds: 60 
  },
  { 
    id: "apt_l_003", category: "Logical", level: "Hard", 
    question: "SCD, TEF, UGH, ____, WKL. What sequence comes next?", 
    options: ["CMN", "UJI", "VIJ", "IJT"], correctOptionIndex: 2, timerSeconds: 90 
  },
  { 
    id: "apt_l_004", category: "Logical", level: "Hard Core", 
    question: "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?", 
    options: ["Brother", "Uncle", "Cousin", "Father"], correctOptionIndex: 3, timerSeconds: 60 
  },

  // --- VERBAL ABILITY ---
  { 
    id: "apt_v_001", category: "Verbal", level: "Easy", 
    question: "Choose the word which is the exact OPPOSITE of the given word: 'ENORMOUS'", 
    options: ["Soft", "Average", "Tiny", "Weak"], correctOptionIndex: 2, timerSeconds: 45 
  },
  { 
    id: "apt_v_002", category: "Verbal", level: "Medium", 
    question: "Find out whether there is any grammatical error in: 'I have been studying since four hours.'", 
    options: ["I have been", "studying", "since four hours", "No error"], correctOptionIndex: 2, timerSeconds: 60 
  },
  { 
    id: "apt_v_003", category: "Verbal", level: "Hard", 
    question: "Substitute the phrase: 'A person who renounces the world and practices self-discipline in order to attain salvation:'", 
    options: ["Skeptic", "Ascetic", "Devotee", "Antiquarian"], correctOptionIndex: 1, timerSeconds: 60 
  },
  { 
    id: "apt_v_004", category: "Verbal", level: "Expert", 
    question: "Choose the correct spelling:", 
    options: ["Accommodate", "Accomodate", "Acommodate", "Acomodate"], correctOptionIndex: 0, timerSeconds: 45 
  }
];

async function seedAptitudeQuestions() {
  console.log("🚀 Starting Aptitude Test Database Seeding...\n");
  let count = 0;
  for (const q of aptitude_questions) {
    try {
      await setDoc(doc(db, "aptitude_questions", q.id), {
        category: q.category,
        level: q.level,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        timerSeconds: q.timerSeconds,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Seeded: [${q.category}] [${q.level}] Question ${count+1}`);
      count++;
    } catch (err) {
      console.error(`❌ Failed:`, err);
    }
  }

  console.log(`\n🎉 Seeded ${count} elite Aptitude questions into Firebase!`);
  process.exit(0);
}

seedAptitudeQuestions();
