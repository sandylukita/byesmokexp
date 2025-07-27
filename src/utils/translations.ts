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

  // Missions
  missions: {
    checkInDaily: string;
    checkInDailyDesc: string;
    drinkWater: string;
    drinkWaterDesc: string;
    exercise: string;
    exerciseDesc: string;
    meditation: string;
    meditationDesc: string;
    healthySnack: string;
    healthySnackDesc: string;
    breathingExercise: string;
    breathingExerciseDesc: string;
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
    loading: string;
    youHave: string;
    of: string;
    badgesOwned: string;
    otherBadges: string;
    updateInfo: string;
  };

  // Badge Names and Descriptions
  badgeNames: {
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
      personalMotivatorDesc: 'Dapatkan motivasi personal yang disesuaikan dengan perjalanan unikmu',
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
      checkInDaily: 'Check-in Harian',
      checkInDailyDesc: 'Lakukan check-in hari ini',
      drinkWater: 'Minum Air',
      drinkWaterDesc: 'Minum 8 gelas air hari ini',
      exercise: 'Olahraga Ringan',
      exerciseDesc: 'Lakukan olahraga ringan selama 15 menit',
      meditation: 'Meditasi',
      meditationDesc: 'Lakukan meditasi selama 10 menit',
      healthySnack: 'Cemilan Sehat',
      healthySnackDesc: 'Konsumsi buah atau sayuran sebagai cemilan',
      breathingExercise: 'Latihan Pernapasan',
      breathingExerciseDesc: 'Latihan pernapasan dalam 5 menit saat stress',
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
      title: 'Statistik Badge',
      loading: 'Memuat statistik badge...',
      youHave: 'Kamu:',
      of: 'dari',
      badgesOwned: 'Badge yang Kamu Miliki',
      otherBadges: 'Badge Lainnya',
      updateInfo: 'Statistik diperbarui secara real-time • Tarik untuk refresh',
    },

    badgeNames: {
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
      aboutVersion: 'Versi 1.0.0',
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
      helpContent: 'Butuh bantuan? FAQ dan panduan akan segera tersedia. Untuk bantuan langsung, hubungi tim pengembang.',
      about: 'ByeSmoke AI v1.0.0',
      aboutContent: 'Aplikasi ini dibuat untuk membantu Anda dalam perjalanan berhenti merokok. Lacak progres Anda dan dapatkan motivasi harian.',
    },

    premium: {
      title: 'Dapatkan Kekuatan Penuh ByeSmoke AI',
      subtitle: 'Jadilah pahlawan bagi diri sendiri dengan dukungan personal dari motivator cerdas kami',
      features: {
        personalConsultation: '🧠 Konsultasi Personal di Momen Penting',
        dailyMotivation: '🎯 Motivasi Harian yang Disesuaikan Perjalanan',
        threeMissions: '✅ 3 Misi Harian (lebih banyak XP!)',
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
        "Jatuh itu manusiawi, bangkit itu pilihan. Mulai lagi hari ini dengan keyakinan yang lebih kuat.",
        "Setiap juara pernah mengalami kekalahan. Yang membedakan adalah keberanian untuk mencoba lagi.",
        "Tidak ada yang namanya kegagalan, yang ada hanya pelajaran. Hari ini adalah awal yang baru.",
        "Streak terputus bukan berarti semua usaha sia-sia. Semua progress sebelumnya tetap berarti.",
        "Kesempurnaan bukanlah tujuan, konsistensi adalah kunci. Mari mulai lagi dengan lebih bijaksana.",
      ],
      newUser: [
        "Selamat datang dalam perjalanan bebas rokok! Setiap langkah kecil adalah kemenangan besar.",
        "Keputusan berhenti merokok adalah investasi terbaik untuk masa depan yang cerah.",
        "Hari pertama adalah yang tersulit. Anda sudah melewatinya dengan baik!",
        "Tubuh Anda mulai pulih dari hari pertama. Rasakan perubahan positifnya.",
        "Perjalanan seribu mil dimulai dari satu langkah. Anda sudah mengambil langkah terpenting.",
      ],
      earlyJourney: [
        "Minggu pertama adalah fondasi kuat untuk perjalanan sehat yang panjang.",
        "Setiap hari tanpa rokok adalah bukti kekuatan mental yang luar biasa.",
        "Nafas Anda semakin lega, energi semakin bertambah. Terus pertahankan!",
        "Habit baru butuh waktu 21 hari untuk terbentuk. Anda sedang di jalan yang benar.",
        "Tubuh Anda sedang dalam proses detoksifikasi alami. Luar biasa!",
      ],
      milestoneAchiever: [
        "Satu bulan bebas rokok! Anda telah membuktikan bahwa Anda lebih kuat dari kebiasaan lama.",
        "Paru-paru Anda kini berfungsi 30% lebih baik. Pencapaian yang menakjubkan!",
        "90 hari pertama adalah yang tersulit. Anda telah melewatinya dengan gemilang!",
        "Milestone ini adalah bukti nyata bahwa Anda mampu mengubah hidup menjadi lebih baik.",
        "Setiap milestone adalah bukti kekuatan dan tekad yang tak tergoyahkan.",
      ],
      veteran: [
        "Veteran sejati! Anda telah menjadi inspirasi bagi banyak orang.",
        "Setahun bebas rokok adalah pencapaian yang patut dibanggakan seumur hidup.",
        "Anda kini memiliki kendali penuh atas hidup dan kesehatan Anda.",
        "Perubahan yang Anda rasakan kini adalah hadiah permanen untuk diri sendiri.",
        "Dari perokok menjadi teladan hidup sehat. Transformasi yang menginspirasi!",
      ],
      generalDaily: [
        "Setiap hari tanpa rokok adalah kemenangan kecil yang bermakna besar.",
        "Kesehatan adalah investasi terbaik untuk masa depan yang cerah.",
        "Kamu lebih kuat dari kecanduan apapun. Percayalah pada diri sendiri.",
        "Perubahan dimulai dari keputusan kecil yang konsisten.",
        "Hidup sehat adalah hadiah terbaik untuk orang-orang yang kamu cintai.",
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
      personalMotivatorDesc: 'Get personal motivation tailored to your unique journey',
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
      checkInDaily: 'Daily Check-in',
      checkInDailyDesc: 'Complete today\'s check-in',
      drinkWater: 'Drink Water',
      drinkWaterDesc: 'Drink 8 glasses of water today',
      exercise: 'Light Exercise',
      exerciseDesc: 'Do light exercise for 15 minutes',
      meditation: 'Meditation',
      meditationDesc: 'Meditate for 10 minutes',
      healthySnack: 'Healthy Snack',
      healthySnackDesc: 'Eat fruits or vegetables as snacks',
      breathingExercise: 'Breathing Exercise',
      breathingExerciseDesc: 'Practice deep breathing for 5 minutes when stressed',
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
      title: 'Badge Statistics',
      loading: 'Loading badge statistics...',
      youHave: 'You:',
      of: 'of',
      badgesOwned: 'Badges You Own',
      otherBadges: 'Other Badges',
      updateInfo: 'Statistics updated in real-time • Pull to refresh',
    },

    badgeNames: {
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
      aboutVersion: 'Version 1.0.0',
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
      helpContent: 'Need help? FAQ and guides will be available soon. For direct support, contact the development team.',
      about: 'ByeSmoke AI v1.0.0',
      aboutContent: 'This app is designed to help you on your journey to quit smoking. Track your progress and get daily motivation.',
    },

    premium: {
      title: 'Get Full Power of ByeSmoke AI',
      subtitle: 'Become your own hero with personal support from our smart motivator',
      features: {
        personalConsultation: '🧠 Personal Consultation at Important Moments',
        dailyMotivation: '🎯 Daily Motivation Tailored to Your Journey',
        threeMissions: '✅ 3 Daily Missions (more XP!)',
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
        "Welcome to your smoke-free journey! Every small step is a huge victory.",
        "The decision to quit smoking is the best investment for a brighter future.",
        "The first day is the hardest. You've gotten through it well!",
        "Your body starts healing from day one. Feel the positive changes.",
        "A journey of a thousand miles begins with one step. You've taken the most important one.",
      ],
      earlyJourney: [
        "The first week is a strong foundation for a long healthy journey.",
        "Every day without cigarettes is proof of extraordinary mental strength.",
        "Your breathing is getting easier, energy is increasing. Keep it up!",
        "New habits need 21 days to form. You're on the right track.",
        "Your body is in a natural detoxification process. Amazing!",
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
        "Every day without cigarettes is a small victory with great meaning.",
        "Health is the best investment for a bright future.",
        "You're stronger than any addiction. Believe in yourself.",
        "Change starts from small, consistent decisions.",
        "Healthy living is the best gift for people you love.",
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