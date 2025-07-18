import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types';

export const signUp = async (email: string, password: string, displayName: string, username: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await createUserDocument(user, displayName, username);
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
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
    isPremium: user.email === 'admin@byerokok.app' || user.email === 'sandy@mail.com', // Admin and sandy get premium
    quitDate: new Date(),
    cigarettesPerDay: 0,
    cigarettePrice: 0,
    streak: 0,
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
  } catch (error) {
    console.error('Error updating user document:', error);
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