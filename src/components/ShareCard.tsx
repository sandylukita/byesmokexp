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
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🚭</Text>
              <Text style={styles.title}>
                {language === 'en' ? 'Smoke-Free Achievement' : 'Pencapaian Bebas Rokok'}
              </Text>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsContainer}>
              {/* Days Since Quit */}
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>
                  {language === 'en' ? 'Days Since Quit' : 'Hari Bebas Rokok'}
                </Text>
                <Text style={styles.metricValue}>{daysSinceQuit}</Text>
                <Text style={styles.metricUnit}>
                  {language === 'en' ? 'days' : 'hari'}
                </Text>
              </View>

              {/* Current Streak */}
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>
                  {language === 'en' ? 'Current Streak' : 'Streak Saat Ini'}
                </Text>
                <View style={styles.streakContainer}>
                  <Text style={styles.fireEmoji}>🔥</Text>
                  <Text style={styles.metricValue}>{currentStreak}</Text>
                </View>
                <Text style={styles.metricUnit}>
                  {language === 'en' ? 'days' : 'hari'}
                </Text>
              </View>

              {/* Money Saved */}
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>
                  {language === 'en' ? 'Money Saved' : 'Uang Tersimpan'}
                </Text>
                <Text style={styles.metricValue}>{formatMoney(moneySaved)}</Text>
                <Text style={styles.metricUnit}>
                  {currency === 'USD' ? 'saved' : 'tersimpan'}
                </Text>
              </View>

              {/* Community Rank (Optional) */}
              {communityRank && (
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>
                    {language === 'en' ? 'Community Rank' : 'Peringkat Komunitas'}
                  </Text>
                  <Text style={styles.metricValue}>💪</Text>
                  <Text style={styles.metricUnit}>{communityRank}</Text>
                </View>
              )}
            </View>

            {/* Footer Logo */}
            <View style={styles.footer}>
              <Text style={styles.logoText}>ByeSmoke AI</Text>
              <Text style={styles.tagline}>
                {language === 'en'
                  ? 'Your Smart Quit Coach'
                  : 'Pelatih Berhenti Rokok Anda'
                }
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
    width: 350,
    height: 500,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metricsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  metric: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  metricLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metricUnit: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: 4,
    fontWeight: '500',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fireEmoji: {
    fontSize: 32,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    fontWeight: '500',
  },
});

ShareCard.displayName = 'ShareCard';
