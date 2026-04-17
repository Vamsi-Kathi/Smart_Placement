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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jobs = [
  { company: "TCS (Tata Consultancy Services)", role: "System Engineer", location: "Bangalore, India", salary: "3.36 - 7.0 LPA", jobType: "Office", description: "Looking for fresh graduates with strong fundamentals in Java, C++, or Python. You will undergo ILP (Initial Learning Program) before project deployment.", applyLink: "https://www.tcs.com/careers" },
  { company: "Infosys", role: "Systems Engineer Specialist", location: "Pune, India", salary: "5.0 - 8.0 LPA", jobType: "Hybrid", description: "Seeking candidates with strong hands-on experience in full-stack web development. Familiarity with React, Node.js, and Cloud basics required.", applyLink: "https://www.infosys.com/careers" },
  { company: "Zomato", role: "Frontend Developer (SDE-1)", location: "Gurugram, India", salary: "12.0 - 18.0 LPA", jobType: "Office", description: "We are looking for aggressive builders who want to create pixel-perfect user interfaces that power India's largest food delivery app.", applyLink: "https://zomato.com/careers" },
  { company: "Flipkart", role: "Backend Engineer", location: "Bangalore, India", salary: "15.0 - 24.0 LPA", jobType: "Hybrid", description: "Scale India's most massive e-commerce engine! Requires strong fundamentals in Data Structures, Algorithms, System Design, and Java/Spring Boot.", applyLink: "https://flipkartcareers.com/" },
  { company: "Wipro", role: "Project Engineer", location: "Hyderabad, India", salary: "3.5 - 6.5 LPA", jobType: "Office", description: "Entry-level engineering role focusing on IT service management, testing, and enterprise support. Great starting pad for freshers.", applyLink: "https://careers.wipro.com/" }
];

async function seedJobs() {
  console.log("🚀 Seeding Indian IT Job Postings...");
  for (const j of jobs) {
    try {
      await addDoc(collection(db, "job_postings"), {
        ...j,
        startDate: new Date().toISOString().split('T')[0],
        endDate: "2029-12-31",
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Deployed: ${j.company} - ${j.role}`);
    } catch(err) {
      console.error(err);
    }
  }
  console.log("Done.");
  process.exit(0);
}

seedJobs();
