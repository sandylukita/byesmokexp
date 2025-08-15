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
      helpContent: 'Ada pertanyaan atau butuh bantuan? Hubungi tim dukungan kami di sandy@zaynstudio.app',
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
        "Sebagai dokter yang telah menangani ribuan pasien, saya ingin mengatakan bahwa jatuh dalam perjalanan berhenti merokok adalah hal yang sangat wajar. Yang terpenting adalah bangkit kembali dengan pemahaman yang lebih dalam tentang pemicu Anda. Setiap kali Anda mencoba lagi, otak Anda menjadi lebih kuat dalam melawan kecanduan nikotin. Mari kita analisis bersama apa yang memicu kembalinya kebiasaan ini dan buat strategi yang lebih baik untuk masa depan.",
        "Dalam praktik medis saya, setiap pasien yang berhasil berhenti merokok pernah mengalami kegagalan berkali-kali. Ini bukan tanda kelemahan, melainkan proses alami pembentukan ulang jalur saraf di otak Anda. Penelitian menunjukkan bahwa rata-rata seseorang mencoba berhenti merokok 6-7 kali sebelum benar-benar berhasil. Pengalaman sebelumnya adalah data berharga yang akan membantu Anda mengidentifikasi pola dan mencegah kesalahan yang sama terulang kembali.",
        "Izinkan saya menjelaskan dari sudut pandang medis: ketika Anda kembali merokok setelah berhenti, tubuh Anda sebenarnya sudah mengalami banyak perbaikan yang tidak akan hilang begitu saja. Sirkulasi darah yang membaik, fungsi paru-paru yang meningkat, dan penurunan risiko penyakit jantung tetap memberikan manfaat jangka panjang. Yang perlu kita lakukan sekarang adalah membangun kembali momentum dengan strategi yang lebih tepat sasaran berdasarkan pengalaman sebelumnya.",
        "Dari perspektif neurologi, setiap hari Anda tidak merokok telah menciptakan jalur saraf baru di otak yang mendukung kebiasaan sehat. Meskipun streak terputus, fondasi neurologis ini tidak hilang sepenuhnya. Seperti otot yang pernah dilatih, otak Anda akan lebih mudah kembali ke pola sehat. Mari kita manfaatkan periode ini untuk menganalisis pemicu emosional dan lingkungan yang menyebabkan kembalinya kebiasaan lama, sehingga kita bisa membangun strategi pertahanan yang lebih kuat.",
        "Sebagai profesional kesehatan, saya selalu mengingatkan pasien bahwa berhenti merokok adalah maraton, bukan sprint. Perfeksionisme seringkali menjadi musuh terbesar dalam proses ini. Yang penting adalah tren jangka panjang menuju kehidupan bebas rokok. Setiap kali Anda mencoba, Anda mengumpulkan wawasan berharga tentang diri sendiri. Mari kita gunakan pengetahuan ini untuk menciptakan rencana yang lebih personal dan realistis, dengan fokus pada progress berkelanjutan daripada kesempurnaan sesaat.",
      ],
      newUser: [
        "Selamat! Sebagai dokter, saya sangat bangga dengan keputusan Anda untuk memulai perjalanan bebas rokok. Dalam 20 menit pertama setelah rokok terakhir, detak jantung dan tekanan darah Anda sudah mulai normal. Dalam 8-12 jam, kadar karbon monoksida dalam darah turun signifikan, dan oksigen mulai mengalir lebih baik ke seluruh tubuh. Hari-hari pertama memang challenging karena tubuh sedang melakukan detoksifikasi nikotin, tapi ingatlah bahwa setiap gejala withdrawal yang Anda rasakan adalah tanda bahwa tubuh sedang memperbaiki diri. Tetap semangat!",
        "Dari sudut pandang medis, keputusan Anda berhenti merokok adalah investasi kesehatan terbaik yang pernah ada. Riset menunjukkan bahwa dalam 24 jam pertama, risiko serangan jantung sudah mulai menurun. Dalam 48-72 jam, indra penciuman dan perasa akan mulai membaik drastis. Sebagai dokter yang telah melihat perbedaan luar biasa pada pasien yang berhasil berhenti, saya yakin Anda akan merasakan peningkatan energi, kualitas tidur yang lebih baik, dan stamina yang meningkat dalam minggu-minggu mendatang.",
        "Hari pertama adalah pencapaian monumental! Dari perspektif fisiologis, tubuh Anda sudah mulai proses penyembuhan yang luar biasa. Silia di paru-paru mulai berfungsi normal kembali, membantu membersihkan lendir dan partikel berbahaya. Sistem kekebalan tubuh mulai menguat. Yang Anda rasakan sekarang - mungkin sedikit gelisah atau sulit konsentrasi - adalah reaksi normal otak yang sedang menyesuaikan kadar dopamin tanpa nikotin. Dalam 3-5 hari, gejala fisik withdrawal akan mulai mereda dan Anda akan merasakan kejernihan mental yang luar biasa.",
        "Sebagai dokter yang telah menangani ribuan kasus berhenti merokok, saya ingin menjelaskan apa yang terjadi dalam tubuh Anda saat ini. Setiap jam tanpa rokok, tubuh bekerja keras memulihkan kerusakan yang telah terjadi. Aliran darah ke tangan dan kaki membaik, suhu tubuh kembali normal, dan yang paling penting - sel-sel dalam paru-paru mulai beregenerasi. Proses ini akan terus berlanjut selama berbulan-bulan kedepan. Percayalah pada kemampuan luar biasa tubuh Anda untuk menyembuhkan diri.",
        "Langkah pertama ini menunjukkan kekuatan karakter dan komitmen terhadap kesehatan yang luar biasa. Dari pengalaman klinis saya, pasien yang berhasil melewati minggu pertama memiliki peluang 90% lebih tinggi untuk berhasil jangka panjang. Yang perlu Anda ingat adalah bahwa nikotin akan sepenuhnya keluar dari tubuh dalam 72 jam. Setelah itu, semua gejala yang Anda rasakan adalah psikologis dan dapat diatasi dengan strategi yang tepat. Mari kita bangun fondasi yang kuat untuk perjalanan sehat Anda!",
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
        "Setiap hari tanpa rokok adalah kemenangan kecil yang bermakna besar. Hari ini, kamu telah memilih untuk menghargai tubuhmu, menghormati kesehatanmu, dan memberikan yang terbaik untuk masa depan. Setiap napas yang kamu ambil sekarang adalah napas yang lebih bersih, lebih bebas, dan lebih penuh makna.",
        "Kesehatan adalah investasi terbaik untuk masa depan yang cerah. Dengan setiap hari yang berlalu tanpa rokok, kamu sedang membangun fondasi yang kuat untuk kehidupan yang lebih panjang, lebih bahagia, dan lebih bermakna. Tubuhmu sedang menyembuhkan diri, dan setiap sel dalam tubuhmu berterima kasih atas keputusan bijak yang telah kamu buat.",
        "Kamu lebih kuat dari kecanduan apapun. Percayalah pada diri sendiri. Dalam setiap momen ketika kamu merasa tergoda, ingatlah bahwa kamu memiliki kekuatan yang luar biasa dalam dirimu. Kamu telah membuktikan bahwa kamu bisa mengambil kendali atas hidupmu sendiri, dan itu adalah pencapaian yang sangat luar biasa.",
        "Perubahan dimulai dari keputusan kecil yang konsisten. Setiap hari yang kamu lewati tanpa rokok adalah bukti nyata bahwa kamu mampu menciptakan transformasi positif dalam hidupmu. Kebiasaan baik yang kamu bangun hari ini akan menjadi fondasi untuk kebiasaan-kebiasaan hebat lainnya di masa depan.",
        "Hidup sehat adalah hadiah terbaik untuk orang-orang yang kamu cintai. Dengan berhenti merokok, kamu tidak hanya memberikan yang terbaik untuk dirimu sendiri, tetapi juga untuk keluarga, teman, dan semua orang yang peduli padamu. Kamu sedang menjadi contoh yang menginspirasi bagi mereka yang melihat perjuanganmu.",
        "Paru-parumu sedang bernapas lega hari ini. Setiap hari tanpa rokok adalah hari dimana tubuhmu memiliki kesempatan untuk menyembuhkan diri. Sirkulasi darahmu membaik, oksigen mengalir lebih lancar, dan energimu akan semakin meningkat. Kamu sedang memberikan hadiah kesehatan yang tak ternilai untuk dirimu sendiri.",
        "Kebebasan sejati dimulai ketika kamu tidak lagi bergantung pada rokok. Hari ini, kamu adalah versi yang lebih bebas dari dirimu. Bebas dari kecemasan mencari rokok, bebas dari kekhawatiran tentang kesehatan, dan bebas untuk menikmati hidup dengan cara yang lebih autentik dan bermakna.",
        "Setiap rupiah yang tidak kamu habiskan untuk rokok adalah investasi untuk mimpi-mimpimu. Bayangkan semua hal indah yang bisa kamu lakukan dengan uang yang sekarang kamu hemat. Liburan bersama keluarga, hobi baru, atau bahkan tabungan untuk masa depan - semuanya menjadi lebih mungkin karena keputusan bijak yang telah kamu ambil."
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
      helpContent: 'Have any question or need help? Contact our support team at sandy@zaynstudio.app',
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
        "Congratulations! As a doctor, I am incredibly proud of your decision to begin this smoke-free journey. Within the first 20 minutes after your last cigarette, your heart rate and blood pressure have already begun to normalize. In 8-12 hours, the carbon monoxide levels in your blood drop significantly, and oxygen starts flowing better throughout your body. The first few days are indeed challenging as your body undergoes nicotine detoxification, but remember that every withdrawal symptom you experience is a sign that your body is healing itself. Stay strong!",
        "From a medical perspective, your decision to quit smoking is the best health investment ever made. Research shows that within the first 24 hours, your risk of heart attack already begins to decrease. In 48-72 hours, your sense of smell and taste will start improving dramatically. As a doctor who has witnessed the extraordinary difference in patients who successfully quit, I'm confident you will experience increased energy, better sleep quality, and improved stamina in the weeks to come.",
        "The first day is a monumental achievement! From a physiological perspective, your body has already begun an incredible healing process. The cilia in your lungs are starting to function normally again, helping to clear mucus and harmful particles. Your immune system is beginning to strengthen. What you're experiencing now - perhaps some restlessness or difficulty concentrating - is your brain's normal response as it adjusts dopamine levels without nicotine. In 3-5 days, physical withdrawal symptoms will start to subside and you'll experience remarkable mental clarity.",
        "As a doctor who has handled thousands of smoking cessation cases, I want to explain what's happening in your body right now. Every hour without cigarettes, your body works hard to repair the damage that has occurred. Blood flow to your hands and feet improves, body temperature returns to normal, and most importantly - cells in your lungs begin to regenerate. This process will continue for months ahead. Trust in your body's incredible ability to heal itself.",
        "This first step demonstrates extraordinary character strength and commitment to health. From my clinical experience, patients who successfully pass the first week have a 90% higher chance of long-term success. What you need to remember is that nicotine will be completely out of your body within 72 hours. After that, all symptoms you experience are psychological and can be overcome with the right strategies. Let's build a strong foundation for your healthy journey!",
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
    
    if (locales && locales.length > 0) {
      // Get the primary locale
      const primaryLocale = locales[0];
      
      // Extract language code (e.g., "id", "en", "fr")
      const languageCode = primaryLocale.languageCode?.toLowerCase();
      
      // Return Indonesian if device is set to Indonesian, otherwise English
      return languageCode === 'id' ? 'id' : 'en';
    }
    
    // Fallback to Indonesian if no locales found
    return 'id';
  } catch (error) {
    // Fallback to Indonesian if detection fails
    console.log('Device language detection failed, using Indonesian fallback');
    return 'id';
  }
}