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

const { width, height } = Dimensions.get('window');
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
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { TYPOGRAPHY } from '../utils/typography';

const ProgressScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState<'health' | 'savings' | 'stats'>('stats');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // For month navigation
  const { colors, updateUser, language } = useTheme();
  const { t } = useTranslation();

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
      }, 100); // Small delay to allow Firebase sync
      
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
            updateUser(userData);
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
        updateUser(demoUser);
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
        updateUser(restoredUser);
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
            {milestone.isReached && (
              <MaterialIcons name="check-circle" size={20} color={colors.secondary} />
            )}
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
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.progress.statistics}</Text>
      </View>
      
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
          
          <View style={styles.monthlyHeatmap}>
            
            {/* Day labels */}
            <View style={styles.heatmapDayLabels}>
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <Text key={day} style={[styles.heatmapDayLabel, { color: colors.textPrimary }]}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.heatmapGrid}>
              {(() => {
                const today = new Date();
                const currentMonth = selectedDate.getMonth();
                const currentYear = selectedDate.getFullYear();
                const firstDay = new Date(currentYear, currentMonth, 1);
                const lastDay = new Date(currentYear, currentMonth + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
                const quitDate = new Date(user.quitDate);
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
                  
                  if (!isFuture && date >= quitDate) {
                    // Check if user did check-in on this specific date
                    const hasCheckedInOnDate = user.lastCheckIn && 
                      new Date(user.lastCheckIn).toDateString() === date.toDateString();
                    
                    // For today, use check-in status and XP combined
                    if (isToday) {
                      // Check actual XP earned today to determine intensity
                      const dateKey = date.getFullYear() + '-' + 
                                    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                                    String(date.getDate()).padStart(2, '0');
                      
                      let todayXP = user.dailyXP?.[dateKey] || 0;
                      if (todayXP === 0) {
                        // Fallback: try UTC format
                        const utcDateKey = date.toISOString().split('T')[0];
                        todayXP = user.dailyXP?.[utcDateKey] || 0;
                      }
                      
                      if (hasCheckedInOnDate) {
                        // Set intensity based on actual XP earned today
                        if (todayXP >= 50) {
                          intensity = 3; // High activity: 50+ XP (check-in + multiple missions)
                        } else if (todayXP >= 20) {
                          intensity = 2; // Medium activity: 20-49 XP (check-in + some missions)
                        } else if (todayXP >= 10) {
                          intensity = 1; // Low activity: 10-19 XP (check-in only)
                        } else {
                          intensity = 1; // Default to light green if checked in but no XP recorded yet
                        }
                      } else {
                        intensity = 0; // Haven't checked in yet today
                      }
                      
                      console.log('📅 Today heatmap calculation:', {
                        date: date.toDateString(),
                        lastCheckIn: user.lastCheckIn ? new Date(user.lastCheckIn).toDateString() : null,
                        hasCheckedInOnDate,
                        todayXP,
                        intensity,
                        intensityMeaning: intensity === 0 ? 'No activity' : intensity === 1 ? 'Light green (10-19 XP)' : intensity === 2 ? 'Medium green (20-49 XP)' : 'Dark green (50+ XP)'
                      });
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
                        intensity = 0; // No activity: 0-9 XP
                      }
                    }
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
              })()}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={[styles.heatmapLegendText, { color: colors.textSecondary }]}>Kurang</Text>
              <View style={styles.heatmapLegendDots}>
                <View style={[styles.heatmapLegendDot, styles.heatmapEmpty]} />
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
    paddingTop: Math.max(50, height * 0.06), // Responsive top padding for mobile
    paddingBottom: Math.max(SIZES.xl, height * 0.08), // Responsive bottom padding for floating card
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
  progressHeader: {
    alignItems: 'center',
    marginBottom: SIZES.md,
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