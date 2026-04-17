import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Need to duplicate firebase config for the pure node script run
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "dummy", // we will load dotenv
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: process.env.VITE_FIREBASE_APP_ID || "dummy"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newQuestions = [
  {
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: ["120 metres", "180 metres", "324 metres", "150 metres"],
    correctOptionIndex: 3,
    category: "Quantitative",
    level: "Easy",
    testSetName: "Test 1",
    timerSeconds: 60
  },
  {
    question: "If 15 toys cost 234, what do 35 toys cost?",
    options: ["546", "540", "560", "550"],
    correctOptionIndex: 0,
    category: "Quantitative",
    level: "Easy",
    testSetName: "Test 1",
    timerSeconds: 60
  },
  {
    question: "Find the odd man out: 3, 5, 11, 14, 17, 21",
    options: ["21", "17", "14", "3"],
    correctOptionIndex: 2, // 14 is even, rest are odd, or primes vs non
    category: "Logical",
    level: "Easy",
    testSetName: "Test 1",
    timerSeconds: 60
  },
  {
    question: "Choose the synonym for 'OBSTINATE':",
    options: ["Stubborn", "Pretty", "Silly", "Clever"],
    correctOptionIndex: 0,
    category: "Verbal",
    level: "Easy",
    testSetName: "Test 1",
    timerSeconds: 60
  }
];

async function seed() {
  console.log("Seeding Test 1 set...");
  let count = 0;
  for (const q of newQuestions) {
     q.createdAt = new Date().toISOString();
     await addDoc(collection(db, "aptitude_questions"), q);
     count++;
  }
  console.log(`Successfully seeded ${count} questions into Test 1.`);
  process.exit(0);
}

seed();
