import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

async function cleanupAptitudeQuestions() {
  console.log("🧹 Fetching all aptitude questions from Firestore...\n");
  const snapshot = await getDocs(collection(db, "aptitude_questions"));
  const total = snapshot.size;

  if (total === 0) {
    console.log("No aptitude questions found. Nothing to delete.");
    process.exit(0);
  }

  console.log(`Found ${total} questions. Analyzing...\n`);

  let fakeCount = 0;
  let realCount = 0;
  const toDelete = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const qText = data.question || '';
    const isFake =
      qText.includes('Generic') &&
      qText.includes('Solve for X') &&
      qText.includes('complex variable');

    if (isFake) {
      fakeCount++;
      toDelete.push(docSnap.id);
    } else {
      realCount++;
    }
  });

  console.log(`📊 Analysis:`);
  console.log(`   Fake/Generic questions: ${fakeCount}`);
  console.log(`   Real questions:         ${realCount}`);
  console.log(`   Total:                  ${total}\n`);

  if (fakeCount === 0) {
    console.log("No fake questions detected. All questions appear to be real.");
    process.exit(0);
  }

  console.log(`⚠️  About to DELETE ${fakeCount} fake questions.`);
  console.log(`   Keeping ${realCount} real questions.\n`);

  let deleted = 0;
  for (const id of toDelete) {
    try {
      await deleteDoc(doc(db, "aptitude_questions", id));
      deleted++;
      if (deleted % 50 === 0) {
        console.log(`   Progress: ${deleted}/${fakeCount} deleted...`);
      }
    } catch (err) {
      console.error(`   ❌ Failed to delete ${id}:`, err.message);
    }
  }

  console.log(`\n✅ Cleanup complete! Deleted ${deleted} fake questions.`);
  console.log(`   ${realCount} real questions remain in the database.`);
  process.exit(0);
}

cleanupAptitudeQuestions().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});

