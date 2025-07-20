export const COLORS = {
  // Primary colors (calming blues and greens)
  primary: '#F99546',
  primaryDark: '#DB6B1D',
  primaryLight: '#6BA3E8',
  
  // Secondary colors
  secondary: '#27AE60',
  secondaryDark: '#1E8449',
  secondaryLight: '#45C579',
  
  // Accent colors
  accent: '#86C67A',
  accentDark: '#E67E22',
  accentLight: '#F7B733',
  accentAlt: '#D1B0F8',
  
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
  black: '#000000',
  
  // Background colors
  background: '#F7F3F1',
  surface: '#FFFDFB',
  card: '#FFFFFF',
  
  // Text colors
  textPrimary: '#40302B',
  textSecondary: '#6C757D',
  textLight: '#FFFFFF',
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
  
  // New tokens
  neutral: '#FFE6D0',
  neutralDark: '#40302B',
  divider: '#EFE6E0',
  iconInactive: '#E0D7CF',
};

export const DARK_COLORS = {
  // Primary colors (same as light mode)
  primary: '#F99546',
  primaryDark: '#DB6B1D',
  primaryLight: '#6BA3E8',
  
  // Secondary colors (same as light mode)
  secondary: '#27AE60',
  secondaryDark: '#1E8449',
  secondaryLight: '#45C579',
  
  // Accent colors (same as light mode)
  accent: '#86C67A',
  accentDark: '#E67E22',
  accentLight: '#F7B733',
  accentAlt: '#D1B0F8',
  
  // Status colors (same as light mode)
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Neutral colors (dark mode variants)
  white: '#FFFFFF',
  lightGray: '#2A2A2A',
  gray: '#6C757D',
  darkGray: '#495057',
  black: '#000000',
  
  // Background colors (dark mode)
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2A2A2A',
  
  // Text colors (dark mode)
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#FFFFFF',
  
  // Shadow (dark mode)
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Dark mode tokens
  neutral: '#3A3A3A',
  neutralDark: '#FFFFFF',
  divider: '#3A3A3A',
  iconInactive: '#6C757D',
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
  displayLarge: 32,
  headline: 24,
  title: 18,
  body: 16,
  caption: 13,
  button: 16,
  
  // Spacing Scale (8pt grid system)
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  
  // Component sizes
  buttonHeight: 52,    // Increased for better touch targets
  inputHeight: 52,     // Increased for better touch targets
  cardPadding: 12,     // Further reduced for more compact cards
  screenPadding: 24,   // Increased for better margins
  
  // Border radius
  buttonRadius: 16,
  cardRadius: 24,
  inputRadius: 12,
  avatarRadius: 28,
  
  // Icon sizes
  icon: 24,
};

export const FONTS = {
  // Font families (using system fonts for better performance)
  fontFamily: "Inter, 'SF Pro', 'Roboto', sans-serif",
  fontWeights: {
    regular: 400,
    medium: 500,
    bold: 700,
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
    icon: 'play-circle-filled',
    color: '#2ECC71',
    requirement: 'Check-in pertama'
  },
  {
    id: 'week-warrior',
    name: 'Pejuang Seminggu',
    description: 'Bertahan selama 7 hari',
    icon: 'date-range',
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
    icon: 'local-fire-department',
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
    icon: 'emoji-events',
    color: '#E74C3C',
    requirement: '50 misi selesai'
  },
  // Premium Badges
  {
    id: 'elite-year',
    name: 'Elite Setahun',
    description: 'Bertahan selama 365 hari',
    icon: 'workspace-premium',
    color: '#FFD700',
    requirement: '365 hari berturut-turut',
    isPremium: true
  },
  {
    id: 'diamond-streak',
    name: 'Diamond Streak',
    description: 'Mencapai streak 500 hari',
    icon: 'diamond',
    color: '#00D4FF',
    requirement: '500 hari berturut-turut',
    isPremium: true
  },
  {
    id: 'legendary-master',
    name: 'Master Legendaris',
    description: 'Mencapai streak 1000 hari',
    icon: 'military-tech',
    color: '#8A2BE2',
    requirement: '1000 hari berturut-turut',
    isPremium: true
  },
  {
    id: 'xp-elite',
    name: 'Elite XP',
    description: 'Mengumpulkan 5000 XP',
    icon: 'auto-awesome',
    color: '#FF6B35',
    requirement: '5000 XP',
    isPremium: true
  },
  {
    id: 'xp-master-premium',
    name: 'XP Master Premium',
    description: 'Mengumpulkan 10000 XP',
    icon: 'stars',
    color: '#FF1493',
    requirement: '10000 XP',
    isPremium: true
  },
  {
    id: 'xp-legend',
    name: 'Legenda XP',
    description: 'Mengumpulkan 25000 XP',
    icon: 'whatshot',
    color: '#DC143C',
    requirement: '25000 XP',
    isPremium: true
  },
  {
    id: 'mission-legend',
    name: 'Legenda Misi',
    description: 'Menyelesaikan 100 misi',
    icon: 'emoji-events',
    color: '#32CD32',
    requirement: '100 misi selesai',
    isPremium: true
  },
  {
    id: 'mission-champion',
    name: 'Juara Misi',
    description: 'Menyelesaikan 250 misi',
    icon: 'emoji-events',
    color: '#FF4500',
    requirement: '250 misi selesai',
    isPremium: true
  },
  {
    id: 'money-saver-elite',
    name: 'Elite Hemat',
    description: 'Hemat 5 juta rupiah',
    icon: 'savings',
    color: '#228B22',
    requirement: 'Hemat 5 juta rupiah',
    isPremium: true
  },
  {
    id: 'money-master-premium',
    name: 'Master Keuangan',
    description: 'Hemat 10 juta rupiah',
    icon: 'account-balance',
    color: '#DAA520',
    requirement: 'Hemat 10 juta rupiah',
    isPremium: true
  },
  {
    id: 'health-transformer',
    name: 'Transformasi Sehat',
    description: 'Mencapai semua milestone kesehatan',
    icon: 'health-and-safety',
    color: '#20B2AA',
    requirement: 'Semua milestone kesehatan',
    isPremium: true
  },
  {
    id: 'perfect-month',
    name: 'Bulan Sempurna',
    description: 'Streak 30 hari + 500 XP dalam sebulan',
    icon: 'verified',
    color: '#9370DB',
    requirement: '30 hari + 500 XP dalam sebulan',
    isPremium: true
  }
];

export const HEALTH_MILESTONES = [
  {
    id: 'twenty-minutes',
    title: '20 Menit',
    description: 'Detak jantung dan tekanan darah mulai normal',
    timeframe: '20 menit',
    icon: 'favorite',
    hours: 0.33
  },
  {
    id: 'twelve-hours',
    title: '12 Jam',
    description: 'Kadar karbon monoksida dalam darah normal',
    timeframe: '12 jam',
    icon: 'air',
    hours: 12
  },
  {
    id: 'two-weeks',
    title: '2 Minggu',
    description: 'Sirkulasi darah membaik, fungsi paru-paru meningkat',
    timeframe: '2 minggu',
    icon: 'directions-run',
    hours: 336
  },
  {
    id: 'one-month',
    title: '1 Bulan',
    description: 'Batuk dan sesak nafas berkurang',
    timeframe: '1 bulan',
    icon: 'self-improvement',
    hours: 720
  },
  {
    id: 'one-year',
    title: '1 Tahun',
    description: 'Risiko penyakit jantung berkurang 50%',
    timeframe: '1 tahun',
    icon: 'security',
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

