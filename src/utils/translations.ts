import * as Localization from 'expo-localization';

export type Language = 'id' | 'en';

export interface Translations {
  // Common UI
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    ok: string;
    yes: string;
    no: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    continue: string;
    skip: string;
    done: string;
    retry: string;
  };

  // Splash Screen
  splash: {
    subtitle: string;
    footer: string;
  };

  // Navigation & Screen Titles
  navigation: {
    dashboard: string;
    progress: string;
    profile: string;
    settings: string;
  };

  // Dashboard Screen
  dashboard: {
    welcome: string;
    welcomeBack: string;
    checkIn: string;
    checkedIn: string;
    streak: string;
    totalDays: string;
    dailyMissions: string;
    todaysMotivation: string;
    personalMotivator: string;
    personalMotivatorDesc: string;
    activateMotivator: string;
    daysSinceQuit: string;
    moneySaved: string;
    cigarettesAvoided: string;
    healthImproving: string;
    nextMilestone: string;
    checkInSuccess: string;
    checkInError: string;
    streakContinued: string;
    newBadge: string;
    newBadges: string;
    badgeEarned: string;
    streakBroken: string;
    missionCompleted: string;
    xpEarned: string;
  };

  // Missions - Expanded to 30 missions per language
  missions: {
    // Universal mission
    checkInDaily: string;
    checkInDailyDesc: string;
    
    // Ad unlock mission
    unlockExtraMissions: string;
    unlockExtraMissionsDesc: string;
    
    // BREATHING & MINDFULNESS (8 missions)
    breathingRelax: string;
    breathingRelaxDesc: string;
    wimHofBreathing: string;
    wimHofBreathingDesc: string;
    quietMeditation: string;
    quietMeditationDesc: string;
    fourSevenEightBreathing: string;
    fourSevenEightBreathingDesc: string;
    boxBreathing: string;
    boxBreathingDesc: string;
    headspaceMeditation: string;
    headspaceMeditationDesc: string;
    bodyScan: string;
    bodyScanDesc: string;
    lovingKindness: string;
    lovingKindnessDesc: string;
    breathAwareness: string;
    breathAwarenessDesc: string;
    progressiveRelaxation: string;
    progressiveRelaxationDesc: string;
    
    // MOVEMENT & EXERCISE (8 missions)
    sevenMinuteWorkout: string;
    sevenMinuteWorkoutDesc: string;
    morningYoga: string;
    morningYogaDesc: string;
    taiChi: string;
    taiChiDesc: string;
    danceTherapy: string;
    danceTherapyDesc: string;
    stretchingFlow: string;
    stretchingFlowDesc: string;
    walkingMeditation: string;
    walkingMeditationDesc: string;
    strengthTraining: string;
    strengthTrainingDesc: string;
    pilatesCore: string;
    pilatesCoreDesc: string;
    
    // NUTRITION & HYDRATION (5 missions)
    greenSmoothie: string;
    greenSmoothieDesc: string;
    herbalTea: string;
    herbalTeaDesc: string;
    mindfulEating: string;
    mindfulEatingDesc: string;
    hydrationBoost: string;
    hydrationBoostDesc: string;
    mediterraneanSnack: string;
    mediterraneanSnackDesc: string;
    
    // LEARNING & GROWTH (5 missions)
    stoicReading: string;
    stoicReadingDesc: string;
    tedTalk: string;
    tedTalkDesc: string;
    podcastLearning: string;
    podcastLearningDesc: string;
    newSkill: string;
    newSkillDesc: string;
    documentary: string;
    documentaryDesc: string;
    
    // CREATIVE & EXPRESSION (4 missions)
    morningPages: string;
    morningPagesDesc: string;
    artTherapy: string;
    artTherapyDesc: string;
    musicTherapy: string;
    musicTherapyDesc: string;
    gratitudeJournal: string;
    gratitudeJournalDesc: string;
  };

  // Progress Screen
  progress: {
    title: string;
    subtitle: string;
    statistics: string;
    health: string;
    savings: string;
    dailyProgress: string;
    healthMilestones: string;
    totalSavings: string;
    perDay: string;
    perWeek: string;
    perMonth: string;
    whatYouCanBuy: string;
    savedMoney: string;
    smokeFree: string;
    cigarettesAvoided: string;
    lifeMinutesGained: string;
    longestStreak: string;
    totalXP: string;
    badgesEarned: string;
    missionsCompleted: string;
    smartphone: string;
    familyPizza: string;
    gasoline: string;
    less: string;
    active: string;
  };

  // Badge Statistics Screen
  badges: {
    title: string;
    subtitle: string;
    loading: string;
    youHave: string;
    of: string;
    badgesOwned: string;
    otherBadges: string;
    updateInfo: string;
    // Internal tabs
    myBadges: string;
    communityStats: string;
    // Community features
    communityRanking: string;
    communityInsights: string;
    premiumRequired: string;
    premiumCommunityDesc: string;
  };

  // Badge Names and Descriptions
  badgeNames: {
    'new-member': string;
    'first-day': string;
    'week-warrior': string;
    'month-master': string;
    'streak-master': string;
    'xp-collector': string;
    'mission-master': string;
    'elite-year': string;
    'diamond-streak': string;
    'legendary-master': string;
    'xp-elite': string;
    'xp-master-premium': string;
    'xp-legend': string;
    'mission-legend': string;
    'mission-champion': string;
    'money-saver-elite': string;
    'money-master-premium': string;
    'health-transformer': string;
    'perfect-month': string;
  };

  badgeDescriptions: {
    'new-member': string;
    'first-day': string;
    'week-warrior': string;
    'month-master': string;
    'streak-master': string;
    'xp-collector': string;
    'mission-master': string;
    'elite-year': string;
    'diamond-streak': string;
    'legendary-master': string;
    'xp-elite': string;
    'xp-master-premium': string;
    'xp-legend': string;
    'mission-legend': string;
    'mission-champion': string;
    'money-saver-elite': string;
    'money-master-premium': string;
    'health-transformer': string;
    'perfect-month': string;
  };

  badgeRequirements: {
    'new-member': string;
    'first-day': string;
    'week-warrior': string;
    'month-master': string;
    'streak-master': string;
    'xp-collector': string;
    'mission-master': string;
    'elite-year': string;
    'diamond-streak': string;
    'legendary-master': string;
    'xp-elite': string;
    'xp-master-premium': string;
    'xp-legend': string;
    'mission-legend': string;
    'mission-champion': string;
    'money-saver-elite': string;
    'money-master-premium': string;
    'health-transformer': string;
    'perfect-month': string;
  };

  // Profile Screen  
  profile: {
    title: string;
    premium: string;
    upgrade: string;
    notifications: string;
    notificationsDesc: string;
    darkMode: string;
    darkModeActive: string;
    darkModeInactive: string;
    premiumFeature: string;
    language: string;
    languageDesc: string;
    help: string;
    helpDesc: string;
    about: string;
    aboutVersion: string;
    logout: string;
    logoutDesc: string;
    logoutConfirm: string;
    logoutMessage: string;
  };

  // Notifications
  notifications: {
    // Permission messages
    permissionRequired: string;
    permissionDenied: string;
    permissionUndetermined: string;
    permissionGranted: string;
    openSettings: string;
    cancel: string;
    
    // Error messages
    schedulingFailed: string;
    schedulingFailedDesc: string;
    timeChangeFailed: string;
    timeChangeFailedDesc: string;
    
    // Status texts
    active: string;
    inactive: string;
    reminderTime: string;
    
    // Notification content (6 variations each)
    titles: {
      reminder: string;
      motivation: string;
      healthy: string;
      consistency: string;
      journey: string;
      freedom: string;
    };
    
    bodies: {
      reminder: string;
      motivation: string;
      healthy: string;
      consistency: string;
      journey: string;
      freedom: string;
    };

    // Lungcat notifications
    lungcat: {
      enabled: string;
      enabledDesc: string;
      feedingTitle: string;
      feedingBody: string;
      playingTitle: string;
      playingBody: string;
      healthGoodTitle: string;
      healthGoodBody: string;
      healthBadTitle: string;
      healthBadBody: string;
      energyLowTitle: string;
      energyLowBody: string;
    };
  };

  // Onboarding
  onboarding: {
    welcome: string;
    welcomeMessage: string;
    smokingYears: string;
    smokingYearsDesc: string;
    cigarettesPerDay: string;
    cigarettesPerDayDesc: string;
    pricePerPack: string;
    pricePerPackDesc: string;
    whyQuit: string;
    whyQuitDesc: string;
    previousAttempts: string;
    previousAttemptsDesc: string;
    quitDate: string;
    quitDateDesc: string;
    congratulations: string;
    congratulationsMessage: string;
    years: string;
    cigarettesDaily: string;
    perPack: string;
    selectOneOrMore: string;
    required: string;
    never: string;
    times: string;
    perfectStart: string;
    startHealthyJourney: string;
    summary: string;
    next: string;
    back: string;
  };

  // Quit Reasons
  quitReasons: {
    health: string;
    family: string;
    money: string;
    fitness: string;
    appearance: string;
    pregnancy: string;
  };

  // Settings & Preferences
  settings: {
    notifications: string;
    notificationsHelp: string;
    darkMode: string;
    language: string;
    help: string;
    helpContent: string;
    about: string;
    aboutContent: string;
  };

  // Premium & Subscription
  premium: {
    title: string;
    subtitle: string;
    valueProposition: string;
    features: {
      personalConsultation: string;
      dailyMotivation: string;
      threeMissions: string;
      darkMode: string;
      adFree: string;
      supportDeveloper: string;
    };
    upgrade: string;
    monthly: string;
    yearly: string;
    paymentProcessing: string;
    paymentSuccess: string;
    paymentError: string;
  };

  // Upgrade Banner
  upgradeBanner: {
    title: string;
    message: string;
    tryFree: string;
    upgradeNow: string;
  };

  // Alerts & Messages
  alerts: {
    fieldRequired: string;
    dataIncomplete: string;
    saveError: string;
    loadError: string;
    internetError: string;
    tryAgain: string;
  };

  // Motivational quotes
  quotes: {
    streakBroken: string[];
    newUser: string[];
    earlyJourney: string[];
    milestoneAchiever: string[];
    veteran: string[];
    generalDaily: string[];
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Berhasil',
      cancel: 'Batal',
      ok: 'OK',
      yes: 'Ya',
      no: 'Tidak',
      save: 'Simpan',
      delete: 'Hapus',
      edit: 'Edit',
      close: 'Tutup',
      back: 'Kembali',
      next: 'Lanjut',
      continue: 'Lanjutkan',
      skip: 'Lewati',
      done: 'Selesai',
      retry: 'Coba Lagi',
    },

    splash: {
      subtitle: 'Mulai Hidup Sehat Hari Ini',
      footer: 'Bergabunglah dengan ribuan pengguna dalam perjalanan bebas rokok mereka',
    },

    navigation: {
      dashboard: 'Beranda',
      progress: 'Progress',
      profile: 'Profil',
      settings: 'Pengaturan',
    },

    dashboard: {
      welcome: 'Selamat datang!',
      welcomeBack: 'Selamat datang kembali!',
      checkIn: 'Check-in Hari Ini',
      checkedIn: 'Sudah Check-in',
      streak: 'Streak',
      totalDays: 'Total Hari',
      dailyMissions: 'Misi Harian',
      todaysMotivation: 'Motivasi Hari Ini',
      personalMotivator: 'Personal Motivator',
      personalMotivatorDesc: '🚀 Dapatkan dorongan personal setiap hari! Motivasi yang disesuaikan dengan perjalanan bebas rokok Anda',
      activateMotivator: 'Aktifkan Personal Motivator',
      daysSinceQuit: 'hari bebas rokok',
      moneySaved: 'Uang Dihemat',
      cigarettesAvoided: 'Rokok Dihindari',
      healthImproving: 'Kesehatan Membaik',
      nextMilestone: 'Milestone Selanjutnya',
      checkInSuccess: 'Check-in berhasil!',
      checkInError: 'Gagal melakukan check-in',
      streakContinued: 'Streak dilanjutkan!',
      newBadge: 'Badge Baru!',
      newBadges: 'Badge baru',
      badgeEarned: 'Kamu mendapat {count} badge baru!',
      streakBroken: 'Streak terputus, tapi tidak apa-apa!',
      missionCompleted: 'Misi selesai!',
      xpEarned: 'XP didapat',
    },

    missions: {
      // Universal check-in mission
      checkInDaily: 'Check-in Hari Ini',
      checkInDailyDesc: 'Absen dulu biar streak nggak putus',
      
      // Ad unlock mission
      unlockExtraMissions: 'Tonton Iklan untuk Misi Lebih',
      unlockExtraMissionsDesc: 'Dapatkan 2 misi seru & menantang! 🎬✨',
      
      // BREATHING & MINDFULNESS (12 missions)
      breathingRelax: 'Tarik Nafas Lega',
      breathingRelaxDesc: 'Hirup dalam lewat hidung, buang pelan lewat mulut, ulang 5x 😌',
      fourSevenEightBreathing: 'Breathing 4-7-8',
      fourSevenEightBreathingDesc: 'Tarik nafas 4 detik → tahan 7 detik → buang 8 detik. Ulang 3x ✨',
      boxBreathing: 'Box Breathing',
      boxBreathingDesc: 'Tarik 4 detik → tahan 4 detik → buang 4 detik → tahan 4 detik. Ulang 4x 🧠',
      quietMeditation: 'Meditasi Sunyi',
      quietMeditationDesc: 'Duduk tenang, pejam mata, fokus ke nafas 2 menit',
      bodyScan: 'Body Scan',
      bodyScanDesc: 'Dari kepala sampai kaki, sadari & rileksin tiap bagian tubuh',
      positivesPrayer: 'Doa Positif',
      positivesPrayerDesc: 'Ucapin doa/doa baik buat dirimu & orang lain',
      mindfulBreathing: 'Mindful Breathing',
      mindfulBreathingDesc: 'Tarik & buang nafas biasa, tapi fokusin pikiran ke alurnya 1 menit',
      progressiveRelaxation: 'Relaksasi Bertahap',
      progressiveRelaxationDesc: 'Tegangin lalu lemaskan otot dari kaki → kepala 🛌',
      miniNap: 'Mini Nap',
      miniNapDesc: 'Rebahin diri & tidur power nap 10–15 menit ⚡',
      stretchBreath: 'Stretch + Nafas',
      stretchBreathDesc: 'Lakukan 3 peregangan ringan, tiap gerakan tarik nafas dalam 🌬️',
      moodCheck: 'Mood Check',
      moodCheckDesc: 'Tutup mata, cek & tulis perasaanmu sekarang',
      
      // MOVEMENT & EXERCISE (12 missions)
      sevenMinuteWorkout: 'Senam 7 Menit',
      sevenMinuteWorkoutDesc: 'Ikuti gerakan senam singkat: jumping jack, squat, push-up',
      gentleYoga: 'Yoga Ringan',
      gentleYogaDesc: 'Lakukan 3 pose yoga dasar: child pose, cobra, cat-cow',
      taiChiSlow: 'Tai Chi Slow Mode',
      taiChiSlowDesc: 'Gerakan tangan & kaki perlahan, 5 menit kayak slow dance',
      traditionalDance: 'Joget Tradisi',
      traditionalDanceDesc: 'Putar musik, joget bebas ala tarian daerah',
      gentleStretch: 'Stretch Alus',
      gentleStretchDesc: 'Peregangan leher, bahu, pinggang, 3x masing-masing',
      mindfulWalk: 'Mindful Walk',
      mindfulWalkDesc: 'Jalan 5 menit, rasain langkah & hembusan angin 👣',
      bodWeightPower: 'Bodyweight Power',
      bodWeightPowerDesc: 'Lakukan 10 push-up + 15 squat 💪',
      coreChallenge: 'Core Challenge',
      coreChallengeDesc: 'Plank 30 detik + sit-up 15x',
      danceRandom: 'Dance Random',
      danceRandomDesc: 'Play lagu favorit, joget 2 menit 🎶',
      climbStairs: 'Naik Tangga',
      climbStairsDesc: 'Cari tangga, naikin 3 lantai tanpa lift',
      miniCardio: 'Mini Cardio',
      miniCardioDesc: 'Lompat tali / jumping jack 2 menit nonstop 🔥',
      tenThousandSteps: '10k Steps',
      tenThousandStepsDesc: 'Jalan sampai capai 10.000 langkah',
      
      // NUTRITION & HYDRATION (8 missions)
      greenJuice: 'Green Juice',
      greenJuiceDesc: 'Blender sayur hijau + buah, minum 1 gelas',
      jamuTime: 'Jamu Time',
      jamuTimeDesc: 'Minum segelas jamu kunyit/temulawak 🌿',
      mindfulEating: 'Mindful Eating',
      mindfulEatingDesc: 'Makan tanpa gadget, kunyah pelan rasain tiap suapan 🍚',
      hydrateCheck: 'Hydrate Check',
      hydrateCheckDesc: 'Minum 2 gelas air putih tambahan hari ini',
      localHealthySnack: 'Snack Sehat Lokal',
      localHealthySnackDesc: 'Pilih cemilan tradisional sehat: kacang rebus/buah',
      noSugarHour: 'No Sugar Hour',
      noSugarHourDesc: '1 jam tanpa teh manis/soda',
      addVeggies: 'Tambah Sayur',
      addVeggiesDesc: 'Tambahin 1 porsi sayur ekstra di makan siang',
      fruitBreak: 'Fruit Break',
      fruitBreakDesc: 'Ganti cemilan sore dengan 1 buah segar 🍎',
      
      // LEARNING & GROWTH (8 missions)
      readWisdom: 'Baca Buku/Konten Bijak',
      readWisdomDesc: 'Baca minimal 2 halaman buku/artikel',
      motivationVideo: 'Video Motivasi',
      motivationVideoDesc: 'Tonton 1 video motivasi 5 menit',
      podcastTime: 'Podcast Time',
      podcastTimeDesc: 'Putar 1 episode podcast inspiratif 🎧',
      newSkill: 'Skill Baru',
      newSkillDesc: 'Coba 1 hal baru: belajar kata bahasa asing / skill kecil',
      watchDocumentary: 'Nonton Dokumenter',
      watchDocumentaryDesc: 'Pilih dokumenter pendek & tonton',
      shortArticle: 'Artikel Singkat',
      shortArticleDesc: 'Cari artikel online, baca sampai selesai',
      shareKnowledge: 'Sharing Knowledge',
      shareKnowledgeDesc: 'Ceritain hal baru yg kamu pelajari ke 1 orang 📢',
      selfQuiz: 'Quiz Diri',
      selfQuizDesc: 'Tulis 3 hal baru yg kamu tau hari ini ✍️',
      
      // CREATIVE & EXPRESSION (6 missions)
      morningJournal: 'Morning Journal',
      morningJournalDesc: 'Tulis 3 kalimat tentang perasaanmu pagi ini',
      creativeWork: 'Karya Kreatif',
      creativeWorkDesc: 'Gambar doodle / tulis puisi mini 🎨',
      musicTherapy: 'Music Therapy',
      musicTherapyDesc: 'Dengerin 1 lagu yang bikin hati adem 🎶',
      gratitudeNote: 'Gratitude Note',
      gratitudeNoteDesc: 'Catat 3 hal kecil yg kamu syukuri 🙏',
      photoOfDay: 'Photo of the Day',
      photoOfDayDesc: 'Ambil foto hal yg bikin senyum 📸',
      playlistMood: 'Playlist Mood',
      playlistMoodDesc: 'Buat playlist sesuai mood hari ini 🎧',
      
      // SOCIAL & RELATIONSHIP (4 missions)
      sayThanks: 'Say Thanks',
      sayThanksDesc: 'Kirim ucapan makasih tulus via chat/call',
      goodVibesChat: 'Good Vibes Chat',
      goodVibesChatDesc: 'Chat temen random, kasih semangat ✨',
      familyTime: 'Family Time',
      familyTimeDesc: 'Ngobrol santai 10 menit tanpa gadget 👨‍👩‍👧',
      helpOut: 'Help Out',
      helpOutDesc: 'Bantu orang sekitar walau hal kecil 💕',
    },

    progress: {
      title: 'Progress Kamu',
      subtitle: 'hari bebas rokok',
      statistics: 'Statistik',
      health: 'Kesehatan',
      savings: 'Uang',
      dailyProgress: 'Progress Harian',
      healthMilestones: 'Milestone Kesehatan',
      totalSavings: 'Total Penghematan (Rp)',
      perDay: 'Per Hari (Rp)',
      perWeek: 'Per Minggu (Rp)',
      perMonth: 'Per Bulan (Rp)',
      whatYouCanBuy: 'Apa yang bisa kamu beli?',
      savedMoney: 'Dengan uang yang kamu hemat',
      smokeFree: 'Rokok Dihindari',
      cigarettesAvoided: 'Rokok Dihindari',
      lifeMinutesGained: 'Menit Hidup Bertambah',
      longestStreak: 'Streak Terpanjang',
      totalXP: 'Total XP',
      badgesEarned: 'Badge Diperoleh',
      missionsCompleted: 'Misi Selesai',
      smartphone: 'Smartphone',
      familyPizza: 'Pizza Keluarga',
      gasoline: 'Liter Bensin',
      less: 'Kurang',
      active: 'Aktif',
    },

    badges: {
      title: 'Pencapaian & Statistik',
      subtitle: 'Lihat pencapaian dan ranking komunitas global',
      loading: 'Memuat data pencapaian...',
      youHave: 'Kamu:',
      of: 'dari',
      badgesOwned: 'Badge yang Kamu Miliki',
      otherBadges: 'Badge Lainnya',
      updateInfo: 'Statistik diperbarui secara real-time • Tarik untuk refresh',
      // Internal tabs
      myBadges: 'Badge Saya',
      communityStats: 'Statistik Komunitas',
      // Community features
      communityRanking: 'Ranking Komunitas',
      communityInsights: 'Insight Komunitas',
      premiumRequired: 'Fitur Premium Diperlukan',
      premiumCommunityDesc: 'Lihat ranking dan statistik komunitas lengkap dengan upgrade ke Premium',
    },

    badgeNames: {
      'new-member': 'Anggota Baru',
      'first-day': 'Langkah Pertama',
      'week-warrior': 'Pejuang Seminggu',
      'month-master': 'Master Sebulan',
      'streak-master': 'Master Konsistensi',
      'xp-collector': 'Kolektor XP',
      'mission-master': 'Master Misi',
      'elite-year': 'Elite Setahun',
      'diamond-streak': 'Diamond Streak',
      'legendary-master': 'Master Legendaris',
      'xp-elite': 'Elite XP',
      'xp-master-premium': 'XP Master Premium',
      'xp-legend': 'Legenda XP',
      'mission-legend': 'Legenda Misi',
      'mission-champion': 'Juara Misi',
      'money-saver-elite': 'Elite Hemat',
      'money-master-premium': 'Master Keuangan',
      'health-transformer': 'Transformasi Sehat',
      'perfect-month': 'Bulan Sempurna',
    },

    badgeDescriptions: {
      'new-member': 'Bergabung dengan komunitas ByeSmoke',
      'first-day': 'Melakukan check-in pertama kali',
      'week-warrior': 'Bertahan selama 7 hari',
      'month-master': 'Bertahan selama 30 hari',
      'streak-master': 'Mencapai streak 100 hari',
      'xp-collector': 'Mengumpulkan 1000 XP',
      'mission-master': 'Menyelesaikan 50 misi',
      'elite-year': 'Bertahan selama 365 hari',
      'diamond-streak': 'Mencapai streak 500 hari',
      'legendary-master': 'Mencapai streak 1000 hari',
      'xp-elite': 'Mengumpulkan 5000 XP',
      'xp-master-premium': 'Mengumpulkan 10000 XP',
      'xp-legend': 'Mengumpulkan 25000 XP',
      'mission-legend': 'Menyelesaikan 100 misi',
      'mission-champion': 'Menyelesaikan 250 misi',
      'money-saver-elite': 'Hemat 5 juta rupiah',
      'money-master-premium': 'Hemat 10 juta rupiah',
      'health-transformer': 'Mencapai semua milestone kesehatan',
      'perfect-month': 'Streak 30 hari + 500 XP dalam sebulan',
    },

    badgeRequirements: {
      'new-member': 'Mendaftar akun',
      'first-day': 'Check-in pertama',
      'week-warrior': '7 hari berturut-turut',
      'month-master': '30 hari berturut-turut',
      'streak-master': '100 hari berturut-turut',
      'xp-collector': '1000 XP',
      'mission-master': '50 misi selesai',
      'elite-year': '365 hari berturut-turut',
      'diamond-streak': '500 hari berturut-turut',
      'legendary-master': '1000 hari berturut-turut',
      'xp-elite': '5000 XP',
      'xp-master-premium': '10000 XP',
      'xp-legend': '25000 XP',
      'mission-legend': '100 misi selesai',
      'mission-champion': '250 misi selesai',
      'money-saver-elite': 'Hemat 5 juta rupiah',
      'money-master-premium': 'Hemat 10 juta rupiah',
      'health-transformer': 'Semua milestone kesehatan',
      'perfect-month': '30 hari + 500 XP dalam sebulan',
    },

    profile: {
      title: 'Profil',
      premium: 'Premium',
      upgrade: 'Upgrade Premium',
      notifications: 'Notifikasi',
      notificationsDesc: 'Pengingat dan motivasi',
      darkMode: 'Mode Gelap',
      darkModeActive: 'Aktif',
      darkModeInactive: 'Nonaktif',
      premiumFeature: 'Fitur Premium',
      language: 'Bahasa',
      languageDesc: 'Pilih bahasa aplikasi',
      help: 'Bantuan',
      helpDesc: 'FAQ dan dukungan',
      about: 'Tentang',
      aboutVersion: 'Versi 1.0.12',
      logout: 'Keluar',
      logoutDesc: 'Logout dari akun',
      logoutConfirm: 'Keluar',
      logoutMessage: 'Apakah kamu yakin ingin keluar?',
    },

    notifications: {
      // Permission messages
      permissionRequired: 'Izin Notifikasi Diperlukan',
      permissionDenied: 'Izin notifikasi ditolak. Silakan aktifkan notifikasi di pengaturan perangkat untuk menggunakan fitur pengingat.',
      permissionUndetermined: 'Izin notifikasi diperlukan untuk mengaktifkan pengingat harian.',
      permissionGranted: 'Notifikasi diizinkan',
      openSettings: 'Buka Pengaturan',
      cancel: 'Batal',
      
      // Error messages
      schedulingFailed: 'Gagal Mengaktifkan Notifikasi',
      schedulingFailedDesc: 'Tidak dapat mengatur pengingat. Pastikan izin notifikasi telah diberikan.',
      timeChangeFailed: 'Gagal Mengubah Waktu',
      timeChangeFailedDesc: 'Tidak dapat mengubah waktu pengingat. Periksa izin notifikasi.',
      
      // Status texts
      active: 'Aktif',
      inactive: 'Tidak aktif',
      reminderTime: 'Waktu Pengingat',
      
      // Notification content (6 variations each)
      titles: {
        reminder: 'ByeSmoke Reminder 🚭',
        motivation: 'Tetap Semangat! 💪',
        healthy: 'Hidup Sehat Menanti 🌟',
        consistency: 'Konsistensi adalah Kunci 🔑',
        journey: 'Perjalanan Hebat Berlanjut 🎯',
        freedom: 'Bebas Rokok, Hidup Lebih Baik ✨',
      },
      
      bodies: {
        reminder: 'Waktunya check-in harian! Tetap konsisten dalam perjalanan bebas rokok Anda.',
        motivation: 'Hari ini adalah hari baru untuk menjadi lebih sehat. Jangan lupa check-in ya!',
        healthy: 'Setiap hari tanpa rokok adalah kemenangan! Mari catat progress hari ini.',
        consistency: 'Streak Anda sangat berharga. Waktunya melakukan check-in harian!',
        journey: 'Kamu sudah sejauh ini, terus maju! Jangan lupa update progress hari ini.',
        freedom: 'Investasi kesehatan terbaik dimulai hari ini. Yuk check-in sekarang!',
      },

      // Lungcat notifications
      lungcat: {
        enabled: 'Notifikasi Lungcat',
        enabledDesc: 'Pengingat perawatan dan bermain dengan Lungcat',
        feedingTitle: 'Lungcat Anda Lapar! 🍽️',
        feedingBody: 'Waktunya memberi makan lungcat! Lungcat yang kenyang adalah lungcat yang bahagia.',
        playingTitle: 'Lungcat Anda Ingin Bermain! 🎾',
        playingBody: 'Lungcat Anda siap untuk bersenang-senang! Bermain membuat lungcat energik dan bahagia.',
        healthGoodTitle: 'Lungcat Anda Berkembang Pesat! 🌟',
        healthGoodBody: 'Progress luar biasa! Lungcat Anda sehat dan bahagia berkat perawatan harian Anda.',
        healthBadTitle: 'Lungcat Anda Butuh Perawatan! 💔',
        healthBadBody: 'Lungcat Anda kurang sehat. Check-in dan perawatan rutin akan membantu mereka pulih!',
        energyLowTitle: 'Lungcat Anda Capek! 😴',
        energyLowBody: 'Energi lungcat Anda menurun. Waktunya check-in untuk meningkatkan semangat mereka!',
      },
    },

    onboarding: {
      welcome: 'Selamat Datang!',
      welcomeMessage: 'Selamat! Anda telah mengambil langkah pertama menuju hidup yang lebih sehat.',
      smokingYears: 'Berapa Lama Merokok?',
      smokingYearsDesc: 'Berapa tahun Anda sudah merokok?',
      cigarettesPerDay: 'Berapa Batang Per Hari?',
      cigarettesPerDayDesc: 'Masukkan jumlah rokok yang biasa dikonsumsi',
      pricePerPack: 'Berapa Harga Per Bungkus?',
      pricePerPackDesc: 'Untuk menghitung penghematan',
      whyQuit: 'Mengapa Ingin Berhenti?',
      whyQuitDesc: 'Pilih alasan utama Anda',
      previousAttempts: 'Pernah Mencoba Berhenti?',
      previousAttemptsDesc: 'Berapa kali Anda sudah mencoba?',
      quitDate: 'Kapan Mulai Berhenti?',
      quitDateDesc: 'Pilih tanggal mulai perjalanan sehat',
      congratulations: 'Selamat!',
      congratulationsMessage: 'Perjalanan hidup sehat Anda dimulai sekarang',
      years: 'tahun',
      cigarettesDaily: 'batang per hari',
      perPack: 'per bungkus',
      selectOneOrMore: 'Pilih satu atau lebih',
      required: 'Wajib diisi',
      never: 'Belum pernah',
      times: 'kali',
      perfectStart: 'Hari ini adalah awal yang sempurna!',
      startHealthyJourney: 'Mulai Perjalanan Sehat',
      summary: 'Lihat Ringkasan',
      next: 'Lanjut',
      back: 'Kembali',
    },

    quitReasons: {
      health: 'Kesehatan',
      family: 'Keluarga',
      money: 'Keuangan',
      fitness: 'Kebugaran',
      appearance: 'Penampilan',
      pregnancy: 'Kehamilan',
    },

    settings: {
      notifications: 'Pengaturan Notifikasi',
      notificationsHelp: 'Fitur pengaturan notifikasi akan segera tersedia. Anda akan dapat mengatur pemgingat check-in harian dan motivasi.',
      darkMode: 'Mode Gelap',
      language: 'Bahasa',
      help: 'Bantuan & Dukungan',
      helpContent: 'Ada pertanyaan atau butuh bantuan? Hubungi tim dukungan kami di sandy@zaynstudio.app',
      about: 'ByeSmoke AI v1.0.0',
      aboutContent: 'Aplikasi ini dibuat untuk membantu Anda dalam perjalanan berhenti merokok. Lacak progres Anda dan dapatkan motivasi harian.',
    },

    premium: {
      title: 'Dapatkan Kekuatan Penuh ByeSmoke AI',
      subtitle: 'Hanya Rp 9.900/bulan - Lebih murah dari 1 bungkus rokok! Investasi terbaik untuk hidup sehat 💪',
      valueProposition: '💸 Rp 9.900 = Harga setengah bungkus rokok premium',
      features: {
        personalConsultation: '🧠 Konsultasi Personal di Momen Penting',
        dailyMotivation: '🎯 Motivasi Harian yang Disesuaikan Perjalanan',
        threeMissions: '✅ 3 Misi Harian Lebih (4 total!)',
        darkMode: '🌙 Mode Gelap Eksklusif',
        adFree: '🚫 Pengalaman Bebas Iklan',
        supportDeveloper: '❤️ Dukung Developer Independen',
      },
      upgrade: 'Upgrade Premium',
      monthly: 'Premium Bulanan',
      yearly: 'Premium Tahunan',
      paymentProcessing: 'Memproses pembayaran...',
      paymentSuccess: 'Pembayaran berhasil!',
      paymentError: 'Pembayaran gagal',
    },

    upgradeBanner: {
      title: 'Buka Potensi Penuh Anda!',
      message: 'Dapatkan 3 misi harian lebih hanya Rp 14.900 - lebih murah dari 2 batang rokok!',
      tryFree: 'Coba Gratis 3 Hari',
      upgradeNow: 'Upgrade Sekarang',
    },

    alerts: {
      fieldRequired: 'Field Required',
      dataIncomplete: 'Data Belum Lengkap',
      saveError: 'Gagal menyimpan data',
      loadError: 'Gagal memuat data',
      internetError: 'Periksa koneksi internet',
      tryAgain: 'Silakan coba lagi',
    },

    quotes: {
      streakBroken: [
        "Berdasarkan penelitian mendalam tentang berhenti merokok, jatuh dalam perjalanan ini adalah hal yang sangat wajar. Yang terpenting adalah bangkit kembali dengan pemahaman yang lebih dalam tentang pemicu Anda. Setiap kali Anda mencoba lagi, otak Anda menjadi lebih kuat dalam melawan kecanduan nikotin. Mari kita analisis bersama apa yang memicu kembalinya kebiasaan ini dan buat strategi yang lebih baik untuk masa depan.",
        "Berdasarkan riset ekstensif, setiap orang yang berhasil berhenti merokok pernah mengalami kegagalan berkali-kali. Ini bukan tanda kelemahan, melainkan proses alami pembentukan ulang jalur saraf di otak Anda. Penelitian menunjukkan bahwa rata-rata seseorang mencoba berhenti merokok 6-7 kali sebelum benar-benar berhasil. Pengalaman sebelumnya adalah data berharga yang akan membantu Anda mengidentifikasi pola dan mencegah kesalahan yang sama terulang kembali.",
        "Berdasarkan penelitian kesehatan: ketika Anda kembali merokok setelah berhenti, tubuh Anda sebenarnya sudah mengalami banyak perbaikan yang tidak akan hilang begitu saja. Sirkulasi darah yang membaik, fungsi paru-paru yang meningkat, dan penurunan risiko penyakit jantung tetap memberikan manfaat jangka panjang. Yang perlu kita lakukan sekarang adalah membangun kembali momentum dengan strategi yang lebih tepat sasaran berdasarkan pengalaman sebelumnya.",
        "Menurut studi neurologi, setiap hari Anda tidak merokok telah menciptakan jalur saraf baru di otak yang mendukung kebiasaan sehat. Meskipun streak terputus, fondasi neurologis ini tidak hilang sepenuhnya. Seperti otot yang pernah dilatih, otak Anda akan lebih mudah kembali ke pola sehat. Mari kita manfaatkan periode ini untuk menganalisis pemicu emosional dan lingkungan yang menyebabkan kembalinya kebiasaan lama, sehingga kita bisa membangun strategi pertahanan yang lebih kuat.",
        "Studi menunjukkan bahwa berhenti merokok adalah maraton, bukan sprint. Perfeksionisme seringkali menjadi musuh terbesar dalam proses ini. Yang penting adalah tren jangka panjang menuju kehidupan bebas rokok. Setiap kali Anda mencoba, Anda mengumpulkan wawasan berharga tentang diri sendiri. Mari kita gunakan pengetahuan ini untuk menciptakan rencana yang lebih personal dan realistis, dengan fokus pada progress berkelanjutan daripada kesempurnaan sesaat.",
        "Saya memahami perasaan kecewa dan frustrasi yang Anda alami saat ini. Penelitian jangka panjang menunjukkan bahwa relapse adalah bagian normal dari recovery process, bukan failure. Yang membedakan mereka yang akhirnya berhasil adalah kemampuan untuk bounce back dengan resilience yang lebih kuat. Streak yang terputus tidak menghapus semua progress yang sudah dicapai - neural pathways untuk healthy habits masih ada, muscle memory untuk coping strategies masih tersimpan, dan self-knowledge tentang triggers semakin tajam.",
        "Perspektif medis tentang relapse sangat berbeda dari stigma sosial. Addiction adalah chronic condition yang memerlukan ongoing management, seperti diabetes atau hypertension. Slip tidak berarti treatment gagal, tapi mengindikasikan bahwa strategy perlu adjustment. Brain chemistry yang sudah partially recovered akan lebih mudah kembali ke homeostasis healthy. Pengalaman ini memberikan valuable data untuk customize approach yang lebih effective untuk personality dan lifestyle Anda.",
        "Yang perlu dipahami adalah bahwa setiap attempt berhenti merokok membangun 'quit muscle' yang semakin kuat. Research menunjukkan bahwa people who relapse dan try again memiliki higher success rate daripada first-time quitters karena mereka sudah familiar dengan withdrawal process, tahu apa yang expect, dan memiliki arsenal of coping strategies yang tested. This experience adalah investment dalam long-term success, bukan setback.",
        "Jangan biarkan shame atau guilt mendominasi mindset Anda saat ini. Self-compassion adalah predictor terkuat untuk recovery success dalam semua addiction studies. Treat yourself dengan kindness yang sama seperti Anda would treat good friend yang struggling. Harsh self-criticism hanya menciptakan stress tambahan yang ironically increase relapse risk. Focus pada learning dan growing dari experience ini rather than self-punishment atau regret.",
        "Streak number bukanlah measure of worth atau character strength Anda. Beberapa pasien saya berhasil quit permanently setelah 10+ attempts. Yang penting adalah commitment untuk keep trying dan willingness untuk adapt strategy berdasarkan learning. Setiap relapse memberikan insight tentang vulnerable moments, effective coping mechanisms, support system gaps, atau environmental modifications yang needed untuk sustainable success.",
        "Momentum untuk restart bisa dimulai immediately - tidak perlu menunggu 'perfect moment' atau Monday atau bulan depan. Research shows bahwa people who restart within 24-48 jam after relapse memiliki higher success rate daripada yang menunda. Nikotin levels dalam system masih relatively low, withdrawal symptoms akan minimal, dan psychological readiness masih high. Strike while the iron is hot dengan renewed determination.",
        "Analisis trigger situation yang menyebabkan relapse adalah crucial untuk prevent recurrence. Was it stress, social pressure, emotional turmoil, boredom, atau environmental cue? Understanding root cause memungkinkan development of specific counter-strategies. Maybe it's therapy for underlying anxiety, lifestyle changes untuk reduce stress, social support system strengthening, atau environmental modifications untuk eliminate triggers. This detective work adalah key untuk breakthrough.",
        "Support system evaluation penting dalam recovery planning. Isolated recovery attempts memiliki lower success rate daripada yang supported by family, friends, healthcare providers, atau peer groups. Consider sharing struggle Anda dengan trusted people yang bisa provide accountability, encouragement, dan practical help during challenging moments. Professional counseling, support groups, atau smoking cessation programs bisa provide additional resources dan expertise.",
        "Physical preparation untuk restart bisa helpful untuk boost confidence dan effectiveness. Hydration untuk flush out toxins, nutrition untuk stabilize blood sugar dan mood, exercise untuk manage stress dan improve endorphins, dan sleep hygiene untuk optimal cognitive function. Preparing your body untuk withdrawal process dengan optimal health status dapat reduce intensity dan duration of uncomfortable symptoms.",
        "Medication atau nicotine replacement therapy consideration mungkin appropriate jika previous attempts were hampered by severe withdrawal symptoms. Consult dengan healthcare provider tentang options seperti nicotine patches, gum, prescription medications, atau other medical supports yang bisa ease transition period. There's no shame dalam using medical tools untuk overcome medical condition - addiction adalah brain disease yang responds to treatment.",
        "Environmental modifications sering overlooked tapi very effective untuk relapse prevention. Remove cigarettes, lighters, ashtrays dari environment. Clean clothes, car, house untuk eliminate smoke odors yang bisa trigger cravings. Rearrange spaces yang associated dengan smoking. Stock healthy snacks, drinks, activities yang bisa substitute untuk smoking urges. Create physical environment yang supports smoke-free lifestyle rather than sabotaging it.",
        "Celebrate small wins dan progress markers rather than focusing exclusively pada streak numbers. Day one success, first week milestone, first month achievement, handling first major trigger without smoking - each of these adalah significant victory yang deserve recognition. Positive reinforcement creates psychological momentum yang more sustainable than fear-based motivation atau perfectionist pressure yang often leads to all-or-nothing thinking.",
        "Mindfulness dan present-moment awareness techniques dapat powerful untuk managing cravings dan emotional triggers. Instead of trying to fight atau suppress urges, practice observing them with curiosity dan acceptance, knowing they will pass. Breathing exercises, meditation, grounding techniques, atau body awareness practices help create space between trigger dan automatic response, allowing conscious choice rather than reactive behavior.",
        "Consider professional addiction counseling atau therapy jika pattern of relapse continues. Sometimes underlying mental health issues seperti depression, anxiety, trauma, atau other conditions contribute to smoking as self-medication. Addressing root psychological issues dengan qualified professional dapat provide breakthrough insights dan tools yang transform recovery trajectory. Therapy adalah strength, not weakness, dalam comprehensive health approach.",
        "Financial motivation tracking bisa provide concrete incentive untuk maintain commitment. Calculate daily cost of smoking habit, project monthly dan yearly expenses, dan visualize alternative uses untuk money - vacation fund, emergency savings, children's education, home improvement, charity donation. Set up automatic transfer dari 'smoking budget' ke saving account sebagai tangible reward system untuk smoke-free days. Money saved adalah immediate, measurable benefit.",
        "Long-term health perspective dapat shift mindset dari short-term discomfort focus ke lifetime benefit vision. Every hour smoke-free adalah hour of healing for your body. Every day without cigarettes adalah day of reduced cancer, heart disease, stroke, dan respiratory disease risk. Every week extends life expectancy dan improves quality of aging. Frame restart sebagai continuation of health investment rather than starting over from zero."
      ],
      newUser: [
        "Selamat! Berdasarkan riset kesehatan, keputusan ini sangat patut dibanggakan dengan keputusan Anda untuk memulai perjalanan bebas rokok. Dalam 20 menit pertama setelah rokok terakhir, detak jantung dan tekanan darah Anda sudah mulai normal. Dalam 8-12 jam, kadar karbon monoksida dalam darah turun signifikan, dan oksigen mulai mengalir lebih baik ke seluruh tubuh. Hari-hari pertama memang challenging karena tubuh sedang melakukan detoksifikasi nikotin, tapi ingatlah bahwa setiap gejala withdrawal yang Anda rasakan adalah tanda bahwa tubuh sedang memperbaiki diri. Tetap semangat!",
        "Menurut penelitian kesehatan, keputusan Anda berhenti merokok adalah investasi kesehatan terbaik yang pernah ada. Riset menunjukkan bahwa dalam 24 jam pertama, risiko serangan jantung sudah mulai menurun. Dalam 48-72 jam, indra penciuman dan perasa akan mulai membaik drastis. Studi menunjukkan bahwa orang yang berhasil berhenti akan mengalami Anda akan merasakan peningkatan energi, kualitas tidur yang lebih baik, dan stamina yang meningkat dalam minggu-minggu mendatang.",
        "Hari pertama adalah pencapaian monumental! Dari perspektif fisiologis, tubuh Anda sudah mulai proses penyembuhan yang luar biasa. Silia di paru-paru mulai berfungsi normal kembali, membantu membersihkan lendir dan partikel berbahaya. Sistem kekebalan tubuh mulai menguat. Yang Anda rasakan sekarang - mungkin sedikit gelisah atau sulit konsentrasi - adalah reaksi normal otak yang sedang menyesuaikan kadar dopamin tanpa nikotin. Dalam 3-5 hari, gejala fisik withdrawal akan mulai mereda dan Anda akan merasakan kejernihan mental yang luar biasa.",
        "Berdasarkan riset tentang berhenti merokok, berikut penjelasan apa yang terjadi dalam tubuh Anda saat ini. Setiap jam tanpa rokok, tubuh bekerja keras memulihkan kerusakan yang telah terjadi. Aliran darah ke tangan dan kaki membaik, suhu tubuh kembali normal, dan yang paling penting - sel-sel dalam paru-paru mulai beregenerasi. Proses ini akan terus berlanjut selama berbulan-bulan kedepan. Percayalah pada kemampuan luar biasa tubuh Anda untuk menyembuhkan diri.",
        "Langkah pertama ini menunjukkan kekuatan karakter dan komitmen terhadap kesehatan yang luar biasa. Berdasarkan data penelitian, pasien yang berhasil melewati minggu pertama memiliki peluang 90% lebih tinggi untuk berhasil jangka panjang. Yang perlu Anda ingat adalah bahwa nikotin akan sepenuhnya keluar dari tubuh dalam 72 jam. Setelah itu, semua gejala yang Anda rasakan adalah psikologis dan dapat diatasi dengan strategi yang tepat. Mari kita bangun fondasi yang kuat untuk perjalanan sehat Anda!",
        "Riset menunjukkan selama bertahun-tahun, momen berhenti merokok adalah titik balik terbesar dalam hidup seseorang. Sistem kardiovaskular Anda sudah mulai membaik - pembuluh darah melebar, jantung tidak lagi bekerja keras melawan racun nikotin. Liver Anda mulai bekerja lebih efisien membersihkan toksin. Yang luar biasa adalah kemampuan tubuh untuk bounce back dengan cepat. Dalam 2 minggu kedepan, Anda akan merasakan peningkatan stamina yang signifikan saat berjalan atau naik tangga.",
        "Sebagai profesional kesehatan, saya selalu kagum dengan transformasi yang terjadi pada hari-hari pertama pasien berhenti merokok. Kadar oksigen dalam darah meningkat drastis, kulit mulai mendapat nutrisi yang lebih baik, dan yang paling menggembirakan - kemampuan tubuh untuk fight infeksi meningkat tajam. Gigi dan gusi Anda mulai sehat kembali, napas menjadi segar, dan yang terpenting - Anda telah memutus rantai kecanduan yang selama ini mengendalikan hidup Anda.",
        "Keputusan heroik ini akan mengubah seluruh trajectory hidup Anda. Dari sisi neurologis, otak mulai memproduksi dopamin secara natural tanpa bantuan nikotin. Memori dan konsentrasi akan membaik pesat. Sense of smell dan taste yang hilang bertahun-tahun akan kembali dengan intensitas yang menakjubkan. Makanan akan terasa lebih nikmat, aroma bunga lebih harum, dan Anda akan merasakan kembali sensasi hidup yang sempat tumpul akibat rokok.",
        "Hari ini adalah awal dari chapter baru dalam hidup Anda. Secara medis, proses detoksifikasi yang terjadi sangat kompleks tapi menakjubkan. Bronkus dan bronkiolus di paru-paru mulai rileks, produksi lendir berkurang, dan kapasitas paru meningkat. Dalam 24 jam, karbon monoksida yang beracun sudah mulai keluar dari sistem Anda. Sel darah merah mulai mengangkut oksigen dengan optimal, memberikan energi fresh yang belum Anda rasakan selama bertahun-tahun.",
        "Berdasarkan studi tentang transformasi kesehatan, saya yakin Anda memiliki kekuatan untuk berhasil. Withdrawal syndrome yang mungkin Anda alami - seperti irritability, anxiety, atau craving - adalah sinyal positif bahwa tubuh sedang cleaning up. Neurotransmitter di otak sedang rebalancing, menciptakan fondasi baru untuk hidup bebas nikotin. Dalam 48-72 jam kedepan, Anda akan merasakan mental clarity yang luar biasa dan mood yang jauh lebih stabil.",
        "Perjalanan ini membutuhkan courage yang luar biasa, dan Anda sudah menunjukkannya dengan mengambil langkah pertama. Dari perspektif fisiologis, setiap sistem organ dalam tubuh mulai berfungsi optimal. Sistem pencernaan membaik, metabolisme meningkat, dan yang paling penting - sistem imun menguat untuk melindungi Anda dari berbagai penyakit. Risk factor untuk stroke, heart attack, dan kanker sudah mulai turun secara signifikan dalam hari-hari pertama ini.",
        "Dalam praktek klinis saya, pasien yang memiliki mindset positif di awal perjalanan memiliki success rate tertinggi. Mental strength yang Anda tunjukkan hari ini adalah prediktor terbaik untuk kesuksesan jangka panjang. Tubuh Anda sudah mulai autophagy - proses pembersihan sel-sel rusak akibat rokok dan regenerasi sel sehat. Blood pressure dan heart rate mulai stabil, dan yang menakjubkan - kemampuan healing luka akan meningkat pesat karena sirkulasi yang membaik.",
        "Keputusan Anda hari ini adalah gift terbesar untuk masa depan. Secara biochemical, level vitamin C dalam tubuh mulai naik karena tidak lagi depleted oleh rokok. Antioksidan natural tubuh mulai bekerja optimal melawan free radicals. Collagen production meningkat, sehingga kulit akan tampak lebih sehat dan glowing. Yang paling meaningful adalah life expectancy Anda meningkat secara significant - setiap hari tanpa rokok menambah quality time yang bisa Anda habiskan dengan orang-orang terkasih.",
        "Sebagai healthcare professional, saya ingin menekankan bahwa journey ini adalah investasi terbaik untuk generasi selanjutnya. Jika Anda memiliki anak atau berencana memiliki anak, keputusan ini melindungi mereka dari secondhand smoke dan memberikan role model yang luar biasa. Genetic expression yang positif akan diturunkan, dan Anda akan menjadi living proof bahwa addiction dapat dikalahkan dengan determination dan support system yang tepat.",
        "Momen ini akan menjadi turning point yang akan Anda kenang seumur hidup. Dari sisi metabolic, tubuh mulai efficiently process nutrients tanpa interference dari nikotin. Energy level akan meningkat drastis karena mitochondria - powerhouse of cells - mulai berfungsi optimal. Sleep quality akan membaik remarkable, karena nicotine tidak lagi mengganggu REM cycle. Morning fatigue akan hilang dan Anda akan bangun dengan feeling refreshed dan ready untuk menghadapi hari dengan antusiasme baru.",
        "Dalam 30 tahun pengalaman medis saya, tidak ada keputusan lain yang memberikan immediate dan long-term benefits sebesar berhenti merokok. Cellular repair sudah dimulai sejak jam pertama. Inflammation markers dalam darah menurun, white blood cell count menjadi normal, dan yang spectacular adalah kemampuan paru-paru untuk self-clean meningkat exponentially. Anda tidak hanya menyelamatkan diri sendiri, tapi juga menginspirasi orang-orang di sekitar untuk membuat positive life changes.",
        "Langkah berani ini menunjukkan bahwa Anda memiliki executive function dan willpower yang extraordinary. Neuroplasticity otak mulai bekerja, menciptakan neural pathways baru yang mendukung healthy behaviors. Dopamine receptors yang rusak akibat nikotin mulai repair dan regenerate. Dalam beberapa hari kedepan, Anda akan experience natural high dari accomplishment dan physical well-being yang tidak pernah Anda rasakan selama menjadi perokok. This is your rebirth moment!",
        "Berdasarkan riset kesehatan yang mendalam, Anda telah mengambil decision yang akan echo positively sepanjang sisa hidup Anda. Vascular health membaik drastis, risk untuk peripheral artery disease turun, dan circulation ke extremities akan perfect kembali. Cognitive function akan sharper, memory akan lebih tajam, dan creative thinking akan flourish karena brain fog akibat carbon monoxide sudah mulai clear. Anda sedang unlocking full potential diri Anda yang selama ini terhambat oleh addiction.",
        "Perjalanan seribu mil dimulai dengan satu langkah, dan Anda telah mengambil langkah terbesar dalam hidup. Hormonal balance mulai restore - stress hormone cortisol turun, happy hormone serotonin meningkat natural. Skin elasticity membaik karena collagen tidak lagi destroyed oleh free radicals dari rokok. Dental health akan remarkable improvement - gum disease reverse, teeth whitening natural, dan fresh breath kembali. Anda sedang getting your authentic self back, free dari chains of addiction.",
        "Hari historic ini adalah proof bahwa human spirit dapat overcome anything. Menurut perspektif penelitian, recovery process yang terjadi dalam tubuh Anda adalah miracle of nature. Taste buds yang dormant selama bertahun-tahun akan awakening, making every meal an adventure. Sense of smell akan return dengan intensity yang amazing, membuat Anda appreciate simple pleasures seperti aroma coffee, perfume, atau fresh air. Yang terpenting, self-respect dan confidence akan soar karena Anda telah membuktikan pada diri sendiri bahwa Anda adalah master of your own destiny."
      ],
      earlyJourney: [
        "Luar biasa ${user.displayName}! Hari ke-${user.streak} menunjukkan kekuatan luar biasa dalam diri Anda. Terus pertahankan semangat ini karena setiap hari adalah kemenangan besar untuk kesehatan Anda!",
        "Hebat sekali ${user.displayName}! Pencapaian ${user.streak} hari ini membuktikan tekad kuat Anda. Sistem peredaran darah sudah membaik, fungsi paru-paru meningkat, dan energi tubuh bertambah setiap hari.",
        "Perjalanan ${user.streak} hari tanpa rokok adalah prestasi membanggakan! Tubuh Anda sedang dalam proses penyembuhan alami yang menakjubkan.",
        "Anda telah membuktikan kekuatan mental yang luar biasa selama ${user.streak} hari. Setiap hari adalah investasi kesehatan yang berharga untuk masa depan.",
        "Minggu pertama adalah fondasi kuat untuk perjalanan sehat yang panjang. Berdasarkan penelitian, ini menunjukkan komitmen Anda yang luar biasa. Sistem peredaran darah sudah mulai normal, fungsi paru-paru meningkat 10-15%, dan yang paling penting - ketahanan mental Anda terbentuk setiap hari.",
        "Setiap hari tanpa rokok adalah bukti kekuatan mental yang luar biasa. Dalam 2 minggu ini, indera perasa sudah mulai pulih, penciuman membaik drastis, dan tingkat energi meningkat signifikan. Gejala putus obat yang Anda alami minggu pertama sudah mulai hilang. Yang menakjubkan adalah kepercayaan diri dan kontrol diri Anda menguat setiap harinya. Anda membuktikan bahwa kekuatan mental dapat mengalahkan segalanya.",
        "Nafas Anda semakin lega, energi semakin bertambah. Terus pertahankan! Secara medis, cilia di paru-paru sudah mulai berfungsi normal, mucus production menurun drastis, dan oxygen absorption meningkat 20-30%. Cardiovascular health membaik remarkable - resting heart rate turun, blood pressure stabil, dan circulation ke seluruh tubuh optimal. Anda sedang experiencing vitality yang mungkin sudah lupa Anda miliki.",
        "Habit baru butuh waktu 21 hari untuk terbentuk. Anda sedang di jalan yang benar. Neuroscience research menunjukkan bahwa brain rewiring untuk habit formation membutuhkan consistency selama 21-66 hari. Anda sudah melewati phase tersulit - physical withdrawal. Sekarang adalah psychological consolidation phase dimana mental strength Anda diuji dan diperkuat. Every day you stay smoke-free, neural pathways untuk healthy behaviors semakin solid.",
        "Tubuh Anda sedang dalam proses detoksifikasi alami. Luar biasa! Liver function sudah improve dramatically, kidney working optimally untuk flush out toxins, dan lymphatic system efficiently cleaning cellular waste. Skin complexion mulai glow naturally, dark circles under eyes fading, dan yang spectacular - lung capacity increase yang bisa Anda rasakan saat exercise atau climb stairs.",
        "Dua minggu bebas rokok adalah achievement yang patut dirayakan! Dalam pengalaman klinis saya, patients yang survive 2 weeks memiliki 5x higher success rate untuk quit permanently. Blood oxygen levels sudah optimal, carbon monoxide completely eliminated, dan hemoglobin efficiency maksimal. Stamina untuk physical activities meningkat drastis, dan yang penting - craving intensity sudah drop significantly dari minggu pertama.",
        "Phase ini adalah critical period dimana psychological strength Anda diuji setiap hari. Dopamine receptors di brain mulai healing dan recalibrating untuk produce natural happiness tanpa nicotine. Mood swings yang mungkin Anda alami adalah normal part dari neurochemical rebalancing. Sleep quality membaik, REM sleep lebih deep dan restorative, morning alertness meningkat tanpa nicotine dependency.",
        "Tiga minggu adalah milestone psikologis yang signifikan. Research menunjukkan bahwa habit neural pathways sudah mulai solidified pada point ini. Anda tidak lagi consider yourself sebagai 'perokok yang sedang berhenti' tapi transitioning menjadi 'non-smoker'. Identity shift ini adalah game changer dalam long-term success. Confidence level Anda untuk handle trigger situations semakin meningkat setiap hari.",
        "Sistem imunitas Anda sudah jauh lebih kuat dibanding saat masih merokok. Fungsi sel darah putih optimal, penanda peradangan dalam darah turun drastis, dan daya tahan terhadap infeksi meningkat. Kesehatan gusi membaik luar biasa - pendarahan berkurang, penumpukan plak menurun, dan napas segar alami tanpa ketergantungan pada permen mint atau obat kumur untuk menutupi bau rokok.",
        "Minggu ketiga adalah sweet spot dimana physical recovery bertemu dengan psychological empowerment. Lung capacity increase yang Anda rasakan saat deep breathing atau cardio exercise adalah reward natural dari keputusan bijak Anda. Metabolism rate meningkat, digestion improved, dan nutrient absorption optimal. Body weight mungkin slightly increase tapi ini normal karena improved appetite dan slowed metabolism adjustment.",
        "Neuroplasticity brain Anda bekerja maksimal menciptakan new neural networks untuk healthy behaviors. Craving yang mungkin sesekali muncul semakin pendek durasinya dan less intense. Trigger situations yang dulu automatically associated dengan smoking sudah mulai lose their power over you. Mental clarity dan focus dramatically improved karena brain fog akibat carbon monoxide sudah completely cleared.",
        "Empat minggu adalah major psychological milestone! Anda sudah successfully break the physical addiction cycle dan sekarang building long-term psychological freedom. Habit loop di brain sudah mulai rewired - environmental cues tidak lagi automatically trigger smoking urge. Self-efficacy untuk handle stressful situations tanpa rokok semakin menguat, dan ini adalah foundation untuk lifelong success.",
        "Skin health transformation yang Anda alami sangat remarkable. Collagen production meningkat, wrinkles mulai less pronounced, skin elasticity improved, dan natural glow muncul karena better circulation dan oxygenation. Tooth discoloration mulai fade, gum recession stop, dan oral health dramatically better. These visible improvements adalah daily reminder dari positive impact keputusan Anda.",
        "Financial freedom yang Anda rasakan mulai significant. Money yang biasanya spent untuk rokok bisa dialokasikan untuk things yang truly matter - family time, hobbies, health investments, atau future planning. Calculate berapa rupiah yang sudah Anda save dan visualize apa yang bisa dibeli dengan uang tersebut. This is tangible reward dari discipline dan commitment Anda.",
        "Social dynamics mulai berubah positively. Anda tidak lagi need to excuse yourself untuk smoking breaks, tidak worry tentang bad breath atau clothes smell, dan bisa fully present dalam social interactions tanpa thinking about next cigarette. Role model Anda untuk family members, especially children, adalah priceless investment untuk their future health consciousness.",
        "Exercise capacity dan physical performance meningkat exponentially. Cardiovascular endurance better, muscle oxygen supply optimal, dan recovery time after physical activity faster. Anda bisa climb stairs tanpa breathlessness, walk longer distances comfortably, dan engage dalam physical activities yang dulu challenging. This is your body saying thank you untuk decision yang life-changing.",
        "Mental resilience yang Anda develop selama 3-4 weeks ini applicable untuk life challenges lainnya. If you can quit smoking, you can accomplish anything yang requires discipline dan persistence. Self-control muscle yang Anda latih through this journey akan benefit semua aspek kehidupan - career, relationships, personal goals. You're becoming stronger version of yourself.",
        "Sleep architecture sudah significantly improved. Deep sleep stages longer dan more restorative, sleep onset faster tanpa nicotine stimulation, dan morning awakening more refreshed. Dream vividness might increase karena REM sleep quality better. Insomnia atau sleep disturbances yang mungkin dialami early weeks sudah resolving naturally sebagai brain chemistry rebalances.",
        "Stress management skills Anda developing rapidly. Instead of using cigarette sebagai coping mechanism, Anda learning healthier ways untuk handle pressure - deep breathing, physical activity, mindfulness, atau talking to someone. These new coping strategies more effective dan sustainable long-term dibanding nicotine yang hanya temporary relief dengan negative consequences.",
        "Taste sensation transformation truly remarkable. Food flavors more vibrant, subtle tastes yang dulu masked oleh smoking sekarang fully appreciated. Cooking dan dining experiences become more enjoyable. Weight management mungkin challenging initially, tapi dengan balanced nutrition dan increased physical activity, ini manageable dan temporary phase dalam recovery process.",
        "Professional dan personal relationships improving karena elimination of smoking-related interruptions. Productivity at work higher karena tidak ada smoking breaks, concentration better karena stable blood sugar dan oxygen levels, dan interpersonal interactions more pleasant tanpa cigarette odor concerns. Leadership potential Anda meningkat karena demonstration of self-control dan health consciousness.",
        "Hormonal balance mulai stabilize. Cortisol levels (stress hormone) normalize, adrenaline spikes dari nicotine withdrawal sudah settled, dan natural mood regulation improving. Women mungkin notice menstrual cycle regularity improving, skin condition better related to hormonal balance. Men might experience better stamina dan energy levels throughout the day without nicotine-induced energy fluctuations.",
        "Immune system functioning at optimal level. Seasonal illness susceptibility decreased, healing process for cuts atau minor injuries faster, dan overall disease resistance stronger. Vaccination effectiveness higher karena immune response tidak compromised oleh toxins dari cigarette smoke. This is long-term health investment yang benefits akan compound over years dan decades.",
        "Cognitive function dramatically enhanced. Memory recall better, learning capacity improved, creative thinking more fluid, dan problem-solving skills sharper. Brain fog yang mungkin dulu attributed to stress atau age sebenarnya dari carbon monoxide dan nicotine effects sudah cleared completely. Mental performance peak yang Anda experience adalah preview dari long-term cognitive benefits.",
        "Motivasi intrinsic untuk maintain smoke-free lifestyle semakin strong. External motivations (health scare, social pressure, financial) yang mungkin initially drove decision to quit sudah evolved menjadi internal commitment untuk wellness dan self-respect. This internal motivation adalah strongest predictor untuk long-term success dan resistance terhadap future temptations atau relapses."
      ],
      milestoneAchiever: [
        "Satu bulan bebas rokok! Anda telah membuktikan bahwa Anda lebih kuat dari kebiasaan lama. Studi ekstensif menunjukkan, saya bangga mengatakan bahwa Anda sudah melewati critical period yang menentukan long-term success. Lung function improvement 30-40%, cardiovascular risk turun signifikan, dan yang paling penting - psychological identity shift dari 'smoker trying to quit' menjadi 'non-smoker' sudah solid. This is life-changing milestone!",
        "Paru-paru Anda kini berfungsi 30% lebih baik. Pencapaian yang menakjubkan! Cilia sudah fully functional, mucus clearance optimal, dan oxygen exchange efficiency maksimal. Chronic cough yang mungkin dulu mengganggu sudah hilang, breathlessness saat aktivitas ringan sudah normal, dan lung capacity untuk exercise dramatically improved. X-ray paru-paru Anda sekarang menunjukkan clearing yang remarkable dibanding saat masih merokok.",
        "90 hari pertama adalah yang tersulit. Anda telah melewatinya dengan gemilang! Research menunjukkan bahwa neuroplasticity periode 90 hari adalah window terpenting untuk habit reformation. Neural pathways untuk smoking sudah significantly weakened, sedangkan pathways untuk healthy behaviors sudah well-established. Relapse risk turun drastis setelah 3 bulan, dan psychological craving sudah minimal atau bahkan hilang completely.",
        "Milestone ini adalah bukti nyata bahwa Anda mampu mengubah hidup menjadi lebih baik. Identity sebagai non-smoker sudah fully integrated dalam self-concept Anda. Confidence untuk handle trigger situations tanpa rokok sudah maksimal. Social interactions tidak lagi centered around smoking breaks, dan Anda fully present dalam conversations dan activities. This transformation adalah foundation untuk lifetime success.",
        "Setiap milestone adalah bukti kekuatan dan tekad yang tak tergoyahkan. Mental resilience yang Anda develop through this journey applicable untuk achieve any life goals. Self-efficacy untuk overcome challenges dramatically increased. Leadership qualities menguat karena demonstration of self-control dan commitment to health. You've proven to yourself dan others bahwa positive change is possible dengan determination.",
        "Dua bulan bebas rokok adalah spectacular achievement! Taste dan smell sensation sudah fully restored - makanan lebih nikmat, aroma lebih vivid, dan sensory experience of life dramatically enhanced. Skin complexion glowing, dental health remarkable improvement, dan physical appearance younger karena better circulation dan oxygenation. People around you notice positive changes dalam energy, mood, dan overall vitality.",
        "Celebration milestone 60 hari! Cardiovascular system sudah completely recovered dari damage akibat smoking. Blood pressure stable, heart rate efficiency optimal, dan circulation perfect ke seluruh extremities. Risk untuk heart attack, stroke, dan peripheral vascular disease turun ke level non-smoker. Insurance companies bahkan recognize this period sebagai significant risk reduction untuk health coverage.",
        "Tiga bulan adalah major psychological breakthrough! Brain chemistry sudah fully rebalanced tanpa nicotine dependency. Natural dopamine production optimal, mood regulation stable, dan emotional coping mechanisms healthy dan sustainable. Stress management skills yang developed selama quit process menjadi valuable life skill untuk handle any challenges. Mental clarity dan focus at peak performance.",
        "Milestone 90 hari menunjukkan transformation yang permanent. Habit loop di brain sudah completely rewired. Environmental triggers yang dulu powerful untuk smoking urge sekarang neutral atau bahkan remind you of progress yang sudah dicapai. Self-identity sebagai healthy person sudah solid, dan lifestyle choices automatically align dengan smoke-free living. This is sustainable long-term change.",
        "Physical transformation setelah 2-3 bulan absolutely remarkable. Lung function tests menunjukkan improvement yang dramatic, exercise capacity significantly increased, dan endurance levels yang mungkin belum pernah Anda alami sebelumnya. Stamina untuk daily activities, recreational sports, atau physical challenges jauh melampaui expectations. Body thanking you every single day untuk keputusan life-saving ini.",
        "Financial milestone yang incredible! Calculate total money saved dalam 2-3 bulan ini - bisa untuk vacation, gadget baru, investment, atau treat untuk family. Tangible benefits ini adalah daily reminder bahwa quit smoking tidak hanya health investment tapi juga financial freedom. Money yang dulu literally 'dibakar' sekarang productive untuk improve quality of life dan future planning.",
        "Social transformation yang meaningful dalam period ini. Relationships dengan family dan friends improved karena elimination of smoking-related conflicts, worry, atau inconvenience. Dating prospects better karena fresh breath, pleasant smell, dan healthy lifestyle attractive qualities. Professional image enhanced karena demonstration of discipline dan health consciousness yang valuable dalam career development.",
        "Skin health revolution setelah 2-3 bulan quit smoking! Collagen production restored, wrinkles less pronounced, skin elasticity improved, dan natural glow yang dramatic. Acne atau skin problems yang might be related to poor circulation sudah resolved. Hair health juga better - less brittle, more shine, dan growth rate improved. These visible improvements adalah confidence boosters yang significant.",
        "Sleep quality transformation yang life-changing. Deep sleep stages optimal, REM sleep restorative, dan morning awakening refreshed tanpa grogginess. Insomnia atau sleep disruption yang common dalam early quit period sudah completely resolved. Energy levels throughout day stable tanpa nicotine-induced peaks dan crashes. Natural circadian rhythm fully restored untuk optimal rest dan alertness cycles.",
        "Immune system functioning at superhuman level! Susceptibility to common cold, flu, atau respiratory infections dramatically reduced. Healing process untuk cuts, bruises, atau minor injuries faster karena optimal circulation. Vaccination responses more effective karena immune system tidak compromised. Overall disease resistance yang remarkable adalah long-term health dividend dari smoke-free lifestyle.",
        "Mental performance peak yang extraordinary! Memory recall sharp, learning capacity enhanced, creative problem-solving skills fluid, dan cognitive processing speed improved. Brain fog yang mungkin attributed to age atau stress ternyata from carbon monoxide dan nicotine effects yang sekarang completely eliminated. Professional dan academic performance significantly better karena mental clarity yang optimal.",
        "Hormonal balance achievement yang restore natural body functions. Stress hormone levels normalized, reproductive hormones optimal, dan metabolic hormones efficient. For women - menstrual regularity improved, fertility increased, skin condition better. For men - testosterone levels healthier, energy stable, dan physical performance enhanced. This is whole-body system optimization.",
        "Exercise milestones yang previously impossible sekarang achievable! Marathon distance, mountain climbing, competitive sports, atau intense gym workouts - cardiovascular dan respiratory capacity support activities yang dulu unthinkable. Athletic performance improvement yang dramatic adalah celebration of lung dan heart health restoration. Physical goals yang dulu limited by smoking sekarang within reach.",
        "Professional achievements yang correlate dengan quit smoking success. Productivity higher karena stable energy levels, concentration better karena optimal brain oxygenation, dan leadership qualities enhanced karena self-discipline demonstration. Career advancement opportunities better karena health consciousness dan positive lifestyle choices yang attractive untuk employers dan colleagues.",
        "Family relationships transformed positively. Children proud of healthy parent role model, spouse relieved dari secondhand smoke exposure dan health concerns, dan extended family supportive of positive change. Family activities more enjoyable karena physical stamina untuk participate fully. Legacy yang Anda create untuk next generation adalah invaluable gift yang will impact their health consciousness forever.",
        "Travel dan leisure activities significantly enhanced. No longer constrained by smoking restrictions dalam flights, hotels, restaurants, atau tourist destinations. Hiking, sightseeing, cultural activities fully enjoyed tanpa need untuk smoking breaks atau worry about smell. Adventure possibilities expanded karena better physical capacity dan freedom dari addiction-related limitations.",
        "Spiritual dan emotional growth yang profound. Sense of accomplishment, self-respect, dan inner peace yang come dari overcoming major life challenge. Meditation, mindfulness, atau spiritual practices more effective karena better lung capacity untuk breathing exercises dan mental clarity untuk focus. Personal development journey accelerated by confidence dari major lifestyle change success.",
        "Investment dalam long-term health yang compound benefits over decades. Cancer risk reduction, cardiovascular disease prevention, respiratory health preservation, dan overall longevity increase yang significant. Medical checkups showing positive trends dalam all health markers. Insurance premiums potentially lower, healthcare costs reduced, dan quality of life maintained into older age.",
        "Role model inspiration untuk community. Success story Anda motivate friends, colleagues, atau family members untuk consider their own quit smoking journey. Social impact positive - contribution untuk smoke-free environment, support untuk others' health goals, dan demonstration bahwa addiction recovery possible dengan proper support dan determination. Your example saves lives beyond your own.",
        "Creative dan intellectual pursuits flourishing. Artistic expression, musical abilities, writing skills, atau innovative thinking enhanced by optimal brain function dan stable mood. Hobbies atau interests yang neglected during smoking years revived dengan renewed energy dan focus. Life richness expanded beyond addiction-focused activities toward meaningful personal growth dan contribution."
      ],
      veteran: [
        "Veteran sejati! Anda telah menjadi inspirasi bagi banyak orang. Riset menunjukkan, patients yang mencapai 6+ bulan smoke-free memiliki resilience dan character strength yang extraordinary. Anda tidak hanya overcome addiction, tapi transform menjadi version terbaik dari diri sendiri. Leadership qualities, discipline, dan health consciousness yang Anda demonstrate adalah blueprint untuk others yang struggling dengan habit changes.",
        "Setahun bebas rokok adalah pencapaian yang patut dibanggakan seumur hidup. Statistik medis menunjukkan bahwa relapse risk setelah 12 bulan is less than 5%. Anda sudah achieved sustainable lifestyle change yang permanent. Health benefits yang Anda nikmati sekarang akan compound over decades - cancer risk dramatically reduced, cardiovascular health optimal, respiratory function perfect, dan overall longevity significantly increased.",
        "Anda kini memiliki kendali penuh atas hidup dan kesehatan Anda. Mental framework yang developed through quit smoking journey applicable untuk achieve any goals dalam life. Self-efficacy, emotional regulation, stress management, dan long-term thinking skills yang honed selama process ini adalah transferable assets untuk career, relationships, dan personal development. You've mastered the art of intentional living.",
        "Perubahan yang Anda rasakan kini adalah hadiah permanen untuk diri sendiri. Physical vitality, mental clarity, emotional stability, dan spiritual growth yang achieved through this transformation adalah lifelong dividends. Energy levels stable throughout day, sleep quality optimal, physical appearance youthful, dan cognitive function sharp. This is sustainable wellness yang akan benefit Anda for remaining decades of life.",
        "Dari perokok menjadi teladan hidup sehat. Transformasi yang menginspirasi! Role model impact Anda extend far beyond personal achievement. Family members, friends, colleagues, dan community members observe Anda success dan motivated untuk make positive changes dalam their own lives. Social ripple effect dari healthy lifestyle choices creates positive influence yang touches many lives beyond your own awareness.",
        "Setengah dekade bebas rokok! Achievement ini menempatkan Anda dalam elite category of successful lifestyle transformation. Medical research shows bahwa health benefits plateau pada 5-year mark - meaning Anda sudah achieved maximum risk reduction untuk most smoking-related diseases. Cancer risk return to near-normal levels, cardiovascular system completely healed, dan respiratory function indistinguishable from never-smokers. This is complete biological recovery.",
        "Decade milestone adalah crown achievement dalam quit smoking journey! Anda sudah officially erase smoking history dari health perspective. Insurance companies, medical practitioners, dan health assessments consider Anda equivalent to never-smoker untuk most purposes. 10 years of compound health benefits create foundation untuk healthy aging, active longevity, dan vibrant golden years. This is generational health legacy.",
        "Veteran status dalam quit smoking community carries profound meaning. Anda represent hope dan proof untuk others bahwa addiction recovery possible. Mentorship role Anda play - whether formally atau informally - saves lives dan transforms families. Expertise yang gained through personal struggle dan victory adalah invaluable resource untuk support others dalam their journey. Your experience adalah beacon of possibility.",
        "Years of smoke-free living transform not just health, tapi entire life philosophy. Decision-making skills refined, risk assessment improved, future-oriented thinking enhanced, dan value system aligned dengan long-term wellness rather than short-term gratification. Wisdom gained through overcoming major life challenge applicable untuk any situation requiring courage, persistence, dan positive change.",
        "Financial transformation over years is staggering. Cumulative savings dari not buying cigarettes could fund major life goals - house down payment, children's education, retirement investment, dream vacation, atau charitable contributions. Money flow redirection dari destructive habit toward constructive purposes demonstrates power of lifestyle change untuk create abundance dan meaningful impact dalam life.",
        "Professional credibility enhanced by demonstration of self-control dan health commitment. Career advancement often correlates dengan personal discipline displayed through major habit change. Leadership positions more accessible, team respect higher, dan professional reputation enhanced by example of overcoming challenges. Health consciousness appreciated dalam workplace culture dan advancement opportunities.",
        "Family legacy profound dan far-reaching. Children grow up dalam smoke-free environment dengan healthy role model, breaking intergenerational patterns of addiction atau unhealthy coping mechanisms. Partner relationship improved by elimination of health concerns, conflict sources, dan lifestyle limitations. Extended family inspired by transformation example, creating positive influence across multiple generations.",
        "Travel experiences unlimited by smoking restrictions atau health limitations. Adventure possibilities expanded - hiking in pristine national parks, international flights comfortable, luxury accommodations accessible, cultural experiences unhindered by need untuk smoking breaks. Physical capacity untuk explore, discover, dan enjoy world dramatically enhanced by optimal respiratory dan cardiovascular function.",
        "Creative dan intellectual pursuits flourish dengan optimal brain function. Artistic expression, musical abilities, writing skills, academic achievement, atau professional innovation enhanced by mental clarity dan stable mood. Cognitive reserve built through years of healthy living provides protection against age-related mental decline dan supports lifelong learning capacity.",
        "Spiritual growth accelerated by overcoming major life challenge. Sense of purpose deepened, gratitude practices enriched, mindfulness capabilities enhanced, dan connection to larger meaning strengthened. Many veterans report spiritual awakening atau renewed faith as result of proving to themselves capability untuk positive transformation. Inner peace dan contentment levels significantly elevated.",
        "Athletic achievements previously unimaginable become reality. Marathon completion, mountain climbing, competitive sports participation, atau fitness goals achieved dengan cardiovascular dan respiratory systems functioning at peak capacity. Physical challenges yang dulu impossible due to smoking limitations now conquered dengan confidence dan capability. Body becomes ally rather than obstacle untuk adventure dan achievement.",
        "Social network transformation natural outcome of lifestyle change. Relationships dengan fellow health-conscious individuals replace smoking-centered social activities. Influence network upgraded to people who support growth, wellness, dan positive choices. Quality of friendships improved as authentic connections replace addiction-based social bonds. Community involvement increased dalam health-promoting activities.",
        "Mental health benefits compound over years of smoke-free living. Anxiety levels normalized, depression risk reduced, mood stability achieved, dan emotional regulation skills refined. Confidence in ability untuk handle life stresses without chemical coping mechanisms provides profound psychological security. Self-respect dan self-efficacy create positive feedback loop untuk continued wellness choices.",
        "Investment dalam long-term health pays exponential returns over decades. Regular medical checkups showing excellent results, preventive care more effective, prescription medication needs reduced, dan overall healthcare costs minimized. Quality of aging dramatically improved - active seniors lifestyle rather than health-compromised elderly years. Independence dan vitality maintained well into advanced age.",
        "Legacy impact extends beyond personal achievement to community transformation. Success story inspires healthcare providers, policy makers, community leaders, dan public health advocates. Participation dalam research studies, testimonial sharing, atau advocacy work contributes to larger movement untuk tobacco control dan addiction recovery support. Individual victory becomes part of collective progress toward healthier society."
      ],
      generalDaily: [
        "Setiap hari tanpa rokok adalah kemenangan kecil yang bermakna besar. Hari ini, kamu telah memilih untuk menghargai tubuhmu, menghormati kesehatanmu, dan memberikan yang terbaik untuk masa depan. Setiap napas yang kamu ambil sekarang adalah napas yang lebih bersih, lebih bebas, dan lebih penuh makna.",
        "Kesehatan adalah investasi terbaik untuk masa depan yang cerah. Dengan setiap hari yang berlalu tanpa rokok, kamu sedang membangun fondasi yang kuat untuk kehidupan yang lebih panjang, lebih bahagia, dan lebih bermakna. Tubuhmu sedang menyembuhkan diri, dan setiap sel dalam tubuhmu berterima kasih atas keputusan bijak yang telah kamu buat.",
        "Kamu lebih kuat dari kecanduan apapun. Percayalah pada diri sendiri. Dalam setiap momen ketika kamu merasa tergoda, ingatlah bahwa kamu memiliki kekuatan yang luar biasa dalam dirimu. Kamu telah membuktikan bahwa kamu bisa mengambil kendali atas hidupmu sendiri, dan itu adalah pencapaian yang sangat luar biasa.",
        "Perubahan dimulai dari keputusan kecil yang konsisten. Setiap hari yang kamu lewati tanpa rokok adalah bukti nyata bahwa kamu mampu menciptakan transformasi positif dalam hidupmu. Kebiasaan baik yang kamu bangun hari ini akan menjadi fondasi untuk kebiasaan-kebiasaan hebat lainnya di masa depan.",
        "Hidup sehat adalah hadiah terbaik untuk orang-orang yang kamu cintai. Dengan berhenti merokok, kamu tidak hanya memberikan yang terbaik untuk dirimu sendiri, tetapi juga untuk keluarga, teman, dan semua orang yang peduli padamu. Kamu sedang menjadi contoh yang menginspirasi bagi mereka yang melihat perjuanganmu.",
        "Paru-parumu sedang bernapas lega hari ini. Setiap hari tanpa rokok adalah hari dimana tubuhmu memiliki kesempatan untuk menyembuhkan diri. Sirkulasi darahmu membaik, oksigen mengalir lebih lancar, dan energimu akan semakin meningkat. Kamu sedang memberikan hadiah kesehatan yang tak ternilai untuk dirimu sendiri.",
        "Kebebasan sejati dimulai ketika kamu tidak lagi bergantung pada rokok. Hari ini, kamu adalah versi yang lebih bebas dari dirimu. Bebas dari kecemasan mencari rokok, bebas dari kekhawatiran tentang kesehatan, dan bebas untuk menikmati hidup dengan cara yang lebih autentik dan bermakna.",
        "Setiap rupiah yang tidak kamu habiskan untuk rokok adalah investasi untuk mimpi-mimpimu. Bayangkan semua hal indah yang bisa kamu lakukan dengan uang yang sekarang kamu hemat. Liburan bersama keluarga, hobi baru, atau bahkan tabungan untuk masa depan - semuanya menjadi lebih mungkin karena keputusan bijak yang telah kamu ambil.",
        "Mental yang sehat adalah kunci kesuksesan dalam perjalanan bebas rokok. Setiap tantangan yang kamu hadapi hari ini adalah kesempatan untuk membuktikan pada diri sendiri bahwa kamu mampu mengatasi apapun tanpa bergantung pada nikotin. Kekuatan mental yang kamu bangun melalui proses ini akan bermanfaat dalam semua aspek kehidupan.",
        "Tidur yang berkualitas adalah salah satu manfaat terbesar dari hidup bebas rokok. Malam ini, tubuhmu akan beristirahat dengan lebih nyenyak, tanpa gangguan nikotin yang mengganggu siklus tidur alami. Energi segar yang kamu rasakan besok pagi adalah hadiah dari keputusan sehat yang kamu buat hari ini.",
        "Sistem kekebalan tubuhmu semakin menguat setiap hari tanpa rokok. Kemampuan tubuh untuk melawan infeksi, menyembuhkan luka, dan mempertahankan kesehatan optimal meningkat secara signifikan. Kamu sedang membangun benteng pertahanan alami yang akan melindungimu dari berbagai penyakit di masa depan.",
        "Produktivitas dan fokusmu akan meningkat pesat tanpa gangguan hasrat merokok. Hari ini, kamu bisa berkonsentrasi penuh pada pekerjaan, hobi, dan kegiatan bermakna tanpa terganggu kebutuhan istirahat merokok. Kejernihan pikiran yang kamu rasakan adalah salah satu manfaat terbaik dari hidup bebas rokok.",
        "Hubungan sosialmu menjadi lebih tulus dan bermakna ketika tidak lagi berpusat pada aktivitas merokok. Kamu bisa hadir sepenuhnya dalam percakapan, menikmati pertemuan sosial tanpa khawatir bau rokok, dan membangun hubungan berdasarkan minat bersama yang sehat dan positif.",
        "Kebebasan finansial yang kamu rasakan dari tidak membeli rokok memberikan ketenangan pikiran yang luar biasa. Uang yang dulu dihabiskan untuk kebiasaan merusak sekarang bisa dialokasikan untuk hal-hal yang benar-benar penting - dana darurat, pendidikan, liburan, atau investasi untuk keamanan dan kebahagiaan masa depan.",
        "Rasa percaya dirimu meningkat setiap hari karena kamu telah membuktikan pada diri sendiri bahwa kamu bisa mengatasi tantangan hidup yang besar. Harga diri dan keyakinan diri yang berkembang melalui perjalanan berhenti merokok dapat diterapkan untuk mencapai tujuan apapun yang kamu tetapkan dalam karier, hubungan, atau pertumbuhan pribadi.",
        "Kreativitas dan pemikiran inovatifmu berkembang pesat ketika fungsi otak optimal tanpa gangguan karbon monoksida dan nikotin. Ekspresi artistik, kemampuan memecahkan masalah, dan pemikiran kreatif meningkat signifikan, membuka kemungkinan untuk terobosan pribadi dan profesional yang sebelumnya tampak mustahil.",
        "Physical stamina dan endurance levelmu continue to improve every day tanpa respiratory limitations dari smoking. Simple activities seperti naik tangga, jalan jauh, atau bermain dengan anak-anak menjadi enjoyable rather than challenging. Body Anda menjadi ally untuk adventure dan achievement rather than obstacle.",
        "Taste dan smell sensations yang enhanced dramatically membuat every meal menjadi lebih enjoyable experience. Subtle flavors yang dulu masked oleh smoking now fully appreciated, making cooking dan dining adventures yang exciting. Simple pleasures seperti aroma coffee atau fresh flowers menjadi source of daily joy.",
        "Stress management skillsmu develop naturally ketika tidak lagi rely pada cigarette sebagai coping mechanism. Healthy alternatives seperti deep breathing, physical activity, meditation, atau talking to someone prove to be more effective dan sustainable untuk handle life pressures tanpa negative side effects.",
        "Professional reputation dan credibilitymu enhanced by demonstration of self-discipline dan health consciousness. Colleagues dan supervisors respect dedication untuk positive lifestyle changes, yang often translates into better career opportunities dan leadership positions. Health-conscious behavior appreciated dalam modern workplace culture.",
        "Family relationshipsmu strengthen significantly ketika eliminate health concerns dan conflicts related to smoking. Children proud of healthy parent role model, spouse relieved dari secondhand smoke exposure, dan family activities more enjoyable karena better physical capacity untuk participate fully dalam shared experiences dan adventures.",
        "Travel experiencesmu become more enjoyable dan less restricted without smoking limitations. Long flights comfortable, hotel stays pleasant, restaurant visits relaxed, dan outdoor adventures unlimited by need untuk smoking breaks. World opens up dengan new possibilities untuk exploration dan cultural experiences.",
        "Spiritual growthmu accelerated by sense of accomplishment dari overcoming major life challenge. Connection to higher purpose, gratitude practices, dan mindfulness capabilities enhanced through process of proving to yourself bahwa positive transformation possible dengan dedication dan perseverance. Inner peace dan contentment levels significantly elevated.",
        "Environmental consciousnessmu contribute to cleaner world by eliminating cigarette waste, reducing air pollution, dan supporting smoke-free spaces untuk everyone. Personal choice untuk quit smoking aligned dengan larger movement towards environmental sustainability dan public health improvement untuk current dan future generations.",
        "Learning capacity dan cognitive functionmu operate at peak performance tanpa impairment dari smoking-related oxygen deprivation dan toxin exposure. Academic pursuits, professional development, skill acquisition, dan intellectual challenges approached dengan mental clarity dan focus yang previously compromised by smoking effects.",
        "Athletic achievements dan fitness goalsmu become increasingly achievable dengan optimal cardiovascular dan respiratory function. Exercise routines more effective, recovery times shorter, dan physical challenges yang seemed impossible during smoking years now within reach dengan proper training dan dedication.",
        "Sleep qualitymu continue to improve dengan natural circadian rhythms restored tanpa nicotine interference. REM sleep stages deeper dan more restorative, morning awakening refreshed dan energetic, dan daytime alertness stable tanpa chemical dependency untuk maintain energy levels throughout busy days.",
        "Immune system strengthmu provide natural protection against seasonal illnesses, infections, dan diseases. Healing processes untuk minor injuries faster, vaccination responses more effective, dan overall disease resistance stronger. Long-term health investment yang pays dividends untuk decades to come dengan reduced medical costs dan improved quality of life.",
        "Mental health stabilitymu supported by elimination of nicotine-induced anxiety, depression, dan mood swings. Natural emotional regulation skills develop, stress responses more balanced, dan psychological well-being enhanced by sense of control over life circumstances dan healthy coping mechanisms untuk handle challenges.",
        "Social network transformationmu natural outcome ketika lifestyle changes align dengan health-conscious community. Relationships dengan people yang support growth dan wellness replace addiction-centered social activities. Quality of friendships improved sebagai authentic connections develop based pada shared values dan positive life choices.",
        "Legacy impactmu extend beyond personal achievement to inspire family members, friends, colleagues, dan community members untuk make positive changes dalam their own lives. Success story becomes beacon of hope untuk others struggling dengan similar challenges, creating ripple effect of positive influence yang touches many lives beyond your immediate awareness."
      ],
    },
  },

  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      continue: 'Continue',
      skip: 'Skip',
      done: 'Done',
      retry: 'Retry',
    },

    splash: {
      subtitle: 'Start Living Healthy Today',
      footer: 'Join thousands of users on their smoke free journey',
    },

    navigation: {
      dashboard: 'Dashboard',
      progress: 'Progress',
      profile: 'Profile',
      settings: 'Settings',
    },

    dashboard: {
      welcome: 'Welcome!',
      welcomeBack: 'Welcome back!',
      checkIn: 'Check-in Today',
      checkedIn: 'Checked In',
      streak: 'Streak',
      totalDays: 'Total Days',
      dailyMissions: 'Daily Missions',
      todaysMotivation: 'Today\'s Motivation',
      personalMotivator: 'Personal Motivator',
      personalMotivatorDesc: '🚀 Get your daily personal boost! Motivation tailored to your smoke-free journey',
      activateMotivator: 'Activate Personal Motivator',
      daysSinceQuit: 'days smoke-free',
      moneySaved: 'Money Saved',
      cigarettesAvoided: 'Cigarettes Avoided',
      healthImproving: 'Health Improving',
      nextMilestone: 'Next Milestone',
      checkInSuccess: 'Check-in successful!',
      checkInError: 'Failed to check-in',
      streakContinued: 'Streak continued!',
      newBadge: 'New Badge!',
      newBadges: 'New badge',
      badgeEarned: 'You earned {count} new badge(s)!',
      streakBroken: 'Streak broken, but that\'s okay!',
      missionCompleted: 'Mission completed!',
      xpEarned: 'XP earned',
    },

    missions: {
      // Universal mission
      checkInDaily: 'Daily Check-in',
      checkInDailyDesc: 'Complete today\'s check-in',
      
      // Ad unlock mission
      unlockExtraMissions: 'Watch Ad for More Missions',
      unlockExtraMissionsDesc: 'Get 2 exciting & rewarding challenges! 🎬✨',
      
      // BREATHING & MINDFULNESS (12 missions) - matching Indonesian keys
      breathingRelax: 'Relaxing Breath',
      breathingRelaxDesc: 'Deep inhale through nose, slow exhale through mouth, repeat 5x 😌',
      fourSevenEightBreathing: '4-7-8 Breathing',
      fourSevenEightBreathingDesc: 'Inhale 4s → hold 7s → exhale 8s. Repeat 3x ✨',
      boxBreathing: 'Box Breathing',
      boxBreathingDesc: 'Inhale 4s → hold 4s → exhale 4s → hold 4s. Repeat 4x 🧠',
      quietMeditation: 'Quiet Meditation',
      quietMeditationDesc: 'Sit quietly, close eyes, focus on breath for 2 minutes',
      bodyScan: 'Body Scan',
      bodyScanDesc: 'From head to toe, notice & relax each body part',
      positivesPrayer: 'Positive Intentions',
      positivesPrayerDesc: 'Send positive thoughts/prayers for yourself & others',
      mindfulBreathing: 'Mindful Breathing',
      mindfulBreathingDesc: 'Normal breathing but focus your mind on the rhythm for 1 minute',
      progressiveRelaxation: 'Progressive Relaxation',
      progressiveRelaxationDesc: 'Tense then relax muscles from feet → head 🛌',
      miniNap: 'Power Nap',
      miniNapDesc: 'Lie down & take a 10-15 minute power nap ⚡',
      stretchBreath: 'Stretch + Breath',
      stretchBreathDesc: 'Do 3 gentle stretches, deep breath with each movement 🌬️',
      moodCheck: 'Mood Check',
      moodCheckDesc: 'Close eyes, check & write down your current feelings',
      
      // MOVEMENT & EXERCISE (12 missions) - matching Indonesian keys
      sevenMinuteWorkout: '7-Minute Workout',
      sevenMinuteWorkoutDesc: 'Quick workout: jumping jacks, squats, push-ups',
      gentleYoga: 'Gentle Yoga',
      gentleYogaDesc: 'Do 3 basic yoga poses: child pose, cobra, cat-cow',
      taiChiSlow: 'Slow Tai Chi',
      taiChiSlowDesc: 'Move arms & legs slowly for 5 minutes like a slow dance',
      traditionalDance: 'Traditional Dance',
      traditionalDanceDesc: 'Play music, freestyle dance to traditional rhythms',
      gentleStretch: 'Gentle Stretch',
      gentleStretchDesc: 'Stretch neck, shoulders, waist, 3x each',
      mindfulWalk: 'Mindful Walk',
      mindfulWalkDesc: 'Walk for 5 minutes, feel each step & the breeze 👣',
      bodWeightPower: 'Bodyweight Power',
      bodWeightPowerDesc: 'Do 10 push-ups + 15 squats 💪',
      coreChallenge: 'Core Challenge',
      coreChallengeDesc: '30-second plank + 15 sit-ups',
      danceRandom: 'Random Dance',
      danceRandomDesc: 'Play favorite song, dance for 2 minutes 🎶',
      climbStairs: 'Climb Stairs',
      climbStairsDesc: 'Find stairs, climb 3 floors without elevator',
      miniCardio: 'Mini Cardio',
      miniCardioDesc: 'Quick cardio burst: 1 minute high knees',
      tenThousandSteps: '10K Steps',
      tenThousandStepsDesc: 'Walk until you reach 10,000 steps today',
      
      // NUTRITION & HYDRATION (8 missions) - matching Indonesian keys  
      greenJuice: 'Green Juice',
      greenJuiceDesc: 'Make fresh green juice with spinach, cucumber & apple 🥒',
      jamuTime: 'Herbal Drink Time',
      jamuTimeDesc: 'Drink herbal tea, ginger tea, or healthy traditional drink',
      mindfulEating: 'Mindful Eating',
      mindfulEatingDesc: 'Eat slowly, chew well, taste every bite',
      hydrateCheck: 'Hydration Check',
      hydrateCheckDesc: 'Drink 2 glasses of water right now 💧',
      localHealthySnack: 'Healthy Local Snack',
      localHealthySnackDesc: 'Eat nuts, fruits, or healthy traditional snacks',
      noSugarHour: 'No Sugar Hour',
      noSugarHourDesc: 'Avoid sugary drinks & sweets for the next hour',
      addVeggies: 'Add Veggies',
      addVeggiesDesc: 'Add extra vegetables to your next meal 🥬',
      fruitBreak: 'Fruit Break',
      fruitBreakDesc: 'Eat one piece of fresh fruit as a snack 🍎',
      mediterraneanSnackDesc: 'Nuts, fruits, olive oil for brain',
      
      // LEARNING & GROWTH (8 missions) - matching Indonesian keys
      readWisdom: 'Read Wisdom',
      readWisdomDesc: 'Read inspirational book, quotes, or wisdom for 10 minutes 📚',
      motivationVideo: 'Motivation Video',
      motivationVideoDesc: 'Watch a short motivational video (5-10 minutes)',
      podcastTime: 'Podcast Time',
      podcastTimeDesc: 'Listen to educational or inspiring podcast episode',
      newSkill: 'New Skill',
      newSkillDesc: 'Learn something new via app/tutorial for 10 minutes 🧠',
      watchDocumentary: 'Watch Documentary',
      watchDocumentaryDesc: 'Watch 15-20 minutes of educational documentary',
      shortArticle: 'Short Article',
      shortArticleDesc: 'Read one interesting article about health/personal growth',
      shareKnowledge: 'Share Knowledge',
      shareKnowledgeDesc: 'Teach someone something or share useful knowledge',
      selfQuiz: 'Self Quiz',
      selfQuizDesc: 'Test your knowledge on a topic you\'re learning',
      
      // CREATIVE & EXPRESSION (6 missions) - matching Indonesian keys
      morningJournal: 'Morning Journal',
      morningJournalDesc: 'Write 1-2 pages about thoughts, feelings, or plans',
      creativeWork: 'Creative Work',
      creativeWorkDesc: 'Draw, sketch, write poetry, or any creative expression',
      musicTherapy: 'Music Therapy',
      musicTherapyDesc: 'Play instrument or listen to music mindfully for 10 minutes 🎵',
      gratitudeNote: 'Gratitude Note',
      gratitudeNoteDesc: 'Write down 3 things you\'re grateful for today',
      photoOfDay: 'Photo of Day',
      photoOfDayDesc: 'Take a meaningful photo that captures your mood/day',
      playlistMood: 'Mood Playlist',
      playlistMoodDesc: 'Create a playlist that matches your current emotions',
      
      // SOCIAL & RELATIONSHIP (4 missions) - matching Indonesian keys
      sayThanks: 'Say Thanks',
      sayThanksDesc: 'Genuinely thank someone for something they did',
      goodVibesChat: 'Good Vibes Chat',
      goodVibesChatDesc: 'Have a positive conversation with friend/family member',
      familyTime: 'Family Time',
      familyTimeDesc: 'Spend quality time with family - no phones allowed',
      helpOut: 'Help Out',
      helpOutDesc: 'Help someone with a task or offer assistance',
    },

    progress: {
      title: 'Your Progress',
      subtitle: 'days smoke-free',
      statistics: 'Statistics',
      health: 'Health',
      savings: 'Money',
      dailyProgress: 'Daily Progress',
      healthMilestones: 'Health Milestones',
      totalSavings: 'Total Savings ($)',
      perDay: 'Per Day ($)',
      perWeek: 'Per Week ($)',
      perMonth: 'Per Month ($)',
      whatYouCanBuy: 'What you can buy?',
      savedMoney: 'With your saved money',
      smokeFree: 'Smoke Free',
      cigarettesAvoided: 'Cigarettes Avoided',
      lifeMinutesGained: 'Life Minutes Gained',
      longestStreak: 'Longest Streak',
      totalXP: 'Total XP',
      badgesEarned: 'Badges Earned',
      missionsCompleted: 'Missions Completed',
      smartphone: 'Smartphone',
      familyPizza: 'Family Pizza',
      gasoline: 'Liters Gasoline',
      less: 'Less',
      active: 'Active',
    },

    badges: {
      title: 'Achievements & Stats',
      subtitle: 'View your achievements and global community rankings',
      loading: 'Loading achievements data...',
      youHave: 'You:',
      of: 'of',
      badgesOwned: 'Badges You Own',
      otherBadges: 'Other Badges',
      updateInfo: 'Statistics updated in real-time • Pull to refresh',
      // Internal tabs
      myBadges: 'My Badges',
      communityStats: 'Community Stats',
      // Community features
      communityRanking: 'Community Ranking',
      communityInsights: 'Community Insights',
      premiumRequired: 'Premium Required',
      premiumCommunityDesc: 'View complete community rankings and statistics with Premium upgrade',
    },

    badgeNames: {
      'new-member': 'New Member',
      'first-day': 'First Step',
      'week-warrior': 'Week Warrior',
      'month-master': 'Month Master',
      'streak-master': 'Streak Master',
      'xp-collector': 'XP Collector',
      'mission-master': 'Mission Master',
      'elite-year': 'Elite Year',
      'diamond-streak': 'Diamond Streak',
      'legendary-master': 'Legendary Master',
      'xp-elite': 'XP Elite',
      'xp-master-premium': 'XP Master Premium',
      'xp-legend': 'XP Legend',
      'mission-legend': 'Mission Legend',
      'mission-champion': 'Mission Champion',
      'money-saver-elite': 'Elite Saver',
      'money-master-premium': 'Money Master',
      'health-transformer': 'Health Transformer',
      'perfect-month': 'Perfect Month',
    },

    badgeDescriptions: {
      'new-member': 'Join the ByeSmoke community',
      'first-day': 'Complete your first check-in',
      'week-warrior': 'Stay smoke-free for 7 days',
      'month-master': 'Stay smoke-free for 30 days',
      'streak-master': 'Reach 100-day streak',
      'xp-collector': 'Collect 1000 XP',
      'mission-master': 'Complete 50 missions',
      'elite-year': 'Stay smoke-free for 365 days',
      'diamond-streak': 'Reach 500-day streak',
      'legendary-master': 'Reach 1000-day streak',
      'xp-elite': 'Collect 5000 XP',
      'xp-master-premium': 'Collect 10000 XP',
      'xp-legend': 'Collect 25000 XP',
      'mission-legend': 'Complete 100 missions',
      'mission-champion': 'Complete 250 missions',
      'money-saver-elite': 'Save 5 million rupiah',
      'money-master-premium': 'Save 10 million rupiah',
      'health-transformer': 'Reach all health milestones',
      'perfect-month': '30-day streak + 500 XP in one month',
    },

    badgeRequirements: {
      'new-member': 'Register account',
      'first-day': 'First check-in',
      'week-warrior': '7 consecutive days',
      'month-master': '30 consecutive days',
      'streak-master': '100 consecutive days',
      'xp-collector': '1000 XP',
      'mission-master': '50 completed missions',
      'elite-year': '365 consecutive days',
      'diamond-streak': '500 consecutive days',
      'legendary-master': '1000 consecutive days',
      'xp-elite': '5000 XP',
      'xp-master-premium': '10000 XP',
      'xp-legend': '25000 XP',
      'mission-legend': '100 completed missions',
      'mission-champion': '250 completed missions',
      'money-saver-elite': 'Save 5 million rupiah',
      'money-master-premium': 'Save 10 million rupiah',
      'health-transformer': 'All health milestones',
      'perfect-month': '30 days + 500 XP in one month',
    },

    profile: {
      title: 'Profile',
      premium: 'Premium',
      upgrade: 'Upgrade Premium',
      notifications: 'Notifications',
      notificationsDesc: 'Reminders and motivation',
      darkMode: 'Dark Mode',
      darkModeActive: 'Active',
      darkModeInactive: 'Inactive',
      premiumFeature: 'Premium Feature',
      language: 'Language',
      languageDesc: 'Choose app language',
      help: 'Help',
      helpDesc: 'FAQ and support',
      about: 'About',
      aboutVersion: 'Version 1.0.12',
      logout: 'Logout',
      logoutDesc: 'Sign out of account',
      logoutConfirm: 'Logout',
      logoutMessage: 'Are you sure you want to logout?',
    },

    notifications: {
      // Permission messages
      permissionRequired: 'Notification Permission Required',
      permissionDenied: 'Notification permission denied. Please enable notifications in device settings to use reminder features.',
      permissionUndetermined: 'Notification permission is required to enable daily reminders.',
      permissionGranted: 'Notifications allowed',
      openSettings: 'Open Settings',
      cancel: 'Cancel',
      
      // Error messages
      schedulingFailed: 'Failed to Enable Notifications',
      schedulingFailedDesc: 'Unable to set up reminders. Please ensure notification permissions are granted.',
      timeChangeFailed: 'Failed to Change Time',
      timeChangeFailedDesc: 'Unable to change reminder time. Please check notification permissions.',
      
      // Status texts
      active: 'Active',
      inactive: 'Inactive',
      reminderTime: 'Reminder Time',
      
      // Notification content (6 variations each)
      titles: {
        reminder: 'ByeSmoke Reminder 🚭',
        motivation: 'Stay Strong! 💪',
        healthy: 'Healthy Life Awaits 🌟',
        consistency: 'Consistency is Key 🔑',
        journey: 'Amazing Journey Continues 🎯',
        freedom: 'Smoke-Free, Better Life ✨',
      },
      
      bodies: {
        reminder: 'Time for your daily check-in! Stay consistent on your smoke-free journey.',
        motivation: 'Today is a new day to be healthier. Don\'t forget to check in!',
        healthy: 'Every smoke-free day is a victory! Let\'s record today\'s progress.',
        consistency: 'Your streak is precious. Time for your daily check-in!',
        journey: 'You\'ve come this far, keep going! Don\'t forget to update today\'s progress.',
        freedom: 'The best health investment starts today. Let\'s check in now!',
      },

      // Lungcat notifications
      lungcat: {
        enabled: 'Lungcat Notifications',
        enabledDesc: 'Care and play reminders for your Lungcat',
        feedingTitle: 'Your Lungcat is Hungry! 🍽️',
        feedingBody: 'Time to feed your lungcat! A well-fed lungcat is a happy lungcat.',
        playingTitle: 'Your Lungcat Wants to Play! 🎾',
        playingBody: 'Your lungcat is ready for some fun! Playing keeps your lungcat energetic and happy.',
        healthGoodTitle: 'Your Lungcat is Thriving! 🌟',
        healthGoodBody: 'Amazing progress! Your lungcat is healthy and happy thanks to your daily care.',
        healthBadTitle: 'Your Lungcat Needs Care! 💔',
        healthBadBody: 'Your lungcat is feeling unwell. Regular check-ins and care will help them recover!',
        energyLowTitle: 'Your Lungcat is Tired! 😴',
        energyLowBody: 'Your lungcat\'s energy is running low. Time for a check-in to boost their spirits!',
      },
    },

    onboarding: {
      welcome: 'Welcome!',
      welcomeMessage: 'Congratulations! You\'ve taken the first step toward a healthier life.',
      smokingYears: 'How Long Have You Been Smoking?',
      smokingYearsDesc: 'How many years have you been smoking?',
      cigarettesPerDay: 'How Many Cigarettes Per Day?',
      cigarettesPerDayDesc: 'Enter the number of cigarettes you usually smoke',
      pricePerPack: 'How Much Per Pack?',
      pricePerPackDesc: 'To calculate your savings',
      whyQuit: 'Why Do You Want to Quit?',
      whyQuitDesc: 'Choose your main reason',
      previousAttempts: 'Have You Tried Quitting Before?',
      previousAttemptsDesc: 'How many times have you tried?',
      quitDate: 'When Will You Start Quitting?',
      quitDateDesc: 'Choose your healthy journey start date',
      congratulations: 'Congratulations!',
      congratulationsMessage: 'Your healthy journey starts now',
      years: 'years',
      cigarettesDaily: 'cigarettes per day',
      perPack: 'per pack',
      selectOneOrMore: 'Select one or more',
      required: 'Required',
      never: 'Never',
      times: 'times',
      perfectStart: 'Today is the perfect start!',
      startHealthyJourney: 'Start Healthy Journey',
      summary: 'View Summary',
      next: 'Next',
      back: 'Back',
    },

    quitReasons: {
      health: 'Health',
      family: 'Family',
      money: 'Money',
      fitness: 'Fitness',
      appearance: 'Appearance',
      pregnancy: 'Pregnancy',
    },

    settings: {
      notifications: 'Notification Settings',
      notificationsHelp: 'Notification settings will be available soon. You\'ll be able to set daily check-in reminders and motivation.',
      darkMode: 'Dark Mode',
      language: 'Language',
      help: 'Help & Support',
      helpContent: 'Have any question or need help? Contact our support team at sandy@zaynstudio.app',
      about: 'ByeSmoke AI v1.0.0',
      aboutContent: 'This app is designed to help you on your journey to quit smoking. Track your progress and get daily motivation.',
    },

    premium: {
      title: 'Get Full Power of ByeSmoke AI',
      subtitle: 'Only $0.70/month - Cheaper than 1 cigarette pack! Best investment for healthy life 💪',
      valueProposition: '💸 $0.70 = Price of half premium cigarette pack',
      features: {
        personalConsultation: '🧠 Personal Consultation at Important Moments',
        dailyMotivation: '🎯 Daily Motivation Tailored to Your Journey',
        threeMissions: '✅ 3 Daily Missions More (4 total!)',
        darkMode: '🌙 Exclusive Dark Mode',
        adFree: '🚫 Ad-Free Experience',
        supportDeveloper: '❤️ Support Independent Developer',
      },
      upgrade: 'Upgrade Premium',
      monthly: 'Premium Monthly',
      yearly: 'Premium Yearly',
      paymentProcessing: 'Processing payment...',
      paymentSuccess: 'Payment successful!',
      paymentError: 'Payment failed',
    },

    upgradeBanner: {
      title: 'Unlock Your Full Potential!',
      message: 'Get 3 more daily missions for just $1.00 - cheaper than 2 cigarette packs!',
      tryFree: 'Try Free 3 Days',
      upgradeNow: 'Upgrade Now',
    },

    alerts: {
      fieldRequired: 'Field Required',
      dataIncomplete: 'Data Incomplete',
      saveError: 'Failed to save data',
      loadError: 'Failed to load data',
      internetError: 'Check internet connection',
      tryAgain: 'Please try again',
    },

    quotes: {
      streakBroken: [
        "Falling is human, rising is a choice. Start again today with stronger conviction.",
        "Every champion has experienced defeat. What makes the difference is the courage to try again.",
        "There's no such thing as failure, only lessons. Today is a fresh start.",
        "A broken streak doesn't mean all efforts were wasted. All previous progress still counts.",
        "Perfection isn't the goal, consistency is the key. Let's start again with more wisdom.",
      ],
      newUser: [
        "Congratulations! According to research, this is an incredibly positive step of your decision to begin this smoke-free journey. Within the first 20 minutes after your last cigarette, your heart rate and blood pressure have already begun to normalize. In 8-12 hours, the carbon monoxide levels in your blood drop significantly, and oxygen starts flowing better throughout your body. The first few days are indeed challenging as your body undergoes nicotine detoxification, but remember that every withdrawal symptom you experience is a sign that your body is healing itself. Stay strong!",
        "According to health studies, your decision to quit smoking is the best health investment ever made. Research shows that within the first 24 hours, your risk of heart attack already begins to decrease. In 48-72 hours, your sense of smell and taste will start improving dramatically. Studies show that people who experience the extraordinary difference in patients who successfully quit, I'm confident you will experience increased energy, better sleep quality, and improved stamina in the weeks to come.",
        "The first day is a monumental achievement! From a physiological perspective, your body has already begun an incredible healing process. The cilia in your lungs are starting to function normally again, helping to clear mucus and harmful particles. Your immune system is beginning to strengthen. What you're experiencing now - perhaps some restlessness or difficulty concentrating - is your brain's normal response as it adjusts dopamine levels without nicotine. In 3-5 days, physical withdrawal symptoms will start to subside and you'll experience remarkable mental clarity.",
        "Research on thousands of smoking cessation cases, I want to explain what's happening in your body right now. Every hour without cigarettes, your body works hard to repair the damage that has occurred. Blood flow to your hands and feet improves, body temperature returns to normal, and most importantly - cells in your lungs begin to regenerate. This process will continue for months ahead. Trust in your body's incredible ability to heal itself.",
        "This first step demonstrates extraordinary character strength and commitment to health. According to research data, patients who successfully pass the first week have a 90% higher chance of long-term success. What you need to remember is that nicotine will be completely out of your body within 72 hours. After that, all symptoms you experience are psychological and can be overcome with the right strategies. Let's build a strong foundation for your healthy journey!",
      ],
      earlyJourney: [
        "Excellent progress! As a medical professional with decades of experience, I want you to understand the remarkable transformations occurring in your body during these crucial early weeks. Your respiratory system is undergoing significant healing - the tiny hair-like structures called cilia in your lungs are regenerating and beginning to effectively clear mucus and toxins. Your cardiovascular system is also improving dramatically; blood circulation to your extremities is normalizing, and your heart no longer has to work overtime to compensate for the toxic effects of smoking. These foundational changes you're experiencing now will continue to compound over the coming months.",
        "From a neurological standpoint, what you're accomplishing right now is extraordinary. Your brain is actively rewiring itself, creating new neural pathways that support healthy behaviors while weakening the old addiction pathways. Every day you maintain this smoke-free lifestyle, you're strengthening your mental resilience and proving to yourself that you have complete control over your choices. The psychological confidence you're building during this period will serve as a powerful foundation for all future challenges in your life.",
        "I want to highlight the remarkable physiological improvements you're experiencing right now. Your lung capacity is increasing daily, your oxygen saturation levels are normalizing, and the chronic inflammation in your respiratory system is subsiding. Many patients tell me they notice improved energy levels, better sleep quality, and enhanced mental clarity during this phase. These aren't just temporary benefits - they're permanent improvements that will continue to enhance your quality of life for decades to come.",
        "As someone who has guided thousands of patients through this journey, I can confidently say that the habit reformation you're undergoing follows well-established neuroplasticity principles. Research shows that it takes approximately 21-66 days to establish new neural patterns, and you're well within this critical window. Your brain is becoming increasingly efficient at maintaining these healthy behaviors, making each subsequent day easier than the last. The consistency you're demonstrating is building unshakeable foundations for lifelong success.",
        "The natural detoxification process your body is undergoing right now is truly remarkable. Your liver is working efficiently to metabolize and eliminate the thousands of toxic compounds that were accumulating in your system. Your kidneys are filtering your blood more effectively, your skin is beginning to regain its healthy glow, and your digestive system is functioning more optimally. This comprehensive cellular renewal process is one of the most powerful examples of your body's incredible capacity for self-healing.",
      ],
      milestoneAchiever: [
        "One month smoke-free! You've proven you're stronger than old habits.",
        "Your lungs now function 30% better. What an amazing achievement!",
        "The first 90 days are the hardest. You've passed them brilliantly!",
        "This milestone is real proof that you can change your life for the better.",
        "Every milestone is proof of unshakeable strength and determination.",
      ],
      veteran: [
        "True veteran! You've become an inspiration to many people.",
        "One year smoke-free is an achievement to be proud of for life.",
        "You now have full control over your life and health.",
        "The changes you feel now are permanent gifts to yourself.",
        "From smoker to healthy living example. An inspiring transformation!",
      ],
      generalDaily: [
        "Every day without cigarettes is a small victory with great meaning. Today, you've chosen to honor your body, respect your health, and give your best to the future. Every breath you take now is cleaner, freer, and more meaningful. You're not just surviving without cigarettes - you're thriving.",
        "Health is the best investment for a bright future. With each passing day without cigarettes, you're building a strong foundation for a longer, happier, and more meaningful life. Your body is healing itself, and every cell in your body is grateful for the wise decision you've made.",
        "You're stronger than any addiction. Believe in yourself. In every moment when you feel tempted, remember that you have extraordinary strength within you. You've proven that you can take control of your own life, and that is an absolutely remarkable achievement.",
        "Change starts from small, consistent decisions. Every day you pass without cigarettes is concrete proof that you're capable of creating positive transformation in your life. The good habits you're building today will become the foundation for other great habits in the future.",
        "Healthy living is the best gift for people you love. By quitting smoking, you're not only giving your best to yourself, but also to your family, friends, and everyone who cares about you. You're becoming an inspiring example for those who witness your journey.",
        "Your lungs are breathing easier today. Every day without cigarettes is a day when your body has the chance to heal itself. Your blood circulation improves, oxygen flows more smoothly, and your energy will continue to increase. You're giving yourself the invaluable gift of health.",
        "True freedom begins when you're no longer dependent on cigarettes. Today, you are a freer version of yourself. Free from the anxiety of searching for cigarettes, free from health worries, and free to enjoy life in a more authentic and meaningful way.",
        "Every dollar you don't spend on cigarettes is an investment in your dreams. Imagine all the beautiful things you can do with the money you're now saving. Family vacations, new hobbies, or even savings for the future - everything becomes more possible because of the wise decision you've made."
      ],
    },
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.id; // Fallback to Indonesian
}

// Helper function to get translated badge data
export function getTranslatedBadge(badgeId: string, language: Language = 'id') {
  const t = getTranslation(language);
  return {
    name: t.badgeNames[badgeId as keyof typeof t.badgeNames] || badgeId,
    description: t.badgeDescriptions[badgeId as keyof typeof t.badgeDescriptions] || '',
    requirement: t.badgeRequirements[badgeId as keyof typeof t.badgeRequirements] || '',
  };
}

// Function to detect device language and return supported app language
export function getDeviceLanguage(): Language {
  try {
    // Get device locales (returns array of locale objects)
    const locales = Localization.getLocales();

    if (__DEV__) {
      console.log('🌍 Device locale detection:', {
        locales: locales,
        localeCount: locales?.length,
        primaryLocale: locales?.[0],
        languageCode: locales?.[0]?.languageCode,
        regionCode: locales?.[0]?.regionCode
      });
    }

    if (locales && locales.length > 0) {
      // Get the primary locale
      const primaryLocale = locales[0];

      // Extract language code (e.g., "id", "en", "fr")
      const languageCode = primaryLocale.languageCode?.toLowerCase();

      if (__DEV__) {
        console.log('🌍 Detected language code:', languageCode);
      }

      // Return Indonesian if device is set to Indonesian, otherwise English
      const detectedLanguage = languageCode === 'id' ? 'id' : 'en';

      if (__DEV__) {
        console.log('🌍 Final language selection:', detectedLanguage);
      }

      return detectedLanguage;
    }

    // Fallback to English if no locales found (changed from 'id' to 'en' for international users)
    if (__DEV__) {
      console.log('🌍 No locales found, using English fallback');
    }
    return 'en';
  } catch (error) {
    // Fallback to English if detection fails (changed from 'id' to 'en' for international users)
    if (__DEV__) {
      console.log('🌍 Device language detection failed, using English fallback:', error);
    }
    return 'en';
  }
}