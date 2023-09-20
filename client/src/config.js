// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGVQqcRlXxdp_0cv_6Z83bUHVAEEvyM60",
  authDomain: "mp4-to-mp3-3b274.firebaseapp.com",
  projectId: "mp4-to-mp3-3b274",
  storageBucket: "mp4-to-mp3-3b274.appspot.com",
  messagingSenderId: "995518559426",
  appId: "1:995518559426:web:114154d8b209659e15f75b",
  measurementId: "G-7T1XDWB0T3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
