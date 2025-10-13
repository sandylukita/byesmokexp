/**
 * Community Comparison Component
 * 
 * Displays user's ranking compared to the community with motivational insights
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { User } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { compareUserToCommunity, UserComparison } from '../services/communityStats';

const { width } = Dimensions.get('window');

interface CommunityComparisonProps {
  user: User;
  onPress?: () => void;
  showTitle?: boolean;
}

export const CommunityComparison: React.FC<CommunityComparisonProps> = ({
  user,
  onPress,
  showTitle = false
}) => {
  const { colors } = useTheme();
  const { language } = useTranslation();
  const [comparison, setComparison] = useState<UserComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityComparison();
  }, [user.id, user.streak, user.xp]);

  const loadCommunityComparison = async () => {
    try {
      setLoading(true);
      const userComparison = await compareUserToCommunity(user);
      setComparison(userComparison);
    } catch (error) {
      console.error('Error loading community comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="people" size={24} color={colors.textSecondary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {language === 'en' ? 'Loading community stats...' : 'Memuat statistik komunitas...'}
          </Text>
        </View>
      </View>
    );
  }

  if (!comparison) {
    // No community stats available, don't render anything
    return null;
  }

  const getPercentileColor = (percentile: number): string => {
    if (percentile >= 90) return colors.success;
    if (percentile >= 75) return colors.primary;
    if (percentile >= 50) return colors.secondary;
    return colors.textSecondary;
  };

  const getPercentileIcon = (percentile: number) => {
    if (percentile >= 90) return 'emoji-events' as const;
    if (percentile >= 75) return 'local-fire-department' as const;
    if (percentile >= 50) return 'trending-up' as const;
    return 'people' as const;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.primary + '15', colors.secondary + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        {showTitle && (
          <View style={styles.cardTitle}>
            <Text style={[styles.cardTitleText, { color: colors.textPrimary }]}>
              {language === 'en' ? 'Community Ranking' : 'Peringkat Komunitas'}
            </Text>
          </View>
        )}

        {/* Main Comparison */}
        <View style={styles.mainComparison}>
          <View style={styles.percentileContainer}>
            <MaterialIcons 
              name={getPercentileIcon(comparison.streakPercentile)}
              size={32}
              color={getPercentileColor(comparison.streakPercentile)}
            />
            <Text style={[styles.percentileNumber, { color: getPercentileColor(comparison.streakPercentile) }]}>
              {comparison.streakPercentile}%
            </Text>
          </View>
          
          <View style={styles.comparisonText}>
            <Text style={[styles.mainText, { color: colors.textPrimary }]}>
              {language === 'en' 
                ? `You're ahead of ${comparison.streakPercentile}% of users!`
                : `Anda mengalahkan ${comparison.streakPercentile}% pengguna!`
              }
            </Text>
            <Text style={[styles.rankText, { color: getPercentileColor(comparison.streakPercentile) }]}>
              {language === 'en' ? `In the ${comparison.streakRank}` : `Berada di ${comparison.streakRank}`}
            </Text>
          </View>
        </View>

        {/* Additional Metrics */}
        <View style={styles.additionalMetrics}>
          <View style={styles.metricItem}>
            <MaterialIcons name="trending-up" size={16} color={colors.secondary} />
            <Text style={[styles.metricText, { color: colors.textSecondary }]}>
              XP: {comparison.xpPercentile}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <MaterialIcons name="calendar-today" size={16} color={colors.info} />
            <Text style={[styles.metricText, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Days' : 'Hari'}: {comparison.daysPercentile}%
            </Text>
          </View>
        </View>

        {/* Community Insight */}
        <View style={styles.insightContainer}>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            {comparison.communityInsight}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.buttonRadius || 16,
    marginVertical: SIZES.xs,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  cardTitle: {
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  loadingText: {
    marginTop: SIZES.sm,
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  percentileContainer: {
    alignItems: 'center',
    marginRight: SIZES.md,
    minWidth: 60,
  },
  percentileNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: SIZES.xs,
  },
  comparisonText: {
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SIZES.xs,
    lineHeight: 22,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '500',
  },
  additionalMetrics: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  metricText: {
    fontSize: 13,
    fontWeight: '500',
  },
  insightContainer: {
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider + '40',
  },
  insightText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },
});