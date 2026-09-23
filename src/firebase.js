import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
// REPLACE THIS OBJECT WITH YOUR ACTUAL FIREBASE KEYS
const firebaseConfig = {
  apiKey: "AIzaSyDR_rTVbbBm99ZJda1MOyRge0mdTnSWAPU",
  authDomain: "aurelius-2b4ee.firebaseapp.com",
  projectId: "aurelius-2b4ee",
  storageBucket: "aurelius-2b4ee.firebasestorage.app",
  messagingSenderId: "722289408069",
  appId: "1:722289408069:web:2ed3f80fb4a0228dd6cb2c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc };