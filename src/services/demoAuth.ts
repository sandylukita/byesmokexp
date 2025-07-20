// Demo authentication service for testing without Firebase setup
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

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
    streak: 12,
    longestStreak: 15,
    totalDays: 15,
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
    dailyXP: {}
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
    streak: 3,
    longestStreak: 5,
    totalDays: 5,
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
    dailyXP: {}
  }
];

let currentUser: DemoUser | null = null;

const DEMO_USER_STORAGE_KEY = 'demo_current_user';

export const demoSignIn = async (email: string, password: string): Promise<DemoUser> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        currentUser = user;
        try {
          await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
          console.log('User saved to AsyncStorage:', user.email);
        } catch (error) {
          console.error('Error saving user to AsyncStorage:', error);
        }
        resolve(user);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simulate network delay
  });
};

export const demoSignUp = async (email: string, password: string, displayName: string, username: string): Promise<DemoUser> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
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
        dailyXP: {}
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
      currentUser = user;
      console.log('User restored successfully:', user.email);
      return user;
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

export const demoCreateUserDocument = async (email: string, displayName: string, username: string): Promise<Partial<User>> => {
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
    onboardingCompleted: true,
    dailyXP: {}
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