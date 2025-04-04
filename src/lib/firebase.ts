import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBYculaKvwuScLjDA0OrDAqYBP_CiVA5Gg",
  authDomain: "release-organize.firebaseapp.com",
  projectId: "release-organize",
  storageBucket: "release-organize.firebasestorage.app",
  messagingSenderId: "517728550807",
  appId: "1:517728550807:web:f0ab81880b7e263a990ed2",
  databaseURL: "https://release-organize-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});