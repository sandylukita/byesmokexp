/**
 * Community Stats Tab Component
 * 
 * Premium-only community statistics and rankings
 * Shows user's ranking, community insights, and detailed statistics
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { User } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { CommunityComparison } from './CommunityComparison';
import { getCommunityStats, getCommunityInsights, CommunityStats } from '../services/communityStats';
import { showRewardedAd, canShowRewardedAd } from '../services/adMob';

const { width } = Dimensions.get('window');

interface CommunityStatsTabProps {
  user: User;
  onUpgradePress?: () => void;
}

export const CommunityStatsTab: React.FC<CommunityStatsTabProps> = ({
  user,
  onUpgradePress,
}) => {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [communityInsights, setCommunityInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnlockedStats, setShowUnlockedStats] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'info' | 'warning' | 'error'
  });

  useEffect(() => {
    loadCommunityData();
  }, []);

  const showCustomAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  const handleWatchAdForCommunityStats = async () => {
    try {
      // Check if rewarded ad is available
      if (!canShowRewardedAd()) {
        showCustomAlert(
          language === 'en' ? 'Ad Not Available' : 'Iklan Tidak Tersedia',
          language === 'en' 
            ? 'Please try again in a few moments.'
            : 'Silakan coba lagi dalam beberapa saat.',
          'warning'
        );
        return;
      }

      // Show rewarded ad
      const rewarded = await showRewardedAd('community_stats_unlock');
      
      if (rewarded) {
        // User watched the ad and earned reward - unlock community stats
        setShowUnlockedStats(true);
        
        showCustomAlert(
          language === 'en' ? 'Stats Unlocked!' : 'Statistik Terbuka!',
          language === 'en' 
            ? 'You can now see detailed community statistics!'
            : 'Sekarang Anda dapat melihat statistik komunitas lengkap!',
          'success'
        );
      } else {
        // User didn't complete the ad
        showCustomAlert(
          language === 'en' ? 'Ad Incomplete' : 'Iklan Tidak Selesai',
          language === 'en' 
            ? 'Please watch the full ad to unlock community stats.'
            : 'Silakan tonton iklan lengkap untuk membuka statistik komunitas.',
          'info'
        );
      }
    } catch (error) {
      console.error('Error showing community stats reward ad:', error);
      showCustomAlert(
        language === 'en' ? 'Error' : 'Kesalahan',
        language === 'en' 
          ? 'Unable to show ad. Please try again later.'
          : 'Tidak dapat menampilkan iklan. Silakan coba lagi nanti.',
        'error'
      );
    }
  };

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Load community stats and insights in parallel
      const [stats, insights] = await Promise.all([
        getCommunityStats(),
        getCommunityInsights()
      ]);
      
      setCommunityStats(stats);
      setCommunityInsights(insights);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Premium-only check - verify trial is still active or user has unlocked via ad
  const hasActivePremium = user.isPremium && (!user.isOnTrial || (user.trialEndDate && new Date() <= new Date(user.trialEndDate)));
  if (!hasActivePremium && !showUnlockedStats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.premiumOnlyContainer, { backgroundColor: colors.surface }]}>
            <LinearGradient
              colors={[colors.secondary + '20', colors.accent + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumOnlyGradient}
            >
              <MaterialIcons name="people" size={64} color={colors.secondary} />
              <Text style={[styles.premiumOnlyTitle, { color: colors.textPrimary }]}>
                {language === 'en' ? 'Community Statistics' : 'Statistik Komunitas'}
              </Text>
              <Text style={[styles.premiumOnlyDescription, { color: colors.textSecondary }]}>
                {language === 'en' 
                  ? 'Watch an ad to see how you compare with other users'
                  : 'Tonton iklan untuk melihat perbandingan dengan pengguna lain'
                }
              </Text>
              
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: colors.secondary }]}
                onPress={() => handleWatchAdForCommunityStats()}
                activeOpacity={0.8}
              >
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <MaterialIcons name="play-circle-filled" size={16} color="#FFFFFF" />
                  <Text style={[styles.upgradeButtonText, { marginLeft: 6 }]}>
                    {language === 'en' ? 'Watch Ad for Stats' : 'Tonton Iklan untuk Statistik'}
                  </Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {language === 'en' ? 'Loading community stats...' : 'Memuat statistik komunitas...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Community Insights */}
        {communityInsights.length > 0 && (
          <View style={[styles.section, styles.communityInsightsSection]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.badges.communityInsights}
            </Text>
            
            {communityInsights.map((insight, index) => (
              <View key={index} style={[styles.insightCard, { backgroundColor: colors.surface }]}>
                <LinearGradient
                  colors={[colors.accent + '15', colors.primary + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.insightGradient}
                >
                  <MaterialIcons name="lightbulb" size={20} color={colors.accent} />
                  <Text style={[styles.insightText, { color: colors.textPrimary }]}>
                    {insight}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}

        {/* Community Ranking Card */}
        <View style={[styles.section, styles.communityRankingSection]}>
          <CommunityComparison user={user} showTitle={true} />
        </View>

        {/* Community Statistics */}
        {communityStats && (
          <View style={styles.section}>
            <View style={[styles.statsGrid, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={[colors.primary + '15', colors.secondary + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statsGridGradient}
              >
                {/* Card Title */}
                <Text style={[styles.communityOverviewTitle, { color: colors.textPrimary }]}>
                  {language === 'en' ? 'Community Overview' : 'Ringkasan Komunitas'}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="people" size={24} color={colors.primary} />
                    <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
                      {communityStats.totalUsers.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Total Users' : 'Total Pengguna'}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <MaterialIcons name="local-fire-department" size={24} color={colors.secondary} />
                    <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
                      {Math.round(communityStats.averageStreak)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Avg Streak' : 'Rata-rata Streak'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="trending-up" size={24} color={colors.info} />
                    <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
                      {Math.round(communityStats.averageXP)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Avg XP' : 'Rata-rata XP'}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <MaterialIcons name="calendar-today" size={24} color={colors.success} />
                    <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
                      {Math.round(communityStats.averageDaysSmokeFree)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Avg Days' : 'Rata-rata Hari'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Streak Distribution */}
        {communityStats && (
          <View style={styles.section}>
            <View style={[styles.distributionCard, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={[colors.primaryLight + '20', colors.primary + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.distributionGradient}
              >
                {/* Card Title */}
                <Text style={[styles.streakDistributionTitle, { color: colors.textPrimary }]}>
                  {language === 'en' ? 'Streak Distribution' : 'Distribusi Streak'}
                </Text>
                {['0-7', '8-30', '31-90', '91-365', '365+'].map((range) => (
                  <View key={range} style={styles.distributionItem}>
                    <Text style={[styles.distributionRange, { color: colors.textPrimary }]}>
                      {range} {language === 'en' ? 'days' : 'hari'}
                    </Text>
                    <Text style={[styles.distributionCount, { color: colors.primary }]}>
                      {(communityStats.streakDistribution[range as keyof typeof communityStats.streakDistribution] || 0).toLocaleString()} {language === 'en' ? 'users' : 'pengguna'}
                    </Text>
                  </View>
                ))}
              </LinearGradient>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Custom Alert */}
      <Modal
        visible={customAlert.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideCustomAlert}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideCustomAlert}
        >
          <View style={[styles.alertContainer, { backgroundColor: colors.surface }]}>
            <View style={[
              styles.alertIconContainer, 
              { 
                backgroundColor: customAlert.type === 'success' ? colors.success + '20' : 
                                 customAlert.type === 'error' ? colors.error + '20' : 
                                 customAlert.type === 'warning' ? colors.warning + '20' : 
                                 colors.info + '20' 
              }
            ]}>
              <MaterialIcons 
                name={
                  customAlert.type === 'success' ? 'check-circle' : 
                  customAlert.type === 'error' ? 'error' : 
                  customAlert.type === 'warning' ? 'warning' : 
                  'info'
                } 
                size={48} 
                color={
                  customAlert.type === 'success' ? colors.success : 
                  customAlert.type === 'error' ? colors.error : 
                  customAlert.type === 'warning' ? colors.warning : 
                  colors.info
                } 
              />
            </View>
            
            <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>
              {customAlert.title}
            </Text>
            
            <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
              {customAlert.message}
            </Text>
            
            <TouchableOpacity 
              style={[styles.alertButton, { backgroundColor: colors.primary }]}
              onPress={hideCustomAlert}
            >
              <Text style={[styles.alertButtonText, { color: colors.white }]}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  communityRankingSection: {
    marginTop: -SIZES.sm,
  },
  communityInsightsSection: {
    marginTop: SIZES.md,
  },
  
  // Premium-only styles
  premiumOnlyContainer: {
    margin: SIZES.screenPadding,
    borderRadius: SIZES.buttonRadius || 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumOnlyGradient: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  premiumOnlyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  premiumOnlyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  upgradeButton: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.buttonRadius || 12,
  },
  upgradeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Stats grid styles
  statsGrid: {
    borderRadius: SIZES.cardRadius || 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGridGradient: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  communityOverviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  streakDistributionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Insight card styles
  insightCard: {
    borderRadius: SIZES.buttonRadius || 12,
    marginBottom: SIZES.sm,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightGradient: {
    padding: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    fontSize: 14,
    marginLeft: SIZES.sm,
    flex: 1,
    lineHeight: 20,
    textAlign: 'left',
  },
  
  // Distribution styles
  distributionCard: {
    borderRadius: SIZES.buttonRadius || 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  distributionGradient: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '30',
  },
  distributionRange: {
    fontSize: 14,
    fontWeight: '600',
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Custom Alert styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  alertContainer: {
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.lg,
    alignItems: 'center',
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  alertIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.lg,
  },
  alertButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.xl,
    borderRadius: SIZES.buttonRadius || 12,
    minWidth: 100,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CommunityStatsTab;