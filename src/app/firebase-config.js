// src/firebase-config.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7azkGuwckJoz96yF6Cn-S5cbaPl6m5C8",
  authDomain: "databaseproject-1e255.firebaseapp.com",
  projectId: "databaseproject-1e255",
  storageBucket: "databaseproject-1e255.firebasestorage.app",
  messagingSenderId: "68188678315",
  appId: "1:68188678315:web:ebece9fe2744db4de4afee",
  measurementId: "G-54YZJQF4RW"
};

// Initialize Firebase once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export auth and db instances
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
