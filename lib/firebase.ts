import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAaeXXzDJ8EBZMDkSmWjH7oegfsfPNnkJI",
  authDomain: "rootx-22b48.firebaseapp.com",
  projectId: "rootx-22b48",
  storageBucket: "rootx-22b48.firebasestorage.app",
  messagingSenderId: "1070223279869",
  appId: "1:1070223279869:web:873fc126310ce61362e094",
  measurementId: "G-GR3241919B",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Keep the user logged in between browser sessions.
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase persistence error:", error);
});