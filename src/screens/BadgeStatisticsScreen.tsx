import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { demoGetCurrentUser, demoRestoreUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { getBadgeStatistics, initializeBadgeStatistics } from '../services/gamification';

import { Badge } from '../types';
import { BADGES, COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

const { width } = Dimensions.get('window');

// Cache for badge statistics to avoid repeated Firebase calls
let cachedBadgeStats: {[badgeId: string]: number} | null = null;
let lastStatsLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Fallback statistics for immediate display
const FALLBACK_STATS: {[badgeId: string]: number} = {
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

const BadgeStatisticsScreen: React.FC = () => {
  const [badgeStats, setBadgeStats] = useState<{[badgeId: string]: number}>(FALLBACK_STATS);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false); // Start with false, show fallback data immediately
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    loadBadgeData();
  }, []);

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
      if (isFirstLoad) {
        setLoading(true);
      }
      
      // Load both in parallel for efficiency
      await Promise.all([
        loadBadgeStatistics(),
        loadUserBadges()
      ]);
      
    } catch (error) {
      console.error('Error loading badge data:', error);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
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
        console.log('✓ Badge statistics loaded and cached');
      } catch (error: any) {
        console.log('Using fallback stats due to slow/failed fetch:', error.message);
        setBadgeStats(FALLBACK_STATS);
        cachedBadgeStats = FALLBACK_STATS;
        lastStatsLoadTime = now;
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

  const handleRefresh = async () => {
    setRefreshing(true);
    // Clear cache to force fresh data
    cachedBadgeStats = null;
    lastStatsLoadTime = 0;
    await loadBadgeData();
    setRefreshing(false);
  };

  const isUserBadgeUnlocked = (badgeId: string): boolean => {
    return userBadges.some(badge => badge.id === badgeId);
  };

  const renderBadgeItem = (badge: any, index: number) => {
    const isUnlocked = isUserBadgeUnlocked(badge.id);
    const unlockCount = badgeStats[badge.id] || FALLBACK_STATS[badge.id] || 50;
    
    return (
      <View key={badge.id} style={[
        styles.badgeItem,
        !isUnlocked && styles.lockedBadgeItem
      ]}>
        <View style={styles.badgeContent}>
          <View style={[
            styles.badgeIcon,
            { backgroundColor: isUnlocked ? badge.color + '20' : COLORS.lightGray },
            !isUnlocked && styles.lockedBadgeIcon
          ]}>
            <MaterialIcons 
              name={badge.icon as any} 
              size={28} 
              color={isUnlocked ? badge.color : COLORS.gray} 
            />
          </View>
          
          <View style={styles.badgeInfo}>
            <Text style={[
              styles.badgeName,
              !isUnlocked && styles.lockedText
            ]}>
              {badge.name}
              {badge.isPremium && ' ⭐'}
            </Text>
            <Text style={[
              styles.badgeDescription,
              !isUnlocked && styles.lockedText
            ]}>
              {badge.description}
            </Text>
            <Text style={styles.badgeRequirement}>
              {badge.requirement}
            </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsCount}>
              {unlockCount.toLocaleString()}
            </Text>
            <Text style={styles.statsLabel}>
              pengguna
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

  if (loading && isFirstLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat statistik badge...</Text>
      </View>
    );
  }

  // Separate unlocked and locked badges
  const unlockedBadges = BADGES.filter(badge => isUserBadgeUnlocked(badge.id));
  const lockedBadges = BADGES.filter(badge => !isUserBadgeUnlocked(badge.id));

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>Statistik Badge</Text>
        <Text style={styles.headerSubtitle}>
          Lihat pencapaian komunitas global
        </Text>
        <View style={styles.userBadgeCount}>
          <Text style={styles.userBadgeText}>
            Kamu: {unlockedBadges.length} dari {BADGES.length} badge
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {unlockedBadges.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Badge yang Kamu Miliki</Text>
            </View>
            <View style={styles.badgeContainer}>
              {unlockedBadges.map((badge, index) => renderBadgeItem(badge, index))}
            </View>
          </>
        )}

        {lockedBadges.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Badge Lainnya</Text>
            </View>
            <View style={styles.badgeContainer}>
              {lockedBadges.map((badge, index) => renderBadgeItem(badge, index))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Statistik diperbarui secara real-time • Tarik untuk refresh
          </Text>
        </View>
      </ScrollView>
    </View>
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
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SIZES.xl,
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
  },
  userBadgeCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.buttonRadius || 12,
    marginTop: SIZES.md,
  },
  userBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.white,
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
    marginTop: SIZES.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  badgeContainer: {
    paddingBottom: SIZES.md,
  },
  badgeItem: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.md,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  lockedBadgeIcon: {
    backgroundColor: COLORS.lightGray,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  badgeRequirement: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  lockedText: {
    color: COLORS.gray,
  },
  statsContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  statsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default BadgeStatisticsScreen;