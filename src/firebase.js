// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDyf26C4SbpCy_MMXw4-DsQ4qZwIU8enDw",
    authDomain: "kingdom-808.firebaseapp.com",
    projectId: "kingdom-808",
    storageBucket: "kingdom-808.firebasestorage.app",
    messagingSenderId: "319355254510",
    appId: "1:319355254510:web:0c1b1bc97ece51524725ff",
    measurementId: "G-BJJTJBYJJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
