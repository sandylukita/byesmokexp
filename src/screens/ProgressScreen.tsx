import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
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
import { User } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import {
    calculateDaysSinceQuit,
    calculateMoneySaved,
    formatCurrency,
    formatNumber,
    getHealthMilestones,
} from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';

const { width } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState<'health' | 'savings' | 'stats'>('health');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('ProgressScreen focused, reloading data...');
      
      // Add a small delay to ensure any pending updates from other screens are completed
      const timeoutId = setTimeout(() => {
        loadUserData();
      }, 100); // 100ms delay
      
      return () => clearTimeout(timeoutId);
    }, [])
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
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = { id: currentUser.uid, ...userDoc.data() } as User;
            console.log('✓ Firebase user data loaded:', {
              email: userData.email,
              completedMissions: userData.completedMissions?.length || 0,
              badges: userData.badges?.length || 0,
              xp: userData.xp,
              totalDays: userData.totalDays
            });
            setUser(userData);
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
          totalDays: demoUser.totalDays
        });
        setUser(demoUser);
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

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const daysSinceQuit = calculateDaysSinceQuit(new Date(user.quitDate));
  const moneySaved = calculateMoneySaved(daysSinceQuit, user.cigarettesPerDay, user.cigarettePrice);
  const healthMilestones = getHealthMilestones(new Date(user.quitDate));
  const cigarettesAvoided = daysSinceQuit * user.cigarettesPerDay;

  const renderHealthMilestones = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Milestone Kesehatan</Text>
      </View>
      
      {healthMilestones.map((milestone, index) => {
        const gradientColors = [
          [COLORS.primary + '20', COLORS.primary + '10'], // Orange gradient
          [COLORS.secondary + '20', COLORS.secondary + '10'], // Green gradient  
          [COLORS.info + '20', COLORS.info + '10'], // Blue gradient
          [COLORS.accent + '20', COLORS.accent + '10'], // Light green gradient
          [COLORS.accentAlt + '20', COLORS.accentAlt + '10'], // Purple gradient
        ];
        const iconColors = [COLORS.primary, COLORS.secondary, COLORS.info, COLORS.accent, COLORS.accentAlt];
        
        return (
          <View key={milestone.id} style={styles.milestoneCardContainer}>
            <LinearGradient
              colors={gradientColors[index % gradientColors.length]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.milestoneCardGradient}
            >
              <View style={styles.milestoneHeader}>
                <View style={[
                  styles.milestoneIcon,
                  { backgroundColor: milestone.isReached ? iconColors[index % iconColors.length] : COLORS.lightGray }
                ]}>
                  <MaterialIcons 
                    name={milestone.icon as any} 
                    size={24} 
                    color={milestone.isReached ? COLORS.white : COLORS.gray} 
                  />
                </View>
            <View style={styles.milestoneInfo}>
              <Text style={[
                styles.milestoneTitle,
                milestone.isReached && styles.milestoneReached
              ]}>
                {milestone.title}
              </Text>
              <Text style={styles.milestoneTime}>{milestone.timeframe}</Text>
            </View>
            {milestone.isReached && (
              <MaterialIcons name="check-circle" size={20} color={COLORS.secondary} />
            )}
          </View>
              <Text style={[
                styles.milestoneDescription,
                milestone.isReached && styles.milestoneDescriptionReached
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
        <Text style={styles.sectionTitle}>Penghematan Uang</Text>
      </View>
      
      <View style={styles.savingsCard}>
        <LinearGradient
          colors={[COLORS.secondary, COLORS.secondaryDark]}
          style={styles.savingsGradient}
        >
          <Text style={styles.savingsAmount}>{formatCurrency(moneySaved)}</Text>
          <Text style={styles.savingsLabel}>Total Penghematan</Text>
        </LinearGradient>
      </View>

      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <MaterialIcons name="today" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.breakdownTextContainer}>
              <Text style={styles.breakdownLabel}>Per Hari</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20))}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: COLORS.accent + '20' }]}>
              <MaterialIcons name="date-range" size={20} color={COLORS.accent} />
            </View>
            <View style={styles.breakdownTextContainer}>
              <Text style={styles.breakdownLabel}>Per Minggu</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20) * 7)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIconContainer, { backgroundColor: COLORS.error + '20' }]}>
              <MaterialIcons name="calendar-month" size={20} color={COLORS.error} />
            </View>
            <View style={styles.breakdownTextContainer}>
              <Text style={styles.breakdownLabel}>Per Bulan</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20) * 30)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.investmentCard}>
        <LinearGradient
          colors={[COLORS.accentAlt + '20', COLORS.accentAlt + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.investmentCardGradient}
        >
          <Text style={styles.investmentTitle}>Apa yang bisa kamu beli?</Text>
          <Text style={styles.investmentSubtitle}>Dengan uang yang kamu hemat</Text>
          
          <View style={styles.investmentGrid}>
            <View style={styles.investmentItemCard}>
              <View style={styles.investmentIconContainer}>
                <Text style={styles.investmentEmoji}>📱</Text>
              </View>
              <Text style={styles.investmentNumber}>
                {Math.floor(moneySaved / 3000000)}
              </Text>
              <Text style={styles.investmentLabel}>Smartphone</Text>
            </View>
            
            <View style={styles.investmentItemCard}>
              <View style={styles.investmentIconContainer}>
                <Text style={styles.investmentEmoji}>🍕</Text>
              </View>
              <Text style={styles.investmentNumber}>
                {Math.floor(moneySaved / 50000)}
              </Text>
              <Text style={styles.investmentLabel}>Pizza Keluarga</Text>
            </View>
            
            <View style={styles.investmentItemCard}>
              <View style={styles.investmentIconContainer}>
                <Text style={styles.investmentEmoji}>⛽</Text>
              </View>
              <Text style={styles.investmentNumber}>
                {Math.floor(moneySaved / 15000)}
              </Text>
              <Text style={styles.investmentLabel}>Liter Bensin</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Statistik Lengkap</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialIcons name="smoke-free" size={32} color={COLORS.primary} />
          <Text style={styles.statValue}>{formatNumber(cigarettesAvoided)}</Text>
          <Text style={styles.statLabel}>Rokok Dihindari</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="schedule" size={32} color={COLORS.secondary} />
          <Text style={styles.statValue}>{formatNumber(cigarettesAvoided * 11)}</Text>
          <Text style={styles.statLabel}>Menit Hidup Bertambah</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="local-fire-department" size={32} color={COLORS.error} />
          <Text style={styles.statValue}>{user.streak}</Text>
          <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">Streak Terpanjang</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="star" size={32} color={COLORS.accent} />
          <Text style={styles.statValue}>{user.xp}</Text>
          <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">Total XP</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="emoji-events" size={32} color={COLORS.accentAlt} />
          <Text style={styles.statValue}>{user.badges?.length || 0}</Text>
          <Text style={styles.statLabel}>Badge Diperoleh</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="assignment-turned-in" size={32} color={COLORS.info} />
          <Text style={styles.statValue}>{user.completedMissions?.length || 0}</Text>
          <Text style={styles.statLabel}>Misi Selesai</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <LinearGradient
          colors={[COLORS.info + '20', COLORS.info + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressSectionGradient}
        >
          <Text style={styles.progressTitle}>Progress Harian</Text>
          <Text style={styles.progressSubtitle}>7 hari terakhir check-in kamu</Text>
          
          <View style={styles.progressWeek}>
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const isToday = i === 6;
              
              // Better logic: random but realistic check-in pattern
              const daysSinceQuit = calculateDaysSinceQuit(new Date(user.quitDate));
              const hasCheckedIn = daysSinceQuit > (6 - i) && (i < 6 || user.streak > 0);
              
              return (
                <View key={i} style={styles.progressDay}>
                  <Text style={styles.progressDayLabel}>
                    {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                  </Text>
                  <Text style={styles.progressDayDate}>
                    {date.getDate()}
                  </Text>
                  <View style={[
                    styles.progressDayCircle,
                    hasCheckedIn && styles.progressDayComplete,
                    isToday && styles.progressDayToday
                  ]}>
                    {hasCheckedIn ? (
                      <MaterialIcons name="check" size={16} color={COLORS.white} />
                    ) : isToday ? (
                      <MaterialIcons name="today" size={16} color={COLORS.primary} />
                    ) : (
                      <View style={styles.progressDayEmpty} />
                    )}
                  </View>
                  {isToday && (
                    <Text style={styles.progressTodayLabel}>Hari ini</Text>
                  )}
                </View>
              );
            })}
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.monthlySection}>
        <LinearGradient
          colors={[COLORS.accent + '20', COLORS.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.monthlySectionGradient}
        >
          <Text style={styles.progressTitle}>Progress Bulanan</Text>
          <Text style={styles.progressSubtitle}>
            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </Text>
          
          <View style={styles.monthlyHeatmap}>
            
            {/* Day labels */}
            <View style={styles.heatmapDayLabels}>
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <Text key={day} style={styles.heatmapDayLabel}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.heatmapGrid}>
              {(() => {
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                const firstDay = new Date(currentYear, currentMonth, 1);
                const lastDay = new Date(currentYear, currentMonth + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
                const quitDate = new Date(user.quitDate);
                
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
                  const isToday = day === today.getDate();
                  const isFuture = date > today;
                  
                  // Calculate activity for this day
                  let intensity = 0;
                  
                  if (!isFuture && date >= quitDate) {
                    const daysSinceQuit = calculateDaysSinceQuit(quitDate);
                    const daysFromQuitToThisDate = Math.floor((date.getTime() - quitDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // Calculate realistic engagement score
                    let activityScore = 0;
                    
                    // Check-in activity (40% of score)
                    const hasCheckedIn = daysFromQuitToThisDate <= user.streak && daysFromQuitToThisDate >= 0;
                    if (hasCheckedIn) activityScore += 0.4;
                    
                    // Mission completion simulation (30% of score)
                    if (hasCheckedIn && daysFromQuitToThisDate > 0) {
                      const missionsCompleted = Math.min(Math.floor(Math.random() * 3), 2);
                      activityScore += (missionsCompleted / 2) * 0.3;
                    }
                    
                    // Consistency bonus (30% of score)
                    if (daysFromQuitToThisDate <= user.streak) {
                      activityScore += 0.3;
                    }
                    
                    // Convert to intensity levels
                    if (activityScore > 0.7) intensity = 3;
                    else if (activityScore > 0.5) intensity = 2;
                    else if (activityScore > 0.2) intensity = 1;
                  }
                  
                  calendarDays.push(
                    <View key={`day-${day}`} style={styles.heatmapDay}>
                      <View style={[
                        styles.heatmapDayCircle,
                        isFuture && styles.heatmapFuture,
                        !isFuture && intensity === 0 && styles.heatmapEmpty,
                        !isFuture && intensity === 1 && styles.heatmapLow,
                        !isFuture && intensity === 2 && styles.heatmapMedium,
                        !isFuture && intensity === 3 && styles.heatmapHigh,
                        isToday && styles.heatmapToday
                      ]}>
                        <Text style={[
                          styles.heatmapDayNumber,
                          (intensity > 1 || isToday) && styles.heatmapDayNumberDark
                        ]}>
                          {day}
                        </Text>
                      </View>
                    </View>
                  );
                }
                
                return calendarDays;
              })()}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={styles.heatmapLegendText}>Kurang</Text>
              <View style={styles.heatmapLegendDots}>
                <View style={[styles.heatmapLegendDot, styles.heatmapEmpty]} />
                <View style={[styles.heatmapLegendDot, styles.heatmapLow]} />
                <View style={[styles.heatmapLegendDot, styles.heatmapMedium]} />
                <View style={[styles.heatmapLegendDot, styles.heatmapHigh]} />
              </View>
              <Text style={styles.heatmapLegendText}>Aktif</Text>
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
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>Progress Kamu</Text>
        <Text style={styles.headerSubtitle}>
          "{daysSinceQuit} hari bebas rokok"
        </Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'health' && styles.activeTab]}
          onPress={() => setSelectedTab('health')}
        >
          <MaterialIcons 
            name="favorite" 
            size={Math.min(width * 0.045, 18)} 
            color={selectedTab === 'health' ? COLORS.white : COLORS.gray} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'health' && styles.activeTabText
          ]}>
            Kesehatan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'savings' && styles.activeTab]}
          onPress={() => setSelectedTab('savings')}
        >
          <MaterialIcons 
            name="savings" 
            size={Math.min(width * 0.045, 18)} 
            color={selectedTab === 'savings' ? COLORS.white : COLORS.gray} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'savings' && styles.activeTabText
          ]}>
            Uang
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'stats' && styles.activeTab]}
          onPress={() => setSelectedTab('stats')}
        >
          <MaterialIcons 
            name="bar-chart" 
            size={Math.min(width * 0.045, 18)} 
            color={selectedTab === 'stats' ? COLORS.white : COLORS.gray} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'stats' && styles.activeTabText
          ]}>
            Statistik
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  tabContent: {
    paddingBottom: SIZES.xl,
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
    shadowColor: COLORS.shadow,
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
    shadowColor: COLORS.shadow,
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
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
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
    marginBottom: SIZES.md,
    gap: SIZES.xs || 4,
  },
  breakdownItem: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
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
    color: COLORS.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  breakdownLabel: {
    fontSize: Math.min(width * 0.032, 12),
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  investmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
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
    marginBottom: SIZES.md,
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
    marginBottom: SIZES.md,
    gap: SIZES.xs || 4,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
    alignItems: 'center',
    width: (width - SIZES.screenPadding * 2 - SIZES.xs) / 2,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
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
  progressSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  progressSectionGradient: {
    padding: SIZES.sm,
  },
  progressTitle: {
    ...TYPOGRAPHY.h5,
    marginBottom: SIZES.xs || 4,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  progressSubtitle: {
    fontSize: Math.min(width * 0.03, 12),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  progressWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  progressDay: {
    alignItems: 'center',
    flex: 1,
  },
  progressDayLabel: {
    fontSize: Math.min(width * 0.025, 10),
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  progressDayDate: {
    fontSize: Math.min(width * 0.03, 12),
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs || 4,
    fontWeight: '600',
  },
  progressDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressDayComplete: {
    backgroundColor: COLORS.secondary,
  },
  progressDayToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  progressDayEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
  },
  progressTodayLabel: {
    fontSize: Math.min(width * 0.022, 9),
    color: COLORS.primary,
    fontWeight: '600',
  },
  monthlySection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  monthlySectionGradient: {
    padding: SIZES.sm,
  },
  monthlyHeatmap: {
    backgroundColor: COLORS.white + '80',
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.lightGray,
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
    backgroundColor: COLORS.lightGray,
  },
  heatmapFuture: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
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
    borderColor: COLORS.primary,
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
});

export default ProgressScreen;