import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { demoGetCurrentUser, demoRestoreUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { getBadgeStatistics, initializeBadgeStatistics } from '../services/gamification';
import { initializeCommunityStats } from '../utils/initializeCommunityStats';

import { Badge, User } from '../types';
import { BADGES, COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { getTranslatedBadge } from '../utils/translations';
import CommunityStatsTab from '../components/CommunityStatsTab';

const { width, height } = Dimensions.get('window');

// Cache for badge statistics to avoid repeated Firebase calls
let cachedBadgeStats: {[badgeId: string]: number} | null = null;
let lastStatsLoadTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache (badge stats change slowly)
const STORAGE_KEY = 'badge_statistics_cache';

// INSTAGRAM-STYLE: Create skeleton user for instant loading
const createSkeletonAchievementUser = (): User => ({
  id: 'loading',
  email: 'loading@app.com',
  displayName: 'Loading User',
  username: 'loading',
  isPremium: false,
  quitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago for realistic badges
  cigarettesPerDay: 10,
  cigarettePrice: 25000,
  streak: 14,
  longestStreak: 14,
  totalDays: 14,
  xp: 140,
  level: 2,
  badges: [
    { id: 'new-member', unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    { id: 'first-day', unlockedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
    { id: 'week-warrior', unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  ],
  completedMissions: [],
  dailyXP: {},
  settings: {
    notifications: true,
    streakNotifications: true,
    reminderTime: '09:00',
  },
  lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
});

// Fallback statistics for immediate display
const FALLBACK_STATS: {[badgeId: string]: number} = {
  'new-member': 3205,
  'first-day': 2847,
  'week-warrior': 1623,
  'month-master': 943,
  'xp-collector': 721,
  'mission-master': 387,
  'streak-master': 234,
  'elite-year': 156,
  'xp-elite': 198,
  'mission-legend': 134,
  'money-saver-elite': 167,
  'health-transformer': 89,
  'perfect-month': 52,
  'diamond-streak': 43,
  'legendary-master': 28,
  'xp-master-premium': 76,
  'xp-legend': 34,
  'mission-champion': 61,
  'money-master-premium': 45,
};

// Load badge statistics from AsyncStorage
const loadStoredBadgeStats = async (): Promise<{[badgeId: string]: number} | null> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.data && parsed.timestamp) {
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_DURATION) {
          console.log('✓ Loaded fresh badge statistics from AsyncStorage');
          return parsed.data;
        } else {
          console.log('ℹ️ Stored badge statistics are stale');
        }
      }
    }
  } catch (error) {
    console.log('Error loading stored badge statistics:', error);
  }
  return null;
};

// Save badge statistics to AsyncStorage
const storeBadgeStats = async (stats: {[badgeId: string]: number}) => {
  try {
    const dataToStore = {
      data: stats,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    console.log('✓ Badge statistics saved to AsyncStorage for offline access');
  } catch (error) {
    console.log('Error storing badge statistics:', error);
  }
};

const BadgeStatisticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const route = useRoute();
  const params = route.params as { initialTab?: number } | undefined;

  const [badgeStats, setBadgeStats] = useState<{[badgeId: string]: number}>(FALLBACK_STATS);
  const [userBadges, setUserBadges] = useState<Badge[]>(() => {
    const cachedUser = demoGetCurrentUser();
    return cachedUser?.badges || [];
  });
  // FIXED: Try to load cached user first, fallback to skeleton only if no cache exists
  const [user, setUser] = useState<User>(() => {
    const cachedUser = demoGetCurrentUser();
    if (cachedUser) {
      console.log('✅ Achievement: Starting with cached user data (no flickering)');
      return cachedUser;
    }
    console.log('📱 Achievement: Starting with skeleton user (no cached data)');
    return createSkeletonAchievementUser();
  });
  // Set initial tab based on route param: 0 = badges, 1 = community
  const [activeTab, setActiveTab] = useState<'badges' | 'community'>(() => {
    return params?.initialTab === 1 ? 'community' : 'badges';
  });
  const [loading, setLoading] = useState(false); // Never show loading, always show fallback data immediately
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [communityTabLoaded, setCommunityTabLoaded] = useState(false); // Lazy load community tab

  useEffect(() => {
    initializeBadgeStats();
  }, []);

  // Handle initialTab param changes (when navigating to this screen with a specific tab)
  useEffect(() => {
    if (params?.initialTab === 1) {
      setActiveTab('community');
      setCommunityTabLoaded(true);
    }
  }, [params?.initialTab]);

  const initializeBadgeStats = async () => {
    // First try to load from AsyncStorage for instant display
    const storedStats = await loadStoredBadgeStats();
    if (storedStats) {
      setBadgeStats(storedStats);
      cachedBadgeStats = storedStats;
      lastStatsLoadTime = Date.now() - 1000; // Mark as slightly old to allow refresh
    }
    
    // Then load fresh data in background
    loadBadgeData();
  };

  // Only reload if cache is stale or user explicitly refreshes
  useFocusEffect(
    useCallback(() => {
      console.log('BadgeStatisticsScreen focused...');
      
      // Only reload user badges (fast operation), not the full statistics
      loadUserBadges();
      
      // Check if stats cache is stale
      const now = Date.now();
      if (!cachedBadgeStats || (now - lastStatsLoadTime) > CACHE_DURATION) {
        console.log('Stats cache is stale, refreshing...');
        loadBadgeStatistics();
      } else {
        console.log('Using cached badge statistics');
        setBadgeStats(cachedBadgeStats);
      }
    }, [])
  );

  const loadBadgeData = async () => {
    try {
      // Load all data in background without showing loading state
      Promise.all([
        loadBadgeStatistics(),
        loadUserBadges(),
        loadUserData()
      ]).catch(error => {
        console.error('Error loading badge data:', error);
      });
      
      setIsFirstLoad(false);
    } catch (error) {
      console.error('Error loading badge data:', error);
    }
  };

  const loadBadgeStatistics = async () => {
    try {
      // Use cached data if available and fresh
      const now = Date.now();
      if (cachedBadgeStats && (now - lastStatsLoadTime) < CACHE_DURATION) {
        setBadgeStats(cachedBadgeStats);
        return;
      }

      // Initialize baseline only on first app load (not every tab switch)
      try {
        const hasInitialized = await AsyncStorage.getItem('badgeStatsInitialized');
        if (!hasInitialized) {
          console.log('🚀 First app load - initializing baseline badge statistics...');
          initializeBadgeStatistics().catch(err => 
            console.log('Non-critical: Could not initialize baseline stats:', err.message)
          );
          
          // Also initialize community stats for the first time
          console.log('🚀 First app load - initializing community statistics...');
          initializeCommunityStats().catch(err => 
            console.log('Non-critical: Could not initialize community stats:', err.message)
          );
          
          await AsyncStorage.setItem('badgeStatsInitialized', 'true');
        }
      } catch (e) {
        console.log('AsyncStorage error:', e);
        // AsyncStorage error, continue with stats loading
      }
      
      // Load badge statistics with timeout to prevent long waits
      const statsPromise = getBadgeStatistics();
      const timeoutPromise = new Promise<{[badgeId: string]: number}>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      try {
        const stats = await Promise.race([statsPromise, timeoutPromise]);
        setBadgeStats(stats);
        cachedBadgeStats = stats;
        lastStatsLoadTime = now;
        // Save to AsyncStorage for offline access
        storeBadgeStats(stats);
        console.log('✓ Badge statistics loaded, cached, and stored for offline access');
      } catch (error: any) {
        console.log('Using fallback stats due to slow/failed fetch:', error.message);
        setBadgeStats(FALLBACK_STATS);
        cachedBadgeStats = FALLBACK_STATS;
        lastStatsLoadTime = now;
        // Save fallback stats to AsyncStorage as backup
        storeBadgeStats(FALLBACK_STATS);
      }
      
    } catch (error) {
      console.error('Error loading badge statistics:', error);
      setBadgeStats(FALLBACK_STATS);
    }
  };

  const loadUserBadges = async () => {
    try {
      // First try Firebase user
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = doc(db, 'users', firebaseUser.uid);
          const userSnapshot = await getDoc(userDoc);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserBadges(userData.badges || []);
            console.log('✓ Loaded user badges from Firebase:', userData.badges?.length || 0);
            return;
          }
        } catch (firebaseError) {
          console.error('Firebase error loading user badges:', firebaseError);
        }
      }
      
      // Fallback to demo user
      const demoUser = demoGetCurrentUser() || await demoRestoreUser();
      if (demoUser) {
        setUserBadges(demoUser.badges || []);
        console.log('✓ Loaded user badges from demo user:', demoUser.badges?.length || 0);
      } else {
        console.log('⚠️ No user found, setting empty badges');
        setUserBadges([]);
      }
    } catch (error) {
      console.error('Error loading user badges:', error);
      setUserBadges([]);
    }
  };

  const loadUserData = async () => {
    try {
      // First try Firebase user
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = doc(db, 'users', firebaseUser.uid);
          const userSnapshot = await getDoc(userDoc);
          
          if (userSnapshot.exists()) {
            const userData = { id: firebaseUser.uid, ...userSnapshot.data() } as User;
            console.log('✅ Badge Screen: Firebase user data loaded:', userData.email);
            setUser(userData);
            return;
          }
        } catch (firebaseError) {
          console.error('Firebase error loading user data:', firebaseError);
        }
      }
      
      // Fallback to demo user
      const demoUser = demoGetCurrentUser() || await demoRestoreUser();
      if (demoUser) {
        setUser(demoUser);
        console.log('✅ Badge Screen: Demo user data loaded:', demoUser.email);
      } else {
        console.log('⚠️ No user found for badge screen');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Clear cache to force fresh data
    cachedBadgeStats = null;
    lastStatsLoadTime = 0;
    await loadBadgeData();
    setRefreshing(false);
  };

  const handleTabSwitch = (tab: 'badges' | 'community') => {
    setActiveTab(tab);
    // Lazy load community tab only when first accessed
    if (tab === 'community' && !communityTabLoaded) {
      setCommunityTabLoaded(true);
      console.log('🚀 Lazy loading Community tab for first time...');
    }
  };

  const handleNavigateToSubscription = () => {
    // Navigation will be handled by parent component or navigation context
    console.log('Navigate to subscription screen - upgrade button pressed');
  };

  const isUserBadgeUnlocked = (badgeId: string): boolean => {
    return userBadges.some(badge => badge.id === badgeId);
  };

  // OPTIMIZED: Memoize badge item rendering to prevent expensive re-renders
  const renderBadgeItem = useMemo(() => {
    return (badge: any, index: number) => {
      const isUnlocked = isUserBadgeUnlocked(badge.id);
      const unlockCount = badgeStats[badge.id] || FALLBACK_STATS[badge.id] || 50;
      const translatedBadge = getTranslatedBadge(badge.id, language as any);
      
      return (
        <View key={badge.id} style={[
          { ...styles.badgeItem, backgroundColor: colors.surface },
          !isUnlocked && styles.lockedBadgeItem
        ]}>
          <View style={styles.badgeContent}>
            <View style={[
              styles.badgeIcon,
              { backgroundColor: isUnlocked ? badge.color + '20' : colors.lightGray },
              !isUnlocked && { backgroundColor: colors.lightGray }
            ]}>
              <MaterialIcons 
                name={badge.icon as any} 
                size={28} 
                color={isUnlocked ? badge.color : colors.gray} 
              />
            </View>
            
            <View style={styles.badgeInfo}>
              <Text style={[
                { ...styles.badgeName, color: colors.textPrimary },
                !isUnlocked && { color: colors.gray }
              ]}>
                {translatedBadge.name}
                {badge.isPremium && ' ⭐'}
              </Text>
              <Text style={[
                { ...styles.badgeDescription, color: colors.textSecondary },
                !isUnlocked && { color: colors.gray }
              ]}>
                {translatedBadge.description}
              </Text>
            </View>
            
            <View style={styles.statsContainer}>
              <Text style={[styles.statsCount, { color: colors.primary }]}>
                {unlockCount.toLocaleString()}
              </Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                {language === 'en' ? 'users' : 'pengguna'}
              </Text>
              {isUnlocked && (
                <View style={styles.unlockedBadge}>
                  <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                </View>
              )}
            </View>
          </View>
        </View>
      );
    };
  }, [userBadges, badgeStats, language, colors]); // Recalculate only when dependencies change

  // OPTIMIZED: Always show UI with skeleton/fallback data, no loading state blocking

  // OPTIMIZED: Memoize expensive badge filtering to prevent recalculation on every render
  const { unlockedBadges, lockedBadges } = useMemo(() => {
    console.log('🏆 Calculating badge categories (memoized):', {
      userBadgesCount: userBadges.length,
      totalBadges: BADGES.length
    });
    
    const unlocked = BADGES.filter(badge => isUserBadgeUnlocked(badge.id));
    const locked = BADGES.filter(badge => !isUserBadgeUnlocked(badge.id));
    
    return { 
      unlockedBadges: unlocked, 
      lockedBadges: locked 
    };
  }, [userBadges]); // Only recalculate when user badges change


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>{t.badges.title}</Text>
        <Text style={styles.headerSubtitle}>
          {t.badges.subtitle}
        </Text>
        <View style={styles.userBadgeCount}>
          <Text style={styles.userBadgeText}>
            {t.badges.youHave} {unlockedBadges.length} {t.badges.of} {BADGES.length} badge
          </Text>
        </View>
      </LinearGradient>

      {/* Floating Tab Navigation - Matching Progress Page */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab, 
            { backgroundColor: activeTab === 'badges' ? colors.primary : 'transparent' }
          ]}
          onPress={() => handleTabSwitch('badges')}
        >
          <MaterialIcons 
            name="emoji-events" 
            size={Math.min(width * 0.045, 18)} 
            color={activeTab === 'badges' ? colors.white : colors.gray} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'badges' ? colors.white : colors.textSecondary }
          ]}>
            {t.badges.myBadges}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'community' ? colors.primary : 'transparent' }
          ]}
          onPress={() => handleTabSwitch('community')}
        >
          <MaterialIcons 
            name="people" 
            size={Math.min(width * 0.045, 18)} 
            color={activeTab === 'community' ? colors.white : colors.gray} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'community' ? colors.white : colors.textSecondary }
          ]}>
            {t.badges.communityStats}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'badges' ? (
        // Badges Tab - Existing Content
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {unlockedBadges.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.badges.badgesOwned}</Text>
              </View>
              <View style={styles.badgeContainer}>
                {unlockedBadges.map((badge, index) => renderBadgeItem(badge, index))}
              </View>
            </>
          )}

          {lockedBadges.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.badges.otherBadges}</Text>
              </View>
              <View style={styles.badgeContainer}>
                {lockedBadges.map((badge, index) => renderBadgeItem(badge, index))}
              </View>
            </>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t.badges.updateInfo}
            </Text>
          </View>
        </ScrollView>
      ) : (
        // Community Tab - Lazy Loaded (OPTIMIZED: Always show skeleton user)
        communityTabLoaded ? (
          <CommunityStatsTab 
            user={user} 
            onUpgradePress={handleNavigateToSubscription}
          />
        ) : (
          // Show placeholder while community tab hasn't been accessed yet
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <MaterialIcons name="people" size={48} color={colors.gray} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Tap to load community stats' : 'Ketuk untuk memuat statistik komunitas'}
            </Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    marginTop: SIZES.md,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: Math.max(45, height * 0.05), // Balanced top padding like dashboard
    paddingBottom: SIZES.xl, // Similar to dashboard but not responsive
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
  },
  userBadgeCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.buttonRadius || 12,
    marginTop: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  userBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs || 4,
    paddingHorizontal: SIZES.screenPadding,
    marginTop: SIZES.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
  },
  badgeContainer: {
    paddingBottom: SIZES.md,
  },
  badgeItem: {
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  lockedBadgeItem: {
    opacity: 0.6,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  lockedBadgeIcon: {},  // Background handled dynamically
  badgeInfo: {
    flex: 1,
    marginRight: SIZES.md,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: 14,
    marginBottom: 6,
  },
  badgeRarity: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  badgeRequirement: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  lockedText: {},  // Color handled dynamically
  statsContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  statsCount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  statsLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  unlockedBadge: {
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.screenPadding,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
  },
  
  // Tab navigation styles - Matching Progress Page
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.screenPadding,
    borderRadius: SIZES.buttonRadius || 12,
    padding: Math.max(width * 0.015, 6),
    marginTop: -SIZES.lg,
    marginBottom: SIZES.xs,
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
  tabText: {
    fontSize: Math.min(width * 0.032, 12),
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.04, 14),
  },
  
  // Placeholder styles
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
  },
  placeholderCard: {
    borderRadius: SIZES.buttonRadius || 16,
    padding: SIZES.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    width: '100%',
    maxWidth: 300,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  placeholderText: {
    marginTop: SIZES.md,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default BadgeStatisticsScreen;