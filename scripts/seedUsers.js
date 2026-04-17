import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the root .env.local file
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Setup Firebase Client in Node
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("🔥 ERROR: Firebase API Key not found. Make sure .env.local exists.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Realistic Data Banks
const degrees = ['B.Tech Computer Science', 'B.Tech IT', 'BCA', 'MCA'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const languages = ['Python', 'Java', 'C++', 'JavaScript'];
const goals = ['Full Stack Developer', 'Data Scientist', 'Frontend Developer', 'Backend Developer'];
const weaknesses = ['Data Structures & Algorithms', 'System Design', 'Communication / Interviews'];
const companies = ['Product Based (FAANG/Top Tech)', 'Service Based (MNCs)', 'Startups'];

const usersToSpawn = [
  { email: 'user1@gmail.com', name: 'Alex Johnson', strength: 'High' },
  { email: 'user2@gmail.com', name: 'Samantha Lee', strength: 'Medium' },
  { email: 'user3@gmail.com', name: 'Rahul Sharma', strength: 'High' },
  { email: 'user4@gmail.com', name: 'Chris Patel', strength: 'Low' },
  { email: 'user5@gmail.com', name: 'Emily Davis', strength: 'Expert' }
];

const randomArr = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function createAuthUserViaREST(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  const data = await response.json();
  if (!response.ok) {
    if (data.error.message === 'EMAIL_EXISTS') {
      console.log(`⚠️ User ${email} already exists. Skipping auth creation.`);
      // Try to log in to get the UID instead
      const loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
      const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      const loginData = await loginRes.json();
      return loginData.localId; // returns UID
    }
    throw new Error(data.error.message);
  }
  return data.localId; // returns UID
}

async function seedDatabase() {
  console.log("🚀 Starting Database Seeding...\n");

  for (const user of usersToSpawn) {
    try {
      console.log(`Creating ${user.email}...`);
      
      // 1. Create in Firebase Auth without logging out current active users
      const uid = await createAuthUserViaREST(user.email, 'user@123');
      
      // Generate some performance stats based on their "strength" tier
      let baseScore = user.strength === 'Expert' ? 95 : user.strength === 'High' ? 85 : user.strength === 'Medium' ? 70 : 50;
      
      // 2. Write highly detailed profile into Firestore Database
      await setDoc(doc(db, "users", uid), {
        name: user.name,
        email: user.email,
        role: 'student',
        profile: {
          degree: randomArr(degrees),
          year: randomArr(years),
          primaryLanguage: randomArr(languages),
          careerGoal: randomArr(goals),
          weakness: randomArr(weaknesses),
          targetCompany: randomArr(companies)
        },
        performance: {
          overallScore: baseScore + Math.floor(Math.random() * 5),
          aptitudeScore: baseScore + Math.floor(Math.random() * 10 - 5),
          codingScore: baseScore + Math.floor(Math.random() * 12 - 6),
          interviewScore: baseScore + Math.floor(Math.random() * 8 - 4),
          problemsSolved: baseScore > 80 ? 150 : 45
        },
        createdAt: new Date().toISOString()
      });

      console.log(`✅ Fully Seeded ${user.name} [UID: ${uid}]`);
    } catch (err) {
      console.error(`❌ Failed on ${user.email}:`, err);
    }
  }

  console.log("\n🎉 Database Seeding Complete! Go check your Admin Dashboard.");
  process.exit(0);
}

seedDatabase();
