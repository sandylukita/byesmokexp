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
  dailyXP?: { [date: string]: number }; // Track XP earned per day
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
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
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

export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}