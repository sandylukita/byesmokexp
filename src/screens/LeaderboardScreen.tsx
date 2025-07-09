import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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

import { LeaderboardEntry } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { calculateLevel } from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';

const { width } = Dimensions.get('window');

const LeaderboardScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'allTime'>('weekly');
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndLeaderboardData();
  }, []);

  // Update rank when tab changes or data loads
  useEffect(() => {
    if (currentUserId) {
      const leaders = selectedTab === 'weekly' ? weeklyLeaders : allTimeLeaders;
      if (leaders.length > 0) {
        const currentUser = leaders.find(user => user.id === currentUserId);
        console.log('Setting rank for user:', currentUserId, 'in', selectedTab, 'tab. Found user:', currentUser);
        setCurrentUserRank(currentUser?.rank || null);
      }
    }
  }, [selectedTab, currentUserId, weeklyLeaders, allTimeLeaders]);

  const loadUserAndLeaderboardData = async () => {
    try {
      let userId: string | null = null;
      
      // Try to get demo user first
      const restoredUser = await demoRestoreUser();
      if (restoredUser) {
        console.log('Leaderboard: Found restored user:', restoredUser.id);
        userId = restoredUser.id;
        setCurrentUserId(restoredUser.id);
      } else {
        const demoUser = demoGetCurrentUser();
        if (demoUser) {
          console.log('Leaderboard: Found demo user:', demoUser.id);
          userId = demoUser.id;
          setCurrentUserId(demoUser.id);
        } else {
          // Fallback to Firebase
          const user = auth.currentUser;
          if (user) {
            console.log('Leaderboard: Found Firebase user:', user.uid);
            userId = user.uid;
            setCurrentUserId(user.uid);
          } else {
            console.log('Leaderboard: No user found');
          }
        }
      }
      
      // Pass the userId directly to loadLeaderboardData
      await loadLeaderboardData(userId);
    } catch (error) {
      console.error('Error loading user and leaderboard data:', error);
    }
  };

  const loadLeaderboardData = async (userId?: string) => {
    try {
      // In a real app, you'd have proper queries for weekly and all-time data
      // For now, we'll simulate with sample data and real user data
      await loadSampleData(userId);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async (userId?: string) => {
    const currentUser = userId || currentUserId;
    // Generate sample leaderboard data
    const sampleWeeklyData: LeaderboardEntry[] = [
      {
        id: 'user1',
        displayName: 'Sarah M.',
        totalDays: 45,
        streak: 12,
        xp: 890,
        level: 3,
        rank: 1,
      },
      {
        id: 'user2',
        displayName: 'Ahmad R.',
        totalDays: 38,
        streak: 8,
        xp: 720,
        level: 3,
        rank: 2,
      },
      {
        id: 'user3',
        displayName: 'Maya L.',
        totalDays: 32,
        streak: 15,
        xp: 650,
        level: 2,
        rank: 3,
      },
      {
        id: 'user4',
        displayName: 'Budi S.',
        totalDays: 28,
        streak: 7,
        xp: 580,
        level: 2,
        rank: 4,
      },
      {
        id: 'user5',
        displayName: 'Rina P.',
        totalDays: 25,
        streak: 10,
        xp: 520,
        level: 2,
        rank: 5,
      },
    ];

    const sampleAllTimeData: LeaderboardEntry[] = [
      {
        id: 'user6',
        displayName: 'David K.',
        totalDays: 365,
        streak: 365,
        xp: 4500,
        level: 8,
        rank: 1,
      },
      {
        id: 'user7',
        displayName: 'Linda W.',
        totalDays: 280,
        streak: 45,
        xp: 3200,
        level: 6,
        rank: 2,
      },
      {
        id: 'user8',
        displayName: 'Michael T.',
        totalDays: 195,
        streak: 85,
        xp: 2800,
        level: 5,
        rank: 3,
      },
      {
        id: 'user1',
        displayName: 'Sarah M.',
        totalDays: 145,
        streak: 12,
        xp: 1890,
        level: 4,
        rank: 4,
      },
      {
        id: 'user9',
        displayName: 'Anna B.',
        totalDays: 120,
        streak: 30,
        xp: 1650,
        level: 4,
        rank: 5,
      },
    ];

    // For demo mode, skip Firebase query and use demo user data
    const realUsers: LeaderboardEntry[] = [];
    
    // Add current demo user to leaderboard if available
    const demoUser = demoGetCurrentUser();
    if (demoUser) {
      const levelInfo = calculateLevel(demoUser.xp || 0);
      realUsers.push({
        id: demoUser.id,
        displayName: demoUser.displayName || 'User',
        totalDays: demoUser.totalDays || 0,
        streak: demoUser.streak || 0,
        xp: demoUser.xp || 0,
        level: levelInfo.level,
        rank: 0, // Will be set after sorting
      });
    }

    // If we have a currentUser but no demo user, create a basic entry for them
    if (!demoUser && currentUser) {
      console.log('Creating basic entry for Firebase user:', currentUser);
      realUsers.push({
        id: currentUser,
        displayName: 'You',
        totalDays: 5, // Default values for Firebase users
        streak: 3,
        xp: 50,
        level: 1,
        rank: 0, // Will be set after sorting
      });
    }

    // Only try Firebase if not in demo mode and we want to get other users
    if (!demoUser) {
      try {
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, orderBy('totalDays', 'desc'), limit(20));
        const usersSnapshot = await getDocs(usersQuery);
        
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const levelInfo = calculateLevel(userData.xp || 0);
          realUsers.push({
            id: doc.id,
            displayName: userData.displayName || 'User',
            totalDays: userData.totalDays || 0,
            streak: userData.streak || 0,
            xp: userData.xp || 0,
            level: levelInfo.level,
            rank: 0, // Will be set after sorting
          });
        });
      } catch (firebaseError) {
        console.log('Firebase query failed (expected in demo mode):', firebaseError);
        // Continue without Firebase data
      }
    }

    // Combine real users with sample data for demo purposes
    const combinedWeekly = [...realUsers, ...sampleWeeklyData]
      .sort((a, b) => {
        // Sort by weekly performance (combination of streak and XP)
        const aScore = a.streak * 10 + a.xp;
        const bScore = b.streak * 10 + b.xp;
        return bScore - aScore;
      })
      .map((user, index) => ({ ...user, rank: index + 1 }));

    const combinedAllTime = [...realUsers, ...sampleAllTimeData]
      .sort((a, b) => b.totalDays - a.totalDays)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    setWeeklyLeaders(combinedWeekly.slice(0, 10));
    setAllTimeLeaders(combinedAllTime.slice(0, 10));

    // Find current user rank
    if (currentUser) {
      console.log('Looking for user:', currentUser, 'in leaderboards');
      const currentUserWeekly = combinedWeekly.find(user => user.id === currentUser);
      const currentUserAllTime = combinedAllTime.find(user => user.id === currentUser);
      
      console.log('Weekly user found:', currentUserWeekly);
      console.log('All-time user found:', currentUserAllTime);
      console.log('Current tab:', selectedTab);
      
      // Set rank based on current tab (default to weekly on initial load)
      if (selectedTab === 'weekly') {
        const rank = currentUserWeekly?.rank || null;
        console.log('Setting weekly rank:', rank);
        setCurrentUserRank(rank);
      } else {
        const rank = currentUserAllTime?.rank || null;
        console.log('Setting all-time rank:', rank);
        setCurrentUserRank(rank);
      }
    } else {
      console.log('No currentUser provided to loadSampleData');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData(currentUserId);
    setRefreshing(false);
  };

  const handleTabChange = (tab: 'weekly' | 'allTime') => {
    setSelectedTab(tab);
    // Update current user rank based on selected tab
    if (currentUserId) {
      const leaders = tab === 'weekly' ? weeklyLeaders : allTimeLeaders;
      const currentUser = leaders.find(user => user.id === currentUserId);
      setCurrentUserRank(currentUser?.rank || null);
    }
  };

  const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.id === currentUserId;
    const isTopThree = index < 3;

    const getRankIcon = (rank: number) => {
      switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return null;
      }
    };

    const getRankColor = (rank: number) => {
      switch (rank) {
        case 1: return COLORS.accent;
        case 2: return COLORS.gray;
        case 3: return COLORS.accentLight;
        default: return COLORS.textSecondary;
      }
    };

    const itemContent = (
      <>
        <View style={styles.rankContainer}>
          {getRankIcon(entry.rank) ? (
            <Text style={styles.rankEmoji}>{getRankIcon(entry.rank)}</Text>
          ) : (
            <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
              #{entry.rank}
            </Text>
          )}
        </View>

        <View style={styles.userInfo}>
          <View style={[styles.avatar, isCurrentUser && styles.currentUserAvatar]}>
            <Text style={[styles.avatarText, isCurrentUser && styles.currentUserAvatarText]}>
              {entry.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, isCurrentUser && styles.currentUserText]}>
              {entry.displayName}
              {isCurrentUser && ' (Kamu)'}
            </Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="local-fire-department" size={12} color={COLORS.error} />
                <Text style={styles.statText}>{entry.streak}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="star" size={12} color={COLORS.accent} />
                <Text style={styles.statText}>Lv.{entry.level}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="calendar-today" size={12} color={COLORS.primary} />
                <Text style={styles.statText}>{entry.totalDays}d</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>
            {selectedTab === 'weekly' ? entry.xp : entry.totalDays}
          </Text>
          <Text style={styles.scoreLabel}>
            {selectedTab === 'weekly' ? 'XP' : 'Hari'}
          </Text>
        </View>
      </>
    );

    if (isTopThree && !isCurrentUser) {
      const gradientColors = [
        [COLORS.accent + '20', COLORS.accent + '10'], // Gold
        [COLORS.gray + '20', COLORS.gray + '10'], // Silver  
        [COLORS.accentLight + '20', COLORS.accentLight + '10'], // Bronze
      ];

      return (
        <View key={entry.id} style={[
          styles.leaderboardItem,
          styles.topThreeItem
        ]}>
          <LinearGradient
            colors={gradientColors[entry.rank - 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.leaderboardItemGradient}
          >
            {itemContent}
          </LinearGradient>
        </View>
      );
    }

    return (
      <View key={entry.id} style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem
      ]}>
        {itemContent}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat leaderboard...</Text>
      </View>
    );
  }

  const currentLeaders = selectedTab === 'weekly' ? weeklyLeaders : allTimeLeaders;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>
          Lihat siapa yang paling konsisten
        </Text>
        {currentUserRank && (
          <View style={styles.userRankBadge}>
            <Text style={styles.userRankText}>Peringkat kamu: #{currentUserRank}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
          onPress={() => handleTabChange('weekly')}
        >
          <MaterialIcons 
            name="date-range" 
            size={Math.min(width * 0.045, 18)} 
            color={selectedTab === 'weekly' ? COLORS.white : COLORS.gray} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'weekly' && styles.activeTabText
          ]}>
            Mingguan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'allTime' && styles.activeTab]}
          onPress={() => handleTabChange('allTime')}
        >
          <MaterialIcons 
            name="emoji-events" 
            size={Math.min(width * 0.045, 18)} 
            color={selectedTab === 'allTime' ? COLORS.white : COLORS.gray} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'allTime' && styles.activeTabText
          ]}>
            Sepanjang Waktu
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedTab === 'weekly' ? 'Top Mingguan' : 'Top Sepanjang Waktu'}
          </Text>
        </View>

        <View style={styles.leaderboardContainer}>
          {currentLeaders.map((entry, index) => renderLeaderboardItem(entry, index))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Leaderboard diperbarui setiap hari
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
  userRankBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.buttonRadius || 12,
    marginTop: SIZES.md,
  },
  userRankText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.screenPadding,
    borderRadius: SIZES.buttonRadius || 12,
    padding: Math.max(width * 0.015, 6),
    marginTop: -SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
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
  leaderboardContainer: {
    paddingBottom: SIZES.xl,
  },
  leaderboardItem: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  topThreeItem: {
    overflow: 'hidden',
    padding: 0,
  },
  leaderboardItemGradient: {
    padding: SIZES.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: Math.min(width * 0.06, 24),
  },
  rankText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZES.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  currentUserAvatar: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.gray,
  },
  currentUserAvatarText: {
    color: COLORS.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs || 2,
    lineHeight: Math.min(width * 0.045, 18),
  },
  currentUserText: {
    color: COLORS.primary,
  },
  userStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Math.min(width * 0.02, 8),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Math.min(width * 0.03, 12),
  },
  statText: {
    fontSize: Math.min(width * 0.028, 11),
    color: COLORS.textSecondary,
    marginLeft: 2,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: Math.min(width * 0.15, 60),
  },
  scoreValue: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: Math.min(width * 0.025, 10),
    color: COLORS.textSecondary,
    fontWeight: '500',
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
});

export default LeaderboardScreen;