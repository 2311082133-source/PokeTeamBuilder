// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCj-4ct5hx9wtXVqwKGAXiYUTPjq6tnMUk",
  authDomain: "poketeambuilder-1110f.firebaseapp.com",
  databaseURL: "https://poketeambuilder-1110f-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "poketeambuilder-1110f",
  storageBucket: "poketeambuilder-1110f.firebasestorage.app",
  messagingSenderId: "182286617718",
  appId: "1:182286617718:web:e1779008d25f730fa8a357",
  measurementId: "G-FMRR5Q60RF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);