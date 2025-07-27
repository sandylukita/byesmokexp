import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyCzKtmjJoEqlnmTVroW2j3kX11sTMPXSB8",
  authDomain: "byesmokexp.firebaseapp.com",
  projectId: "byesmokexp",
  storageBucket: "byesmokexp.firebasestorage.app",
  messagingSenderId: "161013631866",
  appId: "1:161013631866:web:2fdfca241dd7f0224c24c3",
  measurementId: "G-XYDB63TDSZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;