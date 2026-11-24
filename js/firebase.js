import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfTM9Nd9suNxAFa7a0nOjxrS4_YxwkEFw",
  authDomain: "cost-tracker-4f08a.firebaseapp.com",
  projectId: "cost-tracker-4f08a",
  storageBucket: "cost-tracker-4f08a.firebasestorage.app",
  messagingSenderId: "226142223855",
  appId: "1:226142223855:web:c0c2531127546c701b8a1a",
  measurementId: "G-2LTGDK4F7V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);