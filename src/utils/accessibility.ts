import { AccessibilityInfo, Alert } from 'react-native';

export const checkAccessibilitySupport = async (): Promise<boolean> => {
  try {
    const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
    return isScreenReaderEnabled;
  } catch (error) {
    console.error('Error checking accessibility support:', error);
    return false;
  }
};

export const announceToScreenReader = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const setAccessibilityFocus = (reactTag: number): void => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};

// Accessibility labels for common elements
export const AccessibilityLabels = {
  // Navigation
  TAB_HOME: 'Beranda, tab satu dari empat',
  TAB_PROGRESS: 'Progress, tab dua dari empat',
  TAB_LEADERBOARD: 'Leaderboard, tab tiga dari empat',
  TAB_PROFILE: 'Profil, tab empat dari empat',
  
  // Dashboard
  CHECK_IN_BUTTON: 'Tombol check-in harian. Ketuk untuk melakukan check-in hari ini',
  LEVEL_PROGRESS: 'Progress level dan XP. Menampilkan level saat ini dan kemajuan menuju level berikutnya',
  STREAK_STAT: 'Statistik streak. Menampilkan jumlah hari berturut-turut tanpa merokok',
  TOTAL_DAYS_STAT: 'Total hari berhenti merokok',
  MONEY_SAVED_STAT: 'Total uang yang berhasil dihemat',
  
  // Missions
  MISSION_ITEM: 'Item misi harian. Swipe untuk menandai sebagai selesai',
  DAILY_MISSIONS_CARD: 'Kartu misi harian. Berisi daftar aktivitas untuk hari ini',
  
  // Profile
  BADGE_ITEM: 'Badge pencapaian',
  SETTINGS_ITEM: 'Item pengaturan. Ketuk untuk membuka',
  LOGOUT_BUTTON: 'Tombol keluar. Ketuk untuk logout dari akun',
  
  // Progress
  HEALTH_MILESTONE: 'Milestone kesehatan. Menampilkan manfaat kesehatan yang telah dicapai',
  SAVINGS_BREAKDOWN: 'Rincian penghematan uang dari berhenti merokok',
  
  // Leaderboard
  LEADERBOARD_ITEM: 'Item leaderboard pengguna dengan peringkat dan statistik',
  USER_RANK: 'Peringkat Anda di leaderboard',
  
  // Forms
  EMAIL_INPUT: 'Input email. Masukkan alamat email Anda',
  PASSWORD_INPUT: 'Input password. Masukkan kata sandi Anda',
  NAME_INPUT: 'Input nama. Masukkan nama lengkap Anda',
  
  // Buttons
  LOGIN_BUTTON: 'Tombol masuk. Ketuk untuk login ke akun',
  SIGNUP_BUTTON: 'Tombol daftar. Ketuk untuk membuat akun baru',
  CONTINUE_BUTTON: 'Tombol lanjut. Ketuk untuk melanjutkan ke langkah berikutnya',
  BACK_BUTTON: 'Tombol kembali. Ketuk untuk kembali ke langkah sebelumnya',
};

// Accessibility hints for complex interactions
export const AccessibilityHints = {
  CHECK_IN_BUTTON: 'Akan menambah streak dan XP Anda',
  MISSION_COMPLETE: 'Swipe ke kanan untuk menandai misi sebagai selesai',
  BADGE_LOCKED: 'Badge ini belum terbuka. Lihat persyaratan untuk membukanya',
  PREMIUM_FEATURE: 'Fitur ini memerlukan langganan premium',
  TAB_NAVIGATION: 'Gunakan tab untuk berpindah antar halaman utama',
  PROGRESS_CHART: 'Gunakan gesture untuk melihat detail data',
};

// Screen reader announcements for important events
export const announceCheckInSuccess = (streak: number, xp: number): void => {
  const message = `Check-in berhasil! Streak Anda sekarang ${streak} hari. Anda mendapat ${xp} XP.`;
  announceToScreenReader(message);
};

export const announceLevelUp = (newLevel: number, title: string): void => {
  const message = `Selamat! Anda naik ke Level ${newLevel}: ${title}`;
  announceToScreenReader(message);
};

export const announceBadgeEarned = (badgeName: string): void => {
  const message = `Selamat! Anda mendapat badge baru: ${badgeName}`;
  announceToScreenReader(message);
};

export const announceMissionComplete = (missionTitle: string, xp: number): void => {
  const message = `Misi "${missionTitle}" selesai! Anda mendapat ${xp} XP.`;
  announceToScreenReader(message);
};

// Accessibility helpers for dynamic content
export const getAccessibleStatValue = (label: string, value: string | number): string => {
  return `${label}: ${value}`;
};

export const getAccessibleProgressValue = (current: number, total: number): string => {
  const percentage = Math.round((current / total) * 100);
  return `${current} dari ${total}, ${percentage} persen selesai`;
};

export const getAccessibleTimeRemaining = (days: number): string => {
  if (days === 1) return '1 hari tersisa';
  if (days === 0) return 'Berakhir hari ini';
  return `${days} hari tersisa`;
};

// Color contrast helpers for accessibility
export const ensureAccessibleColors = () => {
  // This would contain logic to check color contrast ratios
  // and ensure they meet WCAG guidelines (minimum 4.5:1 for normal text)
  return {
    textOnBackground: '#212529', // High contrast on light background
    textOnPrimary: '#FFFFFF', // White text on colored background
    focusIndicator: '#0066CC', // High contrast focus indicator
    errorText: '#D32F2F', // Accessible red for errors
  };
};

// Voice control helpers
export const setupVoiceCommands = () => {
  // In a real app, this would integrate with platform voice recognition
  const commands = {
    'check in': 'Perform daily check-in',
    'show progress': 'Navigate to progress screen',
    'show profile': 'Navigate to profile screen',
    'complete mission': 'Mark current mission as complete',
  };
  
  return commands;
};

// Gesture accessibility
export const AccessibleGestures = {
  DOUBLE_TAP: 'Ketuk dua kali untuk mengaktifkan',
  LONG_PRESS: 'Tekan lama untuk opsi tambahan',
  SWIPE_RIGHT: 'Geser ke kanan untuk menandai selesai',
  SWIPE_LEFT: 'Geser ke kiri untuk membatalkan',
  THREE_FINGER_SCROLL: 'Gunakan tiga jari untuk scroll cepat',
};

// Font scaling support
export const getScaledFontSize = (baseSize: number): number => {
  // This would integrate with the system's text size settings
  // For now, return the base size
  return baseSize;
};

// Reduced motion support
export const shouldReduceMotion = async (): Promise<boolean> => {
  try {
    const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
    return isReduceMotionEnabled;
  } catch (error) {
    console.error('Error checking reduce motion setting:', error);
    return false;
  }
};

// High contrast support
export const getHighContrastColors = () => {
  return {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#0066CC',
    text: '#000000',
    border: '#333333',
    error: '#CC0000',
    success: '#006600',
  };
};

// Screen reader navigation
export const createAccessibilityNavigationMap = () => {
  return {
    main_content: 'Konten utama',
    navigation: 'Navigasi utama',
    header: 'Header halaman',
    footer: 'Footer halaman',
    sidebar: 'Panel samping',
    modal: 'Dialog modal',
    alert: 'Peringatan penting',
  };
};