export const COLORS = {
  // Primary colors (calming blues and greens)
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  primaryLight: '#6BA3E8',
  
  // Secondary colors
  secondary: '#27AE60',
  secondaryDark: '#1E8449',
  secondaryLight: '#45C579',
  
  // Accent colors
  accent: '#F39C12',
  accentDark: '#E67E22',
  accentLight: '#F7B733',
  
  // Status colors
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Neutral colors
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  gray: '#6C757D',
  darkGray: '#495057',
  black: '#212529',
  
  // Background colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  textLight: '#FFFFFF',
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
};

export const SIZES = {
  // Typography Scale (inspired by modern health apps)
  // Headings
  h1: 32,    // Main titles (splash, onboarding)
  h2: 28,    // Screen titles
  h3: 24,    // Card titles, section headers
  h4: 20,    // Subsection headers
  h5: 18,    // Important text
  
  // Body text
  bodyLarge: 17,   // Primary body text
  bodyMedium: 15,  // Secondary body text
  bodySmall: 13,   // Captions, metadata
  
  // Special sizes
  display: 48,     // Large display text (splash)
  caption: 11,     // Small captions
  button: 16,      // Button text
  
  // Spacing Scale (8pt grid system)
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 32,
  spacingXxl: 40,
  spacingXxxl: 48,
  
  // Legacy spacing (for backward compatibility)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  
  // Component sizes
  buttonHeight: 52,    // Increased for better touch targets
  inputHeight: 52,     // Increased for better touch targets
  cardPadding: 20,     // Increased for better breathing room
  screenPadding: 24,   // Increased for better margins
  
  // Border radius
  borderRadius: 12,    // More modern rounded corners
  borderRadiusLg: 16,
  borderRadiusXl: 20,
  
  // Icon sizes
  iconSm: 18,         // Slightly larger for better visibility
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
};

export const FONTS = {
  // Font families (using system fonts for better performance)
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
  
  // Font weights (for iOS/Android compatibility)
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // Line heights for better readability
  lineHeights: {
    tight: 1.2,      // For headings
    normal: 1.4,     // For body text
    relaxed: 1.6,    // For long text
    loose: 1.8,      // For captions
  },
  
  // Typography styles (inspired by modern health apps)
  styles: {
    display: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 56,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 34,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 30,
      letterSpacing: -0.1,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    caption: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
  },
};

export const BADGES = [
  {
    id: 'first-day',
    name: 'Langkah Pertama',
    description: 'Melakukan check-in pertama kali',
    icon: 'play-circle',
    color: '#2ECC71',
    requirement: 'Check-in pertama'
  },
  {
    id: 'week-warrior',
    name: 'Pejuang Seminggu',
    description: 'Bertahan selama 7 hari',
    icon: 'calendar-week',
    color: '#3498DB',
    requirement: '7 hari berturut-turut'
  },
  {
    id: 'month-master',
    name: 'Master Sebulan',
    description: 'Bertahan selama 30 hari',
    icon: 'calendar-month',
    color: '#9B59B6',
    requirement: '30 hari berturut-turut'
  },
  {
    id: 'streak-master',
    name: 'Master Konsistensi',
    description: 'Mencapai streak 100 hari',
    icon: 'fire',
    color: '#E67E22',
    requirement: '100 hari berturut-turut'
  },
  {
    id: 'xp-collector',
    name: 'Kolektor XP',
    description: 'Mengumpulkan 1000 XP',
    icon: 'star',
    color: '#F39C12',
    requirement: '1000 XP'
  },
  {
    id: 'mission-master',
    name: 'Master Misi',
    description: 'Menyelesaikan 50 misi',
    icon: 'trophy',
    color: '#E74C3C',
    requirement: '50 misi selesai'
  }
];

export const HEALTH_MILESTONES = [
  {
    id: 'twenty-minutes',
    title: '20 Menit',
    description: 'Detak jantung dan tekanan darah mulai normal',
    timeframe: '20 menit',
    icon: 'heart',
    hours: 0.33
  },
  {
    id: 'twelve-hours',
    title: '12 Jam',
    description: 'Kadar karbon monoksida dalam darah normal',
    timeframe: '12 jam',
    icon: 'lungs',
    hours: 12
  },
  {
    id: 'two-weeks',
    title: '2 Minggu',
    description: 'Sirkulasi darah membaik, fungsi paru-paru meningkat',
    timeframe: '2 minggu',
    icon: 'activity',
    hours: 336
  },
  {
    id: 'one-month',
    title: '1 Bulan',
    description: 'Batuk dan sesak nafas berkurang',
    timeframe: '1 bulan',
    icon: 'wind',
    hours: 720
  },
  {
    id: 'one-year',
    title: '1 Tahun',
    description: 'Risiko penyakit jantung berkurang 50%',
    timeframe: '1 tahun',
    icon: 'heart',
    hours: 8760
  }
];

export const STATIC_MISSIONS = [
  {
    id: 'daily-checkin',
    title: 'Check-in Harian',
    description: 'Lakukan check-in hari ini',
    xpReward: 10,
    difficulty: 'easy' as const
  },
  {
    id: 'drink-water',
    title: 'Minum Air',
    description: 'Minum 8 gelas air hari ini',
    xpReward: 15,
    difficulty: 'easy' as const
  },
  {
    id: 'exercise',
    title: 'Olahraga Ringan',
    description: 'Lakukan olahraga ringan selama 15 menit',
    xpReward: 25,
    difficulty: 'medium' as const
  },
  {
    id: 'meditation',
    title: 'Meditasi',
    description: 'Lakukan meditasi selama 10 menit',
    xpReward: 20,
    difficulty: 'medium' as const
  },
  {
    id: 'healthy-snack',
    title: 'Cemilan Sehat',
    description: 'Konsumsi buah atau sayuran sebagai cemilan',
    xpReward: 15,
    difficulty: 'easy' as const
  }
];

export const MOTIVATIONAL_QUOTES = [
  "Setiap hari tanpa rokok adalah kemenangan kecil yang bermakna besar.",
  "Kesehatan adalah investasi terbaik untuk masa depan yang cerah.",
  "Kamu lebih kuat dari kecanduan apapun. Percayalah pada diri sendiri.",
  "Perubahan dimulai dari keputusan kecil yang konsisten.",
  "Hidup sehat adalah hadiah terbaik untuk orang-orang yang kamu cintai.",
  "Setiap nafas yang bersih adalah langkah menuju kehidupan yang lebih baik.",
  "Kekuatan sejati terletak pada kemampuan mengatasi godaan.",
  "Hari ini adalah kesempatan baru untuk menjadi versi terbaik dari diri sendiri."
];

export const XP_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Pemula' },
  { level: 2, xpRequired: 100, title: 'Pejuang' },
  { level: 3, xpRequired: 250, title: 'Juara' },
  { level: 4, xpRequired: 500, title: 'Veteran' },
  { level: 5, xpRequired: 850, title: 'Master' },
  { level: 6, xpRequired: 1300, title: 'Grandmaster' },
  { level: 7, xpRequired: 1900, title: 'Legenda' },
  { level: 8, xpRequired: 2600, title: 'Mitos' },
  { level: 9, xpRequired: 3500, title: 'Dewa' },
  { level: 10, xpRequired: 5000, title: 'Abadi' }
];

export const GEMINI_API_KEY = 'your-gemini-api-key';

