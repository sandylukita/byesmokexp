import { User } from '../types';

/**
 * Unified Lungcat Health Calculation System
 *
 * This ensures all health displays across the app show the same value
 * based on consistent logic.
 */

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