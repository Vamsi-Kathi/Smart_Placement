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

if (!firebaseConfig.apiKey) {
  console.error("ERROR: Firebase API Key not found. Make sure .env.local exists.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================
// SECTION 1: DEMO USERS
// ============================
const demoUsers = [
  {
    uid: 'demo-user-001',
    name: 'Alex Johnson',
    email: 'alex@demo.com',
    role: 'student',
    mobile: '9876543210',
    createdAt: new Date().toISOString(),
    profile: {
      degree: 'B.Tech',
      course: 'Computer Science',
      year: '3rd Year',
      primaryLanguage: 'Python',
      careerGoal: 'Full Stack Developer',
      targetCompany: 'Google / FAANG',
      weakness: 'System Design'
    },
    codingProgress: {
      'q_001': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
      'q_002': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
      'q_003': { highestScore: 95, solved: true, lastSubmitted: new Date().toISOString() },
      'q_006': { highestScore: 80, solved: false, lastSubmitted: new Date().toISOString() },
      'q_007': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
      'q_011': { highestScore: 60, solved: false, lastSubmitted: new Date().toISOString() },
    },
    performance: {
      aptitudeScore: 85,
      atsScore: 78
    },
    totalInterviewsDone: 3,
    latestMockInterview: {
      date: new Date().toISOString(),
      role: 'Software Engineer',
      stack: 'React, Node.js',
      score: 82,
      feedback: 'Strong technical communication, needs more depth on system design.'
    }
  },
  {
    uid: 'demo-user-002',
    name: 'Priya Sharma',
    email: 'priya@demo.com',
    role: 'student',
    mobile: '9123456789',
    createdAt: new Date().toISOString(),
    profile: {
      degree: 'B.Tech',
      course: 'Information Technology',
      year: '4th Year',
      primaryLanguage: 'Java',
      careerGoal: 'Backend Developer',
      targetCompany: 'Service Based (MNCs)',
      weakness: 'Data Structures & Algorithms'
    },
    codingProgress: {
      'q_001': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
      'q_002': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
      'q_004': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
      'q_006': { highestScore: 90, solved: true, lastSubmitted: new Date().toISOString() },
      'q_008': { highestScore: 70, solved: false, lastSubmitted: new Date().toISOString() },
    },
    performance: {
      aptitudeScore: 92,
      atsScore: 88
    },
    totalInterviewsDone: 5,
    latestMockInterview: {
      date: new Date().toISOString(),
      role: 'Java Backend Developer',
      stack: 'Spring Boot, Microservices',
      score: 75,
      feedback: 'Good Java knowledge, needs improvement in concurrency concepts.'
    }
  },
  {
    uid: 'demo-user-003',
    name: 'Rahul Verma',
    email: 'rahul@demo.com',
    role: 'student',
    mobile: '9988776655',
    createdAt: new Date().toISOString(),
    profile: {
      degree: 'BCA',
      course: 'Computer Applications',
      year: '2nd Year',
      primaryLanguage: 'JavaScript',
      careerGoal: 'Frontend Developer',
      targetCompany: 'Startups',
      weakness: 'Communication / Interviews'
    },
    codingProgress: {
      'q_001': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
      'q_003': { highestScore: 100, solved: true, lastSubmitted: new Date().toISOString() },
    },
    performance: {
      aptitudeScore: 65,
      atsScore: 60
    },
    totalInterviewsDone: 1,
    latestMockInterview: {
      date: new Date().toISOString(),
      role: 'UI Developer',
      stack: 'React, CSS',
      score: 55,
      feedback: 'Needs more confidence and clarity in technical explanations.'
    }
  },
  {
    uid: 'demo-admin-001',
    name: 'System Admin',
    email: 'admin@demo.com',
    role: 'admin',
    mobile: '9000000000',
    createdAt: new Date().toISOString(),
    profile: {
      degree: 'MCA',
      course: 'Computer Science',
      year: 'Graduated',
      primaryLanguage: 'Python',
      careerGoal: 'DevOps Engineer',
      targetCompany: 'Product Based (FAANG/Top Tech)',
      weakness: 'None'
    }
  }
];

// ============================
// SECTION 2: CODING PROBLEMS
// ============================
const codingProblems = [
  {
    id: "q_001", title: "Two Sum", level: "Easy", category: "Arrays",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume exactly one solution exists.",
    publicCases: [{ input: "[2,7,11,15], target = 9", output: "[0,1]" }],
    hiddenCases: [{ input: "[3,2,4], target = 6", output: "[1,2]" }, { input: "[3,3], target = 6", output: "[0,1]" }]
  },
  {
    id: "q_002", title: "Reverse String", level: "Easy", category: "Strings",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    publicCases: [{ input: "['h','e','l','l','o']", output: "['o','l','l','e','h']" }],
    hiddenCases: [{ input: "['H','a','n','n','a','h']", output: "['h','a','n','n','a','H']" }]
  },
  {
    id: "q_003", title: "Palindrome Number", level: "Easy", category: "Math",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    publicCases: [{ input: "121", output: "true" }, { input: "-121", output: "false" }],
    hiddenCases: [{ input: "10", output: "false" }, { input: "99899", output: "true" }]
  },
  {
    id: "q_004", title: "Valid Parentheses", level: "Easy", category: "Stacks",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    publicCases: [{ input: "'()'", output: "true" }],
    hiddenCases: [{ input: "'()[]{}'", output: "true" }, { input: "'(]'", output: "false" }]
  },
  {
    id: "q_005", title: "Merge Two Sorted Lists", level: "Easy", category: "Linked Lists",
    description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
    publicCases: [{ input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" }],
    hiddenCases: [{ input: "list1 = [], list2 = []", output: "[]" }, { input: "list1 = [], list2 = [0]", output: "[0]" }]
  },
  {
    id: "q_006", title: "Longest Substring Without Repeating", level: "Medium", category: "Strings",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    publicCases: [{ input: "'abcabcbb'", output: "3" }],
    hiddenCases: [{ input: "'bbbbb'", output: "1" }, { input: "'pwwkew'", output: "3" }]
  },
  {
    id: "q_007", title: "Container With Most Water", level: "Medium", category: "Arrays",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    publicCases: [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49" }],
    hiddenCases: [{ input: "[1,1]", output: "1" }]
  },
  {
    id: "q_008", title: "Sum of Two Integers", level: "Medium", category: "Bit Manipulation",
    description: "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
    publicCases: [{ input: "a = 1, b = 2", output: "3" }],
    hiddenCases: [{ input: "a = 2, b = 3", output: "5" }]
  },
  {
    id: "q_009", title: "Coin Change", level: "Medium", category: "Dynamic Programming",
    description: "Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
    publicCases: [{ input: "coins = [1,2,5], amount = 11", output: "3" }],
    hiddenCases: [{ input: "coins = [2], amount = 3", output: "-1" }, { input: "coins = [1], amount = 0", output: "0" }]
  },
  {
    id: "q_010", title: "Word Break", level: "Medium", category: "Dynamic Programming",
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    publicCases: [{ input: "s = 'leetcode', wordDict = ['leet','code']", output: "true" }],
    hiddenCases: [{ input: "s = 'applepenapple', wordDict = ['apple','pen']", output: "true" }, { input: "s = 'catsandog', wordDict = ['cats','dog','sand','and','cat']", output: "false" }]
  },
  {
    id: "q_011", title: "Trapping Rain Water", level: "Hard", category: "Arrays",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    publicCases: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }],
    hiddenCases: [{ input: "[4,2,0,3,2,5]", output: "9" }]
  },
  {
    id: "q_012", title: "Merge k Sorted Lists", level: "Hard", category: "Linked Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    publicCases: [{ input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }],
    hiddenCases: [{ input: "lists = []", output: "[]" }, { input: "lists = [[]]", output: "[]" }]
  },
  {
    id: "q_013", title: "N-Queens", level: "Hard", category: "Backtracking",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions.",
    publicCases: [{ input: "n = 4", output: "[[.Q..,...Q,Q...,..Q.],[..Q.,Q...,...Q,.Q..]]" }],
    hiddenCases: [{ input: "n = 1", output: "[[Q]]" }]
  },
  {
    id: "q_014", title: "Median of Two Sorted Arrays", level: "Hard", category: "Binary Search",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    publicCases: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" }],
    hiddenCases: [{ input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" }]
  },
  {
    id: "q_015", title: "Word Ladder", level: "Hard", category: "Graphs",
    description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk. Return length of shortest transformation.",
    publicCases: [{ input: "beginWord = 'hit', endWord = 'cog', wordList = ['hot','dot','dog','lot','log','cog']", output: "5" }],
    hiddenCases: [{ input: "beginWord = 'hit', endWord = 'cog', wordList = ['hot','dot','dog','lot','log']", output: "0" }]
  },
  {
    id: "q_016", title: "Regular Expression Matching", level: "Expert", category: "Dynamic Programming",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' Matches any single character. '*' Matches zero or more of the preceding.",
    publicCases: [{ input: "s = 'aa', p = 'a'", output: "false" }],
    hiddenCases: [{ input: "s = 'aa', p = 'a*'", output: "true" }, { input: "s = 'ab', p = '.*'", output: "true" }]
  },
  {
    id: "q_017", title: "Alien Dictionary", level: "Expert", category: "Graphs",
    description: "There is a new alien language that uses the English alphabet. Return a string of the unique letters in the new alien language sorted in lexicographically increasing order.",
    publicCases: [{ input: "words = ['wrt','wrf','er','ett','rftt']", output: "'wertf'" }],
    hiddenCases: [{ input: "words = ['z','x','z']", output: "''" }]
  },
  {
    id: "q_018", title: "Sliding Window Maximum", level: "Expert", category: "Heap / Queue",
    description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window.",
    publicCases: [{ input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]" }],
    hiddenCases: [{ input: "nums = [1], k = 1", output: "[1]" }]
  },
  {
    id: "q_019", title: "Edit Distance", level: "Expert", category: "Dynamic Programming",
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. Permitted: Insert, Delete, Replace.",
    publicCases: [{ input: "word1 = 'horse', word2 = 'ros'", output: "3" }],
    hiddenCases: [{ input: "word1 = 'intention', word2 = 'execution'", output: "5" }]
  },
  {
    id: "q_020", title: "Burst Balloons", level: "Expert", category: "Dynamic Programming",
    description: "You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. If you burst the ith balloon, you will get nums[i - 1] * nums[i] * nums[i + 1] coins. Return the maximum coins you can collect by bursting the balloons wisely.",
    publicCases: [{ input: "nums = [3,1,5,8]", output: "167" }],
    hiddenCases: [{ input: "nums = [1,5]", output: "10" }]
  }
];

// ============================
// SECTION 3: APTITUDE QUESTIONS
// ============================
const aptitudeQuestions = [
  {
    id: "apt_001",
    question: "What is the sum of the first 50 natural numbers?",
    options: ["1275", "1250", "1300", "1225"],
    correctOptionIndex: 0,
    level: "Easy",
    category: "Quantitative",
    testSetName: "Standard Test"
  },
  {
    id: "apt_002",
    question: "If a train travels 360 km in 4 hours, what is its average speed?",
    options: ["80 km/h", "90 km/h", "100 km/h", "85 km/h"],
    correctOptionIndex: 1,
    level: "Easy",
    category: "Quantitative",
    testSetName: "Standard Test"
  },
  {
    id: "apt_003",
    question: "A shopkeeper sells an article at 20% profit. If the cost price is Rs. 500, what is the selling price?",
    options: ["Rs. 580", "Rs. 600", "Rs. 620", "Rs. 550"],
    correctOptionIndex: 1,
    level: "Easy",
    category: "Quantitative",
    testSetName: "Standard Test"
  },
  {
    id: "apt_004",
    question: "Find the missing number: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correctOptionIndex: 1,
    level: "Medium",
    category: "Logical",
    testSetName: "Standard Test"
  },
  {
    id: "apt_005",
    question: "If all roses are flowers and some flowers fade quickly, then:",
    options: ["All roses fade quickly", "Some roses fade quickly", "No conclusion can be drawn", "Roses never fade"],
    correctOptionIndex: 2,
    level: "Medium",
    category: "Logical",
    testSetName: "Standard Test"
  },
  {
    id: "apt_006",
    question: "Choose the synonym of 'EPHEMERAL':",
    options: ["Eternal", "Transient", "Permanent", "Stable"],
    correctOptionIndex: 1,
    level: "Medium",
    category: "Verbal",
    testSetName: "Standard Test"
  },
  {
    id: "apt_007",
    question: "A can complete a work in 10 days and B in 15 days. How many days will they take working together?",
    options: ["5 days", "6 days", "7 days", "8 days"],
    correctOptionIndex: 1,
    level: "Medium",
    category: "Quantitative",
    testSetName: "Standard Test"
  },
  {
    id: "apt_008",
    question: "What is the next number in the series: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "12", "13", "14"],
    correctOptionIndex: 2,
    level: "Easy",
    category: "Logical",
    testSetName: "Standard Test"
  },
  {
    id: "apt_009",
    question: "The ratio of ages of A and B is 3:5. After 6 years, the ratio becomes 2:3. What is B's present age?",
    options: ["20", "25", "30", "35"],
    correctOptionIndex: 2,
    level: "Hard",
    category: "Quantitative",
    testSetName: "Standard Test"
  },
  {
    id: "apt_010",
    question: "Identify the error: 'Neither the students nor the teacher were present.'",
    options: ["Neither...nor", "students", "teacher", "were"],
    correctOptionIndex: 3,
    level: "Medium",
    category: "Verbal",
    testSetName: "Standard Test"
  },
  {
    id: "apt_011",
    question: "If 20% of a number is 40, what is 35% of that number?",
    options: ["60", "65", "70", "75"],
    correctOptionIndex: 2,
    level: "Easy",
    category: "Quantitative",
    testSetName: "Test 1"
  },
  {
    id: "apt_012",
    question: "Complete the analogy: Book is to Reading as Fork is to ?",
    options: ["Cooking", "Eating", "Kitchen", "Food"],
    correctOptionIndex: 1,
    level: "Easy",
    category: "Logical",
    testSetName: "Test 1"
  },
  {
    id: "apt_013",
    question: "A pipe can fill a tank in 6 hours. Due to a leak, it takes 8 hours. How long will the leak take to empty the full tank?",
    options: ["12 hours", "18 hours", "24 hours", "30 hours"],
    correctOptionIndex: 2,
    level: "Hard",
    category: "Quantitative",
    testSetName: "Test 1"
  },
  {
    id: "apt_014",
    question: "Choose the antonym of 'BENEVOLENT':",
    options: ["Kind", "Malevolent", "Generous", "Charitable"],
    correctOptionIndex: 1,
    level: "Medium",
    category: "Verbal",
    testSetName: "Test 1"
  },
  {
    id: "apt_015",
    question: "In a code language, COMPUTER is written as RFUVQNPC. How is MEDICINE written?",
    options: ["EOJDJEFM", "EOJDJFEM", "FJDEJOFM", "MFEDJOEJ"],
    correctOptionIndex: 0,
    level: "Hard",
    category: "Logical",
    testSetName: "Test 1"
  }
];

// ============================
// SECTION 4: JOB POSTINGS
// ============================
const jobPostings = [
  {
    id: "job_001",
    company: "Google",
    role: "Software Engineer",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "25-45 LPA",
    skills: ["Python", "C++", "System Design", "Algorithms"],
    description: "Design and build scalable systems that power billions of users. Strong DSA and system design skills required.",
    eligibility: "B.Tech/MCA with 7+ CGPA",
    deadline: "2025-06-30",
    createdAt: new Date().toISOString()
  },
  {
    id: "job_002",
    company: "Microsoft",
    role: "Frontend Developer",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "18-32 LPA",
    skills: ["React", "TypeScript", "CSS", "Web Performance"],
    description: "Build beautiful, accessible, and performant web interfaces for Microsoft 365 applications.",
    eligibility: "B.Tech/BCA with strong portfolio",
    deadline: "2025-07-15",
    createdAt: new Date().toISOString()
  },
  {
    id: "job_003",
    company: "TCS",
    role: "System Engineer",
    location: "Chennai, India",
    type: "Full-time",
    salary: "3.6-7 LPA",
    skills: ["Java", "SQL", "Spring Boot", "Communication"],
    description: "Join India's largest IT services company. Work on enterprise Java applications for global clients.",
    eligibility: "Any graduate with 60% aggregate",
    deadline: "2025-05-30",
    createdAt: new Date().toISOString()
  },
  {
    id: "job_004",
    company: "Flipkart",
    role: "Data Scientist",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "20-38 LPA",
    skills: ["Python", "Machine Learning", "SQL", "Statistics"],
    description: "Build recommendation engines and demand forecasting models for India's largest e-commerce platform.",
    eligibility: "B.Tech/M.Tech in CS/Stats with ML coursework",
    deadline: "2025-06-15",
    createdAt: new Date().toISOString()
  },
  {
    id: "job_005",
    company: "Zerodha",
    role: "Backend Developer",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "15-28 LPA",
    skills: ["Python", "PostgreSQL", "Redis", "AWS"],
    description: "Work on India's largest stock brokerage platform. Build high-performance trading infrastructure.",
    eligibility: "B.Tech with 2+ years experience or exceptional freshers",
    deadline: "2025-07-01",
    createdAt: new Date().toISOString()
  }
];

// ============================
// SEEDING LOGIC
// ============================
async function seedCollection(collectionName, items, idField = 'id') {
  console.log(`\nSeeding ${collectionName}...`);
  let count = 0;
  for (const item of items) {
    try {
      const docId = item[idField] || item.uid;
      const { [idField]: _, uid: __, ...data } = item;
      await setDoc(doc(db, collectionName, docId), data);
      count++;
    } catch (err) {
      console.error(`  Failed on ${item[idField] || item.uid}:`, err.message);
    }
  }
  console.log(`  Seeded ${count}/${items.length} documents into ${collectionName}`);
  return count;
}

async function seedMaster() {
  console.log("MASTER SEED SCRIPT STARTING...\n");

  const usersCount = await seedCollection('users', demoUsers, 'uid');
  const problemsCount = await seedCollection('problems', codingProblems, 'id');
  const aptitudeCount = await seedCollection('aptitude_questions', aptitudeQuestions, 'id');
  const jobsCount = await seedCollection('job_postings', jobPostings, 'id');

  console.log("\n========================");
  console.log("SEEDING COMPLETE!");
  console.log("========================");
  console.log(`Users:        ${usersCount}`);
  console.log(`Problems:     ${problemsCount}`);
  console.log(`Aptitude Qs:  ${aptitudeCount}`);
  console.log(`Job Postings: ${jobsCount}`);
  console.log("\nYou can now log in with:");
  console.log("  Admin: admin@demo.com (use admin bypass or create auth user)");
  console.log("  Student: alex@demo.com, priya@demo.com, rahul@demo.com");
  console.log("========================\n");

  process.exit(0);
}

seedMaster().catch(err => {
  console.error("Master seed failed:", err);
  process.exit(1);
});

