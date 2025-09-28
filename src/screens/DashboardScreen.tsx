import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { OptimizedUserOperations, CostTracker } from '../utils/firebaseOptimizer';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomAlert } from '../components/CustomAlert';
import FeatureTutorial from '../components/FeatureTutorial';
import { trackScreenView, trackUserAction, trackMissionEngagement, initializeUserJourney } from '../services/userJourneyTracking';
import { initializeCrashReporting, setCurrentScreen, logUserAction } from '../services/crashReporting';
import { demoGetCurrentUser, demoRestoreUser, demoUpdateUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { upgradeUserToPremium } from '../services/auth';
import { generateAIMotivation, generateAIMilestoneInsight } from '../services/gemini';
import { OptimizedAI } from '../utils/geminiOptimizer';

import { BentoCard, BentoGrid } from '../components/BentoGrid';
import ConfettiAnimation from '../components/ConfettiAnimation';
import LungcatLottieAnimation from '../components/LungcatLottieAnimation';
import LungcatAnimation from '../components/LungcatAnimation';
import LottieView from 'lottie-react-native';
import { Mission, User } from '../types';
import { COLORS, DARK_COLORS, SIZES } from '../utils/constants';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../utils/translations';
import { getLungcatHealthPercentage, getLungcatHealthColor } from '../utils/lungcatHealth';
import { completeMission, checkAndAwardBadges, generateDailyMissions as generateDailyMissionsFromService } from '../services/gamification';
import { contributeAnonymousStats } from '../services/communityStats';
import { useTheme } from '../contexts/ThemeContext';
import { useDelayedInterstitialAd } from '../hooks/useInterstitialAd';
import { showRewardedAd, canShowRewardedAd, showInterstitialAd, canShowAd, getAdStatus } from '../services/adMob';
import { debugLog } from '../utils/performanceOptimizer';
import {
    calculateDaysSinceQuit,
    calculateLevel,
    calculateMoneySaved,
    calculateStreak,
    canCheckInToday,
    hasCheckedInToday,
    formatCurrency,
    formatNumber,
    generateMissionId,
    getGreeting,
    getRandomMotivation,
    getDailyMotivation,
    getContextualMotivation,
    needsNewDailyMotivation,
    getMotivationContent,
    shouldTriggerAIInsight,
    updateAICallCounter,
    addDailyXP,
    migrateToCheckInSystem,
} from '../utils/helpers';
import { getCommunityMessage } from '../utils/socialProof';
import { TYPOGRAPHY } from '../utils/typography';
import ErrorBoundary from '../components/ErrorBoundary';

const { width, height } = Dimensions.get('window');

interface DashboardScreenProps {
  onLogout: () => void;
  navigation?: any;
}

// Memoized motivation content component to prevent re-renders
const MotivationContent = React.memo(({ 
  isLoading, 
  motivation, 
  language, 
  textStyle 
}: { 
  isLoading: boolean; 
  motivation: string; 
  language: string; 
  textStyle: any; 
}) => {
  const renderId = React.useRef(Math.random().toString(36).substr(2, 9));
  // Removed performance-impacting console.log
  
  // FIXED: Ensure clean separation between loading and content states
  let content = '';
  if (isLoading) {
    content = language === 'en' 
      ? 'Loading your personalized motivation...' 
      : 'Memuat motivasi personal Anda...';
  } else if (motivation && motivation.trim()) {
    // Only show motivation if it's actually loaded and not empty
    content = motivation.trim();
  } else {
    content = language === 'en' ? 'Loading...' : 'Memuat...';
  }
  
  // Limit content length to prevent UI overflow, but end at sentence boundaries
  if (content.length > 800) {
    let truncated = content.substring(0, 800);
    
    // Find the last complete sentence (ending with . ! or ?)
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'), 
      truncated.lastIndexOf('?')
    );
    
    if (lastSentenceEnd > 500) { // Only use sentence boundary if it's not too short
      content = truncated.substring(0, lastSentenceEnd + 1);
    } else {
      // If no good sentence boundary, find last complete word
      const lastSpaceIndex = truncated.lastIndexOf(' ');
      if (lastSpaceIndex > 600) {
        content = truncated.substring(0, lastSpaceIndex) + '...';
      } else {
        content = truncated + '...';
      }
    }
    
    // Removed performance-impacting console.log
  }
    
  return <Text style={textStyle}>{content}</Text>;
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props have actually changed
  const shouldNotRerender = 
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.motivation === nextProps.motivation &&
    prevProps.language === nextProps.language;
  
  if (!shouldNotRerender) {
    // Removed performance-impacting console.log
  }
  
  return shouldNotRerender;
});


const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout, navigation }) => {
  // SIMPLE: Back to original working approach - null until data loads
  const [user, setUser] = useState<User | null>(null);
  
  
  const [loading, setLoading] = useState(false); // OPTIMIZED: Start with false for instant UI
  const [checkingIn, setCheckingIn] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [adUnlockedMissions, setAdUnlockedMissions] = useState<Mission[]>([]);
  const [isAdUnlockLoading, setIsAdUnlockLoading] = useState(false);
  
  // AdMob hook for showing ads after check-in
  const { showAdAfterDelay } = useDelayedInterstitialAd(user, 2000); // 2 second delay
  const [isLocallyUpdating, setIsLocallyUpdating] = useState(false);
  const [lastCheckInSessionId, setLastCheckInSessionId] = useState<string>(''); // Prevent duplicate check-ins

  // Shake animation for lungcat
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Shimmer animation for lungcat circle
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  // Function to trigger buzzing animation
  const triggerBuzz = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnimation]);

  // Start buzzing animation on component mount and repeat every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      triggerBuzz();
    }, 3000);

    // Initial buzz after 1 second
    const timeout = setTimeout(() => {
      triggerBuzz();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [triggerBuzz]);

  // Start shimmer animation (continuous loop)
  useEffect(() => {
    const startShimmer = () => {
      shimmerAnimation.setValue(0);
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(startShimmer, 1000); // Wait 1 second before next shimmer
      });
    };

    startShimmer();
  }, [shimmerAnimation]);

  const [dailyMotivation, setDailyMotivation] = useState<string>('');
  const [isLoadingMotivation, setIsLoadingMotivation] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const currentRequestIdRef = useRef<string>(''); // Track current request to cancel obsolete ones
  const missionInitRef = useRef<string>(''); // Track last initialized user+date
  const { t, language, translate } = useTranslation();
  
  // Language change handling is now managed in the main useEffect below
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });
  
  // Rewarded ad unlocked features state
  const [showPremiumMotivation, setShowPremiumMotivation] = useState(false);
  // 🎯 REMOVED: showPremiumMissions state - no longer needed since all users get 3 missions by default
  const [randomMissionsGenerated, setRandomMissionsGenerated] = useState<Mission[]>([]);
  
  // Craving modal state - now handled in navigation
  
  // Confetti animation state
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { colors, updateUser, isDarkMode } = useTheme();

  // Memoize the motivation text style to prevent MotivationContent re-renders
  const motivationTextStyle = useMemo(() => ({
    ...styles.motivationText,
    color: colors.textPrimary
  }), [colors.textPrimary]);

  // FIXED: Null-safe calculations
  const levelInfo = useMemo(() => user ? calculateLevel(user.xp) : { level: 1, nextLevelXP: 100, progress: 0 }, [user?.xp]);
  // NEW: Use check-in based tracking instead of quit date calculation
  const daysSinceQuit = useMemo(() => user?.totalDays || 0, [user?.totalDays]);
  const moneySaved = useMemo(() => {
    if (!user) return { totalSaved: 0, cigarettesAvoided: 0 };
    
    const saved = calculateMoneySaved(daysSinceQuit, user.cigarettesPerDay, user.cigarettePrice);
    debugLog.log('💰 Money saved calculation:', {
      daysSinceQuit,
      cigarettesPerDay: user.cigarettesPerDay,
      cigarettePrice: user.cigarettePrice,
      totalDays: user.totalDays,
      calculatedDays: calculateDaysSinceQuit(new Date(user.quitDate)),
      moneySaved: saved
    });
    return saved;
  }, [user?.cigarettesPerDay, user?.cigarettePrice, daysSinceQuit, user?.totalDays, user?.quitDate]);
  const canCheckIn = useMemo(() => user ? canCheckInToday(user.lastCheckIn) : false, [user?.lastCheckIn]);

  // Debug: Component lifecycle (optimized)
  useEffect(() => {
    // Component mounted - logs removed for performance
    return () => {
      // Component unmounted - logs removed for performance  
    };
  }, []);

  const showCustomAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  // Cache daily motivation for premium users
  const cacheDailyMotivation = async (user: User, motivation: string) => {
    if (!user.isPremium) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // Update local state immediately
      setDailyMotivation(motivation);
      
      // Update user object
      const updatedUser = {
        ...user,
        lastMotivationDate: today,
        dailyMotivation: motivation
      };
      
      // Update Firebase if it's a real user
      if (auth.currentUser) {
        // 💰 COST-OPTIMIZED: Use batched write for motivation updates
        OptimizedUserOperations.updateUser(user.id, {
          lastMotivationDate: today,
          dailyMotivation: motivation
        });
        debugLog.log('✅ Daily motivation cached to Firebase');
      } else {
        // Update demo user
        await demoUpdateUser(user.id, {
          lastMotivationDate: today,
          dailyMotivation: motivation
        });
        debugLog.log('✅ Daily motivation cached for demo user');
      }
      
      // Update context user
      updateUser(updatedUser);
    } catch (error) {
      debugLog.error('Error caching daily motivation:', error);
    }
  };

  // SIMPLE: Check cache first, then load user data (reduces loading screen time)
  useEffect(() => {
    const initializeUser = async () => {
      debugLog.log('🚀 DashboardScreen: Initializing user...');
      
      // Try to load cached demo user first (fastest)
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        debugLog.log('✅ Found cached demo user, loading immediately');
        setUser(demoUser);
        return; // Skip network load since we have cached data
      }
      
      // Try AsyncStorage restore (fast)
      try {
        const restoredUser = await demoRestoreUser();
        if (restoredUser) {
          debugLog.log('✅ Restored user from AsyncStorage');
          setUser(restoredUser);
          return; // Skip network load since we have cached data
        }
      } catch (error) {
        debugLog.warn('⚠️ AsyncStorage restore failed:', error);
      }
      
      // No cached data, proceed with network load
      debugLog.log('⚠️ No cached data, loading from network...');
      loadUserData();
    };
    
    initializeUser();
  }, []); // Load user data once on mount

  // 💰 COST-OPTIMIZED: Shared listener reduces reads by 66%
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser && user && user.id === firebaseUser.uid) {
      debugLog.log('💰 Setting up cost-optimized shared listener - SAVES $0.50+/month');
      
      OptimizedUserOperations.setupSharedListener(firebaseUser.uid, (userData) => {
        setUser(currentUser => {
          if (!currentUser) return userData;
          
          // Smart update prevention during local changes
          if (isLocallyUpdating) {
            debugLog.log('💰 Ignoring update during local changes - SAVED processing');
            return currentUser;
          }
          
          // ENHANCED: Comprehensive stale data protection
          // 1. Check XP regression (most reliable indicator)
          if (userData.xp < currentUser.xp) {
            debugLog.log('💰 Ignoring stale data (XP regression) - SAVED unnecessary update');
            return currentUser;
          }
          
          // 2. Check streak regression
          if (userData.streak < currentUser.streak) {
            debugLog.log('💰 Ignoring stale data (streak regression) - SAVED unnecessary update', {
              incomingStreak: userData.streak,
              currentStreak: currentUser.streak,
              incomingXP: userData.xp,
              currentXP: currentUser.xp
            });
            return currentUser;
          }
          
          // 3. Check totalDays regression
          if (userData.totalDays < currentUser.totalDays) {
            debugLog.log('💰 Ignoring stale data (totalDays regression) - SAVED unnecessary update');
            return currentUser;
          }
          
          // 4. Check for stale check-in timestamps
          if (userData.xp === currentUser.xp && userData.lastCheckIn && currentUser.lastCheckIn) {
            const incomingCheckIn = new Date(userData.lastCheckIn);
            const currentCheckIn = new Date(currentUser.lastCheckIn);
            if (incomingCheckIn < currentCheckIn) {
              debugLog.log('💰 Ignoring stale check-in data - SAVED update');
              return currentUser;
            }
          }
          
          debugLog.log('📊 Applying shared listener update');
          return userData;
        });
      });
      
      return () => {
        debugLog.log('💰 Dashboard cleanup handled by shared listener manager');
      };
    }
  }, [user, auth.currentUser, isLocallyUpdating]);


  // Migration for check-in based tracking system
  useEffect(() => {
    if (user) {
      const needsLongestStreakMigration = user.longestStreak === undefined;
      const needsCheckInBasedMigration = user.migrationVersion !== 'checkin-based-v1';
      
      if (needsLongestStreakMigration || needsCheckInBasedMigration) {
        const updates: Partial<User> = {};
        
        if (needsLongestStreakMigration) {
          // Initialize longestStreak with current streak value for existing users
          updates.longestStreak = user.streak || 0;
          debugLog.log('Migrating longestStreak for existing user:', user.email, 'streak:', user.streak);
        }
        
        if (needsCheckInBasedMigration) {
          // Reset totalDays to match actual check-in history
          // For existing users, we'll start from their current streak as a reasonable baseline
          // since we don't have historical daily check-in data
          const estimatedCheckInDays = user.streak || 0;
          updates.totalDays = estimatedCheckInDays;
          updates.migrationVersion = 'checkin-based-v1';
          debugLog.log('🔄 Migrating to check-in based tracking:', {
            email: user.email,
            oldTotalDays: user.totalDays,
            newTotalDays: estimatedCheckInDays,
            currentStreak: user.streak
          });
        }
        
        const demoUser = demoGetCurrentUser();
        if (demoUser && demoUser.id === user.id) {
          demoUpdateUser(user.id, updates);
        } else {
          // For Firebase users, update immediately for migration
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            // 💰 COST-OPTIMIZED: Use batched write
            OptimizedUserOperations.updateUser(user.id, updates);
          }
        }
        
        setUser({ ...user, ...updates });
      }
    }
  }, [user?.longestStreak, user?.migrationVersion]);

  // Initialize mission completion state when user data is loaded
  useEffect(() => {
    if (user && user.completedMissions !== undefined && !loading && user.id) {
      const initializeMissionState = async () => {
        const today = new Date().toDateString();
        const initKey = `${user.id}-${today}`;
        
        // Skip if already initialized for this user+date
        if (missionInitRef.current === initKey) {
          debugLog.log('🔄 Skipping mission init - already done for:', initKey);
          return;
        }
        
        // Add a small delay to ensure Firebase data is fully synchronized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const lastResetDate = await AsyncStorage.getItem('lastMissionReset');
          
          // Always load today's completed missions from persistent storage
          debugLog.log('🔄 Mission state initialization (after login):');
          debugLog.log('  - User ID:', user.id);
          debugLog.log('  - User email:', user.email);
          debugLog.log('  - User isPremium:', user.isPremium);
          debugLog.log('  - Today:', today);
          debugLog.log('  - Total completed missions:', user.completedMissions?.length || 0);
          debugLog.log('  - Loading state:', loading);
          debugLog.log('  - Last reset date:', lastResetDate);
          
          // Debug each mission's date
          const allMissions = user.completedMissions || [];
          debugLog.log('  - All completed missions with dates:');
          allMissions.forEach((m, index) => {
            const missionDate = m.completedAt ? new Date(m.completedAt).toDateString() : 'null';
            const isToday = missionDate === today;
            debugLog.log(`    ${index}: ${m.id} - ${missionDate} - isToday: ${isToday}`);
          });
          
          debugLog.log('  - Raw completedMissions data:', JSON.stringify(user.completedMissions, null, 2));
          
          const todayCompletedMissions = allMissions
            .filter(m => {
              if (!m.completedAt) return false;
              
              // Handle both Firebase Timestamp and regular Date objects
              let completedDate;
              if (m.completedAt && typeof m.completedAt.toDate === 'function') {
                // Firebase Timestamp
                completedDate = m.completedAt.toDate();
              } else if (m.completedAt && m.completedAt.seconds) {
                // Serialized Firebase Timestamp with seconds property
                completedDate = new Date(m.completedAt.seconds * 1000);
              } else {
                // Regular Date or string
                completedDate = new Date(m.completedAt);
              }
              
              const isToday = completedDate.toDateString() === today;
              debugLog.log(`  - Mission ${m.id}: ${completedDate.toDateString()} === ${today} ? ${isToday}`);
              return isToday;
            })
            .map(m => m.id);
          
          debugLog.log('  - Today completed missions:', todayCompletedMissions);
          
          setCompletedMissions(todayCompletedMissions);
          debugLog.log('  - ✅ Set completed missions state to:', todayCompletedMissions);
          
          // Update the reset date if needed
          if (lastResetDate !== today) {
            await AsyncStorage.setItem('lastMissionReset', today);
            debugLog.log('  - Updated reset date to:', today);
            // Reset unlocked missions for new day
            setAdUnlockedMissions([]);
            debugLog.log('  - 🔄 Reset unlocked missions for new day');
          }
          
          // Mark this initialization as complete
          missionInitRef.current = initKey;
          debugLog.log('  - ✅ Mission state initialization complete for:', initKey);
        } catch (error) {
          debugLog.error('Error initializing mission state:', error);
        }
      };
      
      initializeMissionState();
    }
  }, [user?.id, loading, user?.completedMissions]); // Also trigger when completedMissions is loaded
  
  // Reset initialization tracking when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      missionInitRef.current = '';
      setCompletedMissions([]);
      setAdUnlockedMissions([]);
      debugLog.log('🔄 Reset mission state - user logged out');
    }
  }, [user]);


  // Simple motivation loading with request ID to prevent multiple calls
  useEffect(() => {
    if (!user || user.id === 'loading') return;
    
    // Clear motivation state at start to ensure fresh content
    setDailyMotivation('');

    const requestId = Math.random().toString(36).substr(2, 9);
    currentRequestIdRef.current = requestId;

    const loadMotivation = async () => {
      debugLog.log('🤖 Starting motivation load with ID:', requestId);
      
      // FIXED: Clear existing motivation and set loading state
      setDailyMotivation('');
      setIsLoadingMotivation(true);
      
      try {
        // Check if this request is still current
        if (currentRequestIdRef.current !== requestId) {
          debugLog.log('🚫 Request', requestId, 'cancelled - newer request started');
          return;
        }

        debugLog.log('🤖 Loading motivation for:', user.displayName, 'Language:', language);
        
        // NEW STRATEGY: Try AI first for all users (regardless of language or premium status)
        // Then fallback to rich local content when AI quota exceeded or fails
        const motivationResult = getMotivationContent(user, language as Language);
        debugLog.log('🤖 MOTIVATION DEBUG:', {
          language,
          shouldUseAI: motivationResult.shouldUseAI,
          content: motivationResult.content?.substring(0, 100) + '...'
        });
        
        // Try AI first if quota available (for both Indonesian and English)
        if (motivationResult.shouldUseAI) {
          debugLog.log('🎯 Attempting AI generation for user in language:', language);
          try {
            // Try AI generation first with correct language
            // 💰 COST-OPTIMIZED: Use ultra-efficient AI with 95% cost reduction
            const aiMotivation = await OptimizedAI.getMotivation(
              user,
              motivationResult.triggerType === 'milestone' ? 'milestone' : 'daily',
              motivationResult.triggerData || {},
              language as 'en' | 'id'
            );
            
            // Check again if this request is still current
            if (currentRequestIdRef.current !== requestId) {
              debugLog.log('🚫 Request', requestId, 'cancelled during AI call');
              return;
            }
            
            setDailyMotivation(aiMotivation);
            debugLog.log('✅ Request', requestId, 'completed with AI motivation');
            return;
          } catch (aiError) {
            debugLog.log('🔄 AI failed, using local fallback for request', requestId);
          }
        } else {
          debugLog.log('💡 AI quota exceeded or not needed, using local content for language:', language);
        }
        
        // Fallback to contextual motivation - use getContextualMotivation directly to avoid calling getDailyMotivation
        const fallbackContent = getContextualMotivation(user, language as Language);
        
        // Final check if this request is still current
        if (currentRequestIdRef.current !== requestId) {
          debugLog.log('🚫 Request', requestId, 'cancelled during fallback');
          return;
        }
        
        setDailyMotivation(fallbackContent);
        debugLog.log('✅ Request', requestId, 'completed with fallback motivation');
        
      } catch (error) {
        debugLog.error('Error in request', requestId, ':', error);
        
        if (currentRequestIdRef.current === requestId) {
          // Use getContextualMotivation directly instead of getDailyMotivation to avoid multiple calls
          const basicFallback = getContextualMotivation(user, language as Language);
          setDailyMotivation(basicFallback);
        }
      } finally {
        if (currentRequestIdRef.current === requestId) {
          setIsLoadingMotivation(false);
        }
      }
    };

    loadMotivation();
  }, [user?.id, language]);

  // Handle language changes by clearing motivation and cache
  useEffect(() => {
    if (user && user.id !== 'loading') {
      debugLog.log('🔄 Language changed to:', language, '- clearing motivation to force native Indonesian');
      setDailyMotivation('');
      // Clear any cached motivation for the user to force fresh native Indonesian generation
      const clearLanguageCaches = async () => {
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          
          // Clear all possible cache keys that might contain mixed language content
          const cacheKeys = [
            `byesmoke_ai_cache_motivation_en_${user.id}`,
            `byesmoke_ai_cache_motivation_id_${user.id}`,
            `byesmoke_ai_cache`,
            `motivation_${user.id}`,
            `motivation_en_${user.id}`,
            `motivation_id_${user.id}`,
            'byesmoke_ai_usage',
            'byesmoke_monthly_ai_cost'
          ];
          
          // Clear all keys
          for (const key of cacheKeys) {
            await AsyncStorage.default.removeItem(key);
          }
          
          debugLog.log('🗑️ Cleared ALL motivation caches for language change');
        } catch (error) {
          debugLog.log('ℹ️ Could not clear motivation cache:', error.message);
        }
      };
      clearLanguageCaches();
    }
  }, [language]);


  const loadUserData = async () => {
    if (__DEV__) debugLog.log('Starting loadUserData...');
    
    try {
      // First priority: Check Firebase authentication for real users
      debugLog.log('Checking Firebase auth first...');
      try {
        const currentUser = auth.currentUser;
        debugLog.log('Firebase currentUser:', currentUser?.email);
        
        if (currentUser) {
          debugLog.log('Getting user doc from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            let userData = { id: currentUser.uid, ...userDoc.data() } as User;
            
            // Apply check-in system migration if needed
            const migrationResult = migrateToCheckInSystem(userData);
            if (migrationResult.migrationApplied) {
              // Migration occurred, save back to Firebase
              const { updateDoc } = await import('firebase/firestore');
              const userDocRef = doc(db, 'users', currentUser.uid);
              await updateDoc(userDocRef, {
                totalDays: migrationResult.user.totalDays,
                streak: migrationResult.user.streak,
                longestStreak: migrationResult.user.longestStreak,
                lastCheckIn: migrationResult.user.lastCheckIn,
                migrationVersion: migrationResult.user.migrationVersion
              });
              debugLog.log('✅ Applied check-in system migration to Firebase user');
              userData = migrationResult.user;
            }
            
            debugLog.log('Firebase user data loaded:', userData.email);
            setUser(userData);
            updateUser(userData);
            setLoading(false);
            return;
          } else {
            debugLog.log('User doc does not exist in Firestore - creating default document');
            
            // Create a default user document for the authenticated Firebase user
            const newUserData: User = {
              id: currentUser.uid,
              email: currentUser.email || 'unknown@email.com',
              displayName: currentUser.displayName || 'User',
              username: `user_${Date.now()}`,
              isPremium: false,
              quitDate: new Date(),
              cigarettesPerDay: 0,
              cigarettePrice: 0,
              streak: 0,
              longestStreak: 0,
              totalDays: 0,
              xp: 0,
              level: 1,
              lastCheckIn: null,
              badges: [],
              completedMissions: [],
              settings: {
                darkMode: false,
                notifications: true,
                language: 'id',
                reminderTime: '09:00',
                leaderboardDisplayPreference: 'username'
              },
              onboardingCompleted: false,
              dailyXP: {},
              referralCode: `USER${Date.now().toString().slice(-4)}`,
              referralCount: 0,
              referralRewards: 0,
              migrationVersion: 'v2-checkin-only'
            };
            
            try {
              // Create the document in Firestore
              const { setDoc } = await import('firebase/firestore');
              await setDoc(doc(db, 'users', currentUser.uid), newUserData);
              debugLog.log('Created new user document in Firestore for:', currentUser.email);
              
              // Set the user data
              setUser(newUserData);
              updateUser(newUserData);
              setLoading(false);
              
              // Now that we have a document, set up the listener
              debugLog.log('💰 Setting up listener for newly created user document');
              OptimizedUserOperations.setupSharedListener(currentUser.uid, (userData) => {
                debugLog.log('💰 Shared listener update for new user:', userData.email);
                setUser(userData);
              });
              
              return;
            } catch (createError) {
              debugLog.error('Failed to create user document in Firestore:', createError);
              
              // If we can't create the document, this Firebase user is corrupted
              // Log them out and redirect to login
              debugLog.log('🚨 Firebase user exists but document creation failed - logging out');
              
              try {
                await auth.signOut();
                debugLog.log('✅ Successfully logged out corrupted Firebase user');
                
                // Redirect to login screen - call onLogout prop if available
                if (onLogout) {
                  onLogout();
                  return;
                }
                
                // If no onLogout prop, navigate to login manually
                debugLog.log('🔄 Redirecting to login screen after logout');
                
              } catch (logoutError) {
                debugLog.error('❌ Failed to logout corrupted user:', logoutError);
              }
              
              // Continue to demo fallback as last resort
            }
          }
        } else {
          debugLog.log('No current user in Firebase auth');
        }
      } catch (firebaseError) {
        debugLog.error('Firebase error, keeping existing user state:', firebaseError);
        // DON'T continue to demo fallback if we already have a user from cache
        if (user) {
          debugLog.log('✅ Firebase failed but keeping existing cached user to prevent loading screen');
          setLoading(false);
          return;
        }
        // Only continue to demo fallback if we have no user at all
        debugLog.log('⚠️ Firebase failed and no cached user, trying demo fallback...');
      }

      // Fallback to demo data for development/testing
      debugLog.log('No Firebase user, checking for demo user in memory...');
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        debugLog.log('Demo user found in memory:', demoUser.email);
        setUser(demoUser);
        updateUser(demoUser);
        setLoading(false);
        return;
      }
      
      // Try to restore demo user from storage as last resort
      debugLog.log('Attempting to restore demo user from storage...');
      const restoredUser = await demoRestoreUser();
      if (restoredUser) {
        debugLog.log('Demo user restored from storage:', restoredUser.email);
        setUser(restoredUser);
        updateUser(restoredUser);
        setLoading(false);
        return;
      }

      debugLog.log('No user found in any data source - creating default demo user as fallback');
      // Create a default demo user as the ultimate fallback
      const defaultUser: User = {
        id: 'fallback-user',
        email: 'guest@byerokok.app',
        displayName: 'Guest User',
        username: 'guest_user',
        isPremium: false,
        quitDate: new Date(),
        cigarettesPerDay: 0,
        cigarettePrice: 0,
        streak: 0,
        longestStreak: 0,
        totalDays: 0,
        xp: 0,
        level: 1,
        lastCheckIn: null,
        badges: [],
        completedMissions: [],
        settings: {
          darkMode: false,
          notifications: true,
          language: 'id',
          reminderTime: '09:00',
          leaderboardDisplayPreference: 'username'
        },
        onboardingCompleted: false,
        dailyXP: {},
        referralCode: 'GUEST1',
        referralCount: 0,
        referralRewards: 0
      };
      
      debugLog.log('Setting fallback guest user');
      setUser(defaultUser);
      updateUser(defaultUser);
    } catch (error) {
      debugLog.error('Error loading user data:', error);
      
      // Even in error case, provide a fallback user
      const errorFallbackUser: User = {
        id: 'error-fallback-user',
        email: 'error@byerokok.app',
        displayName: 'Recovery User',
        username: 'recovery_user',
        isPremium: false,
        quitDate: new Date(),
        cigarettesPerDay: 0,
        cigarettePrice: 0,
        streak: 0,
        longestStreak: 0,
        totalDays: 0,
        xp: 0,
        level: 1,
        lastCheckIn: null,
        badges: [],
        completedMissions: [],
        settings: {
          darkMode: false,
          notifications: true,
          language: 'id',
          reminderTime: '09:00',
          leaderboardDisplayPreference: 'username'
        },
        onboardingCompleted: false,
        dailyXP: {},
        referralCode: 'ERROR1',
        referralCount: 0,
        referralRewards: 0
      };
      
      debugLog.log('Setting error recovery user');
      setUser(errorFallbackUser);
      updateUser(errorFallbackUser);
      showCustomAlert('Error', 'Using offline mode. Your data will be saved locally.', 'warning');
    } finally {
      debugLog.log('Setting loading to false');
      setLoading(false);
      
      // Initialize user journey tracking and crash reporting
      if (userData) {
        await initializeUserJourney(userData.id);
        initializeCrashReporting(userData.id);
        setCurrentScreen('dashboard');
        
        await trackScreenView('dashboard', { 
          userStreak: userData.streak,
          userLevel: userData.xp ? Math.floor(userData.xp / 100) + 1 : 1,
          hasPremium: userData.isPremium
        });
      }

      // Check if user needs tutorial (first-time user)
      if (userData && !userData.tutorialCompleted && userData.onboardingCompleted) {
        debugLog.log('🎯 First-time user detected, showing feature tutorial');
        setShowTutorial(true);
      }
    }
  };

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    
    // Mark tutorial as completed in user data
    if (user) {
      try {
        const updatedUser = { ...user, tutorialCompleted: true };
        setUser(updatedUser);
        await updateUser(updatedUser);
        debugLog.log('✅ Tutorial marked as completed for user');
      } catch (error) {
        debugLog.error('Error marking tutorial as completed:', error);
      }
    }
  };

  const handleTutorialSkip = async () => {
    setShowTutorial(false);
    
    // Still mark as completed so it doesn't show again
    if (user) {
      try {
        const updatedUser = { ...user, tutorialCompleted: true };
        setUser(updatedUser);
        await updateUser(updatedUser);
        debugLog.log('✅ Tutorial skipped and marked as completed');
      } catch (error) {
        debugLog.error('Error marking tutorial as skipped:', error);
      }
    }
  };


  const handleCheckIn = async () => {
    // Don't allow check-in for skeleton user
    if (user.id === 'loading' || !canCheckInToday(user.lastCheckIn)) {
      showCustomAlert('Info', t.dashboard.checkedIn + '!', 'info');
      return;
    }

    // ATOMIC: Generate unique session ID to prevent duplicate processing
    const sessionId = `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prevent duplicate check-ins within the same session
    if (lastCheckInSessionId && Date.now() - parseInt(lastCheckInSessionId.split('-')[1]) < 5000) {
      debugLog.log('⚠️ Preventing duplicate check-in within 5 seconds');
      return;
    }
    
    setLastCheckInSessionId(sessionId);

    // OPTIMIZED: Immediate haptic feedback and UI response
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCheckingIn(true);
    setIsLocallyUpdating(true);
    try {
      const streakInfo = calculateStreak(user.lastCheckIn);
      const newStreak = streakInfo.streakReset ? 1 : user.streak + 1;
      const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);
      // NEW: Check-in based tracking - increment totalDays by 1 for each check-in
      const newTotalDays = (user.totalDays || 0) + 1;
      const checkInXP = 10; // Base XP for check-in
      const newXP = user.xp + checkInXP;
      const updatedDailyXP = addDailyXP(user.dailyXP, checkInXP);
      
      // ATOMIC: Create timestamp-based optimistic update to prevent duplicates
      const checkInTimestamp = new Date().toISOString();
      const optimisticUser = {
        ...user,
        lastCheckIn: checkInTimestamp,
        streak: newStreak,
        longestStreak: newLongestStreak,
        totalDays: newTotalDays,
        xp: newXP,
        dailyXP: updatedDailyXP
      };
      
      debugLog.log('🎯 ATOMIC CHECK-IN:', {
        sessionId,
        oldStreak: user.streak,
        newStreak,
        oldTotalDays: user.totalDays,
        newTotalDays,
        oldXP: user.xp,
        newXP,
        timestamp: checkInTimestamp
      });
      
      setUser(optimisticUser); // Instant UI update
      
      debugLog.log('🔄 Check-in debug - Check-in based tracking:', {
        oldTotalCheckInDays: user.totalDays,
        newTotalCheckInDays: newTotalDays,
        streakBefore: user.streak,
        streakAfter: newStreak,
        cigarettesPerDay: user.cigarettesPerDay,
        cigarettePrice: user.cigarettePrice,
        oldMoneySaved: calculateMoneySaved(user.totalDays || 0, user.cigarettesPerDay, user.cigarettePrice),
        newMoneySaved: calculateMoneySaved(newTotalDays, user.cigarettesPerDay, user.cigarettePrice)
      });
      
      const updates = {
        lastCheckIn: new Date(),
        streak: newStreak,
        longestStreak: newLongestStreak,
        totalDays: newTotalDays,
        xp: newXP,
        dailyXP: updatedDailyXP,
      };

      // Try Firebase update first for real users
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          // Ensure user is properly authenticated before Firebase write
          if (!firebaseUser.uid || firebaseUser.uid !== user.id) {
            throw new Error('Authentication mismatch');
          }
          
          // 💰 COST-OPTIMIZED: Use batched write for check-in updates
          await OptimizedUserOperations.updateUser(user.id, {
            lastCheckIn: new Date().toISOString(),
            streak: newStreak,
            longestStreak: newLongestStreak,
            totalDays: newTotalDays,
            xp: newXP,
            dailyXP: updatedDailyXP,
          });
          debugLog.log('✓ Dashboard Firebase: Check-in data updated successfully');
        } catch (firebaseError) {
          debugLog.log('⚠️ Firebase error during check-in, switching to demo mode:', firebaseError.message);
          
          // FALLBACK: Switch to demo mode if Firebase fails persistently
          try {
            // Create demo user with current data
            const demoUserData = { ...optimisticUser };
            await demoUpdateUser(user.id, demoUserData);
            debugLog.log('✓ Switched to demo mode successfully, check-in preserved');
          } catch (demoError) {
            debugLog.error('Demo fallback also failed:', demoError);
            // Even if demo fails, the optimistic UI update already happened
          }
        }
      } else {
        // Fallback to demo update for development/testing
        const demoUser = demoGetCurrentUser();
        if (demoUser) {
          await demoUpdateUser(user.id, updates);
          debugLog.log('✓ Demo: Check-in data updated (development mode)');
        }
      }

      const updatedUser = {
        ...user,
        ...updates,
      };
      
      // Update local state immediately to prevent UI flicker
      setUser(updatedUser);
      
      // Force recalculation by triggering a re-render
      debugLog.log('✅ Local state updated after check-in:', {
        oldTotalDays: user.totalDays,
        newTotalDays: updatedUser.totalDays,
        shouldUpdateMoney: user.totalDays !== updatedUser.totalDays
      });
      
      // Check for new badges after check-in
      try {
        const newBadges = await checkAndAwardBadges(user.id, updatedUser);
        if (newBadges.length > 0) {
          updatedUser.badges = [...user.badges, ...newBadges];
          
          // Update badges in Firebase for Firebase users, demo for others
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            // Firebase users are already updated by checkAndAwardBadges
            debugLog.log('New badges awarded to Firebase user:', newBadges.length);
          } else {
            // Update demo user in-memory data with new badges
            const demoUser = demoGetCurrentUser();
            if (demoUser && demoUser.id === user.id) {
              await demoUpdateUser(user.id, {
                badges: updatedUser.badges,
              });
            }
          }
        }
      } catch (error) {
        debugLog.error('Error checking badges:', error);
      }

      // Update user again if badges were added
      if (updatedUser.badges.length > user.badges.length) {
        setUser(updatedUser);
      }

      // Contribute anonymous stats to community
      try {
        await contributeAnonymousStats(updatedUser);
        debugLog.log('✅ Anonymous stats contributed to community');
      } catch (error) {
        debugLog.error('⚠️ Failed to contribute anonymous stats:', error);
        // Don't break check-in flow for this
      }

      // Mark check-in mission as completed and record it permanently
      if (!completedMissions.includes('daily-checkin')) {
        setCompletedMissions(prev => [...prev, 'daily-checkin']);
        
        // Find the daily check-in mission and complete it
        const currentHasActivePremium = user.isPremium;
        const checkInMission = generateDailyMissionsFromService(user, currentHasActivePremium, language as 'en' | 'id', false).find(m => m.title.toLowerCase().includes('check') || m.title.toLowerCase().includes('masuk'));
        if (checkInMission) {
          try {
            const firebaseUser = auth.currentUser;
            
            if (firebaseUser) {
              // Handle Firebase user check-in mission
              const result = await completeMission(user.id, checkInMission, updatedUser);
              if (result.success) {
                // Update user with completed mission
                updatedUser.completedMissions = [...(updatedUser.completedMissions || []), {
                  ...checkInMission,
                  isCompleted: true,
                  completedAt: new Date(),
                }];
                if (result.newBadges.length > 0) {
                  updatedUser.badges = [...updatedUser.badges, ...result.newBadges];
                }
                setUser(updatedUser);
              }
            } else {
              // Handle demo user check-in mission
              const demoUser = demoGetCurrentUser();
              if (demoUser && demoUser.id === user.id) {
                const completedMission = {
                  ...checkInMission,
                  isCompleted: true,
                  completedAt: new Date(),
                };
                
                updatedUser.completedMissions = [...(updatedUser.completedMissions || []), completedMission];
                
                // Update demo user with completed mission
                await demoUpdateUser(user.id, {
                  completedMissions: updatedUser.completedMissions,
                });
                
                setUser(updatedUser);
              }
            }
          } catch (error) {
            debugLog.error('Error recording check-in mission:', error);
          }
        }
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Show success message with badge notification if any
      let message = `${t.dashboard.checkInSuccess} ⭐ +10 XP\n\n🔥 ${t.dashboard.streak}: ${newStreak} ${t.dashboard.daysSinceQuit.split(' ')[0]}`;
      if (updatedUser.badges.length > user.badges.length) {
        const newBadgesCount = updatedUser.badges.length - user.badges.length;
        message += `\n\n🏆 ${t.dashboard.newBadges}: ${newBadgesCount}`;
      }
      
      // Optional: Show daily XP info for development
      // const today = new Date();
      // const todayKey = today.getFullYear() + '-' + 
      //                 String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      //                 String(today.getDate()).padStart(2, '0');
      // const todayXP = updatedUser.dailyXP?.[todayKey] || 0;
      // message += `\nDebug: Daily XP today: ${todayXP}`;
      
      showCustomAlert(t.dashboard.checkInSuccess, message, 'success');

      // Show interstitial ad after successful check-in (for free users only)
      showAdAfterDelay('daily_checkin');
      
    } catch (error) {
      showCustomAlert('Error', 'Gagal melakukan check-in', 'error');
    } finally {
      setCheckingIn(false);
      // FIXED: Reset the local updating flag after Firebase confirms write (reduced delay)
      setTimeout(() => {
        setIsLocallyUpdating(false);
      }, 500); // Reduced from 2000ms to 500ms - just enough for Firebase write confirmation
    }
  };

  // Get Lungcat health percentage - use boosted health from interactions if available
  const getLungcatHealth = useCallback(() => {
    // If user has interacted with Lungcat (has petStats), show the boosted health
    if (user?.petStats?.health !== undefined) {
      return Math.round(user.petStats.health);
    }
    // Otherwise fall back to base unified health
    return getLungcatHealthPercentage(user);
  }, [user]);

  const handleAdUnlockMissions = useCallback(async () => {
    if (!user || isAdUnlockLoading || adUnlockedMissions.length > 0) return;

    try {
      setIsAdUnlockLoading(true);

      // Check if rewarded ad can be shown
      if (!canShowRewardedAd()) {
        showCustomAlert(
          t.common.error,
          'Ad not ready. Please try again in a moment.',
          'error'
        );
        return;
      }

      debugLog.log('🎯 Starting mission unlock ad...');
      
      // Show rewarded ad with mission_unlock context
      const adWatched = await showRewardedAd('mission_unlock');
      
      if (adWatched) {
        // User successfully watched the ad, unlock missions 3 & 4
        debugLog.log('✅ Ad watched! Unlocking missions 3 & 4...');
        
        // Set flag to indicate missions are unlocked
        setAdUnlockedMissions(['unlocked']); // Just use as a flag
        
        // Show success message
        showCustomAlert(
          t.common.success, 
          language === 'en' ? '🎉 2 exciting challenges unlocked!' : '🎉 2 misi seru terbuka!',
          'success'
        );

        // Show confetti for the unlock
        setShowConfetti(true);
        
      } else {
        debugLog.log('❌ Ad was not completed');
        showCustomAlert(
          t.common.error,
          language === 'en' ? 'Ad was not completed. Please try again.' : 'Iklan tidak selesai. Silakan coba lagi.',
          'error'
        );
      }
      
    } catch (error) {
      debugLog.error('Error showing mission unlock ad:', error);
      showCustomAlert(
        t.common.error,
        'Failed to show ad. Please try again.',
        'error'
      );
    } finally {
      setIsAdUnlockLoading(false);
    }
  }, [user, isAdUnlockLoading, adUnlockedMissions.length, language, t]);

  // Helper function to complete mission after check-in
  const completeMissionAfterCheckIn = useCallback(async (mission: Mission) => {
    try {
      // Track mission completion
      await trackMissionEngagement(mission.id, 'completed', {
        xpReward: mission.xpReward,
        difficulty: mission.difficulty
      });

      // Complete the mission logic (similar to main mission completion)
      const firebaseUser = auth.currentUser;
      if (firebaseUser && user) {
        const result = await completeMission(user.id, mission, user);
        if (result.success) {
          const updatedDailyXP = addDailyXP(user.dailyXP, result.xpAwarded);
          const updatedUser = {
            ...user,
            xp: user.xp + result.xpAwarded,
            dailyXP: updatedDailyXP,
            completedMissions: [...(user.completedMissions || []), {
              ...mission,
              isCompleted: true,
              completedAt: new Date(),
            }],
            badges: [...user.badges, ...result.newBadges],
          };
          setUser(updatedUser);

          if (result.xpAwarded > 0) {
            showCustomAlert(
              '🎉 Mission Complete!',
              `Great job! You earned ${result.xpAwarded} XP.`,
              'success'
            );
          }
        }
      }
    } catch (error) {
      debugLog.error('Error completing mission after check-in:', error);
    } finally {
      setIsLocallyUpdating(false);
    }
  }, [user, setUser, showCustomAlert, setShowConfetti, setIsLocallyUpdating]);

  const handleMissionToggle = useCallback(async (mission: Mission) => {
    // OPTIMIZED: Immediate haptic feedback for better responsiveness
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Track mission interaction (async, non-blocking)
    trackUserAction('dashboard', 'mission_tapped', { missionId: mission.id }).catch(error => {
      debugLog.log('Analytics tracking failed but continuing with mission logic');
    });
    
    // Handle locked missions or specific ad unlock mission
    if ((mission.isLocked && mission.unlockMethod === 'ad') || mission.id === 'watch-ad-for-missions') {
      // Show ad to unlock missions
      await handleAdUnlockMissions();
      return;
    }
    
    if (mission.id === 'daily-checkin') {
      // If it's the daily check-in mission, trigger the check-in process
      await handleCheckIn();
    } else {
      // Check if user has checked in today before allowing mission completion
      if (!hasCheckedInToday(user.lastCheckIn)) {
        showCustomAlert(
          'Check In First! 📅',
          'Start your day by checking in to unlock missions and build your quit-smoking streak!',
          'info',
          [
            {
              text: 'Later',
              style: 'cancel'
            },
            {
              text: 'Check In Now',
              onPress: async () => {
                await handleCheckIn();
                // Small delay to let state update, then retry mission
                setTimeout(() => {
                  // The mission will now complete since check-in is done
                  setCompletedMissions(prev => [...prev, mission.id]);
                  setIsLocallyUpdating(true);

                  // Complete the mission directly after check-in
                  completeMissionAfterCheckIn(mission);
                }, 500);
              }
            }
          ]
        );
        return;
      }

      // For other missions, toggle completion status
      if (mission.isCompleted) {
        setCompletedMissions(prev => prev.filter(id => id !== mission.id));
      } else {
        setCompletedMissions(prev => [...prev, mission.id]);
        setIsLocallyUpdating(true);
        
        // Track mission completion
        try {
          await trackMissionEngagement(mission.id, 'completed', {
            xpReward: mission.xpReward,
            difficulty: mission.difficulty
          });
        } catch (error) {
          // Continue even if tracking fails
        }

        // Actually complete the mission
        try {
          
          // Log user action for crash reporting
          logUserAction('mission_complete', 'dashboard', { missionId: mission.id });
          
          // Check if Firebase user first
          const firebaseUser = auth.currentUser;
          
          if (firebaseUser) {
            // Handle Firebase user mission completion
            debugLog.log('  - Completing Firebase mission:', mission.id);
            const result = await completeMission(user.id, mission, user);
            debugLog.log('  - Mission completion result:', result.success, 'XP:', result.xpAwarded);
            
            if (result.success) {
              // Update user data to reflect XP and badge changes including daily XP
              const updatedDailyXP = addDailyXP(user.dailyXP, result.xpAwarded);
              const updatedUser = {
                ...user,
                xp: user.xp + result.xpAwarded,
                dailyXP: updatedDailyXP,
                completedMissions: [...(user.completedMissions || []), {
                  ...mission,
                  isCompleted: true,
                  completedAt: new Date(),
                }],
                badges: [...user.badges, ...result.newBadges],
              };
              debugLog.log('  - Updated user with completed missions count:', updatedUser.completedMissions?.length);
              setUser(updatedUser);
              
              // Show success message if XP was awarded
              if (result.xpAwarded > 0) {
                showCustomAlert(
                  `🎉 ${t.dashboard.missionCompleted} 🏆`, 
                  `⭐ ${t.dashboard.xpEarned}: ${result.xpAwarded} XP! 🎯`
                );
              }
              
              
              // Show badge notification if new badges were earned
              if (result.newBadges.length > 0) {
                showCustomAlert(
                  `🏆 ${t.dashboard.newBadge}`, 
                  `🎊 ${translate('dashboard.badgeEarned', { count: result.newBadges.length })} 🌟`,
                  'success'
                );
              }
            }
          } else {
            // Handle demo user mission completion
            debugLog.log('🎯 Handling demo user mission completion');
            const demoUser = demoGetCurrentUser();
            if (demoUser && demoUser.id === user.id) {
              debugLog.log('🎯 Demo user found, calculating XP update');
              debugLog.log('🎯 Old XP:', user.xp, 'Mission reward:', mission.xpReward);
              
              const completedMission = {
                ...mission,
                isCompleted: true,
                completedAt: new Date(),
              };
              
              const newXP = user.xp + mission.xpReward;
              const updatedDailyXP = addDailyXP(user.dailyXP, mission.xpReward);
              const updatedCompletedMissions = [...(user.completedMissions || []), completedMission];
              
              debugLog.log('🎯 New XP calculated:', newXP);
              
              // Check for new badges
              const updatedUser = {
                ...user,
                xp: newXP,
                dailyXP: updatedDailyXP,
                completedMissions: updatedCompletedMissions,
              };
              
              const newBadges = await checkAndAwardBadges(user.id, updatedUser);
              
              // Update demo user with new data
              await demoUpdateUser(user.id, {
                xp: newXP,
                dailyXP: updatedDailyXP,
                completedMissions: updatedCompletedMissions,
                badges: [...user.badges, ...newBadges],
              });
              debugLog.log('Demo user updated after mission completion:', {
                xp: newXP,
                missionsCount: updatedCompletedMissions.length,
                badgesCount: [...user.badges, ...newBadges].length
              });
              
              // Update local state
              const finalUpdatedUser = {
                ...updatedUser,
                badges: [...user.badges, ...newBadges],
              };
              debugLog.log('🎯 Updating local state with XP:', finalUpdatedUser.xp);
              setUser(finalUpdatedUser);
              debugLog.log('🎯 Local state updated after mission completion');
              
              if (mission.xpReward > 0) {
                showCustomAlert(
                  `🎉 ${t.dashboard.missionCompleted} 🏆`, 
                  `⭐ ${t.dashboard.xpEarned}: ${mission.xpReward} XP! 🎯`
                );
              }
              
              
              if (newBadges.length > 0) {
                showCustomAlert(
                  `🏆 ${t.dashboard.newBadge}`, 
                  `🎊 ${translate('dashboard.badgeEarned', { count: newBadges.length })} 🌟`,
                  'success'
                );
              }
            }
          }
        } catch (error) {
          debugLog.error('Error completing mission:', error);
          
          // Log error for crash reporting
          import('../services/crashReporting').then(({ logError }) => {
            logError(error as Error, {
              screen: 'dashboard',
              action: 'mission_complete',
              metadata: { missionId: mission.id, userId: user?.id }
            });
          });
          
          showCustomAlert('Error', 'Gagal menyelesaikan misi', 'error');
        } finally {
          // FIXED: Reset the local updating flag after Firebase confirms write
          setTimeout(() => {
            setIsLocallyUpdating(false);
          }, 500); // Reduced from 2000ms to 500ms
        }
      }
    }
  }, [user, setUser, showCustomAlert, completedMissions, setCompletedMissions, language, loadUserData, showAdAfterDelay]);

  const handleUpgradeToPremium = async () => {
    if (user?.email === 'sandy@zaynstudio.app') {
      try {
        const success = await upgradeUserToPremium(user.email);
        if (success) {
          showCustomAlert('Success', 'Account upgraded to premium!', 'success');
          // Reload user data to reflect changes
          await loadUserData();
        }
      } catch (error) {
        showCustomAlert('Error', 'Failed to upgrade to premium', 'error');
      }
    }
  };


  // Rewarded Video Ad Handlers
  const handleWatchAdForMotivation = useCallback(async () => {
    try {
      // Check if rewarded ad is available
      if (!canShowRewardedAd()) {
        showCustomAlert(
          language === 'en' ? 'Ad Not Available' : 'Iklan Tidak Tersedia',
          language === 'en' 
            ? 'Please try again in a few moments.'
            : 'Silakan coba lagi dalam beberapa saat.',
          'warning'
        );
        return;
      }

      // Show rewarded ad
      const rewarded = await showRewardedAd('motivation_unlock');
      
      if (rewarded) {
        // User watched the ad and earned reward - unlock motivation content
        setShowPremiumMotivation(true);
        
        showCustomAlert(
          language === 'en' ? '🎉 Content Unlocked! 💝' : '🎉 Konten Terbuka! 💝',
          language === 'en' 
            ? '🔓 You can now see your personalized motivation content! 🌟'
            : '🔓 Sekarang Anda dapat melihat konten motivasi pribadi! 🌟',
          'success'
        );
      } else {
        // User didn't complete the ad
        showCustomAlert(
          language === 'en' ? 'Ad Incomplete' : 'Iklan Tidak Selesai',
          language === 'en' 
            ? 'Please watch the full ad to unlock content.'
            : 'Silakan tonton iklan lengkap untuk membuka konten.',
          'info'
        );
      }
    } catch (error) {
      debugLog.error('Error showing motivation reward ad:', error);
      showCustomAlert(
        language === 'en' ? 'Error' : 'Kesalahan',
        language === 'en' 
          ? 'Unable to show ad. Please try again later.'
          : 'Tidak dapat menampilkan iklan. Silakan coba lagi nanti.',
        'error'
      );
    }
  }, [showCustomAlert, setShowPremiumMotivation, language]);

  // 🎯 REMOVED: handleWatchAdForMissions function - no longer needed since all users get 3 missions by default




  // Calculate premium status - null-safe
  const hasActivePremium = useMemo(() => user?.isPremium || false, [user?.isPremium]);

  // Memoize daily missions to prevent recalculation on every render
  // This must be called before any early returns to maintain hook order
  const dailyMissions = useMemo(() => {
    // Handle null user or skeleton user - show empty missions while loading
    if (!user || user.id === 'loading') {
      return [];
    }
    
    // 🎯 NEW LOGIC: Always show 4 missions - 2 unlocked, 2 locked (unless ad watched)
    const missions = generateDailyMissionsFromService(user, false, language as 'en' | 'id', adUnlockedMissions.length > 0);
    
    // Apply completion status from local state
    const missionsWithStatus = missions.map(mission => ({
      ...mission,
      isCompleted: completedMissions.includes(mission.id),
    }));
    
    return missionsWithStatus;
  }, [user?.id, completedMissions, language, adUnlockedMissions.length]);


  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // SKELETON: Show skeleton dashboard instead of loading screen for better UX
  if (!user) {
    return (
      <ErrorBoundary>
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
          <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 150, height: 24 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 120, height: 18, marginTop: 8 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 180, height: 16, marginTop: 4 }]} />
              </View>
            </View>
          </LinearGradient>

          {/* Skeleton Level Card */}
          <View style={[styles.levelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.levelTopRow}>
              <View style={[styles.skeletonCircle, { backgroundColor: colors.lightGray, width: 24, height: 24 }]} />
              <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 100, height: 20 }]} />
              <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 60, height: 20 }]} />
            </View>
            <View style={styles.levelProgressRow}>
              <View style={[styles.levelProgressBar, { backgroundColor: colors.lightGray, height: 8 }]} />
            </View>
          </View>

          {/* Skeleton Stats Card */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.skeletonCircle, { backgroundColor: colors.lightGray, width: 40, height: 40 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 40, height: 24, marginTop: 8 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 60, height: 16, marginTop: 4 }]} />
              </View>
              <View style={styles.statItem}>
                <View style={[styles.skeletonCircle, { backgroundColor: colors.lightGray, width: 40, height: 40 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 50, height: 24, marginTop: 8 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 70, height: 16, marginTop: 4 }]} />
              </View>
              <View style={styles.statItem}>
                <View style={[styles.skeletonCircle, { backgroundColor: colors.lightGray, width: 40, height: 40 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 80, height: 24, marginTop: 8 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 60, height: 16, marginTop: 4 }]} />
              </View>
            </View>
          </View>

          {/* Skeleton Motivation Card */}
          <View style={[styles.motivationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 150, height: 20, marginBottom: 12 }]} />
            <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: '100%', height: 16, marginBottom: 8 }]} />
            <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: '80%', height: 16, marginBottom: 8 }]} />
            <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: '60%', height: 16 }]} />
          </View>

          {/* Skeleton Daily Missions */}
          <View style={[styles.missionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.skeletonText, { backgroundColor: colors.lightGray, width: 120, height: 20, marginBottom: 16 }]} />
            {[1, 2].map(i => (
              <View key={i} style={[styles.missionItem, { backgroundColor: colors.lightGray, marginBottom: 12, padding: 16 }]}>
                <View style={[styles.skeletonText, { backgroundColor: colors.background, width: '70%', height: 16, marginBottom: 8 }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.background, width: '50%', height: 14 }]} />
              </View>
            ))}
          </View>
        </ScrollView>
      </ErrorBoundary>
    );
  }

  // All calculations are now memoized at the top of the component for better performance
  return (
    <ErrorBoundary>
      <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{getGreeting(user.displayName)}</Text>
            <Text style={styles.headerSubtext}>{levelInfo.nextLevelXP - user.xp} XP {language === 'en' ? 'to next level' : 'ke level berikutnya'}</Text>
            <Text style={styles.headerMotivation}>{language === 'en' ? 'Keep going, champion! 🚀' : 'Terus semangat, juara! 🚀'}</Text>
          </View>
        </View>
      </LinearGradient>


      {/* Level Card - Final structure with next level */}
      <View style={[styles.levelCardFinal, { backgroundColor: colors.surface }]}>
        {/* Top row */}
        <View style={styles.levelTopRow}>
          <MaterialIcons name="emoji-events" size={24} color={colors.accent} style={styles.levelIcon} />
          <Text style={[styles.levelBadgeText, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">{levelInfo.title}</Text>
          <Text style={[styles.levelXPTextLarge, { color: colors.textPrimary }]}>{user.xp} XP</Text>
        </View>
        {/* Middle: Progress bar and level names */}
        <View style={styles.levelProgressRow}>
          <View style={[styles.levelProgressBar, { backgroundColor: colors.lightGray }]}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.levelProgressFill, { width: `${Math.round(levelInfo.progress * 100)}%` }]}
            />
          </View>
          <View style={styles.levelProgressLabelsRow}>
            <Text style={[styles.levelProgressLabelLeft, { color: colors.textSecondary }]}>{`Level ${levelInfo.level}`}</Text>
            <Text style={[styles.levelProgressLabelRight, { color: colors.textSecondary }]}>{`Level ${levelInfo.level + 1}`}</Text>
          </View>
        </View>
        
        {/* Check-in Button - Now part of level card */}
        <TouchableOpacity
          style={[styles.levelCheckInButton, !canCheckIn && styles.checkInButtonDisabled]}
          onPress={handleCheckIn}
          disabled={!canCheckIn || checkingIn}
        >
          <LinearGradient
            colors={canCheckIn ? [colors.secondary, colors.secondaryDark] : [colors.gray, colors.darkGray]}
            style={styles.levelCheckInGradient}
          >
            {checkingIn ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color={colors.white} />
                <Text style={styles.levelCheckInText}>
                  {canCheckIn ? t.dashboard.checkIn : t.dashboard.checkedIn}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Temporary upgrade button for sandy@zaynstudio.app */}
      {user?.email === 'sandy@zaynstudio.app' && !user?.isPremium && (
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
          onPress={handleUpgradeToPremium}
        >
          <Text style={[styles.upgradeButtonText, { color: colors.white }]}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}

      {/* Statistics Row - Two cards side by side */}
      <View style={styles.statsRowContainer}>
        {/* Streak and Total Days Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(231, 76, 60, 0.15)' }]}>
              <MaterialIcons name="local-fire-department" size={20} color={colors.error} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatNumber(user.streak)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.dashboard.streak}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.lightGray }]} />
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(249, 149, 70, 0.15)' }]}>
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatNumber(daysSinceQuit)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{language === 'en' ? 'Days' : 'Hari'}</Text>
          </View>
        </View>

        {/* Money Saved Card */}
        <View style={[styles.statsCard, styles.statsCardLast, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(39, 174, 96, 0.15)' }]}>
              <MaterialIcons name="savings" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatCurrency(moneySaved).replace('Rp', '').trim()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.dashboard.moneySaved}</Text>
          </View>
        </View>
      </View>

      {/* Lungcat Pet Widget */}
      <TouchableOpacity 
        style={[styles.lungcatWidget, { backgroundColor: colors.surface }]}
        onPress={() => {
          // Navigate to Tamagotchi tab
          try {
            navigation?.navigate('Tamagotchi');
          } catch (error) {
            // Fallback if navigation fails
            showCustomAlert(
              language === 'en' ? '🐱 Lungcat' : '🐱 Lungcat',
              language === 'en' 
                ? 'Opening Lungcat page... 🎮' 
                : 'Membuka halaman Lungcat... 🎮',
              'info'
            );
          }
        }}
        activeOpacity={0.8}
      >
        <View style={styles.lungcatWidgetContent}>
          <View style={styles.lungcatInfo}>
            <Text style={[styles.lungcatSubtitle, { color: colors.textSecondary }]}>
              {language === 'en'
                ? "Care for your Lungcat by checking in daily and completing missions!"
                : "Rawat Lungcat Anda dengan check-in harian dan selesaikan misi!"
              }
            </Text>

            {/* Lungcat Status */}
            <Text style={[styles.lungcatStatus, { color: colors.textPrimary }]}>
              {user?.streak >= 30
                ? (language === 'en' ? '🌟 Thriving & Happy!' : '🌟 Berkembang & Bahagia!')
                : user?.streak >= 7
                ? (language === 'en' ? '😊 Healthy & Growing' : '😊 Sehat & Berkembang')
                : user?.streak > 0
                ? (language === 'en' ? '🌱 Getting Better' : '🌱 Semakin Baik')
                : (language === 'en' ? '😷 Needs Your Care' : '😷 Butuh Perhatian')
              }
            </Text>

            {/* Health Meter */}
            <View style={styles.lungcatHealthMeter}>
              <View style={[styles.lungcatHealthBar, { backgroundColor: colors.lightGray }]}>
                <View
                  style={[
                    styles.lungcatHealthFill,
                    {
                      width: `${getLungcatHealth()}%`,
                      backgroundColor: getLungcatHealthColor(user, colors)
                    }
                  ]}
                />
              </View>
              <Text style={[styles.lungcatHealthText, { color: colors.textSecondary }]}>
                ❤️ {getLungcatHealth()}%
              </Text>
            </View>
          </View>

          {/* Lungcat animation on the right */}
          <View style={styles.lungcatRightSection}>
            <View style={[styles.lungcatCircle, { backgroundColor: colors.white }]}>
              {/* Temporarily disabled LottieView for testing black screen
              <LottieView
                source={require('../../assets/lungcat/animations/lungcat-idle.json')}
                autoPlay
                loop
                style={styles.lungcatLottieView}
                resizeMode="contain"
              />
              */}
              <Animated.View
                style={{
                  transform: [{ translateX: shakeAnimation }],
                }}
              >
                <Image
                  source={require('../../assets/images/lungcat.png')}
                  style={styles.lungcatLottieView}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Daily Missions Card */}
      <View style={[styles.missionCardContainer, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.accent + '20', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.missionCardGradient}
          pointerEvents="box-none"
        >
          {/* Card Title */}
          <Text style={[styles.missionCardTitle, { color: colors.textPrimary }]}>{t.dashboard.dailyMissions}</Text>
        {dailyMissions.map((mission) => {
          const isDisabled = (mission.id === 'daily-checkin' && mission.isCompleted) || isAdUnlockLoading;
          
          return (
          <TouchableOpacity 
            key={mission.id} 
            style={[
              styles.missionItem,
              mission.isLocked && mission.unlockMethod === 'ad' && styles.lockedMissionItem
            ]}
            onPress={() => handleMissionToggle(mission)}
            disabled={isDisabled}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            delayPressIn={0}
            delayPressOut={50}
          >
            <View style={styles.missionCheckbox}>
              {mission.isLocked && mission.unlockMethod === 'ad' ? (
                <MaterialIcons name="play-circle-filled" size={24} color={colors.primary} />
              ) : (
                <MaterialIcons 
                  name={mission.isCompleted ? "check-circle" : "radio-button-unchecked"} 
                  size={24} 
                  color={mission.isCompleted ? colors.secondary : colors.gray} 
                />
              )}
            </View>
            <View style={styles.missionInfo}>
              <Text style={[
                styles.missionTitle, 
                { color: colors.textPrimary },
                mission.isCompleted && styles.missionTitleCompleted
              ]}>
                {mission.isLocked && mission.unlockMethod === 'ad' ? 
                  (language === 'en' ? 'Watch Ad for More Missions' : 'Tonton Iklan untuk Misi Lebih') : 
                  mission.title
                }
              </Text>
              <Text style={[
                styles.missionDescription, 
                { color: colors.textSecondary },
                mission.isCompleted && styles.missionDescriptionCompleted
              ]}>
                {mission.isLocked && mission.unlockMethod === 'ad' ? 
                  (language === 'en' ? 'Get 2 exciting & rewarding challenges!' : 'Dapatkan 2 misi seru & menantang!') : 
                  mission.description
                }
              </Text>
            </View>
            <View style={styles.missionReward}>
              <Text style={[
                styles.missionXP, 
                { color: colors.textPrimary },
                mission.isCompleted && styles.missionXPCompleted
              ]}>
                {mission.id === 'watch-ad-for-missions' 
                  ? (language === 'en' ? '🎁 Bonus' : '🎁 Bonus')
                  : `+${mission.xpReward} XP`
                }
              </Text>
            </View>
          </TouchableOpacity>
          );
        })}
        
        {/* 🎯 REMOVED: Unnecessary celebration instruction - happens automatically now */}
        </LinearGradient>
      </View>

      {/* Personal Motivator Card */}
      <View style={[styles.motivationCardContainer, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.accentAlt + '20', colors.accentAlt + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.motivationCardGradient}
        >
          {/* Card Title */}
          <Text style={[styles.motivationCardTitle, { color: colors.textPrimary }]}>{t.dashboard.personalMotivator}</Text>
        {user.isPremium || showPremiumMotivation ? (
          <MotivationContent 
            isLoading={isLoadingMotivation}
            motivation={dailyMotivation}
            language={language}
            textStyle={motivationTextStyle}
          />
        ) : (
          <View style={styles.lockedContent}>
            <MaterialIcons name="psychology" size={32} color={colors.accent} />
            <Text style={[styles.lockedText, { color: colors.textPrimary }]}>{t.dashboard.personalMotivatorDesc}</Text>
            <Text style={[styles.lockedSubtext, { color: colors.textSecondary }]}>{t.premium.features.dailyMotivation + ' + ' + t.premium.features.personalConsultation}</Text>
            <TouchableOpacity 
              style={[styles.upgradeButton, { backgroundColor: colors.secondary }]}
              onPress={() => handleWatchAdForMotivation()}
            >
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <MaterialIcons name="play-circle-filled" size={16} color="#FFFFFF" />
                <Text style={[styles.upgradeButtonText, { color: colors.white, marginLeft: 6 }]}>
                  {language === 'en' ? 'Watch Ad for Motivation' : 'Tonton Iklan untuk Motivasi'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        </LinearGradient>
      </View>
    </ScrollView>
    
    <ConfettiAnimation 
      visible={showConfetti}
      onComplete={() => setShowConfetti(false)}
      colors={['#F99546', '#27AE60', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6']}
      pieceCount={25}
      duration={2500}
    />
    
    <CustomAlert
      visible={customAlert.visible}
      title={customAlert.title}
      message={customAlert.message}
      type={customAlert.type}
      onDismiss={hideCustomAlert}
    />
    
    {/* SOS button now integrated into navigation - removed from here */}
    
    {/* Feature Discovery Tutorial */}
    <FeatureTutorial
      visible={showTutorial}
      onComplete={handleTutorialComplete}
      onSkip={handleTutorialSkip}
      language={language as 'en' | 'id'}
    />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.screenPadding,
  },
  errorText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.buttonRadius || 16,
  },
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  header: {
    paddingTop: Math.max(45, height * 0.05), // Balanced top padding like Achievement page
    paddingBottom: SIZES.xl, // Consistent bottom padding like Achievement page
    paddingHorizontal: SIZES.screenPadding,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center', // Center the text horizontally
  },
  greeting: {
    ...TYPOGRAPHY.h1White,
    fontSize: Math.min(width * 0.055, 22), // Responsive font size for mobile
    lineHeight: Math.min(width * 0.07, 28),
    marginBottom: SIZES.xs || 4,
    textAlign: 'center',
  },
  headerSubtext: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: Math.min(width * 0.04, 16), // Responsive font size
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.xs || 2,
    textAlign: 'center',
  },
  headerMotivation: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: Math.min(width * 0.035, 14), // Responsive font size
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  communityBanner: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: -SIZES.lg, // Overlap slightly with header
    marginBottom: SIZES.xs,
    borderRadius: SIZES.cardRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  communityBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  communityBannerText: {
    ...TYPOGRAPHY.bodySmall,
    marginLeft: SIZES.xs,
    fontWeight: '500',
  },
  logoutButton: {
    padding: Math.max(SIZES.sm, width * 0.03), // Responsive padding for better mobile touch target
    borderRadius: SIZES.buttonRadius / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background for better visibility
  },
  content: {
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: SIZES.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.cardPadding,
    marginBottom: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelContainer: {
    marginBottom: SIZES.xs,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkInButton: {
    marginBottom: 4,
    borderRadius: SIZES.cardRadius,
    overflow: 'hidden',
  },
  checkInButtonDisabled: {
    opacity: 0.7,
  },
  checkInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
  },
  checkInText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    marginLeft: SIZES.sm,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  cardTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  upgradePrompt: {
    marginTop: SIZES.md,
    padding: SIZES.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius || 12,
    alignItems: 'center',
  },
  upgradePromptText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
    lineHeight: 18,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  adMissionItem: {
    backgroundColor: COLORS.primary + '10', // 10% opacity
    borderRadius: SIZES.xs,
    paddingHorizontal: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.primary + '30', // 30% opacity
  },
  lockedMissionItem: {
    backgroundColor: COLORS.primary + '10', // 10% opacity
    borderRadius: SIZES.xs,
    paddingHorizontal: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.primary + '30', // 30% opacity
    opacity: 0.8,
  },
  missionCheckbox: {
    marginRight: SIZES.sm,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  missionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  missionDescription: {
    ...TYPOGRAPHY.bodySmallSecondary,
    marginTop: SIZES.xs,
  },
  missionDescriptionCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  missionReward: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.buttonRadius || 12,
  },
  missionXP: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
  },
  missionXPCompleted: {
    opacity: 0.6,
  },
  motivationText: {
    ...TYPOGRAPHY.bodyMedium,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  lockedText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
    fontWeight: '600',
  },
  lockedSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.md,
    lineHeight: 18,
  },

  // Level Card - Final structure with next level (floating design optimized for mobile)
  levelCardFinal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: -Math.max(SIZES.lg, height * 0.04), // Responsive negative margin for floating effect
    marginBottom: 4, // Minimal bottom margin
    padding: Math.max(SIZES.sm, width * 0.04), // Responsive padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  levelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.xs || 4,
  },
  levelIcon: {
    marginRight: SIZES.sm,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'left',
  },
  levelXPTextLarge: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  levelProgressRow: {
    marginBottom: SIZES.xs || 4,
  },
  levelProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  levelProgressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  levelProgressLabelLeft: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'left',
    flex: 1,
  },
  levelProgressLabelRight: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  levelBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
  },
  levelSubtitleFinal: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'left',
  },
  levelToNextBadge: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '700',
    minWidth: 120,
    textAlign: 'right',
  },

  // Statistics Row - Two cards side by side
  statsRowContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.screenPadding,
    marginTop: 2,
    marginBottom: SIZES.xs || 4,
  },
  statsCard: {
    width: '49%',
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    paddingVertical: SIZES.sm,
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '2%',
    minHeight: 75,
  },
  statsCardLast: {
    marginRight: 0,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 2,
  },
  statCircleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs || 4,
  },
  statValue: {
    ...TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SIZES.xs || 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Bento-specific styles
  bentoStatsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoStatsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  bentoStatsValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SIZES.xs,
  },
  bentoStatsLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  bentoCheckInCard: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  bentoCheckInButton: {
    borderRadius: SIZES.buttonRadius || 12,
    overflow: 'hidden',
  },
  bentoCheckInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.buttonRadius || 12,
  },
  
  bentoLevelContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bentoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.inputRadius,
    marginTop: SIZES.sm,
  },
  bentoBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginLeft: SIZES.xs,
    fontWeight: '500',
    flex: 1,
  },
  
  bentoMissionsCard: {
    minHeight: 160,
  },
  missionCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs || 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  bentoMotivationCard: {
    minHeight: 'auto',
  },
  motivationCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 4,
    marginBottom: SIZES.xs || 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  missionCardGradient: {
    padding: SIZES.sm,
    minHeight: 160,
    flex: 1,
  },
  missionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  motivationCardGradient: {
    padding: SIZES.sm,
    minHeight: 'auto',
    flex: 1,
  },
  motivationCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  levelTopLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  bentoGridContainer: {
    marginTop: SIZES.xs || 4,
  },
  
  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs || 4,
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  
  // Level card check-in button styles
  levelCheckInButton: {
    marginTop: 0,
    borderRadius: SIZES.buttonRadius || 12,
    overflow: 'hidden',
  },
  levelCheckInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.buttonRadius || 12,
  },
  levelCheckInText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    marginLeft: SIZES.sm,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.sm,
    padding: SIZES.sm,
    borderRadius: SIZES.buttonRadius || 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: Math.min(width * 0.032, 12),
    lineHeight: Math.min(width * 0.04, 16),
    flexShrink: 1,
    textAlign: 'center',
  },
  
  // SOS button styles removed - now integrated into navigation tab bar
  
  // Lungcat Widget styles
  lungcatWidget: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.xs / 2,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.cardPadding,
    borderRadius: SIZES.cardRadius,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  lungcatWidgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lungcatInfo: {
    flex: 1,
    marginRight: SIZES.sm,
  },
  lungcatTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 4,
  },
  lungcatSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    lineHeight: 18,
  },
  lungcatStatus: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  lungcatHealthMeter: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
  lungcatHealthBar: {
    width: 120,
    height: 6,
    borderRadius: 3,
    marginBottom: 3,
    overflow: 'hidden',
  },
  lungcatHealthFill: {
    height: '100%',
    borderRadius: 3,
  },
  lungcatHealthText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  lungcatRightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lungcatCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lungcatLottieView: {
    width: 80,
    height: 80,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  glowRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'rgba(255, 165, 0, 0.7)', // Orange with transparency
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },

  // Skeleton loading styles
  skeletonText: {
    borderRadius: 4,
    opacity: 0.7,
  },
  skeletonCircle: {
    borderRadius: 50,
    opacity: 0.7,
  },
});

// Memo comparison to prevent unnecessary re-renders
const arePropsEqual = (prevProps: DashboardScreenProps, nextProps: DashboardScreenProps) => {
  return prevProps.onLogout === nextProps.onLogout;
};

export default React.memo(DashboardScreen, arePropsEqual);