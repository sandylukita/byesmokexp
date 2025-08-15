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
import { generateUniqueReferralCode, findUserByReferralCode } from '../utils/referrals';
import { checkAndAwardBadges } from './gamification';

export const signUp = async (email: string, password: string, displayName: string, username: string, referralCode?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore with referral tracking
    await createUserDocument(user, displayName, username, referralCode);
    
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

export const createUserDocument = async (user: FirebaseUser, displayName: string, username: string, referralCode?: string) => {
  const userDoc = doc(db, 'users', user.uid);
  
  // Generate unique referral code for this user
  const userReferralCode = await generateUniqueReferralCode();
  
  // Handle referral tracking
  let referrerUserId: string | null = null;
  let referralXPBonus = 0;
  
  if (referralCode) {
    try {
      referrerUserId = await findUserByReferralCode(referralCode);
      if (referrerUserId) {
        // Give bonus XP to new user
        referralXPBonus = 25;
        console.log(`✓ Valid referral code ${referralCode} from user ${referrerUserId}`);
        
        // Award referrer for successful referral
        await awardReferralReward(referrerUserId, user.uid);
      } else {
        console.log(`⚠️ Invalid referral code: ${referralCode}`);
      }
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  }
  
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
    xp: referralXPBonus, // Start with referral bonus XP if applicable
    level: 1,
    lastCheckIn: null,
    badges: [],
    completedMissions: [],
    onboardingCompleted: false, // New users need to complete onboarding
    dailyXP: {}, // Initialize empty daily XP tracking
    // Referral fields
    referralCode: userReferralCode,
    referredBy: referralCode || undefined,
    referralCount: 0,
    referralRewards: 0,
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

/**
 * Award referral rewards to the referrer
 */
const awardReferralReward = async (referrerUserId: string, newUserId: string) => {
  try {
    const referrerDoc = doc(db, 'users', referrerUserId);
    
    // Update referrer's stats
    await updateDoc(referrerDoc, {
      referralCount: increment(1),
      referralRewards: increment(50), // 50 XP per successful referral
      xp: increment(50)
    });
    
    console.log(`✓ Awarded referral reward to user ${referrerUserId} for referring ${newUserId}`);
  } catch (error) {
    console.error('Error awarding referral reward:', error);
  }
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