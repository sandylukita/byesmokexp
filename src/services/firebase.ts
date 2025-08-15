import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
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

// Initialize Firebase Auth with platform-specific persistence
export const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;