import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDtOHbqE073pKJN-2YcmHxrkvJPwwHT4TA",
  authDomain: "citypulse-3fd62.firebaseapp.com",
  projectId: "citypulse-3fd62",
  storageBucket: "citypulse-3fd62.firebasestorage.app",
  messagingSenderId: "328133873124",
  appId: "1:328133873124:web:6c77dad6a6f76c9e510bf1",
  measurementId: "G-JNY6EWY1E9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);
provider.setCustomParameters({
  prompt: 'select_account'
});
const db = getFirestore(app);

export{auth, provider, db}