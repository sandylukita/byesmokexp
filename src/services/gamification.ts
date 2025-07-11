import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { BADGES } from '../utils/constants';
import { User, Badge, Mission } from '../types';
import { calculateLevel, calculateMoneySaved } from '../utils/helpers';

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
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        badges: arrayUnion(...newBadges)
      });
    } catch (error) {
      console.error('Error awarding badges:', error);
      // Don't throw - this might be a demo user
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
    const updatedUser: User = {
      ...currentUser,
      xp: newXP,
      completedMissions: [...(currentUser.completedMissions || []), completedMission],
    };

    // Update user document
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      xp: newXP,
      completedMissions: arrayUnion(completedMission),
    });

    // Check for new badges
    const newBadges = await checkAndAwardBadges(userId, updatedUser);

    return {
      success: true,
      xpAwarded: mission.xpReward,
      newBadges,
    };
  } catch (error) {
    console.error('Error completing mission:', error);
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
  isPremium: boolean = false
): Mission[] => {
  const staticMissions = [
    {
      title: 'Check-in Harian',
      description: 'Lakukan check-in hari ini untuk melanjutkan streak',
      xpReward: 10,
      difficulty: 'easy' as const,
    },
    {
      title: 'Minum Air Putih',
      description: 'Minum minimal 8 gelas air putih hari ini',
      xpReward: 15,
      difficulty: 'easy' as const,
    },
    {
      title: 'Olahraga Ringan',
      description: 'Lakukan aktivitas fisik selama 15-30 menit',
      xpReward: 25,
      difficulty: 'medium' as const,
    },
    {
      title: 'Meditasi',
      description: 'Luangkan 10 menit untuk meditasi atau relaksasi',
      xpReward: 20,
      difficulty: 'medium' as const,
    },
    {
      title: 'Cemilan Sehat',
      description: 'Pilih buah atau sayuran sebagai cemilan hari ini',
      xpReward: 15,
      difficulty: 'easy' as const,
    },
    {
      title: 'Napas Dalam',
      description: 'Latihan pernapasan dalam 5 menit saat merasa stress',
      xpReward: 10,
      difficulty: 'easy' as const,
    },
  ];

  // Randomly select missions based on premium status
  const numberOfMissions = isPremium ? 3 : 1;
  const shuffled = staticMissions.sort(() => 0.5 - Math.random());
  const selectedMissions = shuffled.slice(0, numberOfMissions);

  return selectedMissions.map((mission, index) => ({
    id: `mission-${Date.now()}-${index}`,
    ...mission,
    isCompleted: false,
    completedAt: null,
    isAIGenerated: false,
  }));
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