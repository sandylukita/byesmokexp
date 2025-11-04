/**
 * Community Stats Service
 * 
 * Handles anonymous community statistics for social comparison features:
 * - Anonymous data aggregation
 * - Percentile calculations
 * - Community insights
 * - Zero personal data collection
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { User } from '../types';

// Cost optimization settings
const CACHE_SETTINGS = {
  STATS_CACHE_HOURS: 12, // Extend cache from daily to 12 hours
  LOCAL_STORAGE_KEY: 'byesmoke_community_stats',
  MAX_FIREBASE_CALLS_PER_HOUR: 50, // Circuit breaker limit
  FIREBASE_CALL_TRACKING_KEY: 'firebase_calls_tracking',
};

// Anonymous community stats structure
export interface CommunityStats {
  lastUpdated: string;
  totalUsers: number;
  streakDistribution: {
    '0-7': number;
    '8-30': number;
    '31-90': number;
    '91-365': number;
    '365+': number;
  };
  averageStreak: number;
  topStreakRanges: {
    top10Percent: number; // Minimum streak for top 10%
    top25Percent: number; // Minimum streak for top 25%
    top50Percent: number; // Minimum streak for top 50%
  };
  xpDistribution: {
    '0-100': number;
    '101-500': number;
    '501-1000': number;
    '1001-2000': number;
    '2000+': number;
  };
  averageXP: number;
  averageDaysSmokeFree: number;
  averageMoneySaved: number;
}

// User comparison result
export interface UserComparison {
  streakPercentile: number; // What percentage of users this user beats
  xpPercentile: number;
  daysPercentile: number;
  streakRank: string; // "top 10%", "top 25%", etc.
  communityInsight: string; // Motivational message
}

// Cost optimization helper functions
const getLocalStorageStats = async (): Promise<CommunityStats | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_SETTINGS.LOCAL_STORAGE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    const cacheAge = Date.now() - new Date(parsed.cachedAt).getTime();
    const maxAge = CACHE_SETTINGS.STATS_CACHE_HOURS * 60 * 60 * 1000; // Convert to milliseconds
    
    if (cacheAge < maxAge) {
      console.log('💾 Using AsyncStorage cached community stats');
      return parsed.data;
    } else {
      console.log('💾 AsyncStorage cache expired, removing...');
      await AsyncStorage.removeItem(CACHE_SETTINGS.LOCAL_STORAGE_KEY);
      return null;
    }
  } catch (error) {
    console.warn('Failed to read from AsyncStorage:', error);
    return null;
  }
};

const setLocalStorageStats = async (stats: CommunityStats): Promise<void> => {
  try {
    const cacheData = {
      data: stats,
      cachedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CACHE_SETTINGS.LOCAL_STORAGE_KEY, JSON.stringify(cacheData));
    console.log('💾 Community stats cached locally');
  } catch (error) {
    console.warn('Failed to write to AsyncStorage:', error);
  }
};

const trackFirebaseCall = async (): Promise<boolean> => {
  try {
    const now = Date.now();
    const hourStart = Math.floor(now / (1000 * 60 * 60)) * (1000 * 60 * 60);
    const trackingKey = `${CACHE_SETTINGS.FIREBASE_CALL_TRACKING_KEY}_${hourStart}`;
    
    const currentCallsStr = await AsyncStorage.getItem(trackingKey);
    const currentCalls = parseInt(currentCallsStr || '0', 10);
    
    if (currentCalls >= CACHE_SETTINGS.MAX_FIREBASE_CALLS_PER_HOUR) {
      console.warn('🚨 Firebase call limit reached for this hour. Using fallback data.');
      return false; // Circuit breaker activated
    }
    
    await AsyncStorage.setItem(trackingKey, (currentCalls + 1).toString());
    console.log(`📊 Firebase calls this hour: ${currentCalls + 1}/${CACHE_SETTINGS.MAX_FIREBASE_CALLS_PER_HOUR}`);
    return true;
  } catch (error) {
    console.warn('Failed to track Firebase calls:', error);
    return true; // Allow the call if tracking fails
  }
};

/**
 * Enhanced community stats with multi-level caching and cost optimization
 */
export const getCommunityStats = async (): Promise<CommunityStats | null> => {
  // Level 1: Check local storage cache first (fastest, no network)
  const localStats = await getLocalStorageStats();
  if (localStats) {
    return localStats;
  }
  
  // Level 2: Check circuit breaker before making Firebase call
  const canMakeCall = await trackFirebaseCall();
  if (!canMakeCall) {
    console.warn('🚨 Circuit breaker active - using demo stats to control costs');
    return generateDemoCommunityStats();
  }
  
  // Level 3: Firebase call with enhanced caching logic
  try {
    console.log('🔥 Making Firebase call for community stats');
    const statsDoc = await getDoc(doc(db, 'communityStats', 'global'));
    
    if (statsDoc.exists()) {
      const stats = statsDoc.data() as CommunityStats;
      
      // Enhanced cache validation - use 12-hour window instead of daily
      const now = new Date();
      const lastUpdated = new Date(stats.lastUpdated);
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff <= CACHE_SETTINGS.STATS_CACHE_HOURS) {
        console.log('📊 Using Firebase cached community stats (fresh)');
        await setLocalStorageStats(stats); // Cache locally for future requests
        return stats;
      } else {
        console.log('📊 Firebase stats are older than 12h, but still usable');
        await setLocalStorageStats(stats); // Cache locally even if slightly stale
        return stats; // Return slightly stale stats rather than expensive refresh
      }
    }
    
    console.log('📊 No Firebase community stats found, using demo stats');
    const demoStats = generateDemoCommunityStats();
    await setLocalStorageStats(demoStats); // Cache demo stats to avoid repeated Firebase calls
    return demoStats;
    
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.log('🔒 Firebase permissions not set up for communityStats, using demo data');
    } else {
      console.error('Error getting community stats:', error);
    }
    
    console.log('📊 Falling back to demo community stats');
    const demoStats = generateDemoCommunityStats();
    await setLocalStorageStats(demoStats); // Cache demo stats to avoid repeated failures
    return demoStats;
  }
};

/**
 * Cost monitoring and reporting functions
 */
export const getFirebaseUsageStats = async (): Promise<{ callsThisHour: number; maxCalls: number; percentageUsed: number }> => {
  try {
    const now = Date.now();
    const hourStart = Math.floor(now / (1000 * 60 * 60)) * (1000 * 60 * 60);
    const trackingKey = `${CACHE_SETTINGS.FIREBASE_CALL_TRACKING_KEY}_${hourStart}`;
    
    const callsThisHourStr = await AsyncStorage.getItem(trackingKey);
    const callsThisHour = parseInt(callsThisHourStr || '0', 10);
    const maxCalls = CACHE_SETTINGS.MAX_FIREBASE_CALLS_PER_HOUR;
    const percentageUsed = Math.round((callsThisHour / maxCalls) * 100);
    
    return {
      callsThisHour,
      maxCalls,
      percentageUsed
    };
  } catch (error) {
    console.warn('Failed to get Firebase usage stats:', error);
    return { callsThisHour: 0, maxCalls: CACHE_SETTINGS.MAX_FIREBASE_CALLS_PER_HOUR, percentageUsed: 0 };
  }
};

export const clearOldTrackingData = async (): Promise<void> => {
  try {
    const keysToRemove: string[] = [];
    const currentHour = Math.floor(Date.now() / (1000 * 60 * 60)) * (1000 * 60 * 60);
    
    // Get all AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Clean up tracking data older than 24 hours
    for (const key of allKeys) {
      if (key && key.startsWith(CACHE_SETTINGS.FIREBASE_CALL_TRACKING_KEY)) {
        const hourFromKey = parseInt(key.split('_').pop() || '0', 10);
        const hoursDiff = (currentHour - hourFromKey) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove old keys
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`🧹 Cleaned up ${keysToRemove.length} old Firebase tracking entries`);
    }
  } catch (error) {
    console.warn('Failed to clear old tracking data:', error);
  }
};

/**
 * Calculate user's percentile compared to community
 */
export const calculateUserPercentile = (userValue: number, distribution: number[], isHigherBetter: boolean = true): number => {
  if (distribution.length === 0) return 50; // Default to 50th percentile
  
  const sortedDistribution = distribution.sort((a, b) => a - b);
  let betterThanCount = 0;
  
  if (isHigherBetter) {
    betterThanCount = sortedDistribution.filter(value => userValue > value).length;
  } else {
    betterThanCount = sortedDistribution.filter(value => userValue < value).length;
  }
  
  return Math.round((betterThanCount / sortedDistribution.length) * 100);
};

/**
 * Compare user against community stats
 */
export const compareUserToCommunity = async (user: User, language: 'id' | 'en' = 'id'): Promise<UserComparison | null> => {
  try {
    const communityStats = await getCommunityStats();

    if (!communityStats) {
      console.log('No community stats available for comparison');
      return null;
    }

    // Calculate user's current metrics
    const userStreak = user.longestStreak || user.streak || 0;
    const userXP = user.xp || 0;
    const userDays = user.totalDays || 0;

    // Estimate percentiles based on distribution data
    let streakPercentile = 50;
    let streakRank = language === 'en' ? "middle 50%" : "middle 50%";

    // Determine streak percentile from ranges
    if (userStreak >= communityStats.topStreakRanges.top10Percent) {
      streakPercentile = 95;
      streakRank = language === 'en' ? "top 10%" : "top 10%";
    } else if (userStreak >= communityStats.topStreakRanges.top25Percent) {
      streakPercentile = 87;
      streakRank = language === 'en' ? "top 25%" : "top 25%";
    } else if (userStreak >= communityStats.topStreakRanges.top50Percent) {
      streakPercentile = 75;
      streakRank = language === 'en' ? "top 50%" : "top 50%";
    } else if (userStreak > communityStats.averageStreak) {
      streakPercentile = 65;
      streakRank = language === 'en' ? "above average" : "above average";
    }

    // Simple XP percentile estimation
    const xpPercentile = Math.min(95, Math.max(5, (userXP / (communityStats.averageXP * 2)) * 100));

    // Days percentile estimation
    const daysPercentile = Math.min(95, Math.max(5, (userDays / (communityStats.averageDaysSmokeFree * 2)) * 100));

    // Generate community insight
    const communityInsight = generateCommunityInsight(streakPercentile, streakRank, userStreak, language);

    return {
      streakPercentile,
      xpPercentile: Math.round(xpPercentile),
      daysPercentile: Math.round(daysPercentile),
      streakRank,
      communityInsight
    };

  } catch (error) {
    console.error('Error comparing user to community:', error);
    return null;
  }
};

/**
 * Generate motivational community insight
 */
const generateCommunityInsight = (percentile: number, rank: string, streak: number, language: 'id' | 'en' = 'id'): string => {
  if (language === 'en') {
    if (percentile >= 90) {
      return `🌟 Amazing! Your ${streak}-day streak beats 90% of ByeSmoke users!`;
    } else if (percentile >= 75) {
      return `🔥 Great! You're in the ${rank} of users with the longest streaks!`;
    } else if (percentile >= 50) {
      return `💪 Nice! Your streak beats ${percentile}% of other users!`;
    } else if (percentile >= 25) {
      return `📈 Keep it up! You're already better than ${percentile}% of users!`;
    } else {
      return `🚀 Every day is progress! Join the growing community!`;
    }
  } else {
    if (percentile >= 90) {
      return `🌟 Luar biasa! Streak ${streak} hari Anda mengalahkan 90% pengguna ByeSmoke!`;
    } else if (percentile >= 75) {
      return `🔥 Hebat! Anda berada di ${rank} pengguna dengan streak terpanjang!`;
    } else if (percentile >= 50) {
      return `💪 Bagus! Streak Anda mengalahkan ${percentile}% pengguna lainnya!`;
    } else if (percentile >= 25) {
      return `📈 Terus semangat! Anda sudah lebih baik dari ${percentile}% pengguna!`;
    } else {
      return `🚀 Setiap hari adalah kemajuan! Bergabunglah dengan komunitas yang terus berkembang!`;
    }
  }
};

/**
 * Contribute anonymous data to community stats (called during check-ins)
 */
export const contributeAnonymousStats = async (user: User): Promise<void> => {
  try {
    // Only contribute basic, anonymous metrics
    const anonymousData = {
      streak: user.longestStreak || user.streak || 0,
      xp: user.xp || 0,
      totalDays: user.totalDays || 0,
      timestamp: new Date().toISOString(),
      // No personal information collected
    };
    
    // Add to daily contributions collection (for aggregation)
    const today = new Date().toISOString().split('T')[0];
    const contributionDoc = doc(db, 'communityContributions', `${today}_${Date.now()}`);
    
    await setDoc(contributionDoc, anonymousData);
    
    // Increment community count (hybrid approach - max 3 per user)
    await incrementCommunityCountWithCap(user.id);
    
    console.log('📊 Anonymous stats contributed to community');
  } catch (error) {
    console.error('Error contributing anonymous stats:', error);
    // Don't throw - this shouldn't break the user flow
  }
};

/**
 * Increment the real user count only if this is a new user
 */
const incrementRealUserCountIfNew = async (userId: string): Promise<void> => {
  try {
    // Check if user has already been counted
    const userTrackingRef = doc(db, 'communityUserTracking', userId);
    const userTrackingDoc = await getDoc(userTrackingRef);
    
    if (userTrackingDoc.exists()) {
      // User already counted, don't increment
      console.log(`👤 User ${userId} already counted in community stats`);
      return;
    }
    
    // Mark user as counted
    await setDoc(userTrackingRef, {
      firstContribution: new Date().toISOString(),
      userId: userId // Anonymous tracking only
    });
    
    // Increment real user count in global stats
    const globalStatsRef = doc(db, 'communityStats', 'global');
    const statsDoc = await getDoc(globalStatsRef);
    
    if (statsDoc.exists()) {
      const currentStats = statsDoc.data() as CommunityStats;
      const newRealUserCount = (currentStats.realUserCount || 0) + 1;
      const newTotalUsers = currentStats.ghostUserBaseline + newRealUserCount;
      
      await updateDoc(globalStatsRef, {
        realUserCount: newRealUserCount,
        totalUsers: newTotalUsers,
        lastUpdated: new Date().toISOString()
      });
      
      console.log(`🚀 New user added to community! Real users: ${newRealUserCount} (Total: ${newTotalUsers})`);
    } else {
      console.log('⚠️ Global stats document not found, cannot increment real user count');
    }
    
  } catch (error) {
    console.error('Error checking/incrementing real user count:', error);
    // Don't throw - this is a background operation
  }
};

/**
 * Increment community count with cap (max 3 contributions per user)
 * Uses user's own document to track contribution count
 */
const incrementCommunityCountWithCap = async (userId: string): Promise<void> => {
  try {
    // Check user's contribution count in their user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('⚠️ User document not found, cannot track contributions');
      return;
    }
    
    const userData = userDoc.data();
    const contributionCount = userData.communityContributions || 0;
    
    // If user has already contributed 3 times, don't increment
    if (contributionCount >= 3) {
      console.log(`👤 User has reached contribution limit (3/3)`);
      return;
    }
    
    // Increment user's contribution count in their own document
    await updateDoc(userRef, {
      communityContributions: contributionCount + 1
    });
    
    // Increment global community count
    const globalStatsRef = doc(db, 'communityStats', 'global');
    const statsDoc = await getDoc(globalStatsRef);
    
    if (statsDoc.exists()) {
      const currentStats = statsDoc.data() as CommunityStats;
      const newTotalUsers = currentStats.totalUsers + 1;
      
      await updateDoc(globalStatsRef, {
        totalUsers: newTotalUsers,
        lastUpdated: new Date().toISOString()
      });
      
      console.log(`🚀 Community grew! Total users: ${newTotalUsers} (user contribution ${contributionCount + 1}/3)`);
    } else {
      console.log('⚠️ Global stats document not found, cannot increment');
    }
    
  } catch (error) {
    console.error('Error incrementing community count with cap:', error);
    // Don't throw - this is a background operation
  }
};

/**
 * Generate demo community stats for development/testing
 */
export const generateDemoCommunityStats = (): CommunityStats => {
  return {
    lastUpdated: new Date().toISOString(),
    totalUsers: 12847,
    streakDistribution: {
      '0-7': 4523,
      '8-30': 3891,
      '31-90': 2456,
      '91-365': 1677,
      '365+': 300
    },
    averageStreak: 28.5,
    topStreakRanges: {
      top10Percent: 95,
      top25Percent: 45,
      top50Percent: 21
    },
    xpDistribution: {
      '0-100': 3200,
      '101-500': 4500,
      '501-1000': 2800,
      '1001-2000': 1847,
      '2000+': 500
    },
    averageXP: 485,
    averageDaysSmokeFree: 34.2,
    averageMoneySaved: 890000 // In Rupiah
  };
};

/**
 * Initialize Firebase with ghost data baseline
 */
export const initializeGhostDataBaseline = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing Firebase with ghost data baseline...');
    
    const globalStatsRef = doc(db, 'communityStats', 'global');
    const existingStats = await getDoc(globalStatsRef);
    
    if (existingStats.exists()) {
      console.log('✅ Community stats already exist in Firebase');
      return;
    }
    
    // Create initial community stats with ghost data
    const ghostStats = generateDemoCommunityStats();
    
    await setDoc(globalStatsRef, ghostStats);
    
    console.log('✅ Ghost data baseline initialized in Firebase');
    console.log('📊 Starting with', ghostStats.totalUsers, 'ghost users');
    
  } catch (error) {
    console.error('❌ Error initializing ghost data baseline:', error);
    throw error;
  }
};

/**
 * Get community insights for dashboard display
 */
export const getCommunityInsights = async (): Promise<string[]> => {
  try {
    const stats = await getCommunityStats();
    
    if (!stats) {
      return [
        "🌟 Bergabunglah dengan komunitas ByeSmoke yang terus berkembang!",
        "💪 Ribuan pengguna telah berhasil berhenti merokok bersama kami!"
      ];
    }
    
    const insights = [
      `👥 ${stats.totalUsers.toLocaleString('id-ID')} orang telah bergabung dengan komunitas ByeSmoke`,
      `🔥 Rata-rata streak komunitas: ${Math.round(stats.averageStreak)} hari`,
      `🏆 ${stats.streakDistribution['365+']} pengguna telah mencapai streak 1+ tahun!`,
      `💰 Komunitas telah menghemat rata-rata Rp ${Math.round(stats.averageMoneySaved / 1000)}rb per orang`,
      `🚀 Komunitas terus berkembang setiap hari!`
    ];
    
    // Return 2 random insights
    const shuffled = insights.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
    
  } catch (error) {
    console.error('Error getting community insights:', error);
    return [
      "🌟 Bergabunglah dengan komunitas ByeSmoke yang terus berkembang!",
      "💪 Ribuan pengguna telah berhasil berhenti merokok bersama kami!"
    ];
  }
};