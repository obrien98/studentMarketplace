import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_HTlpw1Y-mP-UVI3fu5CjYJOKCYYOV8g",
  authDomain: "student-marketplace-2b351.firebaseapp.com",
  projectId: "student-marketplace-2b351",
  storageBucket: "student-marketplace-2b351.firebasestorage.app",
  messagingSenderId: "767531679967",
  appId: "1:767531679967:web:17c56727779bd91f94e96a",
  measurementId: "G-6Z3M72CLVE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
