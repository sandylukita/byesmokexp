import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { demoGetCurrentUser, demoUpdateUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';

import { BentoCard, BentoGrid } from '../components/BentoGrid';
import { Mission, User } from '../types';
import { COLORS, SIZES, STATIC_MISSIONS } from '../utils/constants';
import {
    calculateDaysSinceQuit,
    calculateLevel,
    calculateMoneySaved,
    calculateStreak,
    canCheckInToday,
    formatCurrency,
    formatNumber,
    generateMissionId,
    getGreeting,
    getRandomMotivation,
} from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';

interface DashboardScreenProps {
  onLogout: () => void;
}


const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Try demo user first
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        setUser(demoUser);
        setLoading(false);
        return;
      }

      // Fallback to Firebase
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = { id: currentUser.uid, ...userDoc.data() } as User;
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    if (!user || !canCheckInToday(user.lastCheckIn)) {
      Alert.alert('Info', 'Kamu sudah check-in hari ini!');
      return;
    }

    setCheckingIn(true);
    try {
      const streakInfo = calculateStreak(user.lastCheckIn);
      const newStreak = streakInfo.streakReset ? 1 : user.streak + 1;
      const newTotalDays = calculateDaysSinceQuit(new Date(user.quitDate));
      const newXP = user.xp + 10; // Base XP for check-in
      
      const updates = {
        lastCheckIn: new Date(),
        streak: newStreak,
        totalDays: newTotalDays,
        xp: newXP,
      };

      // Try demo update first
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        await demoUpdateUser(user.id, updates);
      } else {
        // Fallback to Firebase
        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, {
          lastCheckIn: new Date().toISOString(),
          streak: newStreak,
          totalDays: newTotalDays,
          xp: newXP,
        });
      }

      setUser({
        ...user,
        ...updates,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        'Selamat!', 
        `Check-in berhasil! +10 XP\nStreak: ${newStreak} hari`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal melakukan check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  const generateDailyMissions = (): Mission[] => {
    const missions = STATIC_MISSIONS.slice(0, user?.isPremium ? 3 : 1);
    return missions.map(mission => ({
      ...mission,
      id: generateMissionId(),
      isCompleted: false,
      completedAt: null,
      isAIGenerated: false,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Gagal memuat data pengguna</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const levelInfo = calculateLevel(user.xp);
  const daysSinceQuit = calculateDaysSinceQuit(new Date(user.quitDate));
  const moneySaved = calculateMoneySaved(daysSinceQuit, user.cigarettesPerDay, user.cigarettePrice);
  const canCheckIn = canCheckInToday(user.lastCheckIn);
  const dailyMissions = generateDailyMissions();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting(user.displayName)}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <MaterialIcons name="logout" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Level Card - Final structure with next level */}
      <View style={styles.levelCardFinal}>
        {/* Top row */}
        <View style={styles.levelTopRow}>
          <View style={styles.levelTopLeftGroup}>
            <MaterialIcons name="emoji-events" size={28} color={COLORS.accent} style={styles.levelIcon} />
            <Text style={styles.levelBadgeText}>{levelInfo.title}</Text>
          </View>
          <Text style={styles.levelXP}>{user.xp} XP</Text>
        </View>
        {/* Middle: Progress bar and level names */}
        <View style={styles.levelProgressRow}>
          <View style={styles.levelProgressBar}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.levelProgressFill, { width: `${levelInfo.progress * 100}%` }]}
            />
          </View>
          <View style={styles.levelProgressLabelsRow}>
            <Text style={styles.levelProgressLabelLeft}>{levelInfo.title}</Text>
            <Text style={styles.levelProgressLabelRight}>{`Level ${levelInfo.level + 1}`}</Text>
          </View>
        </View>
        {/* Bottom: Motivation and XP to next badge */}
        <View style={styles.levelBottomRow}>
          <Text style={styles.levelSubtitleFinal}>Keep going, champion! 🚀</Text>
          <Text style={styles.levelToNextBadge}>{levelInfo.nextLevelXP - user.xp} XP to next badge</Text>
        </View>
      </View>

      {/* Statistics Row - Circles in one line */}
      <View style={styles.statsRow}>
        <View style={styles.statCircle}>
          <View style={[styles.statCircleIcon, { backgroundColor: `${COLORS.error}15` }]}>
            <MaterialIcons name="local-fire-department" size={24} color={COLORS.error} />
          </View>
          <Text style={styles.statCircleValue}>{formatNumber(user.streak)}</Text>
          <Text style={styles.statCircleLabel}>Streak</Text>
        </View>

        <View style={styles.statCircle}>
          <View style={[styles.statCircleIcon, { backgroundColor: `${COLORS.primary}15` }]}>
            <MaterialIcons name="calendar-today" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statCircleValue}>{formatNumber(daysSinceQuit)}</Text>
          <Text style={styles.statCircleLabel}>Total Hari</Text>
        </View>

        <View style={styles.statCircle}>
          <View style={[styles.statCircleIcon, { backgroundColor: `${COLORS.secondary}15` }]}>
            <MaterialIcons name="savings" size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.statCircleValue}>{formatCurrency(moneySaved)}</Text>
          <Text style={styles.statCircleLabel}>Uang Hemat</Text>
        </View>
      </View>

      <BentoGrid columns={2}>

        {/* Check-in Button - Large bento card */}
        <BentoCard span={2} height="large" backgroundColor="transparent" style={styles.bentoCheckInCard}>
          <TouchableOpacity
            style={[styles.bentoCheckInButton, !canCheckIn && styles.checkInButtonDisabled]}
            onPress={handleCheckIn}
            disabled={!canCheckIn || checkingIn}
          >
            <LinearGradient
              colors={canCheckIn ? [COLORS.secondary, COLORS.secondaryDark] : [COLORS.gray, COLORS.darkGray]}
              style={styles.bentoCheckInGradient}
            >
              {checkingIn ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={32} color={COLORS.white} />
                  <Text style={styles.checkInText}>
                    {canCheckIn ? 'Check-in Harian' : 'Sudah Check-in'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BentoCard>





        {/* Daily Missions Card */}
        <BentoCard span={2} height="auto" backgroundColor={COLORS.surface} style={styles.bentoMissionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Misi Harian</Text>
            {!user.isPremium && (
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
          {dailyMissions.map((mission) => (
            <View key={mission.id} style={styles.missionItem}>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDescription}>{mission.description}</Text>
              </View>
              <View style={styles.missionReward}>
                <Text style={styles.missionXP}>+{mission.xpReward} XP</Text>
              </View>
            </View>
          ))}
        </BentoCard>

        {/* Motivation Card */}
        <BentoCard span={2} height="auto" backgroundColor={COLORS.surface} style={styles.bentoMotivationCard}>
          <Text style={styles.cardTitle}>Motivasi Harian</Text>
          {user.isPremium ? (
            <Text style={styles.motivationText}>{getRandomMotivation()}</Text>
          ) : (
            <View style={styles.lockedContent}>
              <MaterialIcons name="lock" size={24} color={COLORS.gray} />
              <Text style={styles.lockedText}>Konten motivasi AI tersedia untuk Premium</Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          )}
        </BentoCard>
      </BentoGrid>
    </ScrollView>
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
    marginBottom: SIZES.spacingLg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.borderRadius,
  },
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.screenPadding,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...TYPOGRAPHY.h1White,
    fontSize: 20,
    lineHeight: 26,
  },
  logoutButton: {
    padding: SIZES.sm,
  },
  content: {
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: SIZES.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.cardPadding,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelContainer: {
    marginBottom: SIZES.md,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TYPOGRAPHY.bodyLargePrimary,
    fontWeight: '600',
    marginVertical: SIZES.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmallSecondary,
  },
  checkInButton: {
    marginBottom: SIZES.md,
    borderRadius: SIZES.borderRadiusLg,
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
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    marginLeft: SIZES.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  upgradeButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadius,
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
  },
  missionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  missionDescription: {
    ...TYPOGRAPHY.bodySmallSecondary,
    marginTop: SIZES.spacingXs,
  },
  missionReward: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadius,
  },
  missionXP: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
  },
  motivationText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  lockedText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: SIZES.spacingMd,
  },

  // Level Card - Final structure with next level
  levelCardFinal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusLg,
    marginHorizontal: SIZES.screenPadding,
    marginVertical: SIZES.md,
    padding: SIZES.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  levelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
    gap: 12,
  },
  levelIcon: {
    marginRight: 8,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  levelXP: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.primary,
    fontWeight: '700',
    minWidth: 90,
    textAlign: 'right',
  },
  levelProgressRow: {
    marginBottom: SIZES.md,
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
    gap: 12,
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

  // Statistics Row - Circles in one line
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.screenPadding,
    marginVertical: SIZES.md,
    borderRadius: SIZES.borderRadiusLg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCircle: {
    alignItems: 'center',
    flex: 1,
  },
  statCircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacingSm,
  },
  statCircleValue: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SIZES.spacingXs,
    textAlign: 'center',
  },
  statCircleLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    marginBottom: SIZES.spacingSm,
  },
  bentoStatsValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SIZES.spacingXs,
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
    flex: 1,
    borderRadius: SIZES.borderRadiusLg,
    overflow: 'hidden',
  },
  bentoCheckInGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingLg,
    paddingHorizontal: SIZES.spacingXl,
  },
  
  bentoLevelContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bentoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.spacingSm,
    paddingVertical: SIZES.spacingXs,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.spacingSm,
  },
  bentoBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginLeft: SIZES.spacingXs,
    fontWeight: '500',
    flex: 1,
  },
  
  bentoMissionsCard: {
    minHeight: 160,
  },
  bentoMotivationCard: {
    minHeight: 120,
  },
  levelTopLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default DashboardScreen;