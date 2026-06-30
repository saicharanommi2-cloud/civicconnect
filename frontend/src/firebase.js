import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9qgsydtEn3W2yU8UZYjb50XNGqHto4lY",
  authDomain: "civicconnect-b47d7.firebaseapp.com",
  projectId: "civicconnect-b47d7",
  storageBucket: "civicconnect-b47d7.firebasestorage.app",
  messagingSenderId: "595882149989",
  appId: "1:595882149989:web:e8759d02f94e7370b21e8c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();