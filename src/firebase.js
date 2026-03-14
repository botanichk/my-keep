import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAV9TF1y9LXJVgpANsrSeNEzNAtqdx7mtk",
  authDomain: "my-keep-fde5b.firebaseapp.com",
  projectId: "my-keep-fde5b",
  storageBucket: "my-keep-fde5b.firebasestorage.app",
  messagingSenderId: "305136676195",
  appId: "1:305136676195:web:a7370bea2db066ff87b756",
  measurementId: "G-K1KQRW06X7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
