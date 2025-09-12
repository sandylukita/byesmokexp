// Demo authentication service for testing without Firebase setup
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { generateReferralCode } from '../utils/referrals';
import { migrateToCheckInSystem } from '../utils/helpers';

interface DemoUser extends User {
  password: string;
}

// Demo users for testing
const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-admin',
    email: 'admin@byerokok.app',
    password: 'password123',
    displayName: 'Admin User',
    username: 'admin_hero',
    isPremium: true,
    quitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    cigarettesPerDay: 20,
    cigarettePrice: 25000,
    streak: 0,
    longestStreak: 0,
    totalDays: 0,
    xp: 450,
    level: 2,
    lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    badges: [
      {
        id: 'first-day',
        name: 'Langkah Pertama',
        description: 'Melakukan check-in pertama kali',
        icon: 'play-circle',
        color: '#2ECC71',
        unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        requirement: 'Check-in pertama'
      }
    ],
    completedMissions: [
      {
        id: 'mission-1',
        title: 'Check-in Harian',
        description: 'Lakukan check-in hari ini',
        xpReward: 10,
        isCompleted: true,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isAIGenerated: false,
        difficulty: 'easy'
      }
    ],
    settings: {
      darkMode: false,
      notifications: true,
      language: 'id',
      reminderTime: '09:00',
      leaderboardDisplayPreference: 'username'
    },
    onboardingCompleted: true,
    dailyXP: {},
    // Referral fields
    referralCode: 'ADMIN1',
    referredBy: undefined,
    referralCount: 2,
    referralRewards: 100,
    // Craving tracking fields
    cravingsHandled: 0,
    lastCravingDate: null,
    // Migration tracking
    migrationVersion: 'v2-checkin-only'
  },
  {
    id: 'demo-user',
    email: 'test@example.com',
    password: 'test123',
    displayName: 'Test User',
    username: 'test_warrior',
    isPremium: false,
    quitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    cigarettesPerDay: 12,
    cigarettePrice: 20000,
    streak: 0,
    longestStreak: 0,
    totalDays: 0,
    xp: 120,
    level: 1,
    lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    badges: [],
    completedMissions: [],
    settings: {
      darkMode: false,
      notifications: true,
      language: 'id',
      reminderTime: '09:00',
      leaderboardDisplayPreference: 'username'
    },
    onboardingCompleted: true,
    dailyXP: {},
    // Referral fields
    referralCode: 'TEST01',
    referredBy: 'ADMIN1',
    referralCount: 0,
    referralRewards: 0,
    // Craving tracking fields
    cravingsHandled: 0,
    lastCravingDate: null,
    // Migration tracking
    migrationVersion: 'v2-checkin-only'
  },
  {
    id: 'demo-new-user',
    email: 'newuser@example.com',
    password: 'test123',
    displayName: 'New User',
    username: 'new_starter',
    isPremium: false,
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
    settings: {
      darkMode: false,
      notifications: true,
      language: 'id',
      reminderTime: '09:00',
      leaderboardDisplayPreference: 'username'
    },
    onboardingCompleted: false,
    dailyXP: {},
    // Referral fields
    referralCode: 'NEWB99',
    referredBy: undefined,
    referralCount: 0,
    referralRewards: 0,
    // Craving tracking fields
    cravingsHandled: 0,
    lastCravingDate: null,
    // Migration tracking
    migrationVersion: 'v2-checkin-only'
  }
];

let currentUser: DemoUser | null = null;

const DEMO_USER_STORAGE_KEY = 'demo_current_user';

export const demoSignIn = async (email: string, password: string): Promise<DemoUser> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        // Apply check-in system migration if needed
        const migrationResult = migrateToCheckInSystem(user);
        currentUser = migrationResult.user;
        try {
          await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(migrationResult.user));
          console.log('User saved to AsyncStorage:', migrationResult.user.email);
        } catch (error) {
          console.error('Error saving user to AsyncStorage:', error);
        }
        resolve(migrationResult.user);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simulate network delay
  });
};

export const demoSignUp = async (email: string, password: string, displayName: string, username: string, referralCode?: string): Promise<DemoUser> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      // Generate unique referral code for new user
      let userReferralCode: string;
      do {
        userReferralCode = generateReferralCode();
      } while (DEMO_USERS.some(u => u.referralCode === userReferralCode));

      // Handle referral tracking
      let referralXPBonus = 0;
      let referrerUser = null;
      
      if (referralCode) {
        referrerUser = DEMO_USERS.find(u => u.referralCode === referralCode.toUpperCase());
        if (referrerUser) {
          // Give bonus XP to new user
          referralXPBonus = 25;
          
          // Award referrer
          referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
          referrerUser.referralRewards = (referrerUser.referralRewards || 0) + 50;
          referrerUser.xp = (referrerUser.xp || 0) + 50;
          
          console.log(`✓ Demo referral: ${referralCode} -> +50 XP to referrer, +25 XP to new user`);
        }
      }

      const newUser: DemoUser = {
        id: `demo-${Date.now()}`,
        email,
        password,
        displayName,
        username,
        isPremium: false,
        quitDate: new Date(),
        cigarettesPerDay: 0,
        cigarettePrice: 0,
        streak: 0,
        longestStreak: 0,
        totalDays: 0,
        xp: referralXPBonus,
        level: 1,
        lastCheckIn: null,
        badges: [],
        completedMissions: [],
        settings: {
          darkMode: false,
          notifications: true,
          language: 'id',
          reminderTime: '09:00',
          leaderboardDisplayPreference: 'username'
        },
        onboardingCompleted: false,
        dailyXP: {},
        // Referral fields
        referralCode: userReferralCode,
        referredBy: referralCode?.toUpperCase() || undefined,
        referralCount: 0,
        referralRewards: 0
      };
      
      DEMO_USERS.push(newUser);
      currentUser = newUser;
      await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(newUser));
      resolve(newUser);
    }, 1000);
  });
};

export const demoLogout = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      currentUser = null;
      await AsyncStorage.removeItem(DEMO_USER_STORAGE_KEY);
      resolve();
    }, 500);
  });
};

export const demoRestoreUser = async (): Promise<DemoUser | null> => {
  try {
    console.log('Attempting to restore user from AsyncStorage...');
    const userStr = await AsyncStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // Ensure user has a referral code (for users created before this feature)
      if (!user.referralCode) {
        console.log('User missing referral code, generating one...');
        let userReferralCode: string;
        do {
          userReferralCode = generateReferralCode();
        } while (DEMO_USERS.some(u => u.referralCode === userReferralCode));
        
        user.referralCode = userReferralCode;
        user.referralCount = user.referralCount || 0;
        user.referralRewards = user.referralRewards || 0;
        
        // Save updated user back to storage
        await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
        console.log('✓ Generated referral code for existing user:', userReferralCode);
      }
      
      // Ensure user has craving tracking fields (for users created before this feature)
      if (user.cravingsHandled === undefined || user.lastCravingDate === undefined) {
        console.log('User missing craving fields, adding defaults...');
        user.cravingsHandled = user.cravingsHandled || 0;
        user.lastCravingDate = user.lastCravingDate || null;
        
        // Save updated user back to storage
        await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
        console.log('✓ Added craving tracking fields to existing user');
      }
      
      // Apply check-in system migration if needed
      const migrationResult = migrateToCheckInSystem(user);
      if (migrationResult.migrationApplied) {
        // Migration occurred, save the updated user
        await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(migrationResult.user));
        console.log('✓ Applied check-in system migration to existing user');
        currentUser = migrationResult.user;
      } else {
        currentUser = migrationResult.user;
      }
      
      console.log('User restored successfully:', currentUser.email, 'with referral code:', currentUser.referralCode);
      return currentUser;
    }
    console.log('No user found in AsyncStorage');
    return null;
  } catch (e) {
    console.error('Error restoring user:', e);
    return null;
  }
};

export const demoGetCurrentUser = (): DemoUser | null => {
  return currentUser;
};

export const demoDeleteUser = async (): Promise<void> => {
  try {
    console.log('Deleting demo user account...');
    
    // Clear current user from memory
    currentUser = null;
    
    // Clear user data from AsyncStorage
    await AsyncStorage.removeItem(DEMO_USER_STORAGE_KEY);
    
    console.log('✓ Demo user account deleted successfully');
  } catch (error) {
    console.error('Error deleting demo user:', error);
    throw error;
  }
};

export const demoUpdateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  if (currentUser && currentUser.id === userId) {
    Object.assign(currentUser, updates);
    // Also update in DEMO_USERS array
    const index = DEMO_USERS.findIndex(u => u.id === userId);
    if (index !== -1) {
      Object.assign(DEMO_USERS[index], updates);
    }
    
    // Save updated user to AsyncStorage immediately
    try {
      await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(currentUser));
      console.log('Demo user data saved to storage immediately');
    } catch (error) {
      console.error('Error saving updated user to storage:', error);
      throw error; // Throw error so caller can handle it
    }
  }
};

export const demoCreateUserDocument = async (email: string, displayName: string, username: string, referralCode?: string): Promise<Partial<User>> => {
  // Generate unique referral code for new user
  let userReferralCode: string;
  do {
    userReferralCode = generateReferralCode();
  } while (DEMO_USERS.some(u => u.referralCode === userReferralCode));

  const userData: Partial<User> = {
    email,
    displayName,
    username,
    isPremium: email === 'admin@byerokok.app',
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
    settings: {
      darkMode: false,
      notifications: true,
      language: 'id',
      reminderTime: '09:00',
      leaderboardDisplayPreference: 'username'
    },
    onboardingCompleted: false,
    dailyXP: {},
    // Referral fields
    referralCode: userReferralCode,
    referredBy: referralCode?.toUpperCase() || undefined,
    referralCount: 0,
    referralRewards: 0
  };
  
  return userData;
};

export const demoUpdateOnboardingData = async (onboardingData: {
  quitDate: string;
  cigarettesPerDay: number;
  cigarettePrice: number;
  smokingYears: number;
  quitReasons: string[];
  previousAttempts: number;
  onboardingCompleted: boolean;
  onboardingDate: string;
}): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      if (currentUser) {
        try {
          // Update current user in memory
          Object.assign(currentUser, onboardingData);
          
          // Update in DEMO_USERS array
          const index = DEMO_USERS.findIndex(u => u.id === currentUser?.id);
          if (index !== -1) {
            Object.assign(DEMO_USERS[index], onboardingData);
          }
          
          // Save updated user to AsyncStorage
          await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(currentUser));
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('No current user found'));
      }
    }, 500);
  });
};