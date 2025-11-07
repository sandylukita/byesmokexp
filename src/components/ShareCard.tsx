/**
 * ShareCard Component
 *
 * Strava-style achievement card for sharing smoke-free progress
 * Transparent background with metrics display
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
      // Handle NaN or invalid values (but allow zero)
      if (amount === undefined || amount === null || isNaN(amount) || amount < 0) {
        return language === 'en' ? '$0' : 'Rp0';
      }

      // Use language to determine currency display (override currency prop if needed)
      if (language === 'en') {
        // Convert IDR to USD for English users (assuming amount is in IDR)
        const usdAmount = currency === 'IDR' ? Math.floor(amount / 15000) : amount;
        return `$${usdAmount}`;
      }

      // Indonesian - show in Rupiah
      return formatCurrency(amount, language);
    };

    return (
      <View ref={ref} style={styles.container}>
        <View style={styles.content}>
            {/* Header with Logo and Branding */}
            <View style={styles.header}>
              <Image source={LOGO} style={styles.headerLogo} />
              <Text style={styles.logoText}>ByeSmoke AI</Text>
              <Text style={styles.tagline}>
                {language === 'en' ? 'Your Smart Quit Coach' : 'Pelatih Berhenti Rokok Anda'}
              </Text>
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
          </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 360,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 18,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 11,
    marginBottom: 4,
  },
  mainMetric: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  mainLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.95,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 14,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fireEmoji: {
    fontSize: 18,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    opacity: 0.95,
  },
  tagline: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.85,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

ShareCard.displayName = 'ShareCard';
