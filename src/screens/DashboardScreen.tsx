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
import { demoGetCurrentUser, demoRestoreUser, demoUpdateUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';

import { BentoCard, BentoGrid } from '../components/BentoGrid';
import { Mission, User } from '../types';
import { COLORS, SIZES, STATIC_MISSIONS } from '../utils/constants';
import { completeMission, checkAndAwardBadges } from '../services/gamification';
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
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
    
    // Timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  // Auto-sync totalDays for existing users if outdated
  useEffect(() => {
    if (user) {
      const calculatedDays = calculateDaysSinceQuit(new Date(user.quitDate));
      if (calculatedDays > user.totalDays + 1) {
        const demoUser = demoGetCurrentUser();
        if (demoUser && demoUser.id === user.id) {
          demoUpdateUser(user.id, { totalDays: calculatedDays });
        } else {
          // For Firebase users, update on next check-in
          console.log('totalDays will be synced on next check-in');
        }
        setUser({ ...user, totalDays: calculatedDays });
      }
    }
  }, [user?.quitDate, user?.totalDays]);

  // Reset mission completion state daily
  useEffect(() => {
    if (user) {
      const checkMissionReset = async () => {
        const today = new Date().toDateString();
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const lastResetDate = await AsyncStorage.getItem('lastMissionReset');
          
          if (lastResetDate !== today) {
            setCompletedMissions([]);
            await AsyncStorage.setItem('lastMissionReset', today);
          }
        } catch (error) {
          console.error('Error checking mission reset:', error);
        }
      };
      
      checkMissionReset();
    }
  }, [user]);

  const loadUserData = async () => {
    console.log('Starting loadUserData...');
    try {
      // Check current demo user in memory first (most recent data)
      console.log('Checking for demo user in memory...');
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        console.log('Demo user found in memory:', demoUser.email);
        setUser(demoUser);
        setLoading(false);
        return;
      }
      
      // Try to restore demo user from storage as backup
      console.log('Attempting to restore demo user from storage...');
      const restoredUser = await demoRestoreUser();
      if (restoredUser) {
        console.log('Demo user restored from storage:', restoredUser.email);
        setUser(restoredUser);
        setLoading(false);
        return;
      }

      // Fallback to Firebase
      console.log('No demo user, checking Firebase auth...');
      try {
        const currentUser = auth.currentUser;
        console.log('Firebase currentUser:', currentUser?.email);
        
        if (currentUser) {
          console.log('Getting user doc from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = { id: currentUser.uid, ...userDoc.data() } as User;
            console.log('User data loaded:', userData.email);
            setUser(userData);
          } else {
            console.log('User doc does not exist');
          }
        } else {
          console.log('No current user in Firebase auth');
        }
      } catch (firebaseError) {
        console.error('Firebase error (non-fatal):', firebaseError);
        // Don't throw, just continue without Firebase user
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try logging in again.');
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

      const updatedUser = {
        ...user,
        ...updates,
      };
      
      // Check for new badges after check-in
      try {
        const newBadges = await checkAndAwardBadges(user.id, updatedUser);
        if (newBadges.length > 0) {
          updatedUser.badges = [...user.badges, ...newBadges];
          
          // Update demo user in-memory data with new badges
          const demoUser = demoGetCurrentUser();
          if (demoUser && demoUser.id === user.id) {
            await demoUpdateUser(user.id, {
              badges: updatedUser.badges,
            });
          }
        }
      } catch (error) {
        console.error('Error checking badges:', error);
      }

      setUser(updatedUser);

      // Mark check-in mission as completed and record it permanently
      if (!completedMissions.includes('daily-checkin')) {
        setCompletedMissions(prev => [...prev, 'daily-checkin']);
        
        // Find the daily check-in mission and complete it
        const checkInMission = generateDailyMissions().find(m => m.id === 'daily-checkin');
        if (checkInMission) {
          try {
            const demoUser = demoGetCurrentUser();
            
            if (demoUser && demoUser.id === user.id) {
              // Handle demo user check-in mission
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
            } else {
              // Handle Firebase user
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
            }
          } catch (error) {
            console.error('Error recording check-in mission:', error);
          }
        }
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Show success message with badge notification if any
      let message = `Check-in berhasil! +10 XP\nStreak: ${newStreak} hari`;
      if (updatedUser.badges.length > user.badges.length) {
        const newBadgesCount = updatedUser.badges.length - user.badges.length;
        message += `\n🏆 Badge baru: ${newBadgesCount}`;
      }
      
      Alert.alert('Selamat!', message, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', 'Gagal melakukan check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  const generateDailyMissions = (): Mission[] => {
    const missions = STATIC_MISSIONS.slice(0, user?.isPremium ? 4 : 1);
    const hasCheckedInToday = !canCheckInToday(user?.lastCheckIn);
    
    return missions.map(mission => ({
      ...mission,
      id: mission.id, // Keep original ID for tracking
      isCompleted: mission.id === 'daily-checkin' ? hasCheckedInToday : completedMissions.includes(mission.id),
      completedAt: mission.id === 'daily-checkin' && hasCheckedInToday ? new Date() : 
                   completedMissions.includes(mission.id) ? new Date() : null,
      isAIGenerated: false,
    }));
  };

  const handleMissionToggle = async (mission: Mission) => {
    if (mission.id === 'daily-checkin') {
      // If it's the daily check-in mission, trigger the check-in process
      await handleCheckIn();
    } else {
      // For other missions, toggle completion status
      if (mission.isCompleted) {
        setCompletedMissions(prev => prev.filter(id => id !== mission.id));
      } else {
        setCompletedMissions(prev => [...prev, mission.id]);
        
        // Actually complete the mission
        try {
          // Check if demo user
          const demoUser = demoGetCurrentUser();
          
          if (demoUser && demoUser.id === user.id) {
            // Handle demo user mission completion
            const completedMission = {
              ...mission,
              isCompleted: true,
              completedAt: new Date(),
            };
            
            const newXP = user.xp + mission.xpReward;
            const updatedCompletedMissions = [...(user.completedMissions || []), completedMission];
            
            // Check for new badges
            const updatedUser = {
              ...user,
              xp: newXP,
              completedMissions: updatedCompletedMissions,
            };
            
            const newBadges = await checkAndAwardBadges(user.id, updatedUser);
            
            // Update demo user with new data
            await demoUpdateUser(user.id, {
              xp: newXP,
              completedMissions: updatedCompletedMissions,
              badges: [...user.badges, ...newBadges],
            });
            console.log('Demo user updated after mission completion:', {
              xp: newXP,
              missionsCount: updatedCompletedMissions.length,
              badgesCount: [...user.badges, ...newBadges].length
            });
            
            // Update local state
            setUser({
              ...updatedUser,
              badges: [...user.badges, ...newBadges],
            });
            console.log('Local state updated after mission completion');
            
            if (mission.xpReward > 0) {
              Alert.alert('Misi Selesai!', `Kamu mendapat ${mission.xpReward} XP!`);
            }
            
            if (newBadges.length > 0) {
              Alert.alert('Badge Baru!', `Kamu mendapat ${newBadges.length} badge baru!`);
            }
          } else {
            // Handle Firebase user
            const result = await completeMission(user.id, mission, user);
            if (result.success) {
              // Update user data to reflect XP and badge changes
              const updatedUser = {
                ...user,
                xp: user.xp + result.xpAwarded,
                completedMissions: [...(user.completedMissions || []), {
                  ...mission,
                  isCompleted: true,
                  completedAt: new Date(),
                }],
                badges: [...user.badges, ...result.newBadges],
              };
              setUser(updatedUser);
              
              // Show success message if XP was awarded
              if (result.xpAwarded > 0) {
                Alert.alert('Misi Selesai!', `Kamu mendapat ${result.xpAwarded} XP!`);
              }
              
              // Show badge notification if new badges were earned
              if (result.newBadges.length > 0) {
                Alert.alert('Badge Baru!', `Kamu mendapat ${result.newBadges.length} badge baru!`);
              }
            }
          }
        } catch (error) {
          console.error('Error completing mission:', error);
          Alert.alert('Error', 'Gagal menyelesaikan misi');
        }
      }
    }
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
  // For existing users, sync totalDays with calculated value if they differ significantly
  const calculatedDays = calculateDaysSinceQuit(new Date(user.quitDate));
  const daysSinceQuit = Math.max(user.totalDays, calculatedDays); // Use the higher value
  
  
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{getGreeting(user.displayName)}</Text>
            <Text style={styles.headerSubtext}>{levelInfo.nextLevelXP - user.xp} XP to next level</Text>
            <Text style={styles.headerMotivation}>Keep going, champion! 🚀</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <MaterialIcons name="logout" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Level Card - Final structure with next level */}
      <View style={styles.levelCardFinal}>
        {/* Top row */}
        <View style={styles.levelTopRow}>
          <MaterialIcons name="emoji-events" size={24} color={COLORS.accent} style={styles.levelIcon} />
          <Text style={styles.levelBadgeText} numberOfLines={1} ellipsizeMode="tail">{levelInfo.title}</Text>
          <Text style={styles.levelXPTextLarge}>{user.xp} XP</Text>
        </View>
        {/* Middle: Progress bar and level names */}
        <View style={styles.levelProgressRow}>
          <View style={styles.levelProgressBar}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.levelProgressFill, { width: `${Math.round(levelInfo.progress * 100)}%` }]}
            />
          </View>
          <View style={styles.levelProgressLabelsRow}>
            <Text style={styles.levelProgressLabelLeft}>{`Level ${levelInfo.level}`}</Text>
            <Text style={styles.levelProgressLabelRight}>{`Level ${levelInfo.level + 1}`}</Text>
          </View>
        </View>
        
        {/* Check-in Button - Now part of level card */}
        <TouchableOpacity
          style={[styles.levelCheckInButton, !canCheckIn && styles.checkInButtonDisabled]}
          onPress={handleCheckIn}
          disabled={!canCheckIn || checkingIn}
        >
          <LinearGradient
            colors={canCheckIn ? [COLORS.secondary, COLORS.secondaryDark] : [COLORS.gray, COLORS.darkGray]}
            style={styles.levelCheckInGradient}
          >
            {checkingIn ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color={COLORS.white} />
                <Text style={styles.levelCheckInText}>
                  {canCheckIn ? 'Check-in Harian' : 'Sudah Check-in'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Statistics Row - Two cards side by side */}
      <View style={styles.statsRowContainer}>
        {/* Streak and Total Days Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(231, 76, 60, 0.15)' }]}>
              <MaterialIcons name="local-fire-department" size={20} color={COLORS.error} />
            </View>
            <Text style={styles.statValue}>{formatNumber(user.streak)}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(249, 149, 70, 0.15)' }]}>
              <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{formatNumber(daysSinceQuit)}</Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">Hari</Text>
          </View>
        </View>

        {/* Money Saved Card */}
        <View style={[styles.statsCard, styles.statsCardLast]}>
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(39, 174, 96, 0.15)' }]}>
              <MaterialIcons name="savings" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(moneySaved)}</Text>
            <Text style={styles.statLabel}>Uang Hemat</Text>
          </View>
        </View>
      </View>

      {/* Section Title */}
      <View style={[styles.sectionHeader, { marginTop: SIZES.md }]}>
        <Text style={styles.sectionTitle}>Misi-mu Hari Ini</Text>
      </View>

      {/* Daily Missions Card */}
      <View style={styles.missionCardContainer}>
        <LinearGradient
          colors={[COLORS.accent + '20', COLORS.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.missionCardGradient}
        >
        {dailyMissions.map((mission) => (
          <TouchableOpacity 
            key={mission.id} 
            style={styles.missionItem}
            onPress={() => handleMissionToggle(mission)}
            disabled={mission.id === 'daily-checkin' && mission.isCompleted}
          >
            <View style={styles.missionCheckbox}>
              <MaterialIcons 
                name={mission.isCompleted ? "check-circle" : "radio-button-unchecked"} 
                size={24} 
                color={mission.isCompleted ? COLORS.secondary : COLORS.gray} 
              />
            </View>
            <View style={styles.missionInfo}>
              <Text style={[styles.missionTitle, mission.isCompleted && styles.missionTitleCompleted]}>
                {mission.title}
              </Text>
              <Text style={[styles.missionDescription, mission.isCompleted && styles.missionDescriptionCompleted]}>
                {mission.description}
              </Text>
            </View>
            <View style={styles.missionReward}>
              <Text style={[styles.missionXP, mission.isCompleted && styles.missionXPCompleted]}>
                +{mission.xpReward} XP
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {!user.isPremium && (
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradePromptText}>Buka lebih banyak misi dan raih XP berlimpah! Upgrade sekarang untuk mempercepat perjalanan sehatmu.</Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade Premium</Text>
            </TouchableOpacity>
          </View>
        )}
        </LinearGradient>
      </View>

      {/* Motivation Section Title */}
      <View style={[styles.sectionHeader, { marginTop: SIZES.md }]}>
        <Text style={styles.sectionTitle}>Personal Motivator</Text>
      </View>

      {/* Personal Motivator Card */}
      <View style={styles.motivationCardContainer}>
        <LinearGradient
          colors={[COLORS.accentAlt + '20', COLORS.accentAlt + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.motivationCardGradient}
        >
        {user.isPremium ? (
          <Text style={styles.motivationText}>{getRandomMotivation()}</Text>
        ) : (
          <View style={styles.lockedContent}>
            <MaterialIcons name="psychology" size={32} color={COLORS.accent} />
            <Text style={styles.lockedText}>Dapatkan motivasi personal yang disesuaikan dengan perjalanan unikmu</Text>
            <Text style={styles.lockedSubtext}>AI akan menganalisis progresmu dan memberikan dukungan yang tepat di saat yang tepat</Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Aktifkan Personal Motivator</Text>
            </TouchableOpacity>
          </View>
        )}
        </LinearGradient>
      </View>
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
    borderRadius: SIZES.buttonRadius || 16,
  },
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SIZES.xs || 4,
    paddingHorizontal: SIZES.screenPadding,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    ...TYPOGRAPHY.h1White,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: SIZES.xs || 4,
  },
  headerSubtext: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.xs || 2,
  },
  headerMotivation: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    opacity: 0.8,
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
    borderRadius: SIZES.buttonRadius || 12,
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
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    marginLeft: SIZES.sm,
    fontWeight: '600',
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
    borderRadius: SIZES.buttonRadius || 12,
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
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
    marginTop: SIZES.spacingXs,
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
    color: COLORS.textPrimary,
    fontStyle: 'italic',
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

  // Level Card - Final structure with next level
  levelCardFinal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs || 4,
    padding: SIZES.sm,
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
    marginTop: SIZES.xs || 4,
    marginBottom: SIZES.xs || 4,
  },
  statsCard: {
    width: '49%',
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    paddingVertical: SIZES.sm,
    paddingHorizontal: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  missionCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 0,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
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
    marginTop: 0,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
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
  motivationCardGradient: {
    padding: SIZES.sm,
    minHeight: 'auto',
    flex: 1,
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
});

export default DashboardScreen;