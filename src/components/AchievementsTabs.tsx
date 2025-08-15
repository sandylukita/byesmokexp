/**
 * Achievements Tabs Component
 * 
 * Internal tab navigation for the Achievements & Stats page
 * Provides switching between "My Badges" and "Community Stats"
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, SIZES } from '../utils/constants';

const { width } = Dimensions.get('window');

interface AchievementsTabsProps {
  activeTab: 'badges' | 'community';
  onTabChange: (tab: 'badges' | 'community') => void;
  badgesLabel: string;
  communityLabel: string;
}

export const AchievementsTabs: React.FC<AchievementsTabsProps> = ({
  activeTab,
  onTabChange,
  badgesLabel,
  communityLabel,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.tabContainer, { backgroundColor: colors.lightGray }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'badges' && styles.activeTab,
          ]}
          onPress={() => onTabChange('badges')}
          activeOpacity={0.8}
        >
          {activeTab === 'badges' ? (
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabGradient}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>
                {badgesLabel}
              </Text>
            </LinearGradient>
          ) : (
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>
              {badgesLabel}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'community' && styles.activeTab,
          ]}
          onPress={() => onTabChange('community')}
          activeOpacity={0.8}
        >
          {activeTab === 'community' ? (
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabGradient}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>
                {communityLabel}
              </Text>
            </LinearGradient>
          ) : (
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>
              {communityLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: SIZES.buttonRadius || 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (SIZES.buttonRadius || 12) - 4,
  },
  activeTab: {
    // Style handled by gradient
  },
  activeTabGradient: {
    width: '100%',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (SIZES.buttonRadius || 12) - 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.white,
  },
});

export default AchievementsTabs;