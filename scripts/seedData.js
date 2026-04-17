import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
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

if (!firebaseConfig.apiKey) {
  console.error("🔥 ERROR: Firebase API Key not found. Make sure .env.local exists.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jobs = [
  {
    company: "Google",
    role: "Cloud Solutions Architect",
    startDate: "2026-05-01",
    endDate: "2026-06-15",
    description: "Design and deploy scalable cloud infrastructure. Strong experience in distributed systems.",
    salary: "$180,000 / year",
    location: "San Francisco, CA",
    jobType: "Remote",
    applyLink: "https://careers.google.com",
    status: "Active"
  },
  {
    company: "Microsoft",
    role: "Software Engineer (Backend)",
    startDate: "2026-04-20",
    endDate: "2026-05-20",
    description: "Build robust backend microservices using .NET and Azure cloud. High throughput systems knowledge required.",
    salary: "$150,000 / year",
    location: "Redmond, WA",
    jobType: "Office",
    applyLink: "https://careers.microsoft.com",
    status: "Active"
  },
  {
    company: "OpenAI",
    role: "Data Scientist",
    startDate: "2026-04-10",
    endDate: "2026-05-30",
    description: "Working on generative models and dataset refinement. ML background mandatory.",
    salary: "$200,000 / year",
    location: "San Francisco, CA",
    jobType: "Hybrid",
    applyLink: "https://openai.com/careers",
    status: "Active"
  },
  {
    company: "Netflix",
    role: "UI/UX Designer",
    startDate: "2026-05-15",
    endDate: "2026-06-30",
    description: "Design highly engaging interactive interfaces for millions of users.",
    salary: "$130,000 / year",
    location: "Los Angeles, CA",
    jobType: "Remote",
    applyLink: "https://jobs.netflix.com",
    status: "Active"
  }
];

const aptitudeQuestions = [
  {
    question: "If a train travels 60km in 1 hour, how far will it travel in 3.5 hours?",
    category: "Mathematical",
    level: "Easy",
    options: ["180km", "210km", "200km", "240km"],
    correctOptionIndex: 1,
    timerSeconds: 60
  },
  {
    question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?",
    category: "Logical",
    level: "Medium",
    options: ["Yes", "No", "Maybe", "Cannot be determined"],
    correctOptionIndex: 0,
    timerSeconds: 90
  },
  {
    question: "A man is looking at a photograph of someone. His friend asks who it is. The man replies, 'Brothers and sisters, I have none. But that man's father is my father's son.' Who is in the photograph?",
    category: "Reasoning",
    level: "Hard",
    options: ["His father", "His brother", "His son", "Himself"],
    correctOptionIndex: 2,
    timerSeconds: 120
  },
  {
    question: "What is the next number in the sequence? 2, 6, 12, 20, 30, ...",
    category: "Mathematical",
    level: "Hard Core",
    options: ["40", "42", "44", "48"],
    correctOptionIndex: 1,
    timerSeconds: 150
  },
  {
    question: "Identify the correct sentence:",
    category: "English Grammar",
    level: "Easy",
    options: ["He don't like apples.", "He doesn't likes apples.", "He doesn't like apples.", "He do not likes apples."],
    correctOptionIndex: 2,
    timerSeconds: 60
  }
];

async function seedData() {
  console.log("🚀 Starting Data Seeding for Jobs & Aptitude...");

  for (const job of jobs) {
    try {
      await addDoc(collection(db, "job_postings"), { ...job, createdAt: new Date().toISOString() });
      console.log(`✅ Seeded Job: ${job.role} at ${job.company}`);
    } catch (e) {
      console.error(`❌ Failed Job: ${job.role}`, e);
    }
  }

  for (const q of aptitudeQuestions) {
    try {
      await addDoc(collection(db, "aptitude_questions"), { ...q, createdAt: new Date().toISOString() });
      console.log(`✅ Seeded Aptitude Q: ${q.question.substring(0,25)}...`);
    } catch (e) {
      console.error(`❌ Failed Aptitude Q:`, e);
    }
  }

  console.log("\n🎉 Seeding Complete!");
  process.exit(0);
}

seedData();
