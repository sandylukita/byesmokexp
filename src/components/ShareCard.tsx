/**
 * ShareCard Component
 *
 * Strava-style achievement card for sharing smoke-free progress
 * Beautiful gradient backgrounds with visual stats
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
  style?: 'gradient' | 'dark' | 'light'; // Different visual styles
}

export const ShareCard = React.forwardRef<View, ShareCardProps>(
  ({ daysSinceQuit, currentStreak, moneySaved, communityRank, language, currency, style = 'gradient' }, ref) => {
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

    // Calculate additional metrics for visualization
    const cigarettesAvoided = Math.floor(daysSinceQuit * 20); // Assuming 20 cigs/day

    // Calculate health score based on medically accurate recovery timeline
    // Source: American Cancer Society, CDC smoking cessation benefits timeline
    const calculateHealthScore = (days: number): number => {
      if (days < 1) return 0;
      if (days < 1) return 5;           // 20 minutes - 1 day: Heart rate normalizes
      if (days < 2) return 8;           // 12 hours: CO levels normal
      if (days < 14) return 12;         // 2 weeks: Circulation improves
      if (days < 90) return 25;         // 3 months: Lung function increases
      if (days < 180) return 35;        // 6 months: Coughing decreases
      if (days < 365) return 50;        // 1 year: Heart disease risk halved
      if (days < 1825) return 70;       // 5 years: Stroke risk = non-smoker
      if (days < 3650) return 85;       // 10 years: Lung cancer risk halved
      if (days < 5475) return 95;       // 15 years: Heart disease risk = non-smoker
      return 100;                        // Full recovery
    };

    const healthScore = calculateHealthScore(daysSinceQuit);

    // White text for visibility on any background
    const textColor = '#FFFFFF';

    return (
      <View ref={ref} style={styles.container}>
        <View style={styles.transparentContainer}>
          <View style={styles.content}>
            {/* Header with Logo and Branding */}
            <View style={styles.header}>
              <Image source={LOGO} style={styles.headerLogo} />
              <Text style={[styles.logoText, { color: textColor }]}>ByeSmoke AI</Text>
            </View>

            {/* Main Metric - Days with Visual Impact */}
            <View style={styles.mainMetric}>
              <Text style={[styles.mainValue, { color: textColor }]}>{daysSinceQuit}</Text>
              <Text style={[styles.mainLabel, { color: textColor }]}>
                {language === 'en' ? 'DAYS SMOKE-FREE' : 'HARI BEBAS ROKOK'}
              </Text>
            </View>

            {/* Stats Grid with Visual Elements */}
            <View style={styles.statsGrid}>
              {/* Streak */}
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statEmoji}>🔥</Text>
                </View>
                <Text style={[styles.statCardValue, { color: textColor }]}>{currentStreak}</Text>
                <Text style={[styles.statCardLabel, { color: textColor }]}>
                  {language === 'en' ? 'Day Streak' : 'Hari Streak'}
                </Text>
              </View>

              {/* Money Saved */}
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statEmoji}>💰</Text>
                </View>
                <Text style={[styles.statCardValue, { color: textColor, fontSize: 18 }]}>
                  {formatMoney(moneySaved)}
                </Text>
                <Text style={[styles.statCardLabel, { color: textColor }]}>
                  {language === 'en' ? 'Saved' : 'Hemat'}
                </Text>
              </View>
            </View>

            {/* Bottom Stats Bar */}
            <View style={styles.bottomBar}>
              <View style={styles.bottomStat}>
                <Text style={[styles.bottomStatValue, { color: textColor }]}>🚭 {cigarettesAvoided}</Text>
                <Text style={[styles.bottomStatLabel, { color: textColor }]}>
                  {language === 'en' ? 'Cigarettes Avoided' : 'Rokok Dihindari'}
                </Text>
              </View>
              {healthScore > 0 && (
                <>
                  <View style={[styles.bottomDivider, { backgroundColor: textColor }]} />
                  <View style={styles.bottomStat}>
                    <Text style={[styles.bottomStatValue, { color: textColor }]}>❤️ {healthScore}%</Text>
                    <Text style={[styles.bottomStatLabel, { color: textColor }]}>
                      {language === 'en' ? 'Health Score' : 'Skor Kesehatan'}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 420,
    overflow: 'visible',
  },
  transparentContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLogo: {
    width: 52,
    height: 52,
    borderRadius: 13,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainMetric: {
    alignItems: 'center',
    marginBottom: 12,
  },
  mainValue: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -3,
    textAlign: 'center',
  },
  mainLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
    opacity: 0.95,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 32,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.85,
    letterSpacing: 0.5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomStat: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  bottomStatValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  bottomStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  bottomDivider: {
    width: 1,
    height: 35,
    opacity: 0.25,
    marginHorizontal: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
});

ShareCard.displayName = 'ShareCard';
