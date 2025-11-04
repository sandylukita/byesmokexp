// Demo authentication service for testing without Firebase setup
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { generateReferralCode } from '../utils/referrals';
import { migrateToCheckInSystem } from '../utils/helpers';
import { log } from '../config/environment';
import { getDeviceLanguage } from '../utils/translations';

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
      language: getDeviceLanguage(),
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
    lastCravingDate: undefined,
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
      language: getDeviceLanguage(),
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
    lastCravingDate: undefined,
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
      language: getDeviceLanguage(),
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
    lastCravingDate: undefined,
    // Migration tracking
    migrationVersion: 'v2-checkin-only'
  },

  // Demo user for Lung Tiger stage (App Store screenshots)
  {
    id: 'demo-tiger-stage',
    email: 'tiger@appstore.demo',
    password: 'tiger123',
    displayName: 'Tiger Warrior',
    username: 'tiger_champion',
    isPremium: false,
    quitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    cigarettesPerDay: 15,
    cigarettePrice: 22000,
    streak: 42,
    longestStreak: 42,
    totalDays: 45, // Tiger stage (31-90 days)
    xp: 1250,
    level: 5,
    lastCheckIn: new Date(), // Today - just checked in
    badges: [
      {
        id: 'first-day',
        name: 'Langkah Pertama',
        description: 'Melakukan check-in pertama kali',
        icon: 'play-circle',
        color: '#2ECC71',
        unlockedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000),
        requirement: 'Check-in pertama'
      },
      {
        id: 'week-strong',
        name: 'Seminggu Kuat',
        description: 'Bertahan tanpa rokok selama seminggu',
        icon: 'military-tech',
        color: '#E67E22',
        unlockedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
        requirement: '7 hari bebas rokok'
      },
      {
        id: 'month-warrior',
        name: 'Pejuang Sebulan',
        description: 'Bebas rokok selama sebulan penuh',
        icon: 'emoji-events',
        color: '#9B59B6',
        unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        requirement: '30 hari bebas rokok'
      }
    ],
    completedMissions: [
      {
        id: 'mission-daily-checkin',
        title: 'Check-in Harian',
        description: 'Lakukan check-in hari ini',
        xpReward: 15,
        isCompleted: true,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isAIGenerated: false,
        difficulty: 'easy'
      },
      {
        id: 'mission-meditation',
        title: 'Meditasi 10 Menit',
        description: 'Lakukan meditasi untuk menenangkan pikiran',
        xpReward: 25,
        isCompleted: true,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isAIGenerated: true,
        difficulty: 'medium'
      }
    ],
    settings: {
      darkMode: false,
      notifications: true,
      language: getDeviceLanguage(),
      reminderTime: '08:00',
      leaderboardDisplayPreference: 'username'
    },
    onboardingCompleted: true,
    dailyXP: {
      [new Date().toDateString()]: 40
    },
    petStage: 'tiger', // Explicitly set tiger stage
    petStats: {
      happiness: 85,
      health: 90,
      energy: 80,
      lastFed: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
      lastPlayed: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
      totalInteractions: 156,
      dailyInteractions: 3,
      lastInteractionDate: new Date().toDateString()
    },
    // Referral fields
    referralCode: 'TIGER1',
    referredBy: undefined,
    referralCount: 3,
    referralRewards: 150,
    // Craving tracking fields
    cravingsHandled: 12,
    lastCravingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    // Migration tracking
    migrationVersion: 'v2-checkin-only'
  },

  // Demo user for Lung Lion stage (App Store screenshots)
  {
    id: 'demo-lion-stage',
    email: 'lion@appstore.demo',
    password: 'lion123',
    displayName: 'Lion Master',
    username: 'lion_legend',
    isPremium: true, // Premium user for premium features screenshots
    quitDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    cigarettesPerDay: 18,
    cigarettePrice: 28000,
    streak: 115,
    longestStreak: 115,
    totalDays: 120, // Lion stage (91+ days)
    xp: 3200,
    level: 12,
    lastCheckIn: new Date(), // Today - just checked in
    badges: [
      {
        id: 'first-day',
        name: 'Langkah Pertama',
        description: 'Melakukan check-in pertama kali',
        icon: 'play-circle',
        color: '#2ECC71',
        unlockedAt: new Date(Date.now() - 119 * 24 * 60 * 60 * 1000),
        requirement: 'Check-in pertama'
      },
      {
        id: 'week-strong',
        name: 'Seminggu Kuat',
        description: 'Bertahan tanpa rokok selama seminggu',
        icon: 'military-tech',
        color: '#E67E22',
        unlockedAt: new Date(Date.now() - 113 * 24 * 60 * 60 * 1000),
        requirement: '7 hari bebas rokok'
      },
      {
        id: 'month-warrior',
        name: 'Pejuang Sebulan',
        description: 'Bebas rokok selama sebulan penuh',
        icon: 'emoji-events',
        color: '#9B59B6',
        unlockedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        requirement: '30 hari bebas rokok'
      },
      {
        id: 'triple-month',
        name: 'Master 3 Bulan',
        description: 'Konsisten bebas rokok selama 3 bulan',
        icon: 'diamond',
        color: '#F39C12',
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        requirement: '90 hari bebas rokok'
      },
      {
        id: 'legendary-spirit',
        name: 'Jiwa Legendaris',
        description: 'Mencapai level tertinggi dalam perjalanan bebas rokok',
        icon: 'workspace-premium',
        color: '#8E44AD',
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        requirement: '100+ hari bebas rokok'
      }
    ],
    completedMissions: [
      {
        id: 'mission-daily-checkin',
        title: 'Check-in Harian',
        description: 'Lakukan check-in hari ini',
        xpReward: 20,
        isCompleted: true,
        completedAt: new Date(Date.now() - 30 * 60 * 1000),
        isAIGenerated: false,
        difficulty: 'easy'
      },
      {
        id: 'mission-breathing-exercise',
        title: 'Latihan Pernapasan Dalam',
        description: 'Lakukan teknik pernapasan 4-7-8 selama 5 menit',
        xpReward: 35,
        isCompleted: true,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isAIGenerated: true,
        difficulty: 'medium'
      },
      {
        id: 'mission-inspire-others',
        title: 'Inspirasi Komunitas',
        description: 'Bagikan pencapaian Anda untuk menginspirasi orang lain',
        xpReward: 50,
        isCompleted: true,
        completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isAIGenerated: true,
        difficulty: 'hard'
      }
    ],
    settings: {
      darkMode: true, // Dark mode for premium user
      notifications: true,
      language: getDeviceLanguage(),
      reminderTime: '07:00',
      leaderboardDisplayPreference: 'displayName'
    },
    onboardingCompleted: true,
    dailyXP: {
      [new Date().toDateString()]: 105,
      [new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()]: 95
    },
    petStage: 'lion', // Explicitly set lion stage
    petStats: {
      happiness: 98,
      health: 100,
      energy: 95,
      lastFed: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
      lastPlayed: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      totalInteractions: 450,
      dailyInteractions: 5,
      lastInteractionDate: new Date().toDateString()
    },
    // Referral fields
    referralCode: 'LION01',
    referredBy: undefined,
    referralCount: 8,
    referralRewards: 400,
    // Craving tracking fields
    cravingsHandled: 45,
    lastCravingDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    // Migration tracking
    migrationVersion: 'v2-checkin-only'
  }
];

let currentUser: DemoUser | null = null;

const DEMO_USER_STORAGE_KEY = 'demo_current_user';

export const demoSignIn = async (email: string, password: string): Promise<DemoUser> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      // Debug: Log available demo users
      log.debug('🔍 Demo Sign In Attempt:', email, 'password:', password);
      log.debug('🔍 Available demo users:', DEMO_USERS.map(u => ({ email: u.email, password: u.password })));

      // Enhanced debugging
      const matchingEmailUsers = DEMO_USERS.filter(u => u.email === email);
      log.debug('🔍 Users with matching email:', matchingEmailUsers.length);
      if (matchingEmailUsers.length > 0) {
        log.debug('🔍 Email match found, checking password...');
        const exactMatch = matchingEmailUsers.find(u => u.password === password);
        log.debug('🔍 Password match:', !!exactMatch);
        if (!exactMatch && matchingEmailUsers.length > 0) {
          log.debug('🔍 Expected password:', matchingEmailUsers[0].password, 'Got:', password);
        }
      }

      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      log.debug('🔍 Found matching user:', !!user);

      if (user) {
        // Apply check-in system migration if needed
        const migrationResult = migrateToCheckInSystem(user);
        currentUser = migrationResult.user;
        try {
          await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(migrationResult.user));
          log.debug('User saved to AsyncStorage:', migrationResult.user.email);
        } catch (error) {
          log.error('Error saving user to AsyncStorage:', error);
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
          
          log.debug(`✓ Demo referral: ${referralCode} -> +50 XP to referrer, +25 XP to new user`);
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
          language: getDeviceLanguage(),
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
    log.debug('Attempting to restore user from AsyncStorage...');
    const userStr = await AsyncStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // Ensure user has a referral code (for users created before this feature)
      if (!user.referralCode) {
        log.debug('User missing referral code, generating one...');
        let userReferralCode: string;
        do {
          userReferralCode = generateReferralCode();
        } while (DEMO_USERS.some(u => u.referralCode === userReferralCode));
        
        user.referralCode = userReferralCode;
        user.referralCount = user.referralCount || 0;
        user.referralRewards = user.referralRewards || 0;
        
        // Save updated user back to storage
        await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
        log.debug('✓ Generated referral code for existing user:', userReferralCode);
      }
      
      // Ensure user has craving tracking fields (for users created before this feature)
      if (user.cravingsHandled === undefined || user.lastCravingDate === undefined) {
        log.debug('User missing craving fields, adding defaults...');
        user.cravingsHandled = user.cravingsHandled || 0;
        user.lastCravingDate = user.lastCravingDate || null;
        
        // Save updated user back to storage
        await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
        log.debug('✓ Added craving tracking fields to existing user');
      }
      
      // Apply check-in system migration if needed
      const migrationResult = migrateToCheckInSystem(user);
      if (migrationResult.migrationApplied) {
        // Migration occurred, save the updated user
        await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(migrationResult.user));
        log.debug('✓ Applied check-in system migration to existing user');
        currentUser = migrationResult.user;
      } else {
        currentUser = migrationResult.user;
      }
      
      log.debug('User restored successfully:', currentUser.email, 'with referral code:', currentUser.referralCode);
      return currentUser;
    }
    log.debug('No user found in AsyncStorage');
    return null;
  } catch (e) {
    log.error('Error restoring user:', e);
    return null;
  }
};

export const demoGetCurrentUser = (): DemoUser | null => {
  return currentUser;
};

export const demoDeleteUser = async (): Promise<void> => {
  try {
    log.debug('Deleting demo user account...');
    
    // Clear current user from memory
    currentUser = null;
    
    // Clear user data from AsyncStorage
    await AsyncStorage.removeItem(DEMO_USER_STORAGE_KEY);
    
    log.debug('✓ Demo user account deleted successfully');
  } catch (error) {
    log.error('Error deleting demo user:', error);
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
      log.debug('Demo user data saved to storage immediately');
    } catch (error) {
      log.error('Error saving updated user to storage:', error);
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
      language: getDeviceLanguage(),
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