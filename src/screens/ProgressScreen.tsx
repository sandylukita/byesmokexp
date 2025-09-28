import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc as docRef, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Share,
    Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Cache constants for Progress screen data
const PROGRESS_CACHE_KEY = 'progress_user_cache';
const COMMUNITY_CACHE_KEY = 'community_comparison_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache for user progress data

// Load user data from AsyncStorage cache
const loadCachedUserData = async (): Promise<User | null> => {
  try {
    const cached = await AsyncStorage.getItem(PROGRESS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.data && parsed.timestamp) {
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_DURATION) {
          console.log('✓ Loaded fresh user data from Progress cache');
          return parsed.data;
        }
      }
    }
  } catch (error) {
    console.log('Error loading cached user data:', error);
  }
  return null;
};

// Save user data to AsyncStorage cache
const cacheUserData = async (userData: User) => {
  try {
    const cacheData = {
      data: userData,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(cacheData));
    console.log('✓ User data cached for Progress screen');
  } catch (error) {
    console.log('Error caching user data:', error);
  }
};

// Load community comparison from cache
const loadCachedCommunityComparison = async (userId: string): Promise<any | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${COMMUNITY_CACHE_KEY}_${userId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.data && parsed.timestamp) {
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_DURATION) {
          console.log('✓ Using cached community comparison');
          return parsed.data;
        }
      }
    }
  } catch (error) {
    console.log('Error loading cached community comparison:', error);
  }
  return null;
};

// Cache community comparison data
const cacheCommunityComparison = async (userId: string, comparison: any) => {
  try {
    const cacheData = {
      data: comparison,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(`${COMMUNITY_CACHE_KEY}_${userId}`, JSON.stringify(cacheData));
    console.log('✓ Community comparison cached');
  } catch (error) {
    console.log('Error caching community comparison:', error);
  }
};
import { demoGetCurrentUser, demoRestoreUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { User } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import {
    calculateDaysSinceQuit,
    calculateMoneySaved,
    formatCurrency,
    formatNumber,
    getHealthMilestones,
    cleanCorruptedDailyXP,
} from '../utils/helpers';
import { debugLog } from '../utils/performanceOptimizer';
import { compareUserToCommunity } from '../services/communityStats';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { TYPOGRAPHY } from '../utils/typography';

// OPTIMIZED: Memoized heatmap calculation to prevent expensive re-renders
const MemoizedHeatmapGrid = React.memo(({ 
  user, 
  selectedDate, 
  colors 
}: { 
  user: User; 
  selectedDate: Date; 
  colors: any 
}) => {
  return useMemo(() => {
    console.log('🗓️ HEATMAP RENDER START:', {
      userEmail: user.email,
      userXP: user.xp,
      dailyXPData: user.dailyXP,
      selectedDate: selectedDate.toDateString(),
      renderKey: `heatmap-${user.xp}-${JSON.stringify(user.dailyXP)}`
    });
    
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    // Normalize quit date to start of day to avoid time component issues
    const quitDate = new Date(user.quitDate);
    const quitDateNormalized = new Date(quitDate.getFullYear(), quitDate.getMonth(), quitDate.getDate());
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    // Create array for the calendar grid
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(
        <View key={`empty-${i}`} style={styles.heatmapDay}>
          <View style={styles.heatmapDayEmpty} />
        </View>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = isCurrentMonth && day === today.getDate();
      const isFuture = date > today;
      
      // Calculate activity for this day based on check-in status primarily
      let intensity = 0;
      
      // Debug quit date comparison for new users
      if (isToday) {
        console.log('🏁 QUIT DATE COMPARISON (FIXED):', {
          today: date.toDateString(),
          quitDateOriginal: quitDate.toDateString(),
          quitDateNormalized: quitDateNormalized.toDateString(),
          quitDateFull: quitDate,
          dateComparison: date >= quitDateNormalized,
          isFuture,
          willShowActivity: !isFuture && date >= quitDateNormalized
        });
      }
      

      if (!isFuture && date >= quitDateNormalized) {
        // Check if user did check-in on this specific date (improved date comparison)
        let hasCheckedInOnDate = false;
        if (user.lastCheckIn) {
          const checkInDate = new Date(user.lastCheckIn);
          const targetDate = new Date(date);
          // Compare dates by creating date strings in same timezone
          const checkInDateStr = checkInDate.getFullYear() + '-' + 
            (checkInDate.getMonth() + 1).toString().padStart(2, '0') + '-' + 
            checkInDate.getDate().toString().padStart(2, '0');
          const targetDateStr = targetDate.getFullYear() + '-' + 
            (targetDate.getMonth() + 1).toString().padStart(2, '0') + '-' + 
            targetDate.getDate().toString().padStart(2, '0');
          hasCheckedInOnDate = checkInDateStr === targetDateStr;
        }
        
        // For today, prioritize daily XP over check-in status
        if (isToday) {
          // Check actual XP earned today to determine intensity
          const dateKey = date.getFullYear() + '-' + 
                        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(date.getDate()).padStart(2, '0');
          
          // Get today's XP - NO UTC fallback for today to prevent showing yesterday's XP
          let todayXP = user.dailyXP?.[dateKey] || 0;
          
          
          // Check if user actually checked in TODAY (not yesterday or other days)
          let hasActuallyCheckedInToday = false;
          if (user.lastCheckIn) {
            const checkInDate = new Date(user.lastCheckIn);
            const today = new Date();

            // STRICT: Only consider it a check-in if it happened today AND within reasonable time window
            const timeDiff = Math.abs(today.getTime() - checkInDate.getTime());
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            hasActuallyCheckedInToday = checkInDate.toDateString() === today.toDateString() && hoursDiff < 24;

            console.log('🔍 Heatmap check-in debug:', {
              lastCheckIn: user.lastCheckIn,
              checkInDateString: checkInDate.toDateString(),
              todayDateString: today.toDateString(),
              hoursDiff: hoursDiff.toFixed(2),
              hasActuallyCheckedInToday,
              todayXP,
              userEmail: user.email,
              dateKey,
              utcDateKey: date.toISOString().split('T')[0],
              dailyXPForToday: user.dailyXP?.[dateKey] || user.dailyXP?.[date.toISOString().split('T')[0]] || 'not found'
            });
          }

          // FIXED: Only give check-in credit if genuinely checked in today
          // No automatic XP assignment - user must earn XP through actual actions
          
          // STRICT: Only show green if there's actual activity TODAY
          if (todayXP >= 50) {
            intensity = 3; // High activity: 50+ XP (multiple missions)
          } else if (todayXP >= 20) {
            intensity = 2; // Medium activity: 20-49 XP (some missions)
          } else if (todayXP >= 10) {
            intensity = 1; // Low activity: 10-19 XP (check-in or single mission)
          } else {
            // DEFAULT: No activity today = gray
            intensity = 0; // No green unless there's actual XP earned today
          }
          
        } else {
          // For past days, use dailyXP as fallback for historical data
          const dateKey = date.getFullYear() + '-' +
                        String(date.getMonth() + 1).padStart(2, '0') + '-' +
                        String(date.getDate()).padStart(2, '0');

          // Try current format first, then fallback to legacy UTC format
          let dailyXP = user.dailyXP?.[dateKey] || 0;
          if (dailyXP === 0) {
            // Fallback: try UTC format for legacy data
            const utcDateKey = date.toISOString().split('T')[0];
            dailyXP = user.dailyXP?.[utcDateKey] || 0;
          }


          // Convert XP to intensity levels for historical days
          if (dailyXP >= 50) {
            intensity = 3; // High activity: 50+ XP
          } else if (dailyXP >= 20) {
            intensity = 2; // Medium activity: 20-49 XP
          } else if (dailyXP >= 10) {
            intensity = 1; // Low activity: 10-19 XP
          } else {
            // ENHANCED FALLBACK: Better reconstruction of historical activity
            const daysFromToday = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            const streak = user.streak || 0;
            const totalDays = user.totalDays || 0;

            // ENHANCED: Calculate if this day falls within user's smoking cessation journey
            const daysSinceQuit = user.quitDate ? Math.floor((date.getTime() - new Date(user.quitDate).getTime()) / (1000 * 60 * 60 * 24)) : -1;
            const maxDaysSinceQuit = user.quitDate ? Math.floor((today.getTime() - new Date(user.quitDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

            // FIXED: Use actual calendar days since quit, not just totalDays (which seems to be check-in days)
            const isWithinUserJourney = daysSinceQuit >= 0 && daysSinceQuit <= maxDaysSinceQuit;

            // Debug logging for historical days without XP data
            if (daysSinceQuit >= 0 && daysSinceQuit < Math.min(10, maxDaysSinceQuit)) {
              console.log('🔍 FALLBACK LOGIC DEBUG (FIXED):', {
                date: date.toDateString(),
                daysSinceQuit,
                totalDays,
                maxDaysSinceQuit,
                streak,
                daysFromToday,
                isWithinUserJourney,
                userEmail: user.email
              });
            }

            if (isWithinUserJourney) {
              // STRICT MODE: Only show green if there's actual evidence of activity
              // No more fake green days for missing data

              console.log('⚪ STRICT: No XP data found for day within journey:', {
                date: date.toDateString(),
                daysSinceQuit,
                message: 'Setting intensity 0 - no fake green days'
              });

              intensity = 0; // Strict: No XP = No green
            } else {
              intensity = 0; // No activity before quit date or after journey
              if (daysSinceQuit >= 0) {
                console.log('⚪ FALLBACK: No activity (outside journey):', date.toDateString(), 'daysSinceQuit:', daysSinceQuit, 'totalDays:', totalDays);
              }
            }
          }
        }
      } else {
        // Debug: Why isn't activity being calculated?
        if (isToday) {
          console.log('❌ NO ACTIVITY CALCULATION - Reason:', {
            isFuture: isFuture,
            dateGteQuitDate: date >= quitDateNormalized,
            failedCondition: isFuture ? 'Date is in future' : 'Date is before quit date'
          });
        }
      }
      
      // Debug the style calculation for today
      if (isToday) {
        console.log('🎨 HEATMAP STYLE CALCULATION:', {
          day,
          isToday,
          isFuture,
          intensity,
          expectedColor: intensity === 0 ? 'gray' : intensity === 1 ? 'light green' : intensity === 2 ? 'medium green' : 'dark green',
          stylesApplied: {
            heatmapDayCircle: true,
            surface: true,
            heatmapEmpty: !isFuture && intensity === 0,
            heatmapLow: !isFuture && intensity === 1,
            heatmapMedium: !isFuture && intensity === 2,
            heatmapHigh: !isFuture && intensity === 3,
            heatmapToday: isToday
          }
        });
      }
      
      calendarDays.push(
        <View key={`day-${day}`} style={styles.heatmapDay}>
          <View style={[
            styles.heatmapDayCircle,
            { backgroundColor: colors.surface },
            isFuture && [styles.heatmapFuture, { borderColor: colors.border }],
            !isFuture && intensity === 0 && [styles.heatmapEmpty, { backgroundColor: colors.border }],
            !isFuture && intensity === 1 && styles.heatmapLow,
            !isFuture && intensity === 2 && styles.heatmapMedium,
            !isFuture && intensity === 3 && styles.heatmapHigh,
            isToday && [styles.heatmapToday, { borderColor: colors.primary }]
          ]}>
            <Text style={[
              styles.heatmapDayNumber,
              (intensity > 1 || isToday) && styles.heatmapDayNumberDark,
              { color: (intensity > 1 || isToday) ? colors.white : colors.textSecondary }
            ]}>
              {day}
            </Text>
          </View>
        </View>
      );
    }
    
    return calendarDays;
  }, [user.id, user.xp, user.dailyXP, user.lastCheckIn, user.quitDate, selectedDate, colors]);
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.xp === nextProps.user.xp &&
    JSON.stringify(prevProps.user.dailyXP) === JSON.stringify(nextProps.user.dailyXP) &&
    prevProps.user.lastCheckIn === nextProps.user.lastCheckIn &&
    prevProps.selectedDate.getTime() === nextProps.selectedDate.getTime()
  );
});

// INSTAGRAM-STYLE: Create skeleton user for instant loading
const createSkeletonProgressUser = (): User => ({
  id: 'loading',
  email: 'loading@app.com',
  displayName: 'Loading...',
  username: 'loading',
  isPremium: false,
  quitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago for realistic skeleton
  cigarettesPerDay: 10,
  cigarettePrice: 25000,
  streak: 7,
  longestStreak: 7,
  totalDays: 7,
  xp: 70,
  level: 1,
  badges: [],
  completedMissions: [],
  dailyXP: {
    // Generate skeleton daily XP for last 7 days
    [new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 10,
    [new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 15,
    [new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 20,
    [new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 10,
    [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 25,
    [new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 10,
    [new Date().toISOString().split('T')[0]]: 0, // Today starts with 0
  },
  settings: {
    notifications: true,
    streakNotifications: true,
  },
  lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
});

const ProgressScreen: React.FC = () => {
  // REVERTED: Back to original working approach
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = demoGetCurrentUser();
    if (cachedUser) {
      console.log('✅ Progress: Starting with cached user data');
      return cachedUser;
    }
    return null; // Original approach: null until data loads
  });
  const [selectedTab, setSelectedTab] = useState<'health' | 'savings' | 'stats'>('stats');
  const [loading, setLoading] = useState(false); // OPTIMIZED: Start with false for instant UI
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // For month navigation
  const { colors, updateUser, language } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    initializeProgressData();
  }, []);

  const initializeProgressData = async () => {
    // First load cached data for instant display (if available)
    const cachedData = await loadCachedUserData();
    if (cachedData && cachedData.id !== 'loading') {
      setUser(cachedData);
      console.log('✓ Progress screen showing cached data instantly');
    } else {
      console.log('✓ Progress screen showing skeleton user instantly (no cache)');
      // Keep skeleton user until real data loads
    }
    
    // Then load fresh data in background
    loadUserData();
  };

  // Optimized real-time listener with better error handling
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    console.log('Setting up optimized real-time listener for ProgressScreen...');
    const userDocRef = docRef(db, 'users', firebaseUser.uid);
    
    const unsubscribe = onSnapshot(
      userDocRef, 
      {
        includeMetadataChanges: false, // Only listen for actual data changes
        source: 'default' // Allow cached data to reduce reads
      },
      (doc) => {
        // Only process if user is still authenticated and doc exists
        if (auth.currentUser && doc.exists() && !doc.metadata.fromCache) {
          const rawUserData = { id: firebaseUser.uid, ...doc.data() } as User;
          const cleanedDailyXP = cleanCorruptedDailyXP(rawUserData.dailyXP);
          const userData = {
            ...rawUserData,
            dailyXP: cleanedDailyXP
          };

          // If corruption was detected and cleaned, persist the clean data back to Firestore
          if (rawUserData.dailyXP && Object.keys(rawUserData.dailyXP).length !== Object.keys(cleanedDailyXP).length) {
            console.log('🔧 Persisting cleaned dailyXP data to Firestore');
            try {
              updateDoc(docRef(db, 'users', firebaseUser.uid), { dailyXP: cleanedDailyXP });
            } catch (error) {
              console.error('Error persisting cleaned dailyXP:', error);
            }
          }
          console.log('🔄 Progress real-time update received:', {
            email: userData.email,
            xp: userData.xp,
            totalDays: userData.totalDays,
            streak: userData.streak,
            dailyXPEntries: Object.keys(userData.dailyXP || {}).length,
            completedMissions: userData.completedMissions?.length || 0,
            lastCheckIn: userData.lastCheckIn
          });
          
          // Update user data with smart logic and cache it
          setUser(currentUser => {
            if (!currentUser) {
              console.log('Setting initial Progress screen user data');
              cacheUserData(userData);
              return userData;
            }
            
            // Accept updates if any of these conditions are met:
            // 1. XP increased (mission completed or check-in)
            // 2. lastCheckIn changed (new check-in)
            // 3. dailyXP has new entries (mission completed)
            // 4. completedMissions count changed
            const shouldUpdate = 
              userData.xp >= currentUser.xp || // XP same or increased
              userData.lastCheckIn !== currentUser.lastCheckIn || // New check-in
              (userData.dailyXP && Object.keys(userData.dailyXP).length !== Object.keys(currentUser.dailyXP || {}).length) || // New daily XP entries
              (userData.completedMissions?.length || 0) !== (currentUser.completedMissions?.length || 0); // Mission count changed
              
            if (shouldUpdate) {
              console.log('✅ Accepting Progress screen Firebase update:', {
                xpChange: userData.xp - currentUser.xp,
                checkInChanged: userData.lastCheckIn !== currentUser.lastCheckIn,
                dailyXPEntries: Object.keys(userData.dailyXP || {}).length,
                previousDailyXPEntries: Object.keys(currentUser.dailyXP || {}).length,
                missionsChange: (userData.completedMissions?.length || 0) - (currentUser.completedMissions?.length || 0),
                todaysDailyXP: (() => {
                  const today = new Date();
                  const todayKey = today.getFullYear() + '-' + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                    today.getDate().toString().padStart(2, '0');
                  return userData.dailyXP?.[todayKey] || 0;
                })()
              });
              cacheUserData(userData);
              return userData;
            } else {
              console.log('⏭️ Ignoring stale Progress data from Firebase');
              return currentUser;
            }
          });
        }
      }, 
      (error) => {
        // Handle authentication errors gracefully
        if (error.code === 'permission-denied') {
          console.log('🔐 Progress screen: User authentication changed, stopping listener');
          return; // Don't log error for expected auth changes
        }
        
        // Handle network errors gracefully  
        if (error.code === 'unavailable' || error.code === 'failed-precondition') {
          console.log('📶 Progress screen: Firebase temporarily unavailable');
          return; // Don't log error for expected network issues
        }
        
        // Only log unexpected errors if user is still authenticated
        if (auth.currentUser) {
          console.error('Progress real-time listener error:', error.code || error.message);
        }
      }
    );
    
    return () => {
      console.log('Cleaning up Progress real-time listener');
      unsubscribe();
    };
  }, [auth.currentUser]);


  // Only reload data when screen comes into focus if cache is stale
  useFocusEffect(
    useCallback(() => {
      console.log('ProgressScreen focused...');
      
      // Check if we need to refresh (only if no user data or cache is stale)
      if (!user) {
        console.log('No user data, loading...');
        initializeProgressData();
      } else {
        // Check cache age - only reload if data is older than 5 minutes
        loadCachedUserData().then(cachedData => {
          if (!cachedData) {
            console.log('Cache expired, refreshing in background...');
            loadUserData(); // Background refresh without loading state
          } else {
            console.log('Using existing user data, skipping reload');
          }
        });
      }
    }, [user])
  );

  const loadUserData = async () => {
    console.log('Starting loadUserData in ProgressScreen...');
    try {
      // First priority: Check Firebase authentication for real users
      console.log('Checking Firebase auth first...');
      try {
        const currentUser = auth.currentUser;
        console.log('Firebase currentUser:', currentUser?.email);
        
        if (currentUser) {
          console.log('Getting user doc from Firestore...');
          const userDoc = await getDoc(docRef(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const rawUserData = { id: currentUser.uid, ...userDoc.data() } as User;
            const cleanedDailyXP = cleanCorruptedDailyXP(rawUserData.dailyXP);
            const userData = {
              ...rawUserData,
              dailyXP: cleanedDailyXP
            };

            // If corruption was detected and cleaned, persist the clean data back to Firestore
            if (rawUserData.dailyXP && Object.keys(rawUserData.dailyXP).length !== Object.keys(cleanedDailyXP).length) {
              console.log('🔧 Persisting cleaned dailyXP data to Firestore');
              try {
                updateDoc(docRef(db, 'users', currentUser.uid), { dailyXP: cleanedDailyXP });
              } catch (error) {
                console.error('Error persisting cleaned dailyXP:', error);
              }
            }
            console.log('✓ ProgressScreen Firebase user data loaded:', {
              email: userData.email,
              completedMissions: userData.completedMissions?.length || 0,
              badges: userData.badges?.length || 0,
              xp: userData.xp,
              streak: userData.streak,
              longestStreak: userData.longestStreak,
              totalDays: userData.totalDays,
              lastCheckIn: userData.lastCheckIn,
              dailyXP: userData.dailyXP,
              dailyXPKeys: Object.keys(userData.dailyXP || {}).length
            });
            setUser(userData);
            // Cache the user data for next time
            cacheUserData(userData);
            // updateUser(userData); // Temporarily disabled to prevent infinite loop
            setLoading(false);
            return;
          } else {
            console.log('User doc does not exist in Firestore');
          }
        } else {
          console.log('No current user in Firebase auth');
        }
      } catch (firebaseError) {
        console.error('Firebase error, falling back to demo:', firebaseError);
        // Continue to demo fallback
      }

      // Fallback to demo data for development/testing
      console.log('No Firebase user, checking for demo user in memory...');
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        console.log('✓ Demo user found in memory:', {
          email: demoUser.email,
          completedMissions: demoUser.completedMissions?.length || 0,
          badges: demoUser.badges?.length || 0,
          xp: demoUser.xp,
          totalDays: demoUser.totalDays,
          dailyXP: demoUser.dailyXP
        });
        setUser(demoUser);
        // Cache demo user data too
        cacheUserData(demoUser);
        // updateUser(demoUser); // Temporarily disabled to prevent infinite loop
        setLoading(false);
        return;
      }
      
      // Try to restore demo user from storage as last resort
      console.log('No demo user in memory, checking storage...');
      const restoredUser = await demoRestoreUser();
      if (restoredUser) {
        console.log('✓ Demo user restored from storage:', {
          email: restoredUser.email,
          completedMissions: restoredUser.completedMissions?.length || 0,
          badges: restoredUser.badges?.length || 0,
          xp: restoredUser.xp,
          totalDays: restoredUser.totalDays
        });
        setUser(restoredUser);
        // Cache restored demo user data
        cacheUserData(restoredUser);
        // updateUser(restoredUser); // Temporarily disabled to prevent infinite loop
        setLoading(false);
        return;
      }

      console.log('No user found in any data source');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Month navigation functions
  const goToPreviousMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  // Achievement sharing functions
  const shareAchievement = async (type: 'days' | 'money' | 'cigarettes' | 'streak' | 'milestone', data?: any) => {
    if (!user) return;

    const daysSinceQuit = user.totalDays || 0;
    const moneySaved = calculateMoneySaved(daysSinceQuit, user.cigarettesPerDay, user.cigarettePrice);
    const cigarettesAvoided = daysSinceQuit * user.cigarettesPerDay;

    let message = '';
    
    switch (type) {
      case 'days':
        message = language === 'en' 
          ? `🎉 ${daysSinceQuit} days smoke-free! I'm on my journey to a healthier life with ByeSmoke AI. Join me! 💪 #SmokeFree #HealthyLife`
          : `🎉 ${daysSinceQuit} hari bebas rokok! Saya sedang dalam perjalanan menuju hidup yang lebih sehat bersama ByeSmoke AI. Ikuti saya! 💪 #BebasRokok #HidupSehat`;
        break;
      case 'money':
        const savings = formatCurrency(moneySaved).replace('Rp', '').trim();
        message = language === 'en'
          ? `💰 I've saved ${savings} by quitting smoking! That's the power of saying no to cigarettes. Thanks ByeSmoke AI! 🚭 #MoneySaved #QuitSmoking`
          : `💰 Saya sudah menghemat ${savings} dengan berhenti merokok! Itulah kekuatan mengatakan tidak pada rokok. Terima kasih ByeSmoke AI! 🚭 #HematUang #BerhentiMerokok`;
        break;
      case 'cigarettes':
        message = language === 'en'
          ? `🚭 ${formatNumber(cigarettesAvoided)} cigarettes avoided! My lungs thank me every day. Quitting smoking was the best decision! #HealthFirst #SmokeFree`
          : `🚭 ${formatNumber(cigarettesAvoided)} batang rokok dihindari! Paru-paru saya berterima kasih setiap hari. Berhenti merokok adalah keputusan terbaik! #KesehatanUtama #BebasRokok`;
        break;
      case 'streak':
        const streak = user.longestStreak || user.streak || 0;
        message = language === 'en'
          ? `🔥 ${streak} days streak! Consistency is key to breaking free from smoking addiction. ByeSmoke AI keeps me motivated! #StreakPower #QuitSmoking`
          : `🔥 Streak ${streak} hari! Konsistensi adalah kunci untuk bebas dari kecanduan rokok. ByeSmoke AI membuat saya tetap termotivasi! #KekuatanStreak #BerhentiMerokok`;
        break;
      case 'milestone':
        if (data?.milestone) {
          message = language === 'en'
            ? `✨ Achievement unlocked: "${data.milestone.title}"! ${data.milestone.description} This smoke-free journey gets better every day! 🌟 #Milestone #HealthyLife`
            : `✨ Pencapaian terbuka: "${data.milestone.title}"! ${data.milestone.description} Perjalanan bebas rokok ini semakin baik setiap hari! 🌟 #Pencapaian #HidupSehat`;
        }
        break;
    }

    try {
      const result = await Share.share({
        message: message,
        title: language === 'en' ? 'My Smoke-Free Achievement' : 'Pencapaian Bebas Rokok Saya',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          language === 'en' ? 'Shared!' : 'Berhasil!',
          language === 'en' ? 'Achievement shared successfully!' : 'Pencapaian berhasil dibagikan!'
        );
      }
    } catch (error) {
      console.error('Error sharing achievement:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Kesalahan',
        language === 'en' ? 'Failed to share achievement' : 'Gagal membagikan pencapaian'
      );
    }
  };

  // Comprehensive progress summary sharing
  const shareProgressSummary = async () => {
    if (!user) return;

    const daysSinceQuit = user.totalDays || 0;
    const moneySaved = calculateMoneySaved(daysSinceQuit, user.cigarettesPerDay, user.cigarettePrice);
    const cigarettesAvoided = daysSinceQuit * user.cigarettesPerDay;
    const currentStreak = user.longestStreak || user.streak || 0;
    const missionsCompleted = user.completedMissions?.length || 0;
    const savings = formatCurrency(moneySaved).replace('Rp', '').trim();

    // Get community comparison for enhanced sharing (cached)
    let communityRankText = '';
    try {
      // First try cache
      let comparison = await loadCachedCommunityComparison(user.id);
      
      if (!comparison) {
        // If not cached, fetch from Firebase and cache it
        comparison = await compareUserToCommunity(user);
        if (comparison) {
          await cacheCommunityComparison(user.id, comparison);
        }
      }
      
      if (comparison) {
        communityRankText = language === 'en' 
          ? `\n🏆 Ranked in the ${comparison.streakRank} of ByeSmoke users!`
          : `\n🏆 Berada di ${comparison.streakRank} pengguna ByeSmoke!`;
      }
    } catch (error) {
      console.log('Could not get community comparison for sharing');
    }

    const message = language === 'en'
      ? `🎉 My Smoke-Free Journey with ByeSmoke AI 🚭

✅ ${daysSinceQuit} days smoke-free
💰 ${savings} saved
🚫 ${formatNumber(cigarettesAvoided)} cigarettes avoided
🔥 ${currentStreak}-day streak
🏆 ${missionsCompleted} missions completed

Every day smoke-free is a victory! 💪${communityRankText} #SmokeFree #HealthyLife #QuitSmoking`
      : `🎉 Perjalanan Bebas Rokok Saya dengan ByeSmoke AI 🚭

✅ ${daysSinceQuit} hari bebas rokok
💰 ${savings} dihemat
🚫 ${formatNumber(cigarettesAvoided)} batang rokok dihindari
🔥 Streak ${currentStreak} hari
🏆 ${missionsCompleted} misi selesai

Setiap hari bebas rokok adalah kemenangan! 💪${communityRankText} #BebasRokok #HidupSehat #BerhentiMerokok`;

    try {
      const result = await Share.share({
        message: message,
        title: language === 'en' ? 'My Smoke-Free Progress' : 'Progres Bebas Rokok Saya',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          language === 'en' ? 'Shared!' : 'Berhasil!',
          language === 'en' ? 'Progress shared successfully!' : 'Progres berhasil dibagikan!'
        );
      }
    } catch (error) {
      console.error('Error sharing progress:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Kesalahan',
        language === 'en' ? 'Failed to share progress' : 'Gagal membagikan progres'
      );
    }
  };

  // RESTORED: Show loading when no user data
  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // Use check-in based calculation to match Dashboard
  const daysSinceQuit = user.totalDays || 0;
  const moneySaved = calculateMoneySaved(daysSinceQuit, user.cigarettesPerDay, user.cigarettePrice);
  const healthMilestones = getHealthMilestones(new Date(user.quitDate));
  const cigarettesAvoided = daysSinceQuit * user.cigarettesPerDay;

  const renderHealthMilestones = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.progress.healthMilestones}</Text>
      </View>
      
      {healthMilestones.map((milestone, index) => {
        const gradientColors = [
          [colors.primary + '20', colors.primary + '10'], // Orange gradient
          [colors.secondary + '20', colors.secondary + '10'], // Green gradient  
          [colors.info + '20', colors.info + '10'], // Blue gradient
          [colors.accent + '20', colors.accent + '10'], // Light green gradient
          [colors.accentAlt + '20', colors.accentAlt + '10'], // Purple gradient
        ];
        const iconColors = [colors.primary, colors.secondary, colors.info, colors.accent, colors.accentAlt];
        
        return (
          <View key={milestone.id} style={[styles.milestoneCardContainer, { backgroundColor: colors.surface }]}>
            <LinearGradient
              colors={gradientColors[index % gradientColors.length]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.milestoneCardGradient}
            >
              <View style={styles.milestoneHeader}>
                <View style={[
                  styles.milestoneIcon,
                  { backgroundColor: milestone.isReached ? iconColors[index % iconColors.length] : colors.lightGray }
                ]}>
                  <MaterialIcons 
                    name={milestone.icon as any} 
                    size={24} 
                    color={milestone.isReached ? colors.white : colors.gray} 
                  />
                </View>
            <View style={styles.milestoneInfo}>
              <Text style={[
                styles.milestoneTitle,
                milestone.isReached && styles.milestoneReached,
                { color: colors.textPrimary }
              ]}>
                {milestone.title}
              </Text>
              <Text style={[styles.milestoneTime, { color: colors.textSecondary }]}>{milestone.timeframe}</Text>
            </View>
            <View style={styles.milestoneActions}>
              {milestone.isReached && (
                <MaterialIcons name="check-circle" size={20} color={colors.secondary} />
              )}
            </View>
          </View>
              <Text style={[
                styles.milestoneDescription,
                milestone.isReached && styles.milestoneDescriptionReached,
                { color: colors.textSecondary }
              ]}>
                {milestone.description}
              </Text>
            </LinearGradient>
          </View>
        );
      })}
    </View>
  );

  const renderSavingsBreakdown = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.progress.savings}</Text>
      </View>
      
      <View style={[styles.savingsCard, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.secondary, colors.secondaryDark]}
          style={styles.savingsGradient}
        >
          <Text style={styles.savingsAmount}>{formatCurrency(moneySaved).replace('Rp', '').trim()}</Text>
          <Text style={styles.savingsLabel}>{t.progress.totalSavings}</Text>
        </LinearGradient>
      </View>

      <View style={styles.breakdownContainer}>
        <View style={[styles.breakdownItem, { backgroundColor: colors.surface }]}>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons name="today" size={20} color={colors.primary} />
            </View>
            <View style={styles.breakdownTextContainer}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>{t.progress.perDay}</Text>
              <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>
                {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20)).replace('Rp', '').trim()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.breakdownItem, { backgroundColor: colors.surface }]}>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <MaterialIcons name="date-range" size={20} color={colors.accent} />
            </View>
            <View style={styles.breakdownTextContainer}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>{t.progress.perWeek}</Text>
              <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>
                {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20) * 7).replace('Rp', '').trim()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.breakdownItem, { backgroundColor: colors.surface }]}>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: colors.error + '20' }]}>
              <MaterialIcons name="calendar-month" size={20} color={colors.error} />
            </View>
            <View style={styles.breakdownTextContainer}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>{t.progress.perMonth}</Text>
              <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>
                {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20) * 30).replace('Rp', '').trim()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.investmentCard, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.accentAlt + '20', colors.accentAlt + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.investmentCardGradient}
        >
          <Text style={[styles.investmentTitle, { color: colors.textPrimary }]}>Apa yang bisa kamu beli?</Text>
          <Text style={[styles.investmentSubtitle, { color: colors.textSecondary }]}>Dengan uang yang kamu hemat</Text>
          
          <View style={styles.investmentGrid}>
            <View style={[styles.investmentItemCard, { backgroundColor: colors.surface }]}>
              <View style={styles.investmentIconContainer}>
                <Text style={styles.investmentEmoji}>📱</Text>
              </View>
              <Text style={[styles.investmentNumber, { color: colors.textPrimary }]}>
                {Math.floor(moneySaved / 3000000)}
              </Text>
              <Text style={[styles.investmentLabel, { color: colors.textSecondary }]}>Smartphone</Text>
            </View>
            
            <View style={[styles.investmentItemCard, { backgroundColor: colors.surface }]}>
              <View style={styles.investmentIconContainer}>
                <Text style={styles.investmentEmoji}>🍕</Text>
              </View>
              <Text style={[styles.investmentNumber, { color: colors.textPrimary }]}>
                {Math.floor(moneySaved / 50000)}
              </Text>
              <Text style={[styles.investmentLabel, { color: colors.textSecondary }]}>Pizza Keluarga</Text>
            </View>
            
            <View style={[styles.investmentItemCard, { backgroundColor: colors.surface }]}>
              <View style={styles.investmentIconContainer}>
                <Text style={styles.investmentEmoji}>⛽</Text>
              </View>
              <Text style={[styles.investmentNumber, { color: colors.textPrimary }]}>
                {Math.floor(moneySaved / 15000)}
              </Text>
              <Text style={[styles.investmentLabel, { color: colors.textSecondary }]}>Liter Bensin</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="smoke-free" size={32} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatNumber(cigarettesAvoided)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.progress.cigarettesAvoided}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="schedule" size={32} color={colors.secondary} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatNumber(cigarettesAvoided * 11)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.progress.lifeMinutesGained}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="local-fire-department" size={32} color={colors.error} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{user.longestStreak || user.streak || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{t.progress.longestStreak}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="assignment-turned-in" size={32} color={colors.info} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{user.completedMissions?.length || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.progress.missionsCompleted}</Text>
        </View>
      </View>

      
      <View style={[styles.monthlySection, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.accent + '20', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.monthlySectionGradient}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>{t.progress.dailyProgress}</Text>
            
            <View style={styles.monthNavigation}>
              <TouchableOpacity 
                style={[styles.navButton, { backgroundColor: colors.primary + '20' }]}
                onPress={goToPreviousMonth}
              >
                <MaterialIcons name="chevron-left" size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.monthYearContainer}
                onPress={goToCurrentMonth}
              >
                <Text style={[styles.monthYearText, { color: colors.textPrimary }]}>
                  {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </Text>
                {selectedDate.getMonth() !== new Date().getMonth() || selectedDate.getFullYear() !== new Date().getFullYear() ? (
                  <Text style={[styles.currentMonthHint, { color: colors.textSecondary }]}>
                    Tap untuk bulan ini
                  </Text>
                ) : null}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, { backgroundColor: colors.primary + '20' }]}
                onPress={goToNextMonth}
                disabled={selectedDate.getMonth() >= new Date().getMonth() && selectedDate.getFullYear() >= new Date().getFullYear()}
              >
                <MaterialIcons 
                  name="chevron-right" 
                  size={20} 
                  color={selectedDate.getMonth() >= new Date().getMonth() && selectedDate.getFullYear() >= new Date().getFullYear() ? colors.gray : colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.monthlyHeatmap, { backgroundColor: colors.background }]}>
            
            {/* Day labels */}
            <View style={styles.heatmapDayLabels}>
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <Text key={day} style={[styles.heatmapDayLabel, { color: colors.textPrimary }]}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.heatmapGrid}>
              <MemoizedHeatmapGrid 
                user={user} 
                selectedDate={selectedDate} 
                colors={colors}
              />
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={[styles.heatmapLegendText, { color: colors.textSecondary }]}>Kurang</Text>
              <View style={styles.heatmapLegendDots}>
                <View style={[styles.heatmapLegendDot, { backgroundColor: colors.border }]} />
                <View style={[styles.heatmapLegendDot, styles.heatmapLow]} />
                <View style={[styles.heatmapLegendDot, styles.heatmapMedium]} />
                <View style={[styles.heatmapLegendDot, styles.heatmapHigh]} />
              </View>
              <Text style={[styles.heatmapLegendText, { color: colors.textSecondary }]}>Aktif</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'health':
        return renderHealthMilestones();
      case 'savings':
        return renderSavingsBreakdown();
      case 'stats':
        return renderStatistics();
      default:
        return renderHealthMilestones();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
          <Text style={styles.headerTitle}>{t.progress.title}</Text>
          <Text style={styles.headerSubtitle}>
            "{daysSinceQuit} {t.progress.subtitle}"
          </Text>
          <TouchableOpacity 
            style={styles.shareAchievementButton} 
            onPress={shareProgressSummary}
          >
            <MaterialIcons name="share" size={14} color="#333333" />
            <Text style={styles.shareAchievementText}>
              {language === 'en' ? 'Share Progress' : 'Bagikan Progres'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.tab, 
              { backgroundColor: selectedTab === 'stats' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setSelectedTab('stats')}
          >
            <MaterialIcons 
              name="bar-chart" 
              size={Math.min(width * 0.045, 18)} 
              color={selectedTab === 'stats' ? colors.white : colors.gray} 
            />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'stats' ? colors.white : colors.textSecondary }
            ]}>
              {t.progress.statistics}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab, 
              { backgroundColor: selectedTab === 'health' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setSelectedTab('health')}
          >
            <MaterialIcons 
              name="favorite" 
              size={Math.min(width * 0.045, 18)} 
              color={selectedTab === 'health' ? colors.white : colors.gray} 
            />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'health' ? colors.white : colors.textSecondary }
            ]}>
              {t.progress.health}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab, 
              { backgroundColor: selectedTab === 'savings' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setSelectedTab('savings')}
          >
            <MaterialIcons 
              name="savings" 
              size={Math.min(width * 0.045, 18)} 
              color={selectedTab === 'savings' ? colors.white : colors.gray} 
            />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'savings' ? colors.white : colors.textSecondary }
            ]}>
              {t.progress.savings}
            </Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Math.max(45, height * 0.05), // Balanced top padding like Achievement page
    paddingBottom: SIZES.xl, // Consistent bottom padding like Achievement page
    paddingHorizontal: SIZES.screenPadding,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h1White,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: SIZES.xs || 4,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  shareAchievementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  shareAchievementText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#333333',
    fontWeight: '600',
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.screenPadding,
    borderRadius: SIZES.buttonRadius || 12,
    padding: Math.max(width * 0.015, 6),
    marginTop: -SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Math.max(width * 0.025, 10),
    paddingHorizontal: Math.max(width * 0.015, 4),
    borderRadius: SIZES.buttonRadius || 12,
    minHeight: 60,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: Math.min(width * 0.032, 12),
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.04, 14),
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs || 4,
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 0,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  milestoneCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    padding: SIZES.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  milestoneCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  milestoneCardGradient: {
    padding: SIZES.sm,
    flex: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
    marginBottom: SIZES.xs || 4,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  milestoneReached: {
    color: COLORS.secondary,
  },
  milestoneTime: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs || 2,
  },
  milestoneDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    lineHeight: 18,
  },
  milestoneDescriptionReached: {
    color: COLORS.textPrimary,
  },
  savingsCard: {
    borderRadius: SIZES.buttonRadius || 12,
    overflow: 'hidden',
    marginHorizontal: SIZES.screenPadding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  savingsGradient: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    alignItems: 'center',
  },
  savingsAmount: {
    fontSize: Math.min(width * 0.08, 28),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SIZES.xs || 4,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.09, 32),
  },
  savingsLabel: {
    fontSize: Math.min(width * 0.04, 16),
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
  },
  breakdownContainer: {
    marginHorizontal: SIZES.screenPadding,
    marginBottom: 4,
    gap: 6,
  },
  breakdownItem: {
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  breakdownTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  breakdownValue: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  breakdownLabel: {
    fontSize: Math.min(width * 0.032, 12),
    fontWeight: '500',
    textAlign: 'center',
  },
  investmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  investmentCardGradient: {
    padding: SIZES.sm,
  },
  investmentTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs || 4,
  },
  investmentSubtitle: {
    fontSize: Math.min(width * 0.03, 12),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  investmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  investmentItemCard: {
    backgroundColor: COLORS.white + '80',
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.xs || 4,
    alignItems: 'center',
    width: '30%',
    minHeight: 80,
    justifyContent: 'center',
  },
  investmentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs || 4,
  },
  investmentEmoji: {
    fontSize: 20,
  },
  investmentNumber: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  investmentLabel: {
    fontSize: Math.min(width * 0.025, 10),
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SIZES.screenPadding,
    marginBottom: 0,
    gap: SIZES.xs || 4,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
    alignItems: 'center',
    width: (width - SIZES.screenPadding * 2 - SIZES.xs) / 2,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
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
  monthlySection: {
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
  monthlySectionGradient: {
    padding: SIZES.sm,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  progressTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: SIZES.sm,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SIZES.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
  },
  monthYearText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  currentMonthHint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  monthlyHeatmap: {
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.sm,
  },
  heatmapDayLabels: {
    flexDirection: 'row',
    marginBottom: SIZES.xs,
  },
  heatmapDayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: Math.min(width * 0.028, 11),
    fontWeight: '600',
  },
  heatmapDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  heatmapDayCircle: {
    flex: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapDayEmpty: {
    flex: 1,
  },
  heatmapDayNumber: {
    fontSize: Math.min(width * 0.03, 12),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  heatmapDayNumberDark: {
    color: COLORS.white,
    fontWeight: '600',
  },
  heatmapEmpty: {
    // Background color applied dynamically
  },
  heatmapFuture: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    // Border color applied dynamically
  },
  heatmapLow: {
    backgroundColor: COLORS.secondary + '40',
  },
  heatmapMedium: {
    backgroundColor: COLORS.secondary + '70',
  },
  heatmapHigh: {
    backgroundColor: COLORS.secondary,
  },
  heatmapToday: {
    borderWidth: 2,
    // Border color applied dynamically
  },
  heatmapTodayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
    marginTop: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heatmapLegendText: {
    fontSize: Math.min(width * 0.025, 10),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  heatmapLegendDots: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  heatmapLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  // Sharing styles
  milestoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
});

export default ProgressScreen;