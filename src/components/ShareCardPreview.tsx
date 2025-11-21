/**
 * ShareCardPreview Component
 *
 * Demo/Preview component to visualize all three share card styles
 * Useful for testing and showcasing the design
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ShareCard } from './ShareCard';
import { COLORS, SIZES } from '../utils/constants';

interface ShareCardPreviewProps {
  daysSinceQuit?: number;
  currentStreak?: number;
  moneySaved?: number;
  language?: 'en' | 'id';
  currency?: 'IDR' | 'USD';
}

export const ShareCardPreview: React.FC<ShareCardPreviewProps> = ({
  daysSinceQuit = 15,
  currentStreak = 15,
  moneySaved = 45,
  language = 'en',
  currency = 'USD',
}) => {
  const [activeStyle, setActiveStyle] = useState<'gradient' | 'dark' | 'light'>('gradient');

  const styles: Array<'gradient' | 'dark' | 'light'> = ['gradient', 'dark', 'light'];
  const styleNames = {
    gradient: '🌈 Gradient',
    dark: '🌙 Dark',
    light: '☀️ Light',
  };

  return (
    <ScrollView style={previewStyles.container} contentContainerStyle={previewStyles.content}>
      <View style={previewStyles.header}>
        <Text style={previewStyles.title}>Share Card Preview</Text>
        <Text style={previewStyles.subtitle}>
          Strava-inspired achievement cards
        </Text>
      </View>

      {/* Style Selector */}
      <View style={previewStyles.styleSelector}>
        {styles.map((style) => (
          <TouchableOpacity
            key={style}
            style={[
              previewStyles.styleButton,
              activeStyle === style && previewStyles.styleButtonActive,
            ]}
            onPress={() => setActiveStyle(style)}
          >
            <Text
              style={[
                previewStyles.styleButtonText,
                activeStyle === style && previewStyles.styleButtonTextActive,
              ]}
            >
              {styleNames[style]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current Style Info */}
      <View style={previewStyles.infoCard}>
        <Text style={previewStyles.infoTitle}>Current Style: {styleNames[activeStyle]}</Text>
        <Text style={previewStyles.infoText}>
          {activeStyle === 'gradient' && '• Vibrant orange to green gradient\n• Perfect for celebrations\n• High energy feel'}
          {activeStyle === 'dark' && '• Professional dark theme\n• Great for dark mode users\n• Sleek and premium'}
          {activeStyle === 'light' && '• Clean minimalist design\n• Works everywhere\n• Easy to read'}
        </Text>
      </View>

      {/* Card Preview */}
      <View style={previewStyles.cardContainer}>
        <ShareCard
          daysSinceQuit={daysSinceQuit}
          currentStreak={currentStreak}
          moneySaved={moneySaved}
          language={language}
          currency={currency}
          style={activeStyle}
        />
      </View>

      {/* Stats Info */}
      <View style={previewStyles.statsInfo}>
        <Text style={previewStyles.statsTitle}>📊 Displayed Metrics</Text>
        <View style={previewStyles.statRow}>
          <Text style={previewStyles.statLabel}>🏆 Days Smoke-Free:</Text>
          <Text style={previewStyles.statValue}>{daysSinceQuit} days</Text>
        </View>
        <View style={previewStyles.statRow}>
          <Text style={previewStyles.statLabel}>🔥 Streak:</Text>
          <Text style={previewStyles.statValue}>{currentStreak} days</Text>
        </View>
        <View style={previewStyles.statRow}>
          <Text style={previewStyles.statLabel}>💰 Money Saved:</Text>
          <Text style={previewStyles.statValue}>${moneySaved}</Text>
        </View>
        <View style={previewStyles.statRow}>
          <Text style={previewStyles.statLabel}>🚭 Cigarettes Avoided:</Text>
          <Text style={previewStyles.statValue}>{daysSinceQuit * 20}</Text>
        </View>
        <View style={previewStyles.statRow}>
          <Text style={previewStyles.statLabel}>❤️ Health Score:</Text>
          <Text style={previewStyles.statValue}>
            {Math.min(100, Math.floor((daysSinceQuit / 365) * 100))}%
          </Text>
        </View>
      </View>

      {/* Feature Highlights */}
      <View style={previewStyles.features}>
        <Text style={previewStyles.featuresTitle}>✨ Key Features</Text>
        <Text style={previewStyles.featureItem}>• Beautiful gradient backgrounds</Text>
        <Text style={previewStyles.featureItem}>• Professional typography</Text>
        <Text style={previewStyles.featureItem}>• Dynamic stat calculations</Text>
        <Text style={previewStyles.featureItem}>• Social media optimized (320×480px)</Text>
        <Text style={previewStyles.featureItem}>• Instant style switching</Text>
        <Text style={previewStyles.featureItem}>• Bilingual support (EN/ID)</Text>
      </View>
    </ScrollView>
  );
};

const previewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  styleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  styleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  styleButtonTextActive: {
    color: COLORS.primary,
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  cardContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  statsInfo: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  features: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
