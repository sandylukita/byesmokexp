import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
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
      <Text style={styles.sectionTitle}>Milestone Kesehatan</Text>
      <Text style={styles.sectionSubtitle}>
        Manfaat kesehatan yang sudah dan akan kamu rasakan
      </Text>
      
      {healthMilestones.map((milestone) => (
        <View key={milestone.id} style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <View style={[
              styles.milestoneIcon,
              { backgroundColor: milestone.isReached ? COLORS.secondary : COLORS.lightGray }
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
        </View>
      ))}
    </View>
  );

  const renderSavingsBreakdown = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Penghematan Uang</Text>
      <Text style={styles.sectionSubtitle}>
        Lihat berapa banyak uang yang berhasil kamu hemat
      </Text>
      
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
          <MaterialIcons name="today" size={24} color={COLORS.primary} />
          <Text style={styles.breakdownValue}>
            {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20))}
          </Text>
          <Text style={styles.breakdownLabel}>Per Hari</Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <MaterialIcons name="date-range" size={24} color={COLORS.accent} />
          <Text style={styles.breakdownValue}>
            {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20) * 7)}
          </Text>
          <Text style={styles.breakdownLabel}>Per Minggu</Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <MaterialIcons name="calendar-month" size={24} color={COLORS.error} />
          <Text style={styles.breakdownValue}>
            {formatCurrency(user.cigarettePrice * (user.cigarettesPerDay / 20) * 30)}
          </Text>
          <Text style={styles.breakdownLabel}>Per Bulan</Text>
        </View>
      </View>

      <View style={styles.investmentCard}>
        <Text style={styles.investmentTitle}>Apa yang bisa kamu beli?</Text>
        <View style={styles.investmentItems}>
          <View style={styles.investmentItem}>
            <Text style={styles.investmentEmoji}>📱</Text>
            <Text style={styles.investmentText}>
              {Math.floor(moneySaved / 3000000)} Smartphone baru
            </Text>
          </View>
          <View style={styles.investmentItem}>
            <Text style={styles.investmentEmoji}>🍕</Text>
            <Text style={styles.investmentText}>
              {Math.floor(moneySaved / 50000)} Pizza keluarga
            </Text>
          </View>
          <View style={styles.investmentItem}>
            <Text style={styles.investmentEmoji}>⛽</Text>
            <Text style={styles.investmentText}>
              {Math.floor(moneySaved / 15000)} Liter bensin
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Statistik Lengkap</Text>
      <Text style={styles.sectionSubtitle}>
        Data detail perjalanan berhenti merokok kamu
      </Text>
      
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
          <Text style={styles.statLabel}>Streak Terpanjang</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="star" size={32} color={COLORS.accent} />
          <Text style={styles.statValue}>{user.xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Progress Harian</Text>
        <View style={styles.progressWeek}>
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const isToday = i === 6;
            const hasCheckedIn = true; // You'd calculate this based on actual data
            
            return (
              <View key={i} style={styles.progressDay}>
                <Text style={styles.progressDayLabel}>
                  {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                </Text>
                <View style={[
                  styles.progressDayCircle,
                  hasCheckedIn && styles.progressDayComplete,
                  isToday && styles.progressDayToday
                ]}>
                  {hasCheckedIn && (
                    <MaterialIcons name="check" size={16} color={COLORS.white} />
                  )}
                </View>
              </View>
            );
          })}
        </View>
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
          {daysSinceQuit} hari bebas rokok
        </Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'health' && styles.activeTab]}
          onPress={() => setSelectedTab('health')}
        >
          <MaterialIcons 
            name="favorite" 
            size={20} 
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
            size={20} 
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
            size={20} 
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
  tabContent: {
    paddingBottom: SIZES.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: SIZES.spacingXs,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodyMediumSecondary,
    marginBottom: SIZES.spacingLg,
  },
  milestoneCard: {
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
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  milestoneReached: {
    color: COLORS.secondary,
  },
  milestoneTime: {
    ...TYPOGRAPHY.bodySmallSecondary,
  },
  milestoneDescription: {
    ...TYPOGRAPHY.bodyMediumSecondary,
    lineHeight: 20,
  },
  milestoneDescriptionReached: {
    color: COLORS.textPrimary,
  },
  savingsCard: {
    borderRadius: SIZES.borderRadiusLg,
    overflow: 'hidden',
    marginBottom: SIZES.lg,
  },
  savingsGradient: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  savingsAmount: {
    ...TYPOGRAPHY.display,
    color: COLORS.white,
    marginBottom: SIZES.spacingXs,
  },
  savingsLabel: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  breakdownItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SIZES.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginVertical: SIZES.spacingXs,
    textAlign: 'center',
  },
  breakdownLabel: {
    ...TYPOGRAPHY.bodySmallSecondary,
    textAlign: 'center',
  },
  investmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.cardPadding,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  investmentTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingMd,
    textAlign: 'center',
  },
  investmentItems: {
    alignItems: 'center',
  },
  investmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  investmentEmoji: {
    fontSize: SIZES.h3,
    marginRight: SIZES.spacingMd,
  },
  investmentText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    alignItems: 'center',
    width: (width - SIZES.screenPadding * 2 - SIZES.md) / 2,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    ...TYPOGRAPHY.bodyLargePrimary,
    fontWeight: '600',
    marginVertical: SIZES.spacingXs,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmallSecondary,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.cardPadding,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    ...TYPOGRAPHY.h5,
    marginBottom: SIZES.spacingMd,
    textAlign: 'center',
  },
  progressWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDay: {
    alignItems: 'center',
  },
  progressDayLabel: {
    ...TYPOGRAPHY.caption,
    marginBottom: SIZES.spacingXs,
  },
  progressDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDayComplete: {
    backgroundColor: COLORS.secondary,
  },
  progressDayToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});

export default ProgressScreen;