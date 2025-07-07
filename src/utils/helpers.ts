import { XP_LEVELS, HEALTH_MILESTONES } from './constants';
import { User, HealthMilestone } from '../types';

export const calculateLevel = (xp: number): { level: number; title: string; progress: number; nextLevelXP: number } => {
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1];
  
  for (let i = 0; i < XP_LEVELS.length - 1; i++) {
    if (xp >= XP_LEVELS[i].xpRequired && xp < XP_LEVELS[i + 1].xpRequired) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1];
      break;
    }
  }
  
  if (xp >= XP_LEVELS[XP_LEVELS.length - 1].xpRequired) {
    currentLevel = XP_LEVELS[XP_LEVELS.length - 1];
    nextLevel = XP_LEVELS[XP_LEVELS.length - 1];
  }
  
  const progress = nextLevel.xpRequired > currentLevel.xpRequired 
    ? (xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) 
    : 1;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    progress: Math.min(progress, 1),
    nextLevelXP: nextLevel.xpRequired
  };
};

export const calculateDaysSinceQuit = (quitDate: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - quitDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateMoneySaved = (totalDays: number, cigarettesPerDay: number, cigarettePrice: number): number => {
  if (totalDays === 0 || cigarettesPerDay === 0 || cigarettePrice === 0) return 0;
  
  const cigarettesPerPack = 20; // Assuming 20 cigarettes per pack
  const packsPerDay = cigarettesPerDay / cigarettesPerPack;
  const dailySavings = packsPerDay * cigarettePrice;
  
  return Math.floor(dailySavings * totalDays);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('id-ID').format(number);
};

export const getHealthMilestones = (quitDate: Date): HealthMilestone[] => {
  const now = new Date();
  const hoursSinceQuit = Math.abs(now.getTime() - quitDate.getTime()) / (1000 * 60 * 60);
  
  return HEALTH_MILESTONES.map(milestone => ({
    ...milestone,
    isReached: hoursSinceQuit >= milestone.hours
  }));
};

export const getGreeting = (name: string): string => {
  return `Hi, ${name}!`;
};

export const canCheckInToday = (lastCheckIn: Date | null): boolean => {
  if (!lastCheckIn) return true;
  
  const today = new Date();
  const lastCheckInDate = new Date(lastCheckIn);
  
  return today.toDateString() !== lastCheckInDate.toDateString();
};

export const calculateStreak = (lastCheckIn: Date | null): { canContinue: boolean; streakReset: boolean } => {
  if (!lastCheckIn) return { canContinue: true, streakReset: false };
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastCheckInDate = new Date(lastCheckIn);
  const isToday = today.toDateString() === lastCheckInDate.toDateString();
  const isYesterday = yesterday.toDateString() === lastCheckInDate.toDateString();
  
  if (isToday) {
    return { canContinue: false, streakReset: false }; // Already checked in today
  }
  
  if (isYesterday) {
    return { canContinue: true, streakReset: false }; // Can continue streak
  }
  
  return { canContinue: true, streakReset: true }; // Streak should reset
};

export const getRandomMotivation = (): string => {
  const motivations = [
    "Setiap hari tanpa rokok adalah kemenangan kecil yang bermakna besar.",
    "Kesehatan adalah investasi terbaik untuk masa depan yang cerah.",
    "Kamu lebih kuat dari kecanduan apapun. Percayalah pada diri sendiri.",
    "Perubahan dimulai dari keputusan kecil yang konsisten.",
    "Hidup sehat adalah hadiah terbaik untuk orang-orang yang kamu cintai.",
    "Setiap nafas yang bersih adalah langkah menuju kehidupan yang lebih baik.",
    "Kekuatan sejati terletak pada kemampuan mengatasi godaan.",
    "Hari ini adalah kesempatan baru untuk menjadi versi terbaik dari diri sendiri."
  ];
  
  return motivations[Math.floor(Math.random() * motivations.length)];
};

export const generateMissionId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};