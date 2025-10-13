import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { User } from '../types';
import { checkAndAwardBadges } from './gamification';
import { OptimizedUserOperations } from '../utils/firebaseOptimizer';
import { 
  validateSignUp, 
  validateSignIn, 
  sanitizeDisplayName, 
  sanitizeUsername, 
  sanitizeEmail 
} from '../utils/validation';
import { log } from '../config/environment';

// Error message sanitization to prevent information leakage
const sanitizeErrorMessage = (errorMessage: string): string => {
  // Map Firebase error codes to user-friendly messages
  const errorMappings: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/missing-password': 'Password is required'
  };
  
  // Extract Firebase error code if present
  const firebaseErrorMatch = errorMessage.match(/auth\/[\w-]+/);
  if (firebaseErrorMatch) {
    const errorCode = firebaseErrorMatch[0];
    return errorMappings[errorCode] || 'An error occurred. Please try again';
  }
  
  // For validation errors, return as-is (they're already safe)
  if (!errorMessage.includes('Firebase') && !errorMessage.includes('Error:')) {
    return errorMessage;
  }
  
  // Default safe error message
  return 'An error occurred. Please try again';
};

export const signUp = async (
  email: string, 
  password: string, 
  confirmPassword: string, 
  displayName: string, 
  username?: string
) => {
  try {
    // Sanitize inputs first
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedDisplayName = sanitizeDisplayName(displayName);
    // Auto-generate username from display name if not provided
    const sanitizedUsername = username ? sanitizeUsername(username) : sanitizeUsername(sanitizedDisplayName);
    
    // Validate all inputs (username is now auto-generated)
    const validation = validateSignUp(
      sanitizedEmail,
      password,
      confirmPassword,
      sanitizedDisplayName,
      sanitizedUsername
    );
    
    if (!validation.isValid) {
      const errorMessage = validation.errors.join('. ');
      log.warn('🚫 Sign up validation failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName: sanitizedDisplayName });
    
    // Create user document in Firestore
    await createUserDocument(user, sanitizedDisplayName, sanitizedUsername);
    
    log.info('✅ User signed up successfully:', user.uid);
    return user;
  } catch (error: any) {
    log.error('❌ Sign up error:', error.message);
    // Re-throw with sanitized error message
    throw new Error(sanitizeErrorMessage(error.message));
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    
    // Validate inputs
    const validation = validateSignIn(sanitizedEmail, password);
    
    if (!validation.isValid) {
      const errorMessage = validation.errors.join('. ');
      log.warn('🚫 Sign in validation failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
    log.info('✅ User signed in successfully:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    log.error('❌ Sign in error:', error.message);
    // Re-throw with sanitized error message
    throw new Error(sanitizeErrorMessage(error.message));
  }
};

export const logout = async () => {
  try {
    // Cleanup all Firebase listeners before signing out
    console.log('🧹 Cleaning up Firebase listeners before logout...');
    OptimizedUserOperations.cleanup();
    
    // Sign out from Firebase
    await signOut(auth);
    console.log('✓ User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const createUserDocument = async (user: FirebaseUser, displayName: string, username: string) => {
  const userDoc = doc(db, 'users', user.uid);
  
  const userData: Partial<User> = {
    id: user.uid,
    email: user.email!,
    displayName,
    username,
    isPremium: user.email === 'sandy@zaynstudio.app', // Admin access for Zayn Studio
    quitDate: new Date(),
    cigarettesPerDay: 0,
    cigarettePrice: 0,
    streak: 0,
    longestStreak: 0,
    totalDays: 0,
    xp: 0,
    level: 1,
    lastCheckIn: null,
    badges: [],
    completedMissions: [],
    onboardingCompleted: false, // New users need to complete onboarding
    dailyXP: {}, // Initialize empty daily XP tracking
    settings: {
      darkMode: false,
      notifications: true,
      language: 'id',
      reminderTime: '09:00',
      leaderboardDisplayPreference: 'username'
    }
  };
  
  await setDoc(userDoc, userData);
  
  // Auto-award the "new member" badge and increment its statistics
  try {
    const newBadges = await checkAndAwardBadges(user.uid, userData as User);
    if (newBadges.length > 0) {
      console.log(`✓ Auto-awarded ${newBadges.length} badges to new user: ${newBadges.map(b => b.id).join(', ')}`);
      // Update the userData to include the new badges
      userData.badges = [...(userData.badges || []), ...newBadges];
      // Update the user document with the new badges
      await updateDoc(userDoc, { badges: userData.badges });
    }
  } catch (error) {
    console.error('Error auto-awarding badges to new user:', error);
  }
  
  return userData;
};


export const getUserDocument = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = doc(db, 'users', uid);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: uid } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
};

export const updateUserDocument = async (uid: string, data: Partial<User>) => {
  try {
    const userDoc = doc(db, 'users', uid);
    await updateDoc(userDoc, data);
  } catch (error: any) {
    // Check if this is an offline/network error to avoid spamming user
    const isOfflineError = error.message?.toLowerCase().includes('offline') || 
                          error.message?.toLowerCase().includes('network') ||
                          error.message?.toLowerCase().includes('internet connection') ||
                          error.code === 'unavailable' ||
                          error.code === 'network-request-failed';
    
    if (!isOfflineError) {
      // Only log non-offline errors
      console.error('Error updating user document:', error);
    }
    throw error;
  }
};

export const upgradeUserToPremium = async (email: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === email) {
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, { isPremium: true });
      console.log(`✓ User ${email} upgraded to premium`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error upgrading user to premium:', error);
    throw error;
  }
};