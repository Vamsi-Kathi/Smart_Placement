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

// HackerRank Style Questions Setup
const questions = [
  // EASY
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

  // MEDIUM
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

  // HARD
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

  // HARD CORE / EXPERT 
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

async function seedQuestions() {
  console.log("🚀 Starting Algorithm Questions Database Seeding...\n");
  let count = 0;
  for (const q of questions) {
    try {
      await setDoc(doc(db, "problems", q.id), {
        title: q.title,
        level: q.level,
        category: q.category,
        description: q.description,
        publicCases: q.publicCases,
        hiddenCases: q.hiddenCases,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Seeded Module: [${q.level}] ${q.title}`);
      count++;
    } catch (err) {
      console.error(`❌ Failed on ${q.title}:`, err);
    }
  }

  console.log(`\n🎉 Seeded ${count} elite algorithmic questions into Firebase!`);
  process.exit(0);
}

seedQuestions();
