import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Generate a unique 6-character alphanumeric referral code
 * @returns string - 6-character referral code
 */
export const generateReferralCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Check if a referral code already exists in the database
 * @param code - The referral code to check
 * @returns Promise<boolean> - true if code exists, false otherwise
 */
export const checkReferralCodeExists = async (code: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', code));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking referral code:', error);
    // Return true to be safe and generate a new code
    return true;
  }
};

/**
 * Generate a unique referral code that doesn't exist in the database
 * @param maxAttempts - Maximum number of attempts to generate unique code
 * @returns Promise<string> - Unique referral code
 */
export const generateUniqueReferralCode = async (maxAttempts: number = 10): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode();
    const exists = await checkReferralCodeExists(code);
    
    if (!exists) {
      return code;
    }
  }
  
  // Fallback: add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4);
  return generateReferralCode().slice(0, 2) + timestamp;
};

/**
 * Validate referral code format
 * @param code - The referral code to validate
 * @returns boolean - true if code format is valid
 */
export const isValidReferralCodeFormat = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Must be exactly 6 characters, alphanumeric
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(code.toUpperCase());
};

/**
 * Find user by referral code
 * @param code - The referral code to search for
 * @returns Promise<string | null> - User ID if found, null otherwise
 */
export const findUserByReferralCode = async (code: string): Promise<string | null> => {
  if (!isValidReferralCodeFormat(code)) {
    return null;
  }
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first matching user ID
    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('Error finding user by referral code:', error);
    return null;
  }
};

/**
 * Format referral code for display (adds spaces for readability)
 * @param code - The referral code to format
 * @returns string - Formatted referral code (e.g., "ABC 123")
 */
export const formatReferralCodeForDisplay = (code: string): string => {
  if (!code) return '';
  
  const cleanCode = code.toUpperCase();
  if (cleanCode.length === 6) {
    return `${cleanCode.slice(0, 3)} ${cleanCode.slice(3)}`;
  }
  
  return cleanCode;
};

/**
 * Get shareable referral message
 * @param referralCode - User's referral code
 * @param language - User's language preference
 * @returns string - Formatted message for sharing
 */
export const getReferralShareMessage = (referralCode: string, language: 'id' | 'en' = 'id'): string => {
  const formattedCode = formatReferralCodeForDisplay(referralCode);
  
  if (language === 'en') {
    return `Join me in quitting smoking with ByeSmoke AI! 🚭✨\n\nUse my referral code: ${formattedCode}\n\nDownload the app and let's quit together! 💪`;
  }
  
  return `Bergabunglah dengan saya berhenti merokok dengan ByeSmoke AI! 🚭✨\n\nGunakan kode referral saya: ${formattedCode}\n\nDownload aplikasinya dan mari berhenti bersama! 💪`;
};

/**
 * Calculate referral rewards
 * @param referralCount - Number of successful referrals
 * @returns object - Reward information
 */
export const calculateReferralRewards = (referralCount: number) => {
  const baseXPPerReferral = 50;
  const totalXP = referralCount * baseXPPerReferral;
  
  // Milestone rewards
  const milestones = {
    firstReferral: referralCount >= 1,
    socialInfluencer: referralCount >= 5,
    communityLeader: referralCount >= 10,
    smokeFreeAmbassador: referralCount >= 25,
  };
  
  // Premium feature unlock after 3 referrals
  const unlocksFeatures = referralCount >= 3;
  
  return {
    totalXP,
    currentXP: baseXPPerReferral,
    milestones,
    unlocksFeatures,
    nextMilestone: getNextMilestone(referralCount),
  };
};

/**
 * Get the next referral milestone
 * @param currentCount - Current referral count
 * @returns object - Next milestone information
 */
const getNextMilestone = (currentCount: number) => {
  const milestones = [1, 5, 10, 25, 50];
  
  for (const milestone of milestones) {
    if (currentCount < milestone) {
      return {
        count: milestone,
        remaining: milestone - currentCount,
      };
    }
  }
  
  // If user has reached all milestones
  return {
    count: 100,
    remaining: 100 - currentCount,
  };
};

/**
 * Ensure user has a referral code, generate one if missing
 * @param user - User object that might be missing referral code
 * @returns Promise<string> - The user's referral code (existing or newly generated)
 */
export const ensureUserHasReferralCode = async (user: any): Promise<string> => {
  if (user.referralCode) {
    return user.referralCode;
  }
  
  console.log('User missing referral code, generating one...');
  
  // Generate a unique code
  const newCode = await generateUniqueReferralCode();
  
  // Initialize referral fields if missing
  user.referralCode = newCode;
  user.referralCount = user.referralCount || 0;
  user.referralRewards = user.referralRewards || 0;
  
  console.log('✓ Generated referral code for user:', newCode);
  return newCode;
};