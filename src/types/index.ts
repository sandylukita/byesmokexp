export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  isPremium: boolean;
  quitDate: Date;
  cigarettesPerDay: number;
  cigarettePrice: number;
  streak: number;
  longestStreak: number;
  totalDays: number;
  xp: number;
  level: number;
  lastCheckIn: Date | null;
  badges: Badge[];
  completedMissions: Mission[];
  settings: UserSettings;
  onboardingCompleted?: boolean;
  tutorialCompleted?: boolean; // Track if user completed feature discovery tutorial
  dailyXP?: { [date: string]: number }; // Track XP earned per day
  lastMotivationDate?: string; // Track when motivation was last generated (YYYY-MM-DD)
  dailyMotivation?: string; // Cache today's motivation message
  monthlyAICallsUsed?: number; // Track AI calls used this month (max 2)
  lastAICallDate?: string; // Track when AI was last called (YYYY-MM-DD)
  lastAIInsight?: string; // Cache latest AI-generated insight
  aiCallsResetMonth?: string; // Track which month the counter was reset (YYYY-MM)
  // Trial system fields
  isOnTrial?: boolean; // Whether user is currently on free trial
  trialStartDate?: string; // When trial started (ISO string)
  trialEndDate?: string; // When trial ends (ISO string)
  hasUsedTrial?: boolean; // Whether user has used their free trial
  // Popup timing fields
  createdAt?: string; // User registration date for popup timing
  lastUpgradePopupDismissed?: string; // Track popup dismissal to prevent spam
  // Craving tracking fields
  cravingsHandled?: number; // Total cravings handled using the app
  lastCravingDate?: string; // Last date a craving was logged (YYYY-MM-DD)
  // System migration tracking
  migrationVersion?: string; // Track data migrations for system changes
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: Date | null;
  requirement: string;
  isPremium?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  completedAt: Date | null;
  isAIGenerated: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  isLocked?: boolean; // Whether mission is locked
  unlockMethod?: 'ad' | 'premium'; // How to unlock the mission
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  streakNotifications?: boolean; // Smart streak protection notifications
  language: string;
  reminderTime: string;
  leaderboardDisplayPreference: 'username' | 'displayName';
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  icon: string;
  isReached: boolean;
}

export interface ProgressData {
  dates: string[];
  values: number[];
  label: string;
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  username: string;
  totalDays: number;
  streak: number;
  xp: number;
  level: number;
  rank: number;
}

export interface CravingLog {
  id: string;
  userId: string;
  timestamp: Date;
  intensity: number; // 1-5 scale
  method?: 'breathing' | 'distraction' | 'reasons'; // How they handled it
  duration?: number; // How long the session lasted in seconds
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}