import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG, log } from '../config/environment';

// Secure Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: ENV_CONFIG.FIREBASE.apiKey,
  authDomain: ENV_CONFIG.FIREBASE.authDomain,
  projectId: ENV_CONFIG.FIREBASE.projectId,
  storageBucket: ENV_CONFIG.FIREBASE.storageBucket,
  messagingSenderId: ENV_CONFIG.FIREBASE.messagingSenderId,
  appId: ENV_CONFIG.FIREBASE.appId,
  measurementId: ENV_CONFIG.FIREBASE.measurementId
};

// Validate Firebase configuration before initializing
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    const error = `Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`;
    log.error('🚨 Firebase Config Error:', error);
    throw new Error(error);
  }
  
  log.info('✅ Firebase configuration validated successfully');
};

// Validate configuration on load
validateFirebaseConfig();

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