import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questions = [
  // --- QUANTITATIVE ---
  {
    category: "Quantitative", level: "Medium", testSetName: "Standard Test", timerSeconds: 60,
    question: "If a train 150m long crosses a pole in 15 seconds, what is its speed?",
    options: ["10 m/s", "15 m/s", "25 m/s", "36 km/hr"],
    correctOptionIndex: 0
  },
  {
    category: "Quantitative", level: "Hard", testSetName: "Standard Test", timerSeconds: 90,
    question: "Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both are opened together, when will the tank be full?",
    options: ["10 mins", "12 mins", "15 mins", "25 mins"],
    correctOptionIndex: 1
  },
  {
    category: "Quantitative", level: "Medium", testSetName: "Standard Test", timerSeconds: 60,
    question: "Find the compound interest on $10,000 at 10% per annum for 2 years.",
    options: ["$2000", "$2100", "$2200", "$1000"],
    correctOptionIndex: 1
  },
  {
    category: "Quantitative", level: "Hard Core", testSetName: "Standard Test", timerSeconds: 120,
    question: "At what time between 4 and 5 o'clock will the hands of a watch point in opposite directions?",
    options: ["45 min. past 4", "40 min. past 4", "54 6/11 min. past 4", "50 min. past 4"],
    correctOptionIndex: 2
  },

  // --- LOGICAL ---
  {
    category: "Logical", level: "Medium", testSetName: "Standard Test", timerSeconds: 60,
    question: "Look at this series: 2, 6, 18, 54, ... What number should come next?",
    options: ["108", "148", "162", "216"],
    correctOptionIndex: 2
  },
  {
    category: "Logical", level: "Hard", testSetName: "Standard Test", timerSeconds: 90,
    question: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that code?",
    options: ["EOJDEJFM", "MFEDJJOE", "EOJDJEFM", "MFEJDJOE"],
    correctOptionIndex: 0
  },
  {
    category: "Logical", level: "Medium", testSetName: "Standard Test", timerSeconds: 60,
    question: "SCD, TEF, UGH, ____, WKL",
    options: ["IJT", "VIJ", "CMN", "UJI"],
    correctOptionIndex: 1
  },

  // --- VERBAL ---
  {
    category: "Verbal", level: "Medium", testSetName: "Standard Test", timerSeconds: 45,
    question: "Find the correctly spelt word.",
    options: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"],
    correctOptionIndex: 1
  },
  {
    category: "Verbal", level: "Hard", testSetName: "Standard Test", timerSeconds: 60,
    question: "Choose the word which is most nearly the opposite in meaning to the word 'OBSTINATE'.",
    options: ["Foolish", "Unyielding", "Flexible", "Persistent"],
    correctOptionIndex: 2
  },
  {
    category: "Verbal", level: "Easy", testSetName: "Standard Test", timerSeconds: 30,
    question: "Choose the word most similar in meaning to 'ABANDON'.",
    options: ["Keep", "Forsake", "Cherish", "Embrace"],
    correctOptionIndex: 1
  }
];

const seedTestMap = async () => {
    console.log("Seeding Standard Test massive data set...");
    const ref = collection(db, "aptitude_questions");
    for (let i = 0; i < questions.length; i++) {
        await addDoc(ref, questions[i]);
    }
    console.log(`Successfully seeded ${questions.length} questions into Standard Test!`);
    process.exit(0);
};

seedTestMap();
