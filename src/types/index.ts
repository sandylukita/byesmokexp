export interface User {
  id: string;
  email: string;
  displayName: string;
  isPremium: boolean;
  quitDate: Date;
  cigarettesPerDay: number;
  cigarettePrice: number;
  streak: number;
  totalDays: number;
  xp: number;
  level: number;
  lastCheckIn: Date | null;
  badges: Badge[];
  completedMissions: Mission[];
  settings: UserSettings;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: Date | null;
  requirement: string;
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