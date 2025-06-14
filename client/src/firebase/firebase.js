import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-c7VswhZvlXX6yXeh9N1LFshiXN0mL4k",
  authDomain: "silvercareai.firebaseapp.com",
  projectId: "silvercareai",
  storageBucket: "silvercareai.firebasestorage.app",
  messagingSenderId: "146896772483",
  appId: "1:146896772483:web:34c2d2de03816f316d2ab6",
  measurementId: "G-WLD5RT5YQ9",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
