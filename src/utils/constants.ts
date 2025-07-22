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

// Contextual motivational quotes for premium users
export const CONTEXTUAL_QUOTES = {
  // For users who broke their streak or need to restart
  STREAK_BROKEN: [
    "Jatuh itu manusiawi, bangkit itu pilihan. Mulai lagi hari ini dengan keyakinan yang lebih kuat.",
    "Setiap juara pernah mengalami kekalahan. Yang membedakan adalah keberanian untuk mencoba lagi.",
    "Tidak ada yang namanya kegagalan, yang ada hanya pelajaran. Hari ini adalah awal yang baru.",
    "Streak terputus bukan berarti semua usaha sia-sia. Semua progress sebelumnya tetap berarti.",
    "Kesempurnaan bukanlah tujuan, konsistensi adalah kunci. Mari mulai lagi dengan lebih bijaksana.",
    "Setiap detik adalah kesempatan baru. Jangan biarkan masa lalu menghalangi masa depan yang cerah.",
    "Yang terpenting bukan seberapa sering kamu jatuh, tapi seberapa cepat kamu bangkit kembali.",
    "Pengalaman adalah guru terbaik. Gunakan pelajaran kemarin untuk kekuatan hari ini.",
    "Berhenti merokok adalah maraton, bukan sprint. Satu langkah mundur tidak membatalkan perjalanan.",
    "Keberanian bukan tentang tidak pernah gagal, tapi tentang tidak menyerah setelah gagal.",
    "Mulai dari nol lagi? Tidak apa-apa. Kali ini kamu sudah tahu apa yang harus dihindari.",
    "Setiap sunrise adalah kesempatan kedua. Manfaatkan hari ini untuk memulai yang lebih baik.",
    "Progress bukan garis lurus. Kadang naik turun, yang penting arahnya tetap maju.",
    "Jangan malu dengan restart. Bahkan aplikasi terbaik kadang perlu di-restart untuk bekerja optimal.",
    "Yang penting bukan berapa kali kamu mulai, tapi apakah kamu tidak pernah berhenti mencoba.",
    "Kegagalan adalah kesempatan untuk memulai lagi dengan lebih cerdas.",
    "Streak baru dimulai hari ini. Dan kali ini, kamu lebih kuat dari sebelumnya.",
    "Tidak ada yang salah dengan memulai dari awal. Yang salah adalah tidak memulai sama sekali.",
    "Setiap hari adalah halaman baru dalam buku hidupmu. Tulis cerita yang lebih baik hari ini.",
    "Percaya pada diri sendiri. Kamu sudah membuktikan bisa melakukannya sebelumnya, bisa lagi sekarang.",
    "Reset bukan berarti kalah. Reset berarti kamu cukup bijak untuk mengakui dan memperbaiki kesalahan.",
    "Hidup memberikan second chance setiap hari. Gunakan kesempatan ini dengan baik.",
    "Bukan tentang sempurna, tapi tentang terus berusaha. Dan hari ini kamu sudah memulainya.",
    "Streak yang terputus tidak menghapus semua pembelajaran dan kekuatan yang sudah kamu kumpulkan.",
    "Hari ini adalah hari ke-1 yang baru. Dan setiap hari ke-1 adalah pencapaian yang patut dibanggakan."
  ],

  // For new users (0-7 days)
  NEW_USER: [
    "Langkah pertama adalah yang tersulit, dan kamu sudah melakukannya. Selamat datang di perjalanan baru!",
    "Setiap perjalanan seribu mil dimulai dengan satu langkah. Hari ini adalah langkah pertamamu.",
    "Keputusan berhenti merokok adalah salah satu keputusan terbaik dalam hidupmu. Berbanggalah!",
    "Dalam 24 jam pertama, tubuhmu sudah mulai memperbaiki diri. Kamu sudah di jalan yang benar.",
    "Selamat telah memilih jalan yang lebih sehat. Setiap napas sekarang adalah investasi untuk masa depan.",
    "Hari-hari pertama memang berat, tapi ingat: kamu lebih kuat dari yang kamu kira.",
    "Tubuhmu sedang berterima kasih atas keputusan besar yang kamu buat. Tetap semangat!",
    "Tidak ada kata terlambat untuk memulai hidup sehat. Dan kamu sudah memulainya dengan berani.",
    "Setiap menit tanpa rokok adalah kemenangan kecil. Kumpulkan kemenangan-kemenangan kecil ini.",
    "Proses detoksifikasi sudah dimulai. Beri waktu tubuhmu untuk menyesuaikan dan pulih.",
    "Kamu bukan sedang kehilangan sesuatu, kamu sedang mendapatkan kesehatan dan kebebasan.",
    "Hari ini mungkin sulit, tapi besok akan lebih mudah. Dan lusa akan lebih mudah lagi.",
    "Setiap godaan yang kamu lalui membuat kamu semakin kuat. Kamu sedang membangun mental juara.",
    "Ingat alasan kamu memulai ini. Pegang teguh alasan itu di setiap momen sulit.",
    "Kamu tidak sendirian. Jutaan orang di dunia sudah berhasil, dan kamu juga pasti bisa.",
    "Fokus pada hari ini saja. Jangan pikirkan minggu depan atau bulan depan. Satu hari dalam satu waktu.",
    "Setiap jam yang berlalu, kamu semakin dekat dengan versi terbaik dari dirimu.",
    "Withdrawal symptoms adalah tanda bahwa tubuhmu sedang memperbaiki diri. Ini hal yang baik.",
    "Kamu sedang melakukan investasi terbesar untuk kesehatan dan kebahagiaan masa depanmu.",
    "Percayalah pada prosesnya. Tubuh manusia dirancang untuk pulih, dan kamu akan merasakan perbedaannya.",
    "Setiap orang yang berhasil pernah mengalami hari pertama seperti yang kamu alami sekarang.",
    "Kamu sudah mengambil keputusan paling bijaksana. Sekarang tinggal konsisten menjalankannya.",
    "Dalam seminggu, kamu akan melihat ke belakang dan bangga dengan keputusan hari ini.",
    "Tubuhmu sudah mulai menghilangkan nikotin. Setiap napas membawamu lebih dekat pada kebebasan.",
    "Kamu bukan pecandu lagi. Kamu adalah seseorang yang sedang memilih hidup lebih sehat."
  ],

  // For early journey (1-4 weeks)
  EARLY_JOURNEY: [
    "Momentum sudah terbangun! Setiap hari kamu semakin kuat dan semakin bebas.",
    "Minggu-minggu pertama adalah yang tersulit, dan kamu sudah melewatinya dengan baik.",
    "Tubuhmu sudah mulai merasakan perbedaan. Napas lebih lega, energi lebih stabil.",
    "Kebiasaan baru sedang terbentuk. Terus konsisten, kamu di jalan yang tepat.",
    "Setiap hari tanpa rokok adalah investasi untuk 10-20 tahun hidup yang lebih panjang.",
    "Kamu sudah membuktikan pada diri sendiri bahwa kamu bisa. Sekarang tinggal melanjutkan.",
    "Withdrawal symptoms mulai berkurang. Bagian tersulit sudah hampir terlewati.",
    "Uang yang biasa untuk rokok sekarang bisa untuk hal-hal yang lebih bermakna.",
    "Orang-orang di sekitarmu mulai melihat perubahan positif. Kamu menginspirasi mereka.",
    "Setiap tantangan yang kamu lalui membuat kamu semakin percaya diri menghadapi yang berikutnya.",
    "Rasa makanan mulai terasa lebih nikmat, bukan? Itu karena indera perasa mulai pulih.",
    "Tidur mulai lebih nyenyak karena oksigen mengalir lebih baik ke seluruh tubuh.",
    "Kamu sedang membangun identitas baru: seseorang yang tidak merokok. Dan itu luar biasa!",
    "Rutinitas baru tanpa rokok mulai terasa natural. Kamu beradaptasi dengan sangat baik.",
    "Setiap minggu yang berlalu, risiko kesehatan berkurang secara signifikan.",
    "Kamu sudah melewati fase kritis. Dari sini akan semakin mudah dan menyenangkan.",
    "Sirkulasi darah mulai membaik. Kamu mungkin merasa lebih berenergi dan segar.",
    "Batuk-batuk berkurang karena paru-paru mulai membersihkan diri. Proses penyembuhan bekerja!",
    "Kamu tidak lagi tergantung pada jadwal rokok. Kebebasan ini sangat berharga.",
    "Confidence level meningkat karena kamu berhasil mengontrol diri. Skill ini berguna di banyak hal.",
    "Minggu demi minggu, kamu membuktikan bahwa kamu lebih kuat dari kecanduanmu.",
    "Keluarga dan teman mulai bangga dengan perubahan positif yang kamu tunjukkan.",
    "Setiap hari adalah evidence bahwa kamu memiliki self-control yang luar biasa.",
    "Carbon monoxide sudah hilang dari darahmu. Oksigen mengalir lebih optimal ke seluruh tubuh.",
    "Kamu sedang menciptakan versi terbaik dari dirimu, satu hari dalam satu waktu."
  ],

  // For milestone achievers (1-3 months)
  MILESTONE_ACHIEVER: [
    "Pencapaian luar biasa! Kamu sudah membuktikan komitmen dan kekuatan mental yang sesungguhnya.",
    "Bulanan pertama/kedua adalah pencapaian besar. Kamu layak bangga dengan dirimu sendiri!",
    "Tubuhmu sudah merasakan transformasi signifikan. Investasi kesehatanmu mulai berbuah nyata.",
    "Kamu sudah keluar dari zona bahaya kritis. Risiko kesehatan terus menurun drastis.",
    "Habits baru sudah terbentuk kuat. Hidup tanpa rokok kini terasa natural untukmu.",
    "Setiap bulan yang berlalu adalah bukti nyata bahwa kamu memiliki self-discipline tingkat tinggi.",
    "Orang-orang di sekitarmu melihat perubahan besar. Kamu menjadi inspirasi nyata bagi mereka.",
    "Stamina dan energi sudah jauh membaik. Kamu bisa merasakan perbedaannya dalam aktivitas sehari-hari.",
    "Uang yang terkumpul dari tidak merokok sudah cukup untuk hal-hal yang lebih bermakna.",
    "Sistem imun sudah mulai menguat. Kamu mungkin merasa lebih jarang sakit dari biasanya.",
    "Kamu sudah melewati fase honeymoon period. Sekarang ini adalah lifestyle, bukan lagi perjuangan.",
    "Setiap milestone adalah stepping stone untuk pencapaian yang lebih besar lagi.",
    "Paru-paru sudah mulai membersihkan diri dengan signifikan. Bernapas terasa lebih mudah dan lega.",
    "Kamu sudah membuktikan pada dunia bahwa perubahan besar dimulai dari keputusan personal yang kuat.",
    "Risiko penyakit jantung sudah menurun drastis. Investasi kesehatan jangka panjangmu sangat berharga.",
    "Kamu tidak hanya berhenti merokok, kamu sedang membangun lifestyle sehat yang komprehensif.",
    "Setiap hari kamu membuktikan bahwa kamu adalah master of your own destiny.",
    "Pencapaian ini bukan hanya tentang kesehatan, tapi juga tentang mental strength dan self-respect.",
    "Kamu sudah menciptakan momentum yang powerful. Gunakan momentum ini untuk goals lainnya juga.",
    "Level confidence dan self-esteem pasti sudah meningkat. Kamu tahu kamu bisa achieve anything.",
    "Dari sini, challenge terbesar adalah mempertahankan. Dan track record membuktikan kamu pasti bisa.",
    "Kamu sudah menjadi role model hidup sehat. Influence positifmu menyebar ke orang-orang terdekat.",
    "Setiap bulan adalah evidence kumulatif bahwa kamu memiliki willpower yang extraordinary.",
    "Transformation fisik dan mental sudah sangat terasa. Kamu sedang menjadi best version of yourself.",
    "Pencapaian ini akan menjadi foundation untuk pencapaian-pencapaian besar lainnya di hidup."
  ],

  // For veterans (3+ months)
  VETERAN: [
    "Setelah sekian lama, kamu sudah membuktikan bahwa hidup tanpa rokok bukan hanya mungkin, tapi jauh lebih indah.",
    "Kamu sudah masuk kategori veteran! Pengalaman dan wisdommu berharga untuk membantu orang lain.",
    "Lifestyle sehat sudah menjadi second nature. Kamu sudah tidak bisa membayangkan hidup dengan cara lama.",
    "Setiap hari adalah celebration of your strength and commitment to better life.",
    "Tubuhmu sudah hampir sepenuhnya pulih. Kamu merasakan hidup dengan kualitas yang jauh lebih baik.",
    "Kamu sudah menjadi inspirasi hidup bagi banyak orang. Leadership by example adalah yang terbaik.",
    "Dari pengalamanmu, kamu tahu bahwa setiap hari sulit di awal sangat worth it dengan hari-hari indah sekarang.",
    "Kamu sudah memiliki mental fortitude yang teruji. Skill ini applicable untuk challenge apapun di hidup.",
    "Maintenance mode adalah tentang enjoying the freedom dan terus growing sebagai pribadi yang lebih baik.",
    "Setiap milestone yang kamu capai adalah legacy untuk masa depan dan inspiring story untuk orang lain.",
    "Kamu sudah membuktikan bahwa commitment jangka panjang menghasilkan transformation yang lasting.",
    "Level wisdom dan self-awareness kamu sudah jauh meningkat melalui journey ini.",
    "Kamu tidak hanya survivor, kamu adalah thriver yang sedang living your best life.",
    "Setiap hari adalah reminder bahwa kamu capable of achieving anything you set your mind to.",
    "Kamu sudah create new identity yang powerful: someone who makes conscious healthy choices.",
    "Experience kamu adalah treasure trove of insights yang bisa membantu banyak orang.",
    "Kamu sudah master the art of long-term thinking dan delayed gratification.",
    "Setiap hari tanpa rokok adalah compound interest untuk kesehatan, finansial, dan mental wellbeing.",
    "Kamu sudah prove to yourself bahwa kamu memiliki integrity dan follow-through yang exceptional.",
    "Lifestyle transformation kamu adalah case study nyata bahwa change is possible untuk siapapun.",
    "Kamu sudah build sustainable habits yang akan benefit kamu for decades to come.",
    "Mental clarity dan emotional stability yang kamu rasakan sekarang adalah reward dari consistency.",
    "Kamu sudah demonstrate bahwa true strength adalah tentang making good choices consistently.",
    "Journey kamu adalah testament bahwa personal growth tidak memiliki expiration date.",
    "Kamu sudah living proof bahwa the best time to plant a tree was yesterday, the second best time is now."
  ],

  // General daily motivation for any context
  GENERAL_DAILY: [
    "Setiap hari tanpa rokok adalah kemenangan kecil yang bermakna besar.",
    "Kesehatan adalah investasi terbaik untuk masa depan yang cerah.",
    "Kamu lebih kuat dari kecanduan apapun. Percayalah pada diri sendiri.",
    "Perubahan dimulai dari keputusan kecil yang konsisten.",
    "Hidup sehat adalah hadiah terbaik untuk orang-orang yang kamu cintai.",
    "Setiap nafas yang bersih adalah langkah menuju kehidupan yang lebih baik.",
    "Kekuatan sejati terletak pada kemampuan mengatasi godaan.",
    "Hari ini adalah kesempatan baru untuk menjadi versi terbaik dari diri sendiri.",
    "Konsistensi adalah kunci. Satu hari dalam satu waktu, kamu akan sampai di tujuan.",
    "Tubuhmu sedang berterima kasih atas setiap keputusan sehat yang kamu buat.",
    "Kebebasan dari rokok adalah kebebasan untuk hidup lebih penuh dan bermakna.",
    "Setiap tantangan yang kamu lalui membuat kamu semakin resilient dan wise.",
    "Progress mungkin slow, tapi setiap step membawa kamu closer to your goals.",
    "Kamu sedang create positive impact tidak hanya untuk dirimu, tapi juga orang-orang terdekat.",
    "Mental strength yang kamu build hari ini akan serve you well in all areas of life.",
    "Setiap choice untuk not smoking adalah choice untuk longer, healthier, happier life.",
    "Kamu sedang prove to yourself bahwa kamu memiliki self-control yang extraordinary.",
    "Journey ini bukan hanya tentang berhenti merokok, tapi tentang becoming your best self.",
    "Setiap hari adalah opportunity untuk reinforce positive habits dan strengthen your resolve.",
    "Kamu sedang write success story yang akan inspire kamu sendiri di masa depan.",
    "Remember why you started. That reason is still valid dan still worth fighting for.",
    "Kamu tidak sedang depriving yourself, kamu sedang giving yourself the gift of health.",
    "Setiap moment of resistance makes the next moment easier to handle.",
    "Your future self akan sangat grateful untuk keputusan-keputusan yang kamu buat hari ini.",
    "Kamu sedang demonstrate bahwa true power comes from making conscious, healthy choices."
  ]
};

// Fallback quotes for free users
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

