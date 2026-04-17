import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if the config contains actual keys
let app;
let auth;
let db;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key_here') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase Successfully Initialized! 🚀");
  } else {
    console.warn("⚠️ Firebase keys missing. Running in Mock Mode. Please setup .env.local");
  }
} catch (error) {
  console.error("Firebase Initialization Error", error);
}

export { auth, db };
