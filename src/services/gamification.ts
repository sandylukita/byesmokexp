import { doc, updateDoc, arrayUnion, increment, collection, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { BADGES } from '../utils/constants';
import { User, Badge, Mission } from '../types';
import { demoGetCurrentUser, demoUpdateUser } from './demoAuth';
import { calculateLevel, calculateMoneySaved, addDailyXP } from '../utils/helpers';
import { getTranslatedMissions, getTranslatedMissionsWithSeed } from '../utils/missionTranslations';
import { getTranslation } from '../utils/translations';
// import { showInterstitialAd } from './adMob';

// Baseline badge statistics to make the app feel established
const BASELINE_BADGE_STATS: {[badgeId: string]: number} = {
  // Common badges - most users achieve these
  'new-member': 3205,   // Highest count - all registered users get this
  'first-day': 2847,
  'week-warrior': 1623,
  
  // Medium difficulty badges
  'month-master': 943,
  'xp-collector': 721,
  'mission-master': 387,
  
  // Hard badges - fewer users
  'streak-master': 234,
  
  // Referral badges - social sharing encourages growth
  'social-influencer': 892,      // Many users refer at least 1 friend
  'community-builder': 234,      // Fewer achieve 5 referrals
  'community-leader': 87,        // Even fewer achieve 10 referrals
  'smoke-free-ambassador': 23,   // Very few achieve 25 referrals
  
  // Premium badges - moderate numbers
  'elite-year': 156,
  'xp-elite': 198,
  'mission-legend': 134,
  'money-saver-elite': 167,
  'health-transformer': 89,
  'perfect-month': 52,
  
  // Ultra rare premium badges
  'diamond-streak': 43,
  'legendary-master': 28,
  'xp-master-premium': 76,
  'xp-legend': 34,
  'mission-champion': 61,
  'money-master-premium': 45,
};

export const initializeBadgeStatistics = async (): Promise<void> => {
  console.log('🚀 Initializing baseline badge statistics...');
  
  for (const badge of BADGES) {
    const baselineCount = BASELINE_BADGE_STATS[badge.id] || Math.floor(Math.random() * 100) + 50;
    
    try {
      const badgeStatsDoc = doc(db, 'badgeStats', badge.id);
      await setDoc(badgeStatsDoc, { 
        count: baselineCount,
        baseline: baselineCount,
        realUsers: 0
      }, { merge: true });
      
      console.log(`✓ Initialized ${badge.id}: ${baselineCount} baseline`);
    } catch (error) {
      console.log(`⚠️ Could not initialize ${badge.id} baseline:`, error.message);
    }
  }
  
  console.log('✅ Badge statistics baseline initialization complete');
};

export const incrementBadgeCount = async (badgeId: string): Promise<void> => {
  try {
    const badgeStatsDoc = doc(db, 'badgeStats', badgeId);
    
    // Try to increment both total count and real users count
    await updateDoc(badgeStatsDoc, {
      count: increment(1),
      realUsers: increment(1)
    });
    console.log(`✓ Badge counter incremented for: ${badgeId} (real user)`);
  } catch (error) {
    // If document doesn't exist, initialize with baseline + 1
    try {
      const baselineCount = BASELINE_BADGE_STATS[badgeId] || 50;
      const badgeStatsDoc = doc(db, 'badgeStats', badgeId);
      await setDoc(badgeStatsDoc, { 
        count: baselineCount + 1,
        baseline: baselineCount,
        realUsers: 1
      });
      console.log(`✓ Badge counter created for: ${badgeId} (baseline: ${baselineCount} + 1 real user)`);
    } catch (createError) {
      // If we can't access Firebase, just log and continue
      console.log(`⚠️ Unable to increment badge count for ${badgeId} (permissions/demo mode):`, createError.message);
    }
  }
};

export const getBadgeStatistics = async (): Promise<{[badgeId: string]: number}> => {
  try {
    // Optimized: Read only specific badge documents instead of scanning entire collection
    const badgeIds = BADGES.map(badge => badge.id);
    const readPromises = badgeIds.map(async (badgeId) => {
      try {
        const badgeDocRef = doc(db, 'badgeStats', badgeId);
        const badgeDoc = await getDoc(badgeDocRef);
        return {
          id: badgeId,
          count: badgeDoc.exists() ? (badgeDoc.data().count || 0) : 0
        };
      } catch (error) {
        console.log(`Failed to read badge stat for ${badgeId}:`, error);
        return { id: badgeId, count: 0 };
      }
    });
    
    // Execute all reads in parallel (much faster than collection scan)
    const results = await Promise.all(readPromises);
    
    const firebaseStats: {[badgeId: string]: number} = {};
    results.forEach(result => {
      firebaseStats[result.id] = result.count;
    });
    
    // Merge Firebase data with baseline, ensuring all badges have statistics
    const stats = mergeWithBaseline(firebaseStats);
    
    console.log('✓ Badge statistics loaded from Firebase (optimized reads):', Object.keys(firebaseStats).length, 'badges, merged with baseline');
    return stats;
  } catch (error) {
    console.error('Error loading badge statistics from Firebase, using baseline data:', error);
    
    // Return baseline statistics if Firebase fails
    return getBaselineStats();
  }
};

const mergeWithBaseline = (firebaseStats: {[badgeId: string]: number}): {[badgeId: string]: number} => {
  const mergedStats: {[badgeId: string]: number} = {};
  
  BADGES.forEach(badge => {
    const firebaseCount = firebaseStats[badge.id];
    const baselineCount = BASELINE_BADGE_STATS[badge.id] || 50;
    
    if (firebaseCount !== undefined) {
      // Use Firebase data if available
      mergedStats[badge.id] = firebaseCount;
    } else {
      // Use baseline if no Firebase data
      mergedStats[badge.id] = baselineCount;
    }
  });
  
  return mergedStats;
};

const getBaselineStats = (): {[badgeId: string]: number} => {
  const stats: {[badgeId: string]: number} = {};
  
  BADGES.forEach(badge => {
    stats[badge.id] = BASELINE_BADGE_STATS[badge.id] || Math.floor(Math.random() * 100) + 50;
  });
  
  console.log('✓ Using baseline badge statistics for', Object.keys(stats).length, 'badges');
  return stats;
};


export const checkAndAwardBadges = async (userId: string, user: User): Promise<Badge[]> => {
  const newBadges: Badge[] = [];
  const userBadgeIds = (user.badges || []).map(badge => badge.id);

  for (const badgeTemplate of BADGES) {
    // Skip if user already has this badge
    if (userBadgeIds.includes(badgeTemplate.id)) continue;

    // Skip premium badges if user is not premium
    if (badgeTemplate.isPremium && !user.isPremium) continue;

    let shouldAward = false;

    // Check badge requirements
    switch (badgeTemplate.id) {
      case 'new-member':
        // Auto-awarded to all users (this should be given during registration)
        shouldAward = true;
        break;
      case 'first-day':
        // Award badge after first check-in (when user has done at least one check-in)
        shouldAward = user.lastCheckIn !== null && user.lastCheckIn !== undefined;
        break;
      case 'week-warrior':
        shouldAward = user.streak >= 7;
        break;
      case 'month-master':
        shouldAward = user.totalDays >= 30;
        break;
      case 'streak-master':
        shouldAward = user.streak >= 100;
        break;
      case 'xp-collector':
        shouldAward = user.xp >= 1000;
        break;
      case 'mission-master':
        shouldAward = (user.completedMissions?.length || 0) >= 50;
        break;
      
      // Referral Badges
      case 'social-influencer':
        shouldAward = (user.referralCount || 0) >= 1;
        break;
      case 'community-builder':
        shouldAward = (user.referralCount || 0) >= 5;
        break;
      case 'community-leader':
        shouldAward = (user.referralCount || 0) >= 10;
        break;
      case 'smoke-free-ambassador':
        shouldAward = (user.referralCount || 0) >= 25;
        break;
      
      // Premium Badges
      case 'elite-year':
        shouldAward = user.totalDays >= 365;
        break;
      case 'diamond-streak':
        shouldAward = user.streak >= 500;
        break;
      case 'legendary-master':
        shouldAward = user.streak >= 1000;
        break;
      case 'xp-elite':
        shouldAward = user.xp >= 5000;
        break;
      case 'xp-master-premium':
        shouldAward = user.xp >= 10000;
        break;
      case 'xp-legend':
        shouldAward = user.xp >= 25000;
        break;
      case 'mission-legend':
        shouldAward = (user.completedMissions?.length || 0) >= 100;
        break;
      case 'mission-champion':
        shouldAward = (user.completedMissions?.length || 0) >= 250;
        break;
      case 'money-saver-elite':
        shouldAward = calculateMoneySaved(user.totalDays, user.cigarettesPerDay || 0, user.cigarettePrice || 0) >= 5000000;
        break;
      case 'money-master-premium':
        shouldAward = calculateMoneySaved(user.totalDays, user.cigarettesPerDay || 0, user.cigarettePrice || 0) >= 10000000;
        break;
      case 'health-transformer':
        // Check if user has been smoke-free for 1 year (all health milestones achieved)
        shouldAward = user.totalDays >= 365;
        break;
      case 'perfect-month':
        // Check if user has 30+ day streak AND gained 500+ XP in the last 30 days
        // For simplicity, we'll check if they have 30+ streak and 500+ total XP
        shouldAward = user.streak >= 30 && user.xp >= 500;
        break;
      default:
        break;
    }

    if (shouldAward) {
      const newBadge: Badge = {
        ...badgeTemplate,
        unlockedAt: new Date(),
      };
      newBadges.push(newBadge);
    }
  }

  // Update user document with new badges
  if (newBadges.length > 0) {
    // Check if we're in demo mode first
    const demoUser = demoGetCurrentUser();
    const isDemo = demoUser && demoUser.id === userId;
    
    if (isDemo) {
      // Handle demo user directly
      try {
        const updatedBadges = [...(demoUser.badges || []), ...newBadges];
        await demoUpdateUser(userId, { badges: updatedBadges });
        console.log('✓ Demo: Successfully awarded badges:', newBadges.length);
        
        // Skip badge statistics for demo users to avoid Firebase errors
        console.log('ℹ️ Skipping badge statistics for demo user');
      } catch (demoError) {
        console.error('Demo badge awarding failed:', demoError);
      }
    } else {
      // Handle Firebase user
      try {
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, {
          badges: arrayUnion(...newBadges)
        });
        console.log('✓ Firebase: Successfully awarded badges:', newBadges.length);
        
        // Increment badge counters for statistics (Firebase users only)
        for (const badge of newBadges) {
          await incrementBadgeCount(badge.id);
        }
      } catch (error) {
        console.error('Firebase error awarding badges:', error);
      }
    }
    
    // Show interstitial ad when user earns badges (async, don't await)
    if (newBadges.length > 0) {
      // Get user's premium status to determine if we should show ad
      const shouldShowAd = !user.isPremium;
      if (shouldShowAd) {
        // Show ad after a short delay, don't block the function
        setTimeout(() => {
          // showInterstitialAd(user.isPremium, `badge_earned_${newBadges[0].id}`); // Commented out for web compatibility
          console.log('🎯 Badge earned ad would show here on native platforms');
        }, 3000); // 3 second delay to let user enjoy the badge notification
      }
    }
  }

  return newBadges;
};

export const awardXP = async (userId: string, xpAmount: number, reason: string): Promise<void> => {
  try {
    const userDoc = doc(db, 'users', userId);
    
    // In a real app, you'd first fetch the current user data, calculate new XP,
    // then update. For simplicity, we're using increment
    await updateDoc(userDoc, {
      xp: xpAmount // This should be increment(xpAmount) in a real implementation
    });

    console.log(`Awarded ${xpAmount} XP to user ${userId} for: ${reason}`);
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
};

export const completeMission = async (
  userId: string, 
  mission: Mission, 
  currentUser: User
): Promise<{ success: boolean; xpAwarded: number; newBadges: Badge[] }> => {
  try {
    const completedMission: Mission = {
      ...mission,
      isCompleted: true,
      completedAt: new Date(),
    };

    const newXP = currentUser.xp + mission.xpReward;
    const updatedDailyXP = addDailyXP(currentUser.dailyXP, mission.xpReward);
    const updatedUser: User = {
      ...currentUser,
      xp: newXP,
      dailyXP: updatedDailyXP,
      completedMissions: [...(currentUser.completedMissions || []), completedMission],
    };

    try {
      // Try Firebase first - get current data, then update
      console.log('🔥 Attempting Firebase mission save:');
      console.log('  - User ID:', userId);
      console.log('  - Mission ID:', completedMission.id);
      console.log('  - Mission completed at:', completedMission.completedAt);
      console.log('  - New XP:', newXP);
      
      const userDoc = doc(db, 'users', userId);
      
      // Get current user data to safely update missions array
      const currentDoc = await getDoc(userDoc);
      if (currentDoc.exists()) {
        const currentData = currentDoc.data();
        const currentMissions = currentData.completedMissions || [];
        
        // Check if mission already exists (avoid duplicates)
        const missionExists = currentMissions.some((m: any) => m.id === completedMission.id && 
          new Date(m.completedAt?.toDate?.() || m.completedAt).toDateString() === new Date(completedMission.completedAt!).toDateString());
        
        if (!missionExists) {
          const updatedMissions = [...currentMissions, completedMission];
          
          await updateDoc(userDoc, {
            xp: newXP,
            dailyXP: updatedDailyXP,
            completedMissions: updatedMissions,
          });
          console.log('✅ Firebase: Successfully completed mission and saved to Firestore');
          console.log('  - Updated missions count:', updatedMissions.length);
        } else {
          console.log('⚠️ Mission already exists, skipping duplicate save');
        }
      } else {
        console.log('❌ User document not found');
        throw new Error('User document not found');
      }
    } catch (firebaseError) {
      console.error('Firebase error completing mission, trying demo fallback:', firebaseError);
      
      // Fallback to demo user update
      const demoUser = demoGetCurrentUser();
      if (demoUser && demoUser.id === userId) {
        const updatedCompletedMissions = [...(demoUser.completedMissions || []), completedMission];
        await demoUpdateUser(userId, {
          xp: newXP,
          dailyXP: updatedDailyXP,
          completedMissions: updatedCompletedMissions,
        });
        console.log('✓ Demo: Successfully completed mission as fallback');
      } else {
        throw firebaseError; // Re-throw if no demo fallback available
      }
    }

    // Check for new badges
    const newBadges = await checkAndAwardBadges(userId, updatedUser);

    return {
      success: true,
      xpAwarded: mission.xpReward,
      newBadges,
    };
  } catch (error) {
    console.error('Error completing mission (all methods failed):', error);
    return {
      success: false,
      xpAwarded: 0,
      newBadges: [],
    };
  }
};

export const handleStreakUpdate = async (
  userId: string,
  currentStreak: number,
  totalDays: number
): Promise<{ newBadges: Badge[] }> => {
  try {
    // Create a temporary user object for badge checking
    const tempUser: Partial<User> = {
      id: userId,
      streak: currentStreak,
      totalDays: totalDays,
      badges: [], // Will be fetched separately if needed
      xp: 0, // Will be fetched separately if needed
      completedMissions: [], // Will be fetched separately if needed
    };

    // Check for streak-related badges
    const newBadges = await checkAndAwardBadges(userId, tempUser as User);

    return { newBadges };
  } catch (error) {
    console.error('Error handling streak update:', error);
    return { newBadges: [] };
  }
};

export const calculateXPForCheckIn = (
  streak: number,
  isConsecutive: boolean
): number => {
  let baseXP = 10;
  
  // Bonus XP for consecutive days
  if (isConsecutive) {
    if (streak >= 30) baseXP += 15; // Month milestone
    else if (streak >= 14) baseXP += 10; // Two weeks
    else if (streak >= 7) baseXP += 5; // One week
  }

  // Cap maximum XP per check-in
  return Math.min(baseXP, 30);
};

export const getLevelProgress = (xp: number) => {
  const levelInfo = calculateLevel(xp);
  return {
    currentLevel: levelInfo.level,
    currentLevelTitle: levelInfo.title,
    progress: levelInfo.progress,
    nextLevelXP: levelInfo.nextLevelXP,
    currentLevelXP: xp,
  };
};

export const generateDailyMissions = (
  user: User,
  isPremium: boolean = false,
  language: 'en' | 'id' = 'id',
  isAdUnlocked: boolean = false
): Mission[] => {
  const t = getTranslation(language);
  const missions: Mission[] = [];
  
  // Mission 1: Daily check-in (always unlocked)
  missions.push({
    id: 'daily-checkin',
    title: t.missions.checkInDaily,
    description: t.missions.checkInDailyDesc,
    xpReward: 10,
    isCompleted: false,
    completedAt: null,
    isAIGenerated: false,
    difficulty: 'easy'
  });
  
  // Mission 2: Always show first random mission (before and after ad)
  const firstRandomMission = getTranslatedMissionsWithSeed(language, 1, `${user.id}-daily-${new Date().toDateString()}`);
  if (firstRandomMission.length > 0) {
    missions.push({
      ...firstRandomMission[0],
      id: `random-mission-1-${new Date().toDateString()}`,
    });
  }

  if (isAdUnlocked) {
    // After ad: Add 2 more random missions (missions 3 & 4)
    const additionalMissions = getTranslatedMissionsWithSeed(language, 2, `${user.id}-unlocked-${new Date().toDateString()}`);
    additionalMissions.forEach((mission, index) => {
      missions.push({
        ...mission,
        id: `random-mission-${index + 2}-${new Date().toDateString()}`,
      });
    });
  } else {
    // Before ad: Show "watch ad" button as mission 3
    missions.push({
      id: 'watch-ad-for-missions',
      title: language === 'en' ? 'Watch Ad for More Missions' : 'Tonton Iklan untuk Misi Lebih',
      description: language === 'en' ? 'Get 2 exciting & rewarding challenges!' : 'Dapatkan 2 misi seru & menantang!',
      xpReward: 0,
      isCompleted: false,
      completedAt: null,
      isAIGenerated: false,
      difficulty: 'easy',
      isLocked: true,
      unlockMethod: 'ad'
    });
  }
  
  return missions;
};

export const getMotivationalMessage = (user: User): string => {
  const messages = [
    `Hebat ${user.displayName}! Kamu sudah ${user.totalDays} hari bebas rokok. Terus pertahankan!`,
    `Streak ${user.streak} hari adalah pencapaian luar biasa. Kamu membuktikan bahwa kamu bisa!`,
    `Setiap hari tanpa rokok adalah investasi untuk kesehatan masa depanmu.`,
    `Level ${calculateLevel(user.xp).level} ${calculateLevel(user.xp).title}! Kamu semakin kuat dan sehat.`,
    `${user.badges.length} badge telah kamu raih. Pencapaian yang membanggakan!`,
    `Kamu sudah menghemat banyak uang dan kesehatan. Terus maju!`,
    `Pernapasanmu semakin sehat, energimu bertambah. Nikmati perubahannya!`,
    `Orang-orang di sekitarmu bangga dengan perjuanganmu. Kamu inspirasi!`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

export const checkLevelUp = (oldXP: number, newXP: number): boolean => {
  const oldLevel = calculateLevel(oldXP).level;
  const newLevel = calculateLevel(newXP).level;
  return newLevel > oldLevel;
};

export const calculateHealthScore = (user: User): number => {
  // Calculate a health score based on various factors
  const streakScore = Math.min(user.streak * 2, 100); // Max 100 points for streak
  const totalDaysScore = Math.min(user.totalDays * 1, 200); // Max 200 points for total days
  const missionsScore = Math.min((user.completedMissions?.length || 0) * 5, 100); // Max 100 points for missions
  
  return Math.round((streakScore + totalDaysScore + missionsScore) / 4);
};

export const getNextMilestone = (user: User): { type: string; target: number; current: number; description: string } | null => {
  const milestones = [
    { type: 'streak', target: 7, description: 'Seminggu berturut-turut' },
    { type: 'streak', target: 30, description: 'Sebulan berturut-turut' },
    { type: 'streak', target: 100, description: '100 hari berturut-turut' },
    { type: 'totalDays', target: 30, description: 'Total 30 hari' },
    { type: 'totalDays', target: 90, description: 'Total 90 hari' },
    { type: 'totalDays', target: 365, description: 'Setahun bebas rokok' },
    { type: 'xp', target: 500, description: '500 XP' },
    { type: 'xp', target: 1000, description: '1000 XP' },
    { type: 'xp', target: 2500, description: '2500 XP' },
  ];

  for (const milestone of milestones) {
    let current = 0;
    switch (milestone.type) {
      case 'streak':
        current = user.streak;
        break;
      case 'totalDays':
        current = user.totalDays;
        break;
      case 'xp':
        current = user.xp;
        break;
    }

    if (current < milestone.target) {
      return {
        type: milestone.type,
        target: milestone.target,
        current,
        description: milestone.description,
      };
    }
  }

  return null;
};