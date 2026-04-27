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

const categories = ["Quantitative", "Logical", "Verbal"];
const levels = ["Easy", "Medium", "Hard", "Hard Core", "Expert"];
const testSets = ["Standard Test", "Test 1", "Test 2", "Test 3", "TCS NQT", "Infosys Pseudo"];

const generateQuestion = (cat, lev, testSet, index) => {
   let timer = 30;
   if (lev === "Medium") timer = 45;
   if (lev === "Hard") timer = 60;
   if (lev === "Hard Core") timer = 90;
   if (lev === "Expert") timer = 120;
   
   return {
      category: cat,
      level: lev,
      testSetName: testSet,
      timerSeconds: timer,
      question: `[${testSet}] Generic ${lev} ${cat} Question #${index}: Solve for X where X is a complex variable based on real-world placement criteria.`,
      options: ["Option A (Correct)", "Option B", "Option C", "Option D"],
      correctOptionIndex: 0
   };
};

const seedEntireMatrix = async () => {
    console.log("INITIALIZING MASSIVE V5 HYPER-SEEDER...");
    const ref = collection(db, "aptitude_questions");
    const buffer = [];
    
    // 3 categories * 5 levels * 6 testSets * 3 questions each = 270 questions!
    for (const cat of categories) {
       for (const lev of levels) {
          for (const ts of testSets) {
             for (let i = 1; i <= 3; i++) {
                 buffer.push(generateQuestion(cat, lev, ts, i));
             }
          }
       }
    }
    
    console.log(`Payload loaded: ${buffer.length} questions. Blasting to Firebase...`);
    let count = 0;
    for (const q of buffer) {
       await addDoc(ref, q);
       count++;
       if (count % 50 === 0) console.log(`Injected ${count}/${buffer.length}...`);
    }
    console.log("MASSIVE DATATBASE SEED COMPLETE!");
    process.exit(0);
};

seedEntireMatrix();
