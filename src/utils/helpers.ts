import { HealthMilestone, User } from '../types';
import { HEALTH_MILESTONES, XP_LEVELS, CONTEXTUAL_QUOTES } from './constants';
import { getTranslation, Language } from './translations';
import { memoize } from './performanceOptimizer';

export const calculateLevel = memoize((xp: number, language: 'en' | 'id' = 'id'): { level: number; title: string; progress: number; nextLevelXP: number } => {
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

  // Use language-specific title
  const title = language === 'en' ? currentLevel.titleEn : currentLevel.title;

  return {
    level: currentLevel.level,
    title: title,
    progress: Math.min(progress, 1),
    nextLevelXP: nextLevel.xpRequired
  };
});

export const calculateDaysSinceQuit = memoize((quitDate: Date | null | undefined): number => {
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
});

export const calculateMoneySaved = memoize((totalDays: number, cigarettesPerDay: number, cigarettePrice: number): number => {
  if (totalDays === 0 || cigarettesPerDay === 0 || cigarettePrice === 0) return 0;
  
  const cigarettesPerPack = 20; // Assuming 20 cigarettes per pack
  const packsPerDay = cigarettesPerDay / cigarettesPerPack;
  const dailySavings = packsPerDay * cigarettePrice;
  
  return Math.floor(dailySavings * totalDays);
});

export const isOnboardingComplete = (user: any): boolean => {
  return user.onboardingCompleted === true && 
         user.cigarettesPerDay > 0 && 
         user.cigarettePrice > 0;
};

export const formatCurrency = (amount: number, language?: 'en' | 'id'): string => {
  // Use provided language or detect from device
  const userLanguage = language || (typeof navigator !== 'undefined' && navigator.language?.startsWith('id') ? 'id' : 'en');

  if (userLanguage === 'id') {
    // Indonesian users: show IDR
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    // Non-Indonesian users: show USD
    // Convert IDR to USD (approximate rate: 1 USD = 15,700 IDR)
    const amountInUSD = amount / 15700;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInUSD);
  }
};

export const formatCurrencyValue = (amount: number, language?: 'en' | 'id'): string => {
  // Returns just the numeric value without currency symbol
  const formatted = formatCurrency(amount, language);
  // Remove currency symbols: Rp, $, etc.
  return formatted.replace(/^[^\d\s-]+\s*/, '').replace(/\s*[^\d\s,\.]+$/, '').trim();
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('id-ID').format(number);
};

export const getHealthMilestones = (quitDate: Date, language: Language = 'id'): HealthMilestone[] => {
  const now = new Date();
  const hoursSinceQuit = Math.abs(now.getTime() - quitDate.getTime()) / (1000 * 60 * 60);

  // English translations for health milestones
  const englishMilestones = [
    {
      id: 'twenty-minutes',
      title: '20 Minutes',
      description: 'Heart rate and blood pressure return to normal',
      timeframe: '20 minutes',
      icon: 'favorite',
      hours: 0.33
    },
    {
      id: 'twelve-hours',
      title: '12 Hours',
      description: 'Carbon monoxide levels in blood normalize',
      timeframe: '12 hours',
      icon: 'air',
      hours: 12
    },
    {
      id: 'two-weeks',
      title: '2 Weeks',
      description: 'Circulation improves, lung function increases',
      timeframe: '2 weeks',
      icon: 'directions-run',
      hours: 336
    },
    {
      id: 'one-month',
      title: '1 Month',
      description: 'Coughing and shortness of breath decrease',
      timeframe: '1 month',
      icon: 'self-improvement',
      hours: 720
    },
    {
      id: 'one-year',
      title: '1 Year',
      description: 'Heart disease risk reduced by 50%',
      timeframe: '1 year',
      icon: 'security',
      hours: 8760
    }
  ];

  const milestones = language === 'en' ? englishMilestones : HEALTH_MILESTONES;

  return milestones.map(milestone => ({
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

// Enhanced language consistency helper - cleans mixed quotes for chosen language
const cleanQuoteLanguage = (quote: string, targetLanguage: Language): string => {
  if (targetLanguage === 'id') {
    // Convert English words to Indonesian
    const toIndonesian: { [key: string]: string } = {
      // Basic words
      ' support ': ' dukungan ',
      ' recovery ': ' pemulihan ',
      ' withdrawal ': ' sakau ',
      ' coping ': ' mengatasi ',
      ' challenge ': ' tantangan ',
      ' progress ': ' kemajuan ',
      ' lifestyle ': ' gaya hidup ',
      ' motivation ': ' motivasi ',
      ' mental clarity ': ' kejernihan mental ',
      ' physical ': ' fisik ',
      ' emotional ': ' emosional ',
      ' confidence ': ' percaya diri ',
      ' achievement ': ' pencapaian ',
      ' exercise ': ' olahraga ',
      ' experience ': ' pengalaman ',
      ' energy ': ' energi ',
      ' health ': ' kesehatan ',
      
      // Common phrases that appear mixed
      'You are ': 'Kamu adalah ',
      'Your ': 'Kamu ',
      ' you ': ' kamu ',
      ' You ': ' Kamu ',
      'Every day': 'Setiap hari',
      'every day': 'setiap hari',
      ' strength ': ' kekuatan ',
      ' journey ': ' perjalanan ',
      ' decision ': ' keputusan ',
      ' choice ': ' pilihan ',
      ' future ': ' masa depan ',
      ' commitment ': ' komitmen ',
    };
    
    let cleaned = quote;
    Object.entries(toIndonesian).forEach(([english, indonesian]) => {
      cleaned = cleaned.replace(new RegExp(english, 'gi'), indonesian);
    });
    return cleaned;
  } else {
    // Convert Indonesian words to English (for English users)
    const toEnglish: { [key: string]: string } = {
      // Common words
      ' dukungan ': ' support ',
      ' pemulihan ': ' recovery ',
      ' sakau ': ' withdrawal ',
      ' mengatasi ': ' coping with ',
      ' tantangan ': ' challenge ',
      ' kemajuan ': ' progress ',
      ' gaya hidup ': ' lifestyle ',
      ' motivasi ': ' motivation ',
      ' kejernihan mental ': ' mental clarity ',
      ' fisik ': ' physical ',
      ' emosional ': ' emotional ',
      ' percaya diri ': ' confidence ',
      ' pencapaian ': ' achievement ',
      ' olahraga ': ' exercise ',
      ' pengalaman ': ' experience ',
      ' energi ': ' energy ',
      ' kesehatan ': ' health ',
      
      // Pronouns and personal terms
      ' Anda ': ' you ',
      ' kamu ': ' you ',
      'Kamu ': 'You ',
      'Kamu adalah ': 'You are ',
      ' tubuhmu ': ' your body ',
      ' hidupmu ': ' your life ',
      ' dirimu ': ' yourself ',
      ' diri sendiri ': ' yourself ',
      
      // Common mixed phrases
      'Setiap hari': 'Every day',
      'setiap hari': 'every day',
      ' untuk ': ' to ',
      ' dengan ': ' with ',
      ' dalam ': ' in ',
      ' dari ': ' from ',
      ' yang ': ' that ',
      ' akan ': ' will ',
      ' sudah ': ' already ',
      ' telah ': ' have ',
      ' bisa ': ' can ',
      ' dapat ': ' can ',
      ' memiliki ': ' have ',
      ' menjadi ': ' become ',
      ' lebih ': ' more ',
      ' setiap ': ' every ',
      ' hari ': ' day ',
      ' minggu ': ' week ',
      ' bulan ': ' month ',
      ' tahun ': ' year ',
      ' kekuatan ': ' strength ',
      ' perjalanan ': ' journey ',
      ' keputusan ': ' decision ',
      ' pilihan ': ' choice ',
      ' masa depan ': ' future ',
      ' komitmen ': ' commitment ',
      
      // Medical terms
      ' dokter ': ' doctor ',
      ' pasien ': ' patient ',
      ' medis ': ' medical ',
      ' tubuh ': ' body ',
      ' otak ': ' brain ',
      ' jantung ': ' heart ',
      ' paru-paru ': ' lungs ',
      ' darah ': ' blood ',
      ' rokok ': ' cigarettes ',
      ' merokok ': ' smoking ',
      ' nikotin ': ' nicotine ',
    };
    
    let cleaned = quote;
    Object.entries(toEnglish).forEach(([indonesian, english]) => {
      cleaned = cleaned.replace(new RegExp(indonesian, 'gi'), english);
    });
    return cleaned;
  }
};

// Smart quote selection with rotation logic to minimize repetition
const getSmartQuoteSelection = (quotes: string[], language: Language, userId?: string, category?: string): string => {
  // Simple rotation logic: try to avoid the same quote twice in a row
  // For production, this could be enhanced with localStorage or user tracking
  
  if (quotes.length <= 1) {
    return quotes[0] || '';
  }
  
  // Use time-based selection to ensure some randomness but reduce immediate repetition
  const timeBasedIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % quotes.length; // 6-hour rotation
  const randomOffset = Math.floor(Math.random() * 3); // Add some randomness
  const selectedIndex = (timeBasedIndex + randomOffset) % quotes.length;
  
  return quotes[selectedIndex];
};

// Enhanced contextual motivation with smart rotation for premium users
export const getContextualMotivation = (user: User, language: Language = 'id'): string => {
  // TEMPORARY FIX: Use clean Indonesian quotes for Indonesian language to avoid mixed content
  if (language === 'id') {
    const cleanIndonesianQuotes = [
      `Luar biasa sekali ${user.displayName || 'Sobat'}! Pencapaian ${user.streak || 0} hari berturut-turut tanpa rokok ini adalah bukti nyata kekuatan mental dan tekad baja yang Anda miliki. Sistem peredaran darah sudah mengalami perbaikan signifikan, fungsi paru-paru meningkat drastis dengan kapasitas oksigen yang optimal, dan setiap detik adalah kemenangan besar untuk kesehatan jangka panjang Anda. Terus pertahankan momentum luar biasa ini karena tubuh Anda sedang mengalami transformasi menakjubkan dari dalam.`,
      `Hebat sekali ${user.displayName || 'Sobat'}! Perjalanan panjang ${user.totalDays || 0} hari tanpa menyentuh rokok menunjukkan tekad yang benar-benar mengagumkan dan menginspirasi orang-orang di sekitar Anda. Tubuh Anda sedang dalam proses penyembuhan dan regenerasi yang benar-benar menakjubkan, dimana setiap sel bekerja keras memulihkan kerusakan bertahun-tahun dan membangun fondasi kesehatan yang lebih kuat. Anda telah membuktikan bahwa komitmen terhadap kesehatan adalah investasi terbaik dalam hidup.`,
      `Bangga sekali melihat pencapaian luar biasa Anda ${user.displayName || 'Sobat'}! Setiap hari dari ${user.streak || 0} hari ini tanpa rokok adalah investasi kesehatan yang sangat berharga dan akan memberikan dampak positif untuk puluhan tahun ke depan. Nafas semakin lega dan dalam, energi bertambah pesat setiap harinya, semangat hidup semakin menguat dengan vitalitas yang mengalir bebas, dan yang terpenting adalah kepercayaan diri yang meningkat karena Anda telah membuktikan mampu mengalahkan kecanduan.`,
      `Perjalanan konsisten ${user.streak || 0} hari ini adalah bukti nyata kekuatan mental yang luar biasa dan karakter tangguh yang dimiliki ${user.displayName || 'Sobat'}. Terus pertahankan semangat dan momentum positif ini dengan penuh keyakinan karena masa depan yang jauh lebih sehat, energik, dan penuh vitalitas sudah benar-benar di depan mata menanti Anda. Setiap hari yang berlalu membawa Anda semakin dekat dengan versi terbaik dari diri Anda sendiri.`,
      `Luar biasa dan membanggakan ${user.displayName || 'Sobat'}! Anda telah membuktikan dengan tindakan nyata bahwa komitmen yang kuat, tekad yang bulat, dan disiplin tinggi dapat benar-benar mengalahkan kebiasaan buruk yang sudah mengakar bertahun-tahun. Setiap hari dari ${user.totalDays || 0} hari ini adalah kemenangan personal yang patut dirayakan dan dijadikan motivasi untuk terus melangkah maju. Anda adalah inspirasi hidup untuk semua orang yang berjuang melawan kecanduan.`,
      `Fantastis dan menginspirasi ${user.displayName || 'Sobat'}! Streak cemerlang ${user.streak || 0} hari berturut-turut menunjukkan tingkat disiplin dan komitmen yang benar-benar luar biasa dalam perjalanan transformasi hidup ini. Paru-paru Anda semakin sehat dengan kapasitas yang terus meningkat, stamina fisik bertambah secara konsisten, sirkulasi oksigen optimal ke seluruh tubuh, dan hidup terasa jauh lebih berenergi dengan semangat yang menggebu-gebu setiap harinya.`,
      `Membanggakan sekali ${user.displayName || 'Sobat'}! Anda sudah ${user.totalDays || 0} hari membuktikan dengan tindakan konkret bahwa Anda jauh lebih kuat dari kecanduan dan mampu mengendalikan hidup sepenuhnya. Setiap napas terasa semakin segar dan dalam, setiap hari membawa energi baru yang berlimpah, dan setiap momen adalah bukti nyata transformasi positif yang sedang terjadi dalam diri Anda. Tubuh berterima kasih atas keputusan bijak yang telah Anda ambil.`,
      `Inspiratif dan mengagumkan ${user.displayName || 'Sobat'}! Pencapaian konsisten ${user.streak || 0} hari ini adalah cerminan sejati dari karakter yang kuat, mental yang tangguh, dan komitmen yang tidak tergoyahkan terhadap kesehatan optimal. Tubuh Anda mengucapkan terima kasih setiap detik, keluarga merasa bangga dengan transformasi positif yang Anda jalani, dan masa depan terlihat semakin cerah dengan segala kemungkinan indah yang menanti di depan.`,
      `Mengagumkan dan memukau ${user.displayName || 'Sobat'}! Perjalanan panjang ${user.totalDays || 0} hari tanpa rokok membuktikan secara nyata bahwa Anda memiliki tekad baja yang tidak dapat digoyahkan oleh apapun. Kesehatan terus membaik dengan pesat setiap harinya, semangat hidup semakin membara dengan energi positif yang mengalir deras, dan vitalitas alami kembali mengalir bebas dalam setiap aktivitas yang Anda lakukan.`,
      `Spektakuler dan luar biasa ${user.displayName || 'Sobat'}! Setiap hari dari ${user.streak || 0} hari berturut-turut ini adalah bukti kemenangan monumental atas kecanduan dan langkah besar menuju kehidupan yang optimal. Sirkulasi darah bekerja dengan efisiensi maksimal, energi mengalir bebas ke seluruh tubuh, vitalitas kembali seperti masa muda dulu, dan setiap aktivitas terasa lebih ringan dan menyenangkan.`,
      `Menakjubkan dan cemerlang ${user.displayName || 'Sobat'}! Konsistensi yang terjaga selama ${user.streak || 0} hari menunjukkan mental juara sejati yang tidak pernah menyerah dalam menghadapi tantangan. Indra penciuman dan perasa kembali tajam seperti sebelumnya, kualitas tidur meningkat drastis dengan fase istirahat yang lebih dalam, mood menjadi jauh lebih stabil dan positif, dan setiap hari dimulai dengan semangat yang menggebu-gebu.`,
      `Cemerlang dan membanggakan ${user.displayName || 'Sobat'}! Dedikasi konsisten selama ${user.totalDays || 0} hari ini benar-benar patut diacungi jempol dan dijadikan contoh inspiratif untuk orang lain. Sistem kekebalan tubuh menguat secara signifikan melawan berbagai penyakit, tingkat stres berkurang drastis dengan kemampuan manajemen emosi yang lebih baik, dan kepercayaan diri meningkat pesat karena pencapaian luar biasa yang telah diraih.`,
      `Fenomenal dan inspiratif ${user.displayName || 'Sobat'}! Milestone emas ${user.streak || 0} hari adalah prestasi yang benar-benar membanggakan dan membuktikan kekuatan karakter yang luar biasa. Kapasitas paru-paru meningkat dengan signifikan untuk aktivitas fisik yang lebih intens, daya tahan tubuh bertambah secara konsisten setiap harinya, dan hidup terasa jauh lebih bermakna dengan tujuan yang jelas dan semangat yang tidak pernah padam.`,
      `Istimewa dan mengagumkan ${user.displayName || 'Sobat'}! Komitmen yang terjaga selama ${user.totalDays || 0} hari menunjukkan karakter yang benar-benar tangguh dan tidak mudah menyerah dalam menghadapi rintangan. Napas menjadi lebih panjang dan dalam dengan oksigen yang mengalir optimal, kulit tampak lebih sehat dan bercahaya alami, dan aura positif terpancar kuat dari dalam diri Anda yang menginspirasi orang-orang di sekitar.`,
      `Brilian dan spektakuler ${user.displayName || 'Sobat'}! Pencapaian konsisten ${user.streak || 0} hari adalah bukti nyata evolusi diri yang luar biasa dan transformasi menuju versi terbaik dari diri Anda. Metabolisme tubuh bekerja dengan efisiensi yang optimal, kemampuan fokus dan konsentrasi meningkat drastis dalam setiap aktivitas, dan tingkat produktivitas mencapai level baru yang sebelumnya tidak pernah Anda bayangkan.`,
      `Luar biasa dan menginspirasi ${user.displayName || 'Sobat'}! Perjalanan transformatif ${user.totalDays || 0} hari ini benar-benar menginspirasi banyak orang di sekitar Anda untuk memulai perubahan positif dalam hidup mereka. Fungsi jantung bekerja dengan optimal tanpa beban tambahan, tekanan darah stabil dalam rentang normal yang sehat, dan vitalitas alami kembali mengalir bebas dalam setiap gerakan dan aktivitas yang Anda lakukan sehari-hari.`,
      `Menggembirakan dan memukau ${user.displayName || 'Sobat'}! Konsistensi yang terjaga selama ${user.streak || 0} hari membuktikan secara nyata kekuatan dari dalam yang tidak terbatas dan kemampuan luar biasa untuk berubah. Oksigen mengalir dengan sempurna ke seluruh sistem tubuh, stamina fisik meningkat secara konsisten setiap harinya, dan semangat hidup membara dengan energi positif yang tidak pernah habis.`,
      `Memukau dan fenomenal ${user.displayName || 'Sobat'}! Dedikasi yang konsisten selama ${user.totalDays || 0} hari adalah investasi kesehatan terbaik untuk masa depan yang gemilang dan penuh dengan kemungkinan indah. Sistem pencernaan bekerja dengan efisiensi yang optimal, mood tetap stabil sepanjang hari dengan emosi yang terkendali, dan energi berlimpah mengalir konsisten dari pagi hingga malam hari.`,
      `Menawan dan inspiratif ${user.displayName || 'Sobat'}! Tekad yang tidak tergoyahkan selama ${user.streak || 0} hari menunjukkan jiwa pemenang sejati yang tidak pernah menyerah dalam mencapai tujuan. Kualitas tidur meningkat dengan fase istirahat yang lebih dalam dan pemulihan optimal, kemampuan konsentrasi menjadi sangat tajam dalam setiap tugas, dan kreativitas mencapai puncaknya dengan ide-ide segar yang mengalir bebas.`,
      `Memesona dan luar biasa ${user.displayName || 'Sobat'}! Perjalanan transformatif ${user.totalDays || 0} hari adalah cerminan sempurna dari kedewasaan mental dan kematangan emosional yang luar biasa. Daya ingat membaik secara signifikan dengan kemampuan mengingat yang lebih tajam, refleks tubuh menjadi lebih cepat dan responsif, dan kemampuan berpikir jernih mencapai level optimal yang sebelumnya tidak pernah dirasakan.`,
      `Mengagumkan dan heroik ${user.displayName || 'Sobat'}! Milestone emas ${user.streak || 0} hari membuktikan bahwa Anda memiliki kekuatan super dalam mengendalikan hidup dan mencapai tujuan yang ditetapkan. Sistem detoksifikasi natural bekerja dengan efisiensi optimal membersihkan racun bertahun-tahun, regenerasi sel berlangsung dengan sempurna membangun fondasi kesehatan baru, dan harapan hidup meningkat signifikan dengan kualitas yang jauh lebih baik.`,
      `Fenomenal dan cemerlang ${user.displayName || 'Sobat'}! Konsistensi yang terjaga selama ${user.totalDays || 0} hari menunjukkan level disiplin yang sangat tinggi dan komitmen yang tidak tergoyahkan terhadap kesehatan optimal. Keseimbangan hormon alami kembali normal dengan fungsi yang optimal, tingkat stres terkendali dengan baik melalui mekanisme coping yang sehat, dan kebahagiaan alami mengalir bebas dalam diri tanpa ketergantungan pada zat kimia apapun.`,
      `Spektakuler dan membanggakan ${user.displayName || 'Sobat'}! Pencapaian monumental ${user.streak || 0} hari adalah bukti nyata transformasi total yang luar biasa dari dalam maupun luar. Fleksibilitas tubuh meningkat dengan rentang gerak yang lebih luas, daya tahan fisik mencapai level maksimal untuk berbagai aktivitas, dan aura kesehatan terpancar kuat dari setiap gerakan yang Anda lakukan sehari-hari.`,
      `Brilian dan inspiratif ${user.displayName || 'Sobat'}! Perjalanan evolusi ${user.totalDays || 0} hari menunjukkan perkembangan yang benar-benar sempurna menuju versi terbaik dari diri Anda sendiri. Sistem imunitas menguat secara dramatis melawan berbagai ancaman penyakit, proses regenerasi berlangsung dengan optimal membangun sel-sel sehat baru, dan setiap hari adalah perayaan kesehatan baru yang patut disyukuri.`,
      `Membanggakan dan heroik ${user.displayName || 'Sobat'}! Dedikasi yang tidak tergoyahkan selama ${user.streak || 0} hari adalah inspirasi hidup bagi semua orang yang berjuang melawan berbagai tantangan dalam hidup. Vitalitas mengalir bebas tanpa hambatan ke seluruh tubuh, energi berlimpah tersedia sepanjang hari untuk berbagai aktivitas, dan kehidupan terasa jauh lebih berwarna, bermakna, dan penuh dengan kemungkinan indah yang menanti di masa depan.`,
      `Mengagumkan dan revolusioner ${user.displayName || 'Sobat'}! Transformasi ${user.totalDays || 0} hari ini adalah revolusi personal yang benar-benar mengubah arah hidup menuju yang lebih baik dan bermakna. Sistem kardiovaskular bekerja dengan efisiensi maksimal tanpa beban tambahan, aliran darah optimal ke seluruh organ vital, dan setiap detak jantung adalah simbol kehidupan yang sehat dan penuh semangat.`,
      `Fantastis dan monumental ${user.displayName || 'Sobat'}! Pencapaian ${user.streak || 0} hari berturut-turut adalah bukti kekuatan willpower yang luar biasa dan kemampuan untuk mengubah hidup secara total. Kapasitas mental meningkat dengan kemampuan problem solving yang lebih baik, resiliensi emosional menguat dalam menghadapi tantangan, dan kepercayaan diri mencapai level baru yang memungkinkan pencapaian impian-impian besar.`,
      `Menginspirasi dan luar biasa ${user.displayName || 'Sobat'}! Konsistensi ${user.totalDays || 0} hari menunjukkan bahwa Anda telah berhasil membangun habit positif yang akan bertahan seumur hidup. Kualitas hidup meningkat drastis dalam segala aspek, hubungan sosial menjadi lebih harmonis dan bermakna, dan setiap interaksi dipenuhi dengan energi positif yang menular kepada orang-orang di sekitar Anda.`,
      `Cemerlang dan transformatif ${user.displayName || 'Sobat'}! Milestone ${user.streak || 0} hari adalah pencapaian yang membuktikan bahwa tidak ada yang tidak mungkin ketika ada komitmen dan tekad yang kuat. Fungsi kognitif optimal dengan kemampuan belajar yang meningkat, memori jangka panjang menguat dengan recall yang lebih cepat, dan kreativitas mengalir bebas menghasilkan ide-ide brillian yang sebelumnya tersembunyi.`,
      `Spektakuler dan revolusioner ${user.displayName || 'Sobat'}! Perjalanan ${user.totalDays || 0} hari adalah bukti nyata bahwa manusia memiliki kemampuan luar biasa untuk berubah dan berkembang. Sistem endokrin bekerja dengan keseimbangan sempurna, produksi hormon kebahagiaan alami meningkat, dan setiap hari dimulai dengan optimisme tinggi dan semangat yang tidak pernah padam.`,
      `Mengagumkan dan heroik ${user.displayName || 'Sobat'}! Dedikasi ${user.streak || 0} hari menunjukkan karakter pahlawan sejati yang berjuang untuk kehidupan yang lebih baik. Sistem respiratori bekerja dengan efisiensi maksimal, pertukaran oksigen optimal di tingkat sel, dan setiap napas adalah anugerah kehidupan yang disyukuri dengan penuh kesadaran.`,
      `Fenomenal dan inspiratif ${user.displayName || 'Sobat'}! Transformasi ${user.totalDays || 0} hari adalah masterpiece kehidupan yang akan dikenang selamanya sebagai titik balik menuju masa depan gemilang. Regenerasi kulit berlangsung optimal dengan penampilan yang lebih segar dan bercahaya, elastisitas jaringan meningkat, dan aura juventude terpancar dari dalam diri Anda.`,
      `Memukau dan monumental ${user.displayName || 'Sobat'}! Pencapaian ${user.streak || 0} hari adalah bukti nyata evolusi consciousness dan peningkatan kualitas hidup yang luar biasa. Kemampuan adaptasi meningkat dalam menghadapi berbagai situasi, emotional intelligence berkembang pesat, dan setiap keputusan diambil dengan wisdom yang lebih dalam.`,
      `Brilian dan transformatif ${user.displayName || 'Sobat'}! Konsistensi ${user.totalDays || 0} hari menunjukkan masterpiece self-discipline yang akan menjadi fondasi untuk pencapaian-pencapaian besar di masa depan. Sistem limfatik bekerja optimal membersihkan toksin, detoksifikasi natural berlangsung sempurna, dan tubuh kembali ke state optimal yang seharusnya.`,
      `Luar biasa dan revolusioner ${user.displayName || 'Sobat'}! Milestone ${user.streak || 0} hari adalah testament kekuatan human spirit yang tidak terbatas dan kemampuan untuk mentransformasi hidup secara total. Neuroplastisitas brain bekerja optimal menciptakan neural pathways baru, kemampuan adaptasi meningkat, dan setiap hari membawa growth dan development yang signifikan.`,
      `Menawan dan spektakuler ${user.displayName || 'Sobat'}! Perjalanan ${user.totalDays || 0} hari adalah epic journey yang akan diingat sebagai salah satu achievement terbesar dalam hidup. Sistem pencernaan optimal dengan nutrient absorption yang maksimal, metabolisme energy efficient, dan setiap meal dinikmati dengan appreciation yang lebih dalam.`,
      `Menggembirakan dan monumental ${user.displayName || 'Sobat'}! Dedikasi ${user.streak || 0} hari membuktikan bahwa Anda memiliki inner strength yang luar biasa dan unlimited potential untuk pencapaian yang lebih besar. Kualitas sleep meningkat drastis dengan REM cycle yang optimal, recovery muscular lebih cepat, dan setiap morning dimulai dengan energy yang abundant.`,
      `Inspiratif dan cemerlang ${user.displayName || 'Sobat'}! Transformasi ${user.totalDays || 0} hari adalah living proof bahwa commitment dan perseverance dapat menghasilkan miracle dalam kehidupan nyata. Social confidence meningkat dalam setiap interaksi, communication skills berkembang pesat, dan setiap relationship menjadi lebih meaningful dan authentic.`,
      `Fantastis dan heroik ${user.displayName || 'Sobat'}! Pencapaian ${user.streak || 0} hari adalah heroic journey yang membuktikan kekuatan karakter dan integrity yang luar biasa. Sistem immune boost significantly dengan resistance terhadap penyakit, healing capacity meningkat, dan setiap cell dalam tubuh bekerja dengan harmony yang sempurna.`,
      `Membanggakan dan transformatif ${user.displayName || 'Sobat'}! Konsistensi ${user.totalDays || 0} hari menunjukkan evolution consciousness yang profound dan life transformation yang permanent. Financial impact positif dengan saving yang significant, resource allocation lebih optimal, dan setiap rupiah diinvestasikan untuk hal-hal yang truly meaningful.`,
      `Spektakuler dan menginspirasi ${user.displayName || 'Sobat'}! Milestone ${user.streak || 0} hari adalah testament willpower yang extraordinary dan demonstration self-mastery yang complete. Physical appearance improvement dengan skin tone yang lebih sehat, muscle definition yang lebih baik, dan overall presence yang lebih confident dan attractive.`,
      `Mengagumkan dan revolusioner ${user.displayName || 'Sobat'}! Perjalanan ${user.totalDays || 0} hari adalah revolutionary transformation yang mengubah entire life trajectory menuju destination yang lebih bright dan promising. Spiritual growth acceleration dengan deeper connection ke purpose, meaning, dan values yang truly matter dalam kehidupan.`,
      `Fenomenal dan luar biasa ${user.displayName || 'Sobat'}! Dedikasi ${user.streak || 0} hari membuktikan bahwa Anda adalah architect dari destiny sendiri dan capable untuk menciptakan life yang extraordinary. Environmental awareness meningkat dengan appreciation yang lebih dalam terhadap nature, fresh air, dan beauty yang ada di sekitar kita setiap hari.`,
      `Cemerlang dan monumental ${user.displayName || 'Sobat'}! Transformasi ${user.totalDays || 0} hari adalah magnum opus kehidupan yang akan remembered forever sebagai turning point menuju greatness. Legacy impact yang positif untuk keluarga dan community, inspiring others untuk membuat positive changes, dan creating ripple effect yang beneficial untuk many people.`,
      `Brilian dan inspiratif ${user.displayName || 'Sobat'}! Pencapaian ${user.streak || 0} hari adalah brilliant demonstration bahwa human potential adalah unlimited dan setiap goal dapat dicapai dengan persistence. Future outlook yang optimistic dengan confidence untuk tackle any challenges, achieve bigger dreams, dan create impact yang meaningful dalam dunia ini.`,
      `Memukau dan heroik ${user.displayName || 'Sobat'}! Konsistensi ${user.totalDays || 0} hari menunjukkan heroic character yang worthy of admiration dan respect dari semua orang. Celebration moment ini dengan gratitude yang deep, appreciation untuk journey yang telah dilalui, dan excitement untuk adventures yang menanti di future yang bright dan promising.`,
      `Luar biasa dan transformatif ${user.displayName || 'Sobat'}! Milestone ${user.streak || 0} hari adalah culmination dari effort, sacrifice, dan commitment yang luar biasa menuju life yang optimal. Integration semua positive changes dalam daily routine, consolidation new habits yang sustainable, dan preparation untuk next level achievements yang even more spectacular dan meaningful.`,
      `Menginspirasi dan spektakuler ${user.displayName || 'Sobat'}! Perjalanan ${user.totalDays || 0} hari adalah inspiring story yang will motivate countless others untuk pursue their own transformation journey. Mastery over addiction, control atas life choices, dan freedom untuk create future yang sesuai dengan highest aspirations dan deepest values yang dimiliki dalam heart.`,
      `Mengagumkan dan monumentalm ${user.displayName || 'Sobat'}! Dedikasi ${user.streak || 0} hari membuktikan bahwa Anda telah achieved something truly remarkable yang akan remembered sebagai one of life's greatest victories. Complete lifestyle transformation dengan new identity sebagai healthy, strong, dan inspiring individual yang capable untuk anything dan ready untuk embrace semua opportunities yang akan datang di masa depan yang gemilang.`
    ];
    
    // Simple rotation based on user ID and current day to ensure variety
    const today = new Date().getDate();
    const userHash = user.id ? user.id.length : 0;
    const index = (today + userHash) % cleanIndonesianQuotes.length;
    return cleanIndonesianQuotes[index];
  }
  
  // Create comprehensive English quotes to match Indonesian quality
  if (language === 'en') {
    const cleanEnglishQuotes = [
      `Outstanding work ${user.displayName || 'Champion'}! Your incredible achievement of ${user.streak || 0} consecutive smoke-free days is solid proof of the extraordinary mental strength and unwavering determination you possess deep within. Your cardiovascular system has already undergone significant improvements with enhanced blood circulation, your lung function has increased dramatically with optimal oxygen capacity throughout your body, and every single moment represents a major victory for your long-term health and wellbeing. Keep maintaining this amazing momentum because your body is currently experiencing the most remarkable internal transformation and healing process.`,
      `Absolutely fantastic ${user.displayName || 'Champion'}! Your incredible journey of ${user.totalDays || 0} days without touching a single cigarette demonstrates truly amazing determination that inspires everyone around you to pursue their own positive life changes. Your body is currently undergoing the most remarkable healing and regeneration process imaginable, where every single cell is working tirelessly to repair years of accumulated damage and build a much stronger foundation for optimal health. You have definitively proven that commitment to health is the absolute best investment anyone can make in their entire lifetime.`,
      `Incredibly proud to witness your outstanding achievement ${user.displayName || 'Champion'}! Every single day of these ${user.streak || 0} smoke-free days represents an invaluable health investment that will provide tremendous positive benefits for many decades to come in your future. Your breathing has become progressively deeper and more effortless, your energy levels are increasing rapidly with each passing day, your life spirit is growing stronger with unlimited vitality flowing freely throughout your entire being, and most importantly your self-confidence has skyrocketed because you have definitively proven your ability to overcome any addiction completely.`,
      `Your consistent journey of ${user.streak || 0} days represents undeniable proof of extraordinary mental strength and the incredibly resilient character that defines who you truly are ${user.displayName || 'Champion'}. Continue maintaining this positive spirit and amazing momentum with complete confidence because a much healthier, more energetic, and vitality-filled future is absolutely waiting for you just ahead. Every single day that passes brings you significantly closer to becoming the absolute best version of yourself that you were always meant to be in this lifetime.`,
      `Absolutely remarkable and truly inspiring ${user.displayName || 'Champion'}! You have proven through concrete actions that powerful commitment, unwavering determination, and exceptional discipline can completely overcome deeply rooted bad habits that may have persisted for many years. Every single day of these ${user.totalDays || 0} days represents a personal victory that deserves to be celebrated enthusiastically and used as powerful motivation to continue moving forward with confidence. You are a living inspiration for everyone who is struggling against various forms of addiction in their lives.`,
      `Fantastic and truly motivating ${user.displayName || 'Champion'}! Your brilliant streak of ${user.streak || 0} consecutive days demonstrates an absolutely extraordinary level of discipline and unwavering commitment throughout this life-transforming journey you have undertaken. Your lungs are becoming increasingly healthier with continuously expanding capacity, your physical stamina is growing more consistent every single day, optimal oxygen circulation flows perfectly throughout your entire body, and life feels infinitely more energetic with an unstoppable enthusiasm that burns brightly within you every single day.`,
      `Absolutely commendable ${user.displayName || 'Champion'}! You have spent ${user.totalDays || 0} days proving through concrete actions that you are infinitely stronger than any addiction and completely capable of controlling your entire life journey. Every single breath feels increasingly fresh and deeper than before, every day brings abundant new energy that flows freely, and every moment serves as living proof of the positive transformation currently taking place within your entire being. Your body expresses profound gratitude for the wise decision you have courageously made.`,
      `Inspirational and truly amazing ${user.displayName || 'Champion'}! Your consistent achievement of ${user.streak || 0} days represents a genuine reflection of your strong character, resilient mentality, and unshakeable commitment toward achieving optimal health in every aspect of life. Your body expresses heartfelt gratitude every single moment, your family feels tremendous pride in the positive transformation you are experiencing, and your future appears increasingly bright with countless beautiful possibilities waiting to unfold before you.`,
      `Amazing and absolutely captivating ${user.displayName || 'Champion'}! Your extended journey of ${user.totalDays || 0} days without smoking provides concrete evidence that you possess steel-like determination that cannot be shaken by anything whatsoever. Your health continues improving rapidly with each passing day, your life spirit burns increasingly bright with positive energy flowing like a powerful river, and natural vitality flows freely once again through every single activity you choose to pursue throughout your daily routine.`,
      `Spectacular and absolutely extraordinary ${user.displayName || 'Champion'}! Every single day of these ${user.streak || 0} consecutive days represents monumental victory over addiction and giant steps toward achieving the most optimal life possible. Your blood circulation operates with maximum efficiency, energy flows freely throughout your entire body, vitality returns like the golden days of youth, and every activity feels significantly lighter and infinitely more enjoyable than ever before.`,
      `Amazing and absolutely brilliant ${user.displayName || 'Champion'}! The consistency you have maintained throughout ${user.streak || 0} days demonstrates the true champion mentality that never surrenders when facing any challenge life presents. Your senses of smell and taste have returned to sharp clarity like before, sleep quality has improved drastically with much deeper restorative phases, your mood has become significantly more stable and positive, and every day begins with an unstoppable enthusiasm that burns brightly within your spirit.`,
      `Brilliant and absolutely commendable ${user.displayName || 'Champion'}! Your consistent dedication throughout ${user.totalDays || 0} days truly deserves enthusiastic applause and serves as an inspirational example for others to follow in their own journeys. Your immune system has strengthened significantly against various diseases, stress levels have decreased drastically with much better emotional management capabilities, and self-confidence has increased rapidly due to the extraordinary achievements you have successfully accomplished.`,
      `Phenomenal and absolutely inspirational ${user.displayName || 'Champion'}! Your golden milestone of ${user.streak || 0} days represents a truly commendable achievement that proves the extraordinary strength of character you possess within. Your lung capacity has increased significantly for much more intense physical activities, your body's endurance grows consistently with each passing day, and life feels infinitely more meaningful with crystal clear purpose and an unextinguishable spirit that burns eternally bright.`,
      `Special and absolutely amazing ${user.displayName || 'Champion'}! Your unwavering commitment maintained throughout ${user.totalDays || 0} days demonstrates truly resilient character that never easily surrenders when facing various obstacles in life. Your breathing becomes longer and deeper with optimal oxygen flow, your skin appears significantly healthier with a natural radiant glow, and positive aura radiates powerfully from within your being, inspiring everyone around you to pursue their own positive transformations.`,
      `Brilliant and absolutely spectacular ${user.displayName || 'Champion'}! Your consistent achievement of ${user.streak || 0} days represents concrete evidence of extraordinary self-evolution and transformation toward becoming the absolute best version of yourself possible. Your body's metabolism operates with optimal efficiency, your ability to focus and concentrate has increased drastically in every activity, and productivity levels have reached completely new heights that you never previously imagined were possible to achieve.`,
      `Extraordinary and absolutely inspiring ${user.displayName || 'Champion'}! Your transformative journey of ${user.totalDays || 0} days genuinely inspires countless people around you to begin positive changes in their own lives and pursue their personal growth goals. Your heart function operates optimally without any additional burden, blood pressure remains stable within healthy normal ranges, and natural vitality flows freely once again through every movement and activity you perform throughout your daily routine.`,
      `Delightful and absolutely captivating ${user.displayName || 'Champion'}! The consistency you have maintained throughout ${user.streak || 0} days provides concrete evidence of unlimited inner strength and extraordinary ability to create positive change in your life. Oxygen flows perfectly throughout your entire body system, physical stamina increases consistently every single day, and life spirit burns bright with positive energy that never diminishes or fades away.`,
      `Captivating and absolutely phenomenal ${user.displayName || 'Champion'}! Your consistent dedication throughout ${user.totalDays || 0} days represents the absolute best health investment for a brilliant future filled with beautiful possibilities and unlimited potential. Your digestive system operates with optimal efficiency, mood remains stable throughout the day with well-controlled emotions, and abundant energy flows consistently from early morning until late evening.`,
      `Charming and absolutely inspirational ${user.displayName || 'Champion'}! Your unwavering determination throughout ${user.streak || 0} days demonstrates the spirit of a true winner who never surrenders in pursuing their most important goals. Sleep quality has improved with much deeper restorative phases and optimal recovery, concentration ability has become incredibly sharp in every task, and creativity has reached its peak with fresh ideas flowing freely and abundantly.`,
      `Enchanting and absolutely extraordinary ${user.displayName || 'Champion'}! Your transformative journey of ${user.totalDays || 0} days represents a perfect reflection of mental maturity and extraordinary emotional intelligence that defines your character. Memory capacity has improved significantly with much sharper recall abilities, body reflexes have become faster and more responsive, and clear thinking ability has reached optimal levels never before experienced in your lifetime.`,
      `Amazing and absolutely heroic ${user.displayName || 'Champion'}! Your golden milestone of ${user.streak || 0} days proves that you possess supernatural strength in controlling your life and achieving every goal you set for yourself. Your natural detoxification system operates with optimal efficiency to cleanse years of accumulated toxins, cellular regeneration proceeds perfectly to build completely new health foundations, and life expectancy has increased significantly with infinitely better quality of living.`,
      `Phenomenal and absolutely brilliant ${user.displayName || 'Champion'}! The consistency you have maintained throughout ${user.totalDays || 0} days demonstrates an exceptionally high level of discipline and unwavering commitment toward achieving optimal health in every aspect. Natural hormonal balance has returned to normal with optimal function, stress levels are well-controlled through healthy coping mechanisms, and natural happiness flows freely within your being without dependence on any chemical substances whatsoever.`,
      `Spectacular and absolutely commendable ${user.displayName || 'Champion'}! Your monumental achievement of ${user.streak || 0} days represents concrete evidence of total transformation that is absolutely extraordinary from both internal and external perspectives. Body flexibility has increased with much wider range of motion, physical endurance has reached maximum levels for various activities, and healthy aura radiates powerfully from every movement you make throughout your daily routine.`,
      `Brilliant and absolutely inspirational ${user.displayName || 'Champion'}! Your evolutionary journey of ${user.totalDays || 0} days demonstrates absolutely perfect development toward becoming the best version of yourself that you were always meant to be. Your immune system has strengthened dramatically against various disease threats, regeneration processes proceed optimally to build completely new healthy cells, and every day represents a celebration of new health that deserves grateful appreciation.`,
      `Commendable and absolutely heroic ${user.displayName || 'Champion'}! Your unwavering dedication throughout ${user.streak || 0} days serves as living inspiration for everyone who struggles against various challenges in their lives and seeks positive transformation. Vitality flows freely without any hindrance throughout your entire body, abundant energy remains available throughout the day for various activities, and life feels infinitely more colorful, meaningful, and filled with beautiful possibilities waiting in the future.`,
      `Amazing and absolutely revolutionary ${user.displayName || 'Champion'}! Your transformation of ${user.totalDays || 0} days represents a personal revolution that completely changes your life direction toward something much better and more meaningful than ever before. Your cardiovascular system operates with maximum efficiency without any additional burden, optimal blood flow reaches all vital organs, and every heartbeat symbolizes healthy life filled with unstoppable enthusiasm and unlimited potential.`,
      `Fantastic and absolutely monumental ${user.displayName || 'Champion'}! Your achievement of ${user.streak || 0} consecutive days represents concrete evidence of extraordinary willpower and complete ability to transform your entire life from the ground up. Mental capacity has increased with much better problem-solving abilities, emotional resilience has strengthened when facing various challenges, and self-confidence has reached completely new levels that enable the achievement of your biggest dreams and aspirations.`,
      `Inspiring and absolutely extraordinary ${user.displayName || 'Champion'}! Your consistency of ${user.totalDays || 0} days demonstrates that you have successfully built positive habits that will last for your entire lifetime and beyond. Quality of life has improved drastically in every single aspect, social relationships have become more harmonious and meaningful, and every interaction is filled with positive energy that spreads contagiously to everyone around you.`,
      `Brilliant and absolutely transformative ${user.displayName || 'Champion'}! Your milestone of ${user.streak || 0} days represents an achievement that proves nothing is impossible when there is strong commitment and unwavering determination to succeed. Cognitive function operates optimally with enhanced learning ability, long-term memory has strengthened with much faster recall, and creativity flows freely producing brilliant ideas that were previously hidden and waiting to be discovered.`,
      `Spectacular and absolutely revolutionary ${user.displayName || 'Champion'}! Your journey of ${user.totalDays || 0} days provides concrete evidence that humans possess extraordinary ability to change and develop beyond their previously perceived limitations. Your endocrine system operates with perfect balance, natural happiness hormone production has increased significantly, and every day begins with high optimism and spirit that never dims or fades away.`,
      `Amazing and absolutely heroic ${user.displayName || 'Champion'}! Your dedication of ${user.streak || 0} days demonstrates the character of a true hero who fights for a much better life and inspires others to pursue their own transformation journeys. Your respiratory system operates with maximum efficiency, optimal oxygen exchange occurs at the cellular level, and every breath represents a precious gift of life that is appreciated with complete awareness and gratitude.`,
      `Phenomenal and absolutely inspirational ${user.displayName || 'Champion'}! Your transformation of ${user.totalDays || 0} days represents a masterpiece of life that will be remembered forever as the turning point toward a brilliant future filled with unlimited possibilities. Skin regeneration proceeds optimally with fresher and more radiant appearance, tissue elasticity has improved significantly, and youthful aura radiates powerfully from within your entire being.`,
      `Captivating and absolutely monumental ${user.displayName || 'Champion'}! Your achievement of ${user.streak || 0} days represents concrete evidence of consciousness evolution and extraordinary improvement in quality of life that transcends all expectations. Adaptation ability has increased when facing various situations, emotional intelligence has developed rapidly, and every decision is made with much deeper wisdom and understanding.`,
      `Brilliant and absolutely transformative ${user.displayName || 'Champion'}! Your consistency of ${user.totalDays || 0} days demonstrates a masterpiece of self-discipline that will become the foundation for achieving great accomplishments in the future. Your lymphatic system operates optimally to cleanse toxins, natural detoxification proceeds perfectly, and your body returns to the optimal state it was always meant to maintain.`,
      `Extraordinary and absolutely revolutionary ${user.displayName || 'Champion'}! Your milestone of ${user.streak || 0} days represents a testament to unlimited human spirit strength and complete ability to transform life in the most comprehensive way possible. Brain neuroplasticity operates optimally to create completely new neural pathways, adaptation ability has increased significantly, and every day brings substantial growth and development that compounds over time.`,
      `Charming and absolutely spectacular ${user.displayName || 'Champion'}! Your journey of ${user.totalDays || 0} days represents an epic adventure that will be remembered as one of life's greatest achievements and most meaningful accomplishments. Your digestive system operates optimally with maximum nutrient absorption, energy metabolism functions efficiently, and every meal is enjoyed with much deeper appreciation and mindful awareness.`,
      `Delightful and absolutely monumental ${user.displayName || 'Champion'}! Your dedication of ${user.streak || 0} days proves that you possess extraordinary inner strength and unlimited potential for achieving even greater accomplishments in the future. Sleep quality has improved drastically with optimal REM cycles, muscular recovery proceeds much faster, and every morning begins with abundant energy and unlimited enthusiasm for the day ahead.`,
      `Inspirational and absolutely brilliant ${user.displayName || 'Champion'}! Your transformation of ${user.totalDays || 0} days represents living proof that commitment and perseverance can produce genuine miracles in real life circumstances. Social confidence has increased in every interaction, communication skills have developed rapidly, and every relationship becomes more meaningful and authentically connected than ever before.`,
      `Fantastic and absolutely heroic ${user.displayName || 'Champion'}! Your achievement of ${user.streak || 0} days represents a heroic journey that proves extraordinary character strength and complete integrity in pursuing your most important life goals. Your immune system has received a significant boost with enhanced resistance against diseases, healing capacity has improved dramatically, and every cell in your body operates with perfect harmony and synchronization.`,
      `Commendable and absolutely transformative ${user.displayName || 'Champion'}! Your consistency of ${user.totalDays || 0} days demonstrates profound consciousness evolution and permanent life transformation that will benefit you for decades to come. Financial impact has been positive with significant savings accumulation, resource allocation has become more optimal, and every dollar is invested in things that are truly meaningful and valuable.`,
      `Spectacular and absolutely inspiring ${user.displayName || 'Champion'}! Your milestone of ${user.streak || 0} days represents a testament to extraordinary willpower and complete demonstration of self-mastery in every aspect of life. Physical appearance has improved with healthier skin tone, better muscle definition, and overall presence that is more confident and naturally attractive to others.`,
      `Amazing and absolutely revolutionary ${user.displayName || 'Champion'}! Your journey of ${user.totalDays || 0} days represents a revolutionary transformation that changes your entire life trajectory toward a destination that is much brighter and more promising than ever imagined. Spiritual growth has accelerated with deeper connection to purpose, meaning, and values that truly matter in life and contribute to lasting fulfillment.`,
      `Phenomenal and absolutely extraordinary ${user.displayName || 'Champion'}! Your dedication of ${user.streak || 0} days proves that you are the architect of your own destiny and completely capable of creating an extraordinary life filled with unlimited possibilities. Environmental awareness has increased with much deeper appreciation for nature, fresh air, and the beauty that surrounds us every single day of our lives.`,
      `Brilliant and absolutely monumental ${user.displayName || 'Champion'}! Your transformation of ${user.totalDays || 0} days represents the magnum opus of your lifetime that will be remembered forever as the turning point toward achieving true greatness. Legacy impact remains positive for family and community, inspiring others to make positive changes, and creating beneficial ripple effects that touch many people's lives.`,
      `Brilliant and absolutely inspirational ${user.displayName || 'Champion'}! Your achievement of ${user.streak || 0} days represents a brilliant demonstration that human potential is truly unlimited and every goal can be achieved through persistent effort and unwavering determination. Future outlook remains optimistic with confidence to tackle any challenges, achieve bigger dreams, and create meaningful impact in this world.`,
      `Captivating and absolutely heroic ${user.displayName || 'Champion'}! Your consistency of ${user.totalDays || 0} days demonstrates heroic character that is worthy of admiration and respect from everyone who witnesses your incredible transformation journey. Celebrate this moment with deep gratitude, appreciation for the journey you have traveled, and excitement for the adventures that await in a bright and promising future.`,
      `Extraordinary and absolutely transformative ${user.displayName || 'Champion'}! Your milestone of ${user.streak || 0} days represents the culmination of extraordinary effort, sacrifice, and unwavering commitment toward achieving the most optimal life possible. Integration of all positive changes into daily routine, consolidation of new sustainable habits, and preparation for next-level achievements that will be even more spectacular and meaningful.`,
      `Inspiring and absolutely spectacular ${user.displayName || 'Champion'}! Your journey of ${user.totalDays || 0} days represents an inspiring story that will motivate countless others to pursue their own transformation journeys with confidence and determination. Mastery over addiction, complete control over life choices, and freedom to create a future that aligns with your highest aspirations and deepest values held within your heart.`,
      `Amazing and absolutely monumental ${user.displayName || 'Champion'}! Your dedication of ${user.streak || 0} days proves that you have achieved something truly remarkable that will be remembered as one of life's greatest victories and most meaningful accomplishments. Complete lifestyle transformation with new identity as a healthy, strong, and inspiring individual who is capable of anything and ready to embrace all opportunities that will come in the brilliant future ahead.`,
      `Outstanding and absolutely transformative ${user.displayName || 'Champion'}! Your incredible journey of ${user.totalDays || 0} days represents the ultimate triumph of human willpower and the absolute proof that anyone can completely redesign their entire life when they commit to positive change with unwavering determination and persistent action every single day.`
    ];
    
    // Simple rotation based on user ID and current day to ensure variety
    const today = new Date().getDate();
    const userHash = user.id ? user.id.length : 0;
    const index = (today + userHash) % cleanEnglishQuotes.length;
    return cleanEnglishQuotes[index];
  }
  
  // Use the correct language quotes from translations for other languages
  const t = getTranslation(language);
  
  // Determine user's journey context
  const totalDays = user.totalDays || 0;
  const streak = user.streak || 0;
  const streakInfo = calculateStreak(user.lastCheckIn);
  const userId = user.id;
  
  // Check if streak was broken (user needs encouragement to restart)
  if (streakInfo.streakReset && totalDays > 0) {
    const quotes = t.quotes.streakBroken;
    return getSmartQuoteSelection(quotes, language, userId, 'streakBroken');
  }
  
  // Categorize user by their journey stage with smart selection
  if (totalDays <= 7) {
    const quotes = t.quotes.newUser;
    return getSmartQuoteSelection(quotes, language, userId, 'newUser');
  } else if (totalDays <= 28) {
    const quotes = t.quotes.earlyJourney;
    return getSmartQuoteSelection(quotes, language, userId, 'earlyJourney');
  } else if (totalDays <= 90) {
    const quotes = t.quotes.milestoneAchiever;
    return getSmartQuoteSelection(quotes, language, userId, 'milestoneAchiever');
  } else if (totalDays > 90) {
    const quotes = t.quotes.veteran;
    return getSmartQuoteSelection(quotes, language, userId, 'veteran');
  }
  
  // Fallback to general daily motivation with smart selection
  const quotes = t.quotes.generalDaily;
  return getSmartQuoteSelection(quotes, language, userId, 'generalDaily');
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
  
  // TEMPORARILY DISABLED: Skip cached motivation to use new expanded system
  // TODO: Re-enable caching after users get fresh contextual quotes
  // if (user.lastMotivationDate === today && user.dailyMotivation) {
  //   return user.dailyMotivation;
  // }
  
  // Generate new contextual motivation for today using enhanced system
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
// NEW: All users can try AI (when quota available), no premium requirement
export const shouldTriggerAIInsight = (user: User): { 
  shouldTrigger: boolean; 
  triggerType: 'milestone' | 'streak_recovery' | 'daily_motivation' | 'none';
  triggerData: any;
  priority: number; // 1 = highest, 2 = medium, 3 = daily
} => {
  // Check AI availability (2 calls per month limit)
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
// NEW: All users can try AI first (when quota available), then fallback to local content
export const getMotivationContent = (user: User, language: Language = 'id'): { 
  content: string; 
  isAIGenerated: boolean; 
  shouldUseAI: boolean;
  triggerType?: string;
} => {
  // Check if user has recent AI insight from today
  const today = new Date().toISOString().split('T')[0];
  if (user.lastAICallDate === today && user.lastAIInsight) {
    return {
      content: user.lastAIInsight,
      isAIGenerated: true,
      shouldUseAI: false // Don't call AI again, use cached
    };
  }
  
  // Check if AI should be triggered (this includes quota check)
  const aiTrigger = shouldTriggerAIInsight(user);
  
  if (aiTrigger.shouldTrigger) {
    return {
      content: '', // Will be populated by AI call
      isAIGenerated: true,
      shouldUseAI: true,
      triggerType: aiTrigger.triggerType
    };
  }
  
  // Fall back to rich local contextual quotes (both Indonesian and English have extensive libraries)
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
}, language: 'en' | 'id' = 'id'): {
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
    headline = language === 'en'
      ? `${cigarettesPerDay} cigarettes/day for ${smokingYears} years? Your body is ready for an amazing recovery!`
      : `${cigarettesPerDay} batang/hari selama ${smokingYears} tahun? Tubuh Anda siap untuk pemulihan yang menakjubkan!`;
  } else if (isHeavySmoker) {
    headline = language === 'en'
      ? `${cigarettesPerDay} cigarettes per day is in the past! Time for a healthier life.`
      : `${cigarettesPerDay} batang per hari adalah masa lalu! Saatnya hidup lebih sehat.`;
  } else if (isLongTermSmoker) {
    headline = language === 'en'
      ? `After ${smokingYears} years, you've finally chosen the right path!`
      : `Setelah ${smokingYears} tahun, Anda akhirnya memilih jalan yang tepat!`;
  } else {
    headline = language === 'en'
      ? `You've made the best decision! Let's start your healthy journey.`
      : `Keputusan terbaik telah Anda buat! Mari mulai perjalanan sehat.`;
  }
  
  // Create main message based on primary reason
  switch (primaryReason) {
    case 'health':
      if (isLongTermSmoker) {
        message = language === 'en'
          ? `After ${smokingYears} years of smoking, your body will begin an amazing healing process. In the first 20 minutes, your heart rate and blood pressure will start to normalize!`
          : `Setelah ${smokingYears} tahun merokok, tubuh Anda akan mulai penyembuhan yang luar biasa. Dalam 20 menit pertama, detak jantung dan tekanan darah akan mulai normal!`;
      } else {
        message = language === 'en'
          ? `Choosing health is the best investment! Your body will soon feel amazing positive changes.`
          : `Pilihan untuk kesehatan adalah investasi terbaik! Tubuh Anda akan segera merasakan perubahan positif yang mengagumkan.`;
      }
      break;
    case 'family':
      message = language === 'en'
        ? `Quitting smoking for your family shows tremendous love. You're giving the gift of health to your loved ones.`
        : `Keputusan berhenti merokok untuk keluarga menunjukkan kasih sayang yang besar. Anda sedang memberikan hadiah kesehatan untuk orang-orang tercinta.`;
      break;
    case 'money':
      message = language === 'en'
        ? `Smart financial decision! Money usually spent on cigarettes can now be used for more meaningful things.`
        : `Keputusan finansial yang cerdas! Uang yang biasa dihabiskan untuk rokok kini bisa digunakan untuk hal-hal yang lebih bermakna.`;
      break;
    case 'pregnancy':
      message = language === 'en'
        ? `Best choice for your baby! You're giving your little one a healthy start to life.`
        : `Pilihan terbaik untuk calon buah hati! Anda sedang memberikan awal kehidupan yang sehat untuk si kecil.`;
      break;
    default:
      message = language === 'en'
        ? `Your journey to a healthy life begins with brave decisions like the one you made today.`
        : `Perjalanan menuju hidup sehat dimulai dari keputusan berani seperti yang Anda buat hari ini.`;
  }
  
  // Financial highlight
  if (dailySavings > 0) {
    const formattedDaily = formatCurrency(dailySavings, language);
    const formattedYearly = formatCurrency(yearlySavings, language);

    if (yearlySavings >= 5000000) {
      financialHighlight = language === 'en'
        ? `Saving ${formattedDaily}/day = ${formattedYearly}/year - enough for a family vacation!`
        : `Menghemat ${formattedDaily}/hari = ${formattedYearly}/tahun - cukup untuk liburan keluarga!`;
    } else if (yearlySavings >= 2000000) {
      financialHighlight = language === 'en'
        ? `${formattedYearly}/year you save could go towards education or investment!`
        : `${formattedYearly}/tahun yang Anda hemat bisa untuk dana pendidikan atau investasi!`;
    } else {
      financialHighlight = language === 'en'
        ? `${formattedDaily}/day x 365 days = ${formattedYearly} per year!`
        : `${formattedDaily}/hari x 365 hari = ${formattedYearly} per tahun!`;
    }
  } else {
    financialHighlight = language === 'en'
      ? "Financial savings will be felt in the long run!"
      : "Penghematan finansial akan terasa dalam jangka panjang!";
  }
  
  // Health highlight based on smoking intensity
  if (isHeavySmoker) {
    healthHighlight = language === 'en'
      ? "20 min: Normal heart rate • 12 hours: Carbon monoxide gone • 2 weeks: Better circulation"
      : "20 menit: Detak jantung normal • 12 jam: Karbon monoksida hilang • 2 minggu: Sirkulasi membaik";
  } else {
    healthHighlight = language === 'en'
      ? "20 min: Blood pressure drops • 8 hours: Oxygen rises • 24 hours: Heart attack risk decreases"
      : "20 menit: Tekanan darah turun • 8 jam: Oksigen naik • 24 jam: Risiko serangan jantung turun";
  }

  // Motivational note based on previous attempts
  if (previousAttempts >= 3) {
    motivationalNote = language === 'en'
      ? `Attempt #${previousAttempts + 1} is different! Previous experiences are valuable lessons. This time you have ByeSmoke AI!`
      : `Percobaan ke-${previousAttempts + 1} ini berbeda! Pengalaman sebelumnya adalah pembelajaran berharga. Kali ini Anda punya ByeSmoke AI!`;
  } else if (previousAttempts > 0) {
    motivationalNote = language === 'en'
      ? `Second attempts are often more successful! You already know what to avoid. Let's make this time different!`
      : `Percobaan kedua sering kali lebih berhasil! Anda sudah tahu apa yang harus dihindari. Mari buat kali ini berbeda!`;
  } else {
    motivationalNote = language === 'en'
      ? `The first step is the hardest, and you've already done it! Believe in your inner strength.`
      : `Langkah pertama adalah yang tersulit, dan Anda sudah melakukannya! Percayalah pada kekuatan diri Anda.`;
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

export const cleanCorruptedDailyXP = (dailyXP: { [date: string]: number } | undefined): { [date: string]: number } => {
  if (!dailyXP) return {};

  const cleanedData: { [date: string]: number } = {};

  for (const [key, value] of Object.entries(dailyXP)) {
    // Valid date format should be YYYY-MM-DD
    const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(key);
    const isValidNumber = typeof value === 'number' && !isNaN(value) && isFinite(value);

    if (isValidDateFormat && isValidNumber) {
      cleanedData[key] = value;
    } else {
      console.warn('🧹 Removing corrupted dailyXP entry:', { key, value, type: typeof value });
    }
  }

  console.log('🧹 Daily XP cleanup completed:', {
    originalEntries: Object.keys(dailyXP).length,
    cleanedEntries: Object.keys(cleanedData).length,
    removedEntries: Object.keys(dailyXP).length - Object.keys(cleanedData).length
  });

  return cleanedData;
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

// Migration system: Keep existing progress (Option 1 approach)
export const migrateToCheckInSystem = (user: User): { user: User; migrationApplied: boolean } => {
  // Option 1: Keep current system stable - no migration needed
  // Users maintain their existing progress and build from there
  return { user, migrationApplied: false };
};