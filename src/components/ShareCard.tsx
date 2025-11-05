/**
 * ShareCard Component
 *
 * Strava-style achievement card for sharing smoke-free progress
 * Transparent background with metrics display
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const LOGO = require('../../assets/images/icon.png');

interface ShareCardProps {
  daysSinceQuit: number;
  currentStreak: number;
  moneySaved: number;
  communityRank?: string;
  language: 'en' | 'id';
  currency: 'IDR' | 'USD';
}

export const ShareCard = React.forwardRef<View, ShareCardProps>(
  ({ daysSinceQuit, currentStreak, moneySaved, communityRank, language, currency }, ref) => {
    const formatMoney = (amount: number) => {
      if (currency === 'USD') {
        return `$${Math.floor(amount / 15000)}`;
      }
      return formatCurrency(amount, language);
    };

    return (
      <View ref={ref} style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🚭</Text>
            </View>

            {/* Main Metric - Days */}
            <View style={styles.mainMetric}>
              <Text style={styles.mainValue}>{daysSinceQuit}</Text>
              <Text style={styles.mainLabel}>
                {language === 'en' ? 'DAYS SMOKE-FREE' : 'HARI BEBAS ROKOK'}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>
                  {language === 'en' ? 'STREAK' : 'STREAK'}
                </Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.fireEmoji}>🔥</Text>
                  <Text style={styles.statValue}>{currentStreak}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>
                  {language === 'en' ? 'SAVED' : 'HEMAT'}
                </Text>
                <Text style={styles.statValue}>{formatMoney(moneySaved)}</Text>
              </View>
            </View>

            {/* Footer Logo */}
            <View style={styles.footer}>
              <Image source={LOGO} style={styles.logo} />
              <Text style={styles.logoText}>ByeSmoke AI</Text>
              <Text style={styles.tagline}>
                {language === 'en' ? 'Your Smart Quit Coach' : 'Pelatih Berhenti Rokok Anda'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: 340,
    height: 480,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    flex: 1,
    padding: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
  },
  mainMetric: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  mainValue: {
    fontSize: 96,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  mainLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.95,
    letterSpacing: 2,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fireEmoji: {
    fontSize: 24,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  footer: {
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.85,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

ShareCard.displayName = 'ShareCard';
