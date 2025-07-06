import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../services/firebase';

import { LeaderboardEntry } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { calculateLevel } from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';

const LeaderboardScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'allTime'>('weekly');
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid);
      loadLeaderboardData();
    }
  }, []);

  const loadLeaderboardData = async () => {
    try {
      // In a real app, you'd have proper queries for weekly and all-time data
      // For now, we'll simulate with sample data and real user data
      await loadSampleData();
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async () => {
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

    // Try to get real user data and insert into leaderboard
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('totalDays', 'desc'), limit(20));
      const usersSnapshot = await getDocs(usersQuery);
      
      const realUsers: LeaderboardEntry[] = [];
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
      if (currentUserId) {
        const currentUserWeekly = combinedWeekly.find(user => user.id === currentUserId);
        const currentUserAllTime = combinedAllTime.find(user => user.id === currentUserId);
        
        if (selectedTab === 'weekly' && currentUserWeekly) {
          setCurrentUserRank(currentUserWeekly.rank);
        } else if (selectedTab === 'allTime' && currentUserAllTime) {
          setCurrentUserRank(currentUserAllTime.rank);
        }
      }
    } catch (error) {
      console.error('Error fetching real user data:', error);
      // Fallback to sample data
      setWeeklyLeaders(sampleWeeklyData);
      setAllTimeLeaders(sampleAllTimeData);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
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

    return (
      <View key={entry.id} style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem,
        isTopThree && styles.topThreeItem
      ]}>
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
            <Text style={styles.avatarText}>
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
            size={20} 
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
            size={20} 
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
    marginTop: SIZES.spacingMd,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.screenPadding,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.display,
    color: COLORS.white,
    marginBottom: SIZES.spacingXs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.white,
    opacity: 0.9,
  },
  userRankBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.md,
  },
  userRankText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.screenPadding,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.xs,
    marginTop: -SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    borderRadius: SIZES.borderRadius,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray,
    marginLeft: SIZES.spacingXs,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.screenPadding,
  },
  leaderboardContainer: {
    marginBottom: SIZES.lg,
  },
  leaderboardItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.cardPadding,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  topThreeItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: SIZES.h3,
  },
  rankText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
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
  userDetails: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingXs,
  },
  currentUserText: {
    color: COLORS.primary,
  },
  userStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  statText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scoreLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmallSecondary,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;