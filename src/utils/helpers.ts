import { HealthMilestone } from '../types';
import { HEALTH_MILESTONES, XP_LEVELS } from './constants';

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
  if (hasMultipleAttempts >= 3) {
    motivationalNote = `Percobaan ke-${previousAttempts + 1} ini berbeda! Pengalaman sebelumnya adalah pembelajaran berharga. Kali ini Anda punya ByeSmoke XP!`;
  } else if (hasMultipleAttempts > 0) {
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