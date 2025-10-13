import { User } from '../types';

/**
 * Unified Lungcat Health Calculation System
 *
 * This ensures all health displays across the app show the same value
 * based on consistent logic.
 */

// Evolution thresholds
export const EVOLUTION_THRESHOLDS = {
  TIGER: 30,  // Days to evolve from cat to tiger
  LION: 90,   // Days to evolve from tiger to lion
} as const;

export type PetStage = 'cat' | 'tiger' | 'lion';

export interface EvolutionInfo {
  currentStage: PetStage;
  nextStage: PetStage | null;
  daysToNextEvolution: number | null;
  evolutionProgress: number; // 0-100 percentage to next evolution
}

export interface LungcatHealthInfo {
  health: number;        // 0-100 percentage
  status: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  color: 'error' | 'warning' | 'primary' | 'success';
}

/**
 * Calculate Lungcat health percentage based on user's streak and activity
 */
export const calculateLungcatHealth = (user: User | null): LungcatHealthInfo => {
  if (!user) {
    return {
      health: 50,
      status: 'fair',
      color: 'warning'
    };
  }

  const streak = user.streak || 0;
  const lastCheckIn = user.lastCheckIn;

  // Base health calculation based on streak
  let baseHealth: number;

  if (streak === 0) {
    baseHealth = 20;
  } else if (streak < 7) {
    baseHealth = 40;
  } else if (streak < 30) {
    baseHealth = 70;
  } else if (streak < 90) {
    baseHealth = 85;
  } else {
    baseHealth = 100;
  }

  // Adjust for check-in recency
  let finalHealth = baseHealth;

  if (lastCheckIn) {
    const timeSinceCheckIn = Date.now() - new Date(lastCheckIn).getTime();
    const hoursGone = Math.floor(timeSinceCheckIn / (1000 * 60 * 60));

    // Reduce health if user hasn't checked in recently
    if (hoursGone > 24) {
      finalHealth = Math.max(finalHealth - 20, 0);
    } else if (hoursGone > 48) {
      finalHealth = Math.max(finalHealth - 30, 0);
    }
  }

  // Ensure health is within bounds
  finalHealth = Math.max(0, Math.min(100, finalHealth));

  // Determine status and color
  let status: LungcatHealthInfo['status'];
  let color: LungcatHealthInfo['color'];

  if (finalHealth >= 85) {
    status = 'excellent';
    color = 'success';
  } else if (finalHealth >= 60) {
    status = 'good';
    color = 'success';
  } else if (finalHealth >= 40) {
    status = 'fair';
    color = 'warning';
  } else if (finalHealth >= 20) {
    status = 'poor';
    color = 'warning';
  } else {
    status = 'critical';
    color = 'error';
  }

  return {
    health: finalHealth,
    status,
    color
  };
};

/**
 * Get just the health percentage (for compatibility with existing code)
 */
export const getLungcatHealthPercentage = (user: User | null): number => {
  return calculateLungcatHealth(user).health;
};

/**
 * Get health color for styling
 */
export const getLungcatHealthColor = (user: User | null, colors: any): string => {
  const healthInfo = calculateLungcatHealth(user);

  switch (healthInfo.color) {
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'error':
      return colors.error;
    default:
      return colors.primary;
  }
};

/**
 * Calculate evolution information based on user's total days
 */
export const getEvolutionInfo = (user: User | null): EvolutionInfo => {
  if (!user) {
    return {
      currentStage: 'cat',
      nextStage: 'tiger',
      daysToNextEvolution: EVOLUTION_THRESHOLDS.TIGER,
      evolutionProgress: 0,
    };
  }

  const totalDays = user.totalDays || 0;

  // Use explicit petStage if set, otherwise calculate from totalDays
  let currentStage: PetStage;
  if (user.petStage) {
    currentStage = user.petStage;
  } else {
    if (totalDays >= EVOLUTION_THRESHOLDS.LION) {
      currentStage = 'lion';
    } else if (totalDays >= EVOLUTION_THRESHOLDS.TIGER) {
      currentStage = 'tiger';
    } else {
      currentStage = 'cat';
    }
  }

  let nextStage: PetStage | null;
  let daysToNextEvolution: number | null;
  let evolutionProgress: number;

  switch (currentStage) {
    case 'cat':
      nextStage = 'tiger';
      daysToNextEvolution = Math.max(0, EVOLUTION_THRESHOLDS.TIGER - totalDays);
      evolutionProgress = Math.min(100, (totalDays / EVOLUTION_THRESHOLDS.TIGER) * 100);
      break;

    case 'tiger':
      nextStage = 'lion';
      daysToNextEvolution = Math.max(0, EVOLUTION_THRESHOLDS.LION - totalDays);
      evolutionProgress = Math.min(100, ((totalDays - EVOLUTION_THRESHOLDS.TIGER) / (EVOLUTION_THRESHOLDS.LION - EVOLUTION_THRESHOLDS.TIGER)) * 100);
      break;

    case 'lion':
      nextStage = null;
      daysToNextEvolution = null;
      evolutionProgress = 100;
      break;
  }

  return {
    currentStage,
    nextStage,
    daysToNextEvolution,
    evolutionProgress,
  };
};

/**
 * Get evolution-aware care message for the lungcat widget
 */
export const getEvolutionCareMessage = (user: User | null, language: 'en' | 'id'): string => {
  const evolutionInfo = getEvolutionInfo(user);
  const { currentStage, daysToNextEvolution } = evolutionInfo;

  switch (currentStage) {
    case 'cat':
      if (language === 'en') {
        const daysText = daysToNextEvolution === 1 ? 'day' : 'days';
        return daysToNextEvolution && daysToNextEvolution > 0
          ? `Your Lungcat is growing stronger! Only ${daysToNextEvolution} ${daysText} until it evolves into a mighty Tiger! 🐱➡️🐯`
          : `Your Lungcat is ready to evolve into a Tiger! Keep up your streak! 🐱➡️🐯`;
      } else {
        const daysText = daysToNextEvolution === 1 ? 'hari' : 'hari';
        return daysToNextEvolution && daysToNextEvolution > 0
          ? `Lungcat Anda semakin kuat! Hanya ${daysToNextEvolution} ${daysText} lagi untuk berevolusi menjadi Harimau yang perkasa! 🐱➡️🐯`
          : `Lungcat Anda siap berevolusi menjadi Harimau! Pertahankan streak Anda! 🐱➡️🐯`;
      }

    case 'tiger':
      if (language === 'en') {
        const daysText = daysToNextEvolution === 1 ? 'day' : 'days';
        return daysToNextEvolution && daysToNextEvolution > 0
          ? `Your Tiger is thriving! Only ${daysToNextEvolution} ${daysText} until it evolves into a majestic Lion! 🐯➡️🦁`
          : `Your Tiger is ready to become a Lion! Continue your legendary journey! 🐯➡️🦁`;
      } else {
        const daysText = daysToNextEvolution === 1 ? 'hari' : 'hari';
        return daysToNextEvolution && daysToNextEvolution > 0
          ? `Harimau Anda berkembang pesat! Hanya ${daysToNextEvolution} ${daysText} lagi untuk berevolusi menjadi Singa yang megah! 🐯➡️🦁`
          : `Harimau Anda siap menjadi Singa! Lanjutkan perjalanan legendaris Anda! 🐯➡️🦁`;
      }

    case 'lion':
      if (language === 'en') {
        return `Your Lion reigns supreme! You've mastered the ultimate evolution - keep this legendary streak alive! 👑🦁✨`;
      } else {
        return `Singa Anda berkuasa mutlak! Anda telah menguasai evolusi tertinggi - pertahankan streak legendaris ini! 👑🦁✨`;
      }

    default:
      // Fallback to original message
      return language === 'en'
        ? "Care for your Lungcat by checking in daily and completing missions!"
        : "Rawat Lungcat Anda dengan check-in harian dan selesaikan misi!";
  }
};

/**
 * Get evolution-aware status message
 */
export const getEvolutionStatusMessage = (user: User | null, language: 'en' | 'id'): string => {
  if (!user) {
    return language === 'en' ? '😷 Needs Your Care' : '😷 Butuh Perhatian';
  }

  const evolutionInfo = getEvolutionInfo(user);
  const streak = user.streak || 0;

  // Base status on streak and evolution stage
  if (streak >= 30) {
    switch (evolutionInfo.currentStage) {
      case 'lion':
        return language === 'en' ? '👑 Legendary Lion Master!' : '👑 Master Singa Legendaris!';
      case 'tiger':
        return language === 'en' ? '🐯 Powerful Tiger!' : '🐯 Harimau Perkasa!';
      default:
        return language === 'en' ? '🌟 Thriving & Happy!' : '🌟 Berkembang & Bahagia!';
    }
  } else if (streak >= 7) {
    switch (evolutionInfo.currentStage) {
      case 'tiger':
        return language === 'en' ? '🐯 Growing Tiger!' : '🐯 Harimau Berkembang!';
      default:
        return language === 'en' ? '😊 Healthy & Growing' : '😊 Sehat & Berkembang';
    }
  } else if (streak > 0) {
    return language === 'en' ? '🌱 Getting Better' : '🌱 Semakin Baik';
  } else {
    return language === 'en' ? '😷 Needs Your Care' : '😷 Butuh Perhatian';
  }
};