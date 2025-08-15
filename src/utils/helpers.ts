import { HealthMilestone, User } from '../types';
import { HEALTH_MILESTONES, XP_LEVELS, CONTEXTUAL_QUOTES } from './constants';
import { getTranslation, Language } from './translations';

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

export const calculateDaysSinceQuit = (quitDate: Date | null | undefined): number => {
  if (!quitDate || isNaN(new Date(quitDate).getTime())) {
    return 0;
  }
  const now = new Date();
  const quitDateObj = new Date(quitDate);
  
  // Set both dates to start of day for accurate day counting
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const quitDateStart = new Date(quitDateObj.getFullYear(), quitDateObj.getMonth(), quitDateObj.getDate());
  
  const diffTime = nowDate.getTime() - quitDateStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Return the number of complete days since quitting
  return Math.max(0, diffDays);
};

export const calculateMoneySaved = (totalDays: number, cigarettesPerDay: number, cigarettePrice: number): number => {
  if (totalDays === 0 || cigarettesPerDay === 0 || cigarettePrice === 0) return 0;
  
  const cigarettesPerPack = 20; // Assuming 20 cigarettes per pack
  const packsPerDay = cigarettesPerDay / cigarettesPerPack;
  const dailySavings = packsPerDay * cigarettePrice;
  
  return Math.floor(dailySavings * totalDays);
};

export const isOnboardingComplete = (user: any): boolean => {
  return user.onboardingCompleted === true && 
         user.cigarettesPerDay > 0 && 
         user.cigarettePrice > 0;
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

export const hasCheckedInToday = (lastCheckIn: Date | null): boolean => {
  if (!lastCheckIn) return false;
  
  const today = new Date();
  const lastCheckInDate = new Date(lastCheckIn);
  
  return today.toDateString() === lastCheckInDate.toDateString();
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

export const getRandomMotivation = (language: Language = 'id'): string => {
  const t = getTranslation(language);
  const motivations = t.quotes.generalDaily;
  
  return motivations[Math.floor(Math.random() * motivations.length)];
};

// Smart contextual motivation for premium users
export const getContextualMotivation = (user: User, language: Language = 'id'): string => {
  const t = getTranslation(language);
  
  // Determine user's journey context
  const totalDays = user.totalDays || 0;
  const streak = user.streak || 0;
  const streakInfo = calculateStreak(user.lastCheckIn);
  
  // Check if streak was broken (user needs encouragement to restart)
  if (streakInfo.streakReset && totalDays > 0) {
    const quotes = t.quotes.streakBroken;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  // Categorize user by their journey stage
  if (totalDays <= 7) {
    // New user (first week)
    const quotes = t.quotes.newUser;
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else if (totalDays <= 28) {
    // Early journey (1-4 weeks)
    const quotes = t.quotes.earlyJourney;
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else if (totalDays <= 90) {
    // Milestone achiever (1-3 months)
    const quotes = t.quotes.milestoneAchiever;
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else if (totalDays > 90) {
    // Veteran (3+ months)
    const quotes = t.quotes.veteran;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  // Fallback to general daily motivation
  const quotes = t.quotes.generalDaily;
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Check if user needs new daily motivation (premium feature with caching)
export const needsNewDailyMotivation = (user: User): boolean => {
  if (!user.isPremium) return false;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // If no motivation date recorded, or it's a new day, user needs new motivation
  return !user.lastMotivationDate || user.lastMotivationDate !== today;
};

// Get or generate daily motivation for premium users
export const getDailyMotivation = (user: User, language: Language = 'id'): string => {
  // Personal motivator is premium-only feature
  if (!user.isPremium) {
    return language === 'en' 
      ? 'Upgrade to Premium for personalized AI motivation'
      : 'Upgrade ke Premium untuk motivasi AI yang personal';
  }
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // If we have today's cached motivation, return it
  if (user.lastMotivationDate === today && user.dailyMotivation) {
    return user.dailyMotivation;
  }
  
  // Generate new contextual motivation for today
  return getContextualMotivation(user, language);
};

// Detect if user has reached a major milestone worthy of AI insight
export const detectMajorMilestone = (user: User): { isMilestone: boolean; milestoneType: string; daysAchieved: number } => {
  const totalDays = user.totalDays || 0;
  const majorMilestones = [30, 60, 90, 180, 365, 500, 730, 1000]; // Major milestones
  
  // Check if user just hit a major milestone (within the last day)
  const previousDay = totalDays - 1;
  
  for (const milestone of majorMilestones) {
    if (totalDays >= milestone && previousDay < milestone) {
      return {
        isMilestone: true,
        milestoneType: `${milestone}_days`,
        daysAchieved: milestone
      };
    }
  }
  
  return { isMilestone: false, milestoneType: '', daysAchieved: 0 };
};

// Detect if user needs streak recovery support (after breaking significant streak)
export const detectStreakRecovery = (user: User): { needsRecovery: boolean; brokenStreakLength: number; daysSinceBroken: number } => {
  const currentStreak = user.streak || 0;
  const longestStreak = user.longestStreak || 0;
  const totalDays = user.totalDays || 0;
  
  // If current streak is 0-3 days and they had a streak ≥7 days before
  if (currentStreak <= 3 && longestStreak >= 7) {
    // Estimate days since streak was broken
    // This is approximate since we don't track exact break dates
    const estimatedDaysSinceBroken = Math.min(currentStreak, 3);
    
    return {
      needsRecovery: true,
      brokenStreakLength: longestStreak,
      daysSinceBroken: estimatedDaysSinceBroken
    };
  }
  
  return { needsRecovery: false, brokenStreakLength: 0, daysSinceBroken: 0 };
};

// Check if user is eligible for AI insight based on monthly budget
export const canUseAIThisMonth = (user: User): { canUse: boolean; callsUsed: number; callsRemaining: number } => {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
  const maxMonthlyAICalls = 2;
  
  // Reset counter if it's a new month
  const resetMonth = user.aiCallsResetMonth || '';
  const callsUsed = (resetMonth === currentMonth) ? (user.monthlyAICallsUsed || 0) : 0;
  
  return {
    canUse: callsUsed < maxMonthlyAICalls,
    callsUsed: callsUsed,
    callsRemaining: maxMonthlyAICalls - callsUsed
  };
};

// Determine if AI insight should be triggered and what type
export const shouldTriggerAIInsight = (user: User): { 
  shouldTrigger: boolean; 
  triggerType: 'milestone' | 'streak_recovery' | 'daily_motivation' | 'none';
  triggerData: any;
  priority: number; // 1 = highest, 2 = medium, 3 = daily
} => {
  if (!user.isPremium) {
    return { shouldTrigger: false, triggerType: 'none', triggerData: null, priority: 0 };
  }
  
  const aiAvailability = canUseAIThisMonth(user);
  if (!aiAvailability.canUse) {
    return { shouldTrigger: false, triggerType: 'none', triggerData: null, priority: 0 };
  }
  
  // Priority 1: Streak recovery (more emotionally critical)
  const streakRecovery = detectStreakRecovery(user);
  if (streakRecovery.needsRecovery) {
    return {
      shouldTrigger: true,
      triggerType: 'streak_recovery',
      triggerData: streakRecovery,
      priority: 1
    };
  }
  
  // Priority 2: Major milestones
  const milestone = detectMajorMilestone(user);
  if (milestone.isMilestone) {
    return {
      shouldTrigger: true,
      triggerType: 'milestone',
      triggerData: milestone,
      priority: 2
    };
  }
  
  // Priority 3: Daily AI motivation for all premium users (if no AI insight today)
  const today = new Date().toISOString().split('T')[0];
  if (!user.lastAICallDate || user.lastAICallDate !== today) {
    return {
      shouldTrigger: true,
      triggerType: 'daily_motivation',
      triggerData: {
        streak: user.streak || 0,
        totalDays: user.totalDays || 0,
        level: user.level || 1,
        badges: user.badges || [],
        xp: user.xp || 0
      },
      priority: 3
    };
  }
  
  return { shouldTrigger: false, triggerType: 'none', triggerData: null, priority: 0 };
};

// Update user's monthly AI call counter
export const updateAICallCounter = (user: User): Partial<User> => {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Reset counter if it's a new month
  const resetMonth = user.aiCallsResetMonth || '';
  const isNewMonth = resetMonth !== currentMonth;
  
  const newCallsUsed = isNewMonth ? 1 : (user.monthlyAICallsUsed || 0) + 1;
  
  return {
    monthlyAICallsUsed: newCallsUsed,
    lastAICallDate: today,
    aiCallsResetMonth: currentMonth
  };
};

// Check if we should show AI insight vs contextual quote
export const getMotivationContent = (user: User, language: Language = 'id'): { 
  content: string; 
  isAIGenerated: boolean; 
  shouldUseAI: boolean;
  triggerType?: string;
} => {
  if (!user.isPremium) {
    return {
      content: language === 'en' 
        ? 'Upgrade to Premium for personalized AI motivation'
        : 'Upgrade ke Premium untuk motivasi AI yang personal',
      isAIGenerated: false,
      shouldUseAI: false
    };
  }
  
  // Check if user has recent AI insight from today
  const today = new Date().toISOString().split('T')[0];
  if (user.lastAICallDate === today && user.lastAIInsight) {
    return {
      content: user.lastAIInsight,
      isAIGenerated: true,
      shouldUseAI: false // Don't call AI again, use cached
    };
  }
  
  // Check if AI should be triggered
  const aiTrigger = shouldTriggerAIInsight(user);
  
  if (aiTrigger.shouldTrigger) {
    return {
      content: '', // Will be populated by AI call
      isAIGenerated: true,
      shouldUseAI: true,
      triggerType: aiTrigger.triggerType
    };
  }
  
  // Fall back to contextual quotes
  return {
    content: getDailyMotivation(user, language),
    isAIGenerated: false,
    shouldUseAI: false
  };
};

export const generatePersonalizedGreeting = (userData: {
  smokingYears: number;
  cigarettesPerDay: number;
  cigarettePrice: number;
  quitReasons: string[];
  previousAttempts: number;
}): {
  headline: string;
  message: string;
  financialHighlight: string;
  healthHighlight: string;
  motivationalNote: string;
} => {
  const { smokingYears, cigarettesPerDay, cigarettePrice, quitReasons, previousAttempts } = userData;
  
  // Calculate daily and yearly savings
  const cigarettesPerPack = 20;
  const packsPerDay = cigarettesPerDay / cigarettesPerPack;
  const dailySavings = Math.floor(packsPerDay * cigarettePrice);
  const yearlySavings = Math.floor(dailySavings * 365);
  
  // Determine user profile
  const isHeavySmoker = cigarettesPerDay >= 20;
  const isLongTermSmoker = smokingYears >= 10;
  const hasMultipleAttempts = previousAttempts > 0;
  const primaryReason = quitReasons[0] || 'health';
  
  // Generate personalized content
  let headline = "";
  let message = "";
  let financialHighlight = "";
  let healthHighlight = "";
  let motivationalNote = "";
  
  // Create headline based on profile
  if (isHeavySmoker && isLongTermSmoker) {
    headline = `${cigarettesPerDay} batang/hari selama ${smokingYears} tahun? Tubuh Anda siap untuk pemulihan yang menakjubkan!`;
  } else if (isHeavySmoker) {
    headline = `${cigarettesPerDay} batang per hari adalah masa lalu! Saatnya hidup lebih sehat.`;
  } else if (isLongTermSmoker) {
    headline = `Setelah ${smokingYears} tahun, Anda akhirnya memilih jalan yang tepat!`;
  } else {
    headline = `Keputusan terbaik telah Anda buat! Mari mulai perjalanan sehat.`;
  }
  
  // Create main message based on primary reason
  switch (primaryReason) {
    case 'health':
      if (isLongTermSmoker) {
        message = `Setelah ${smokingYears} tahun merokok, tubuh Anda akan mulai penyembuhan yang luar biasa. Dalam 20 menit pertama, detak jantung dan tekanan darah akan mulai normal!`;
      } else {
        message = `Pilihan untuk kesehatan adalah investasi terbaik! Tubuh Anda akan segera merasakan perubahan positif yang mengagumkan.`;
      }
      break;
    case 'family':
      message = `Keputusan berhenti merokok untuk keluarga menunjukkan kasih sayang yang besar. Anda sedang memberikan hadiah kesehatan untuk orang-orang tercinta.`;
      break;
    case 'money':
      message = `Keputusan finansial yang cerdas! Uang yang biasa dihabiskan untuk rokok kini bisa digunakan untuk hal-hal yang lebih bermakna.`;
      break;
    case 'pregnancy':
      message = `Pilihan terbaik untuk calon buah hati! Anda sedang memberikan awal kehidupan yang sehat untuk si kecil.`;
      break;
    default:
      message = `Perjalanan menuju hidup sehat dimulai dari keputusan berani seperti yang Anda buat hari ini.`;
  }
  
  // Financial highlight
  if (dailySavings > 0) {
    if (yearlySavings >= 5000000) {
      financialHighlight = `Menghemat Rp ${formatCurrency(dailySavings)}/hari = Rp ${formatCurrency(yearlySavings)}/tahun - cukup untuk liburan keluarga!`;
    } else if (yearlySavings >= 2000000) {
      financialHighlight = `Rp ${formatCurrency(yearlySavings)}/tahun yang Anda hemat bisa untuk dana pendidikan atau investasi!`;
    } else {
      financialHighlight = `Rp ${formatCurrency(dailySavings)}/hari x 365 hari = Rp ${formatCurrency(yearlySavings)} per tahun!`;
    }
  } else {
    financialHighlight = "Penghematan finansial akan terasa dalam jangka panjang!";
  }
  
  // Health highlight based on smoking intensity
  if (isHeavySmoker) {
    healthHighlight = "20 menit: Detak jantung normal • 12 jam: Karbon monoksida hilang • 2 minggu: Sirkulasi membaik";
  } else {
    healthHighlight = "20 menit: Tekanan darah turun • 8 jam: Oksigen naik • 24 jam: Risiko serangan jantung turun";
  }
  
  // Motivational note based on previous attempts
  if (previousAttempts >= 3) {
    motivationalNote = `Percobaan ke-${previousAttempts + 1} ini berbeda! Pengalaman sebelumnya adalah pembelajaran berharga. Kali ini Anda punya ByeSmoke AI!`;
  } else if (previousAttempts > 0) {
    motivationalNote = `Percobaan kedua sering kali lebih berhasil! Anda sudah tahu apa yang harus dihindari. Mari buat kali ini berbeda!`;
  } else {
    motivationalNote = `Langkah pertama adalah yang tersulit, dan Anda sudah melakukannya! Percayalah pada kekuatan diri Anda.`;
  }
  
  return {
    headline,
    message,
    financialHighlight,
    healthHighlight,
    motivationalNote
  };
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

export const addDailyXP = (dailyXP: { [date: string]: number } | undefined, xpAmount: number): { [date: string]: number } => {
  // Use local timezone to match heatmap calculation
  const today = new Date();
  const dateKey = today.getFullYear() + '-' + 
                  String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(today.getDate()).padStart(2, '0');
  const currentDailyXP = dailyXP || {};
  
  return {
    ...currentDailyXP,
    [dateKey]: (currentDailyXP[dateKey] || 0) + xpAmount
  };
};

export const getDailyXP = (dailyXP: { [date: string]: number } | undefined, date: Date): number => {
  // Use local timezone to match addDailyXP format
  const dateKey = date.getFullYear() + '-' + 
                  String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(date.getDate()).padStart(2, '0');
  return dailyXP?.[dateKey] || 0;
};

// Smart Streak Notifications - Streak Risk Detection
export interface StreakRiskInfo {
  isAtRisk: boolean;
  hoursUntilExpiry: number;
  currentStreak: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  shouldNotify: boolean;
  nextNotificationTime?: Date;
}

export const detectStreakRisk = (user: User): StreakRiskInfo => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentStreak = user.streak || 0;
  
  // If user hasn't checked in today and it's past 8 PM
  const hasCheckedInToday = !canCheckInToday(user.lastCheckIn);
  const hoursUntilMidnight = 24 - currentHour;
  
  if (hasCheckedInToday || currentStreak === 0) {
    return {
      isAtRisk: false,
      hoursUntilExpiry: hoursUntilMidnight,
      currentStreak,
      riskLevel: 'low',
      shouldNotify: false
    };
  }
  
  // Determine risk level based on time
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  let shouldNotify = false;
  let nextNotificationTime: Date | undefined;
  
  if (currentHour >= 20 && currentHour < 21) { // 8 PM - 9 PM
    riskLevel = 'medium';
    shouldNotify = true;
    nextNotificationTime = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour later
  } else if (currentHour >= 21 && currentHour < 22) { // 9 PM - 10 PM
    riskLevel = 'high';
    shouldNotify = true;
    nextNotificationTime = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour later
  } else if (currentHour >= 22) { // 10 PM and later
    riskLevel = 'critical';
    shouldNotify = true;
    nextNotificationTime = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes later
  } else {
    riskLevel = 'low';
  }
  
  return {
    isAtRisk: true,
    hoursUntilExpiry: hoursUntilMidnight,
    currentStreak,
    riskLevel,
    shouldNotify,
    nextNotificationTime
  };
};

export const getStreakNotificationContent = (streakRisk: StreakRiskInfo, language: 'en' | 'id' = 'id'): { title: string; body: string } => {
  const streak = streakRisk.currentStreak;
  const hours = streakRisk.hoursUntilExpiry;
  
  const isEnglish = language === 'en';
  
  switch (streakRisk.riskLevel) {
    case 'medium':
      return {
        title: isEnglish ? "🔥 Don't Lose Your Streak!" : "🔥 Jangan Sampai Streak Hilang!",
        body: isEnglish 
          ? `Your ${streak}-day streak is waiting for you! Quick check-in keeps the momentum going 💪`
          : `Streak ${streak} hari Anda sedang menunggu! Check-in cepat untuk menjaga momentum 💪`
      };
    
    case 'high':
      return {
        title: isEnglish ? "🚨 Streak Alert!" : "🚨 Peringatan Streak!",
        body: isEnglish
          ? `Only ${hours} hours left to maintain your ${streak}-day streak! Don't let progress slip away 🏃‍♂️`
          : `Hanya ${hours} jam tersisa untuk mempertahankan streak ${streak} hari! Jangan biarkan progress hilang 🏃‍♂️`
      };
    
    case 'critical':
      return {
        title: isEnglish ? "⏰ URGENT: Save Your Streak!" : "⏰ MENDESAK: Selamatkan Streak Anda!",
        body: isEnglish
          ? `Your ${streak}-day streak expires in ${hours} hours! Quick tap to save your amazing progress 🆘`
          : `Streak ${streak} hari berakhir dalam ${hours} jam! Tap cepat untuk menyelamatkan progress luar biasa Anda 🆘`
      };
    
    default:
      return {
        title: isEnglish ? "🔥 Keep Your Streak Alive" : "🔥 Jaga Streak Tetap Hidup",
        body: isEnglish
          ? `Your ${streak}-day journey continues! Check in to maintain your progress 🌟`
          : `Perjalanan ${streak} hari berlanjut! Check-in untuk mempertahankan progress Anda 🌟`
      };
  }
};

export const shouldScheduleStreakReminder = (user: User): boolean => {
  const streakRisk = detectStreakRisk(user);
  const hasNotificationsEnabled = user.settings?.notifications ?? true;
  const hasStreakNotificationsEnabled = user.settings?.streakNotifications ?? true; // Default to true
  
  return hasNotificationsEnabled && hasStreakNotificationsEnabled && streakRisk.shouldNotify && streakRisk.currentStreak > 0;
};

export const getOptimalReminderTimes = (user: User): string[] => {
  // Analyze user's typical check-in pattern
  const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
  const typicalHour = lastCheckIn ? lastCheckIn.getHours() : 9;
  
  // Schedule reminders 2 hours before typical check-in time, then escalating
  const reminderTimes: string[] = [];
  
  // First reminder: 2 hours before typical time or 8 PM, whichever is earlier
  const firstReminderHour = Math.min(Math.max(typicalHour - 2, 20), 22);
  reminderTimes.push(`${firstReminderHour.toString().padStart(2, '0')}:00`);
  
  // Additional escalating reminders
  if (firstReminderHour < 21) {
    reminderTimes.push('21:00'); // 9 PM
  }
  if (firstReminderHour < 22) {
    reminderTimes.push('22:00'); // 10 PM
  }
  
  return reminderTimes;
};