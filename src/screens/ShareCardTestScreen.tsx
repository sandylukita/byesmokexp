/**
 * ShareCardTestScreen
 *
 * Test screen to preview and test share card functionality
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ShareCard } from '../components/ShareCard';
import { CheckInShareModal } from '../components/CheckInShareModal';
import { COLORS, SIZES } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

export const ShareCardTestScreen = ({ navigation }: any) => {
  const { colors, language } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'gradient' | 'dark' | 'light'>('gradient');

  // Test data
  const testData = {
    daysSinceQuit: 15,
    currentStreak: 15,
    moneySaved: 675000, // IDR
    currency: 'IDR' as const,
  };

  const styles: Array<'gradient' | 'dark' | 'light'> = ['gradient', 'dark', 'light'];
  const styleInfo = {
    gradient: {
      name: '🌈 Gradient',
      description: 'Vibrant and energetic',
    },
    dark: {
      name: '🌙 Dark',
      description: 'Professional and sleek',
    },
    light: {
      name: '☀️ Light',
      description: 'Clean and minimal',
    },
  };

  return (
    <SafeAreaView style={[screenStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={screenStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={screenStyles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[screenStyles.headerTitle, { color: colors.textPrimary }]}>
          Share Card Preview
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={screenStyles.content}
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={[screenStyles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[screenStyles.infoTitle, { color: colors.textPrimary }]}>
            📱 Test Share Card Styles
          </Text>
          <Text style={[screenStyles.infoText, { color: colors.textSecondary }]}>
            Tap on a style below to preview. Tap &quot;Test Share Modal&quot; to see the full sharing experience.
          </Text>
        </View>

        {/* Style Selector */}
        <View style={screenStyles.styleSelector}>
          {styles.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                screenStyles.styleButton,
                { backgroundColor: colors.card },
                selectedStyle === style && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedStyle(style)}
            >
              <Text style={[screenStyles.styleName, { color: colors.textPrimary }]}>
                {styleInfo[style].name}
              </Text>
              <Text style={[screenStyles.styleDesc, { color: colors.textSecondary }]}>
                {styleInfo[style].description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card Preview */}
        <View style={screenStyles.cardContainer}>
          <ShareCard
            daysSinceQuit={testData.daysSinceQuit}
            currentStreak={testData.currentStreak}
            moneySaved={testData.moneySaved}
            language={language as 'en' | 'id'}
            currency={testData.currency}
            style={selectedStyle}
          />
        </View>

        {/* Test Data Info */}
        <View style={[screenStyles.dataCard, { backgroundColor: colors.card }]}>
          <Text style={[screenStyles.dataTitle, { color: colors.textPrimary }]}>
            📊 Test Data
          </Text>
          <View style={screenStyles.dataRow}>
            <Text style={[screenStyles.dataLabel, { color: colors.textSecondary }]}>
              Days Smoke-Free:
            </Text>
            <Text style={[screenStyles.dataValue, { color: colors.textPrimary }]}>
              {testData.daysSinceQuit}
            </Text>
          </View>
          <View style={screenStyles.dataRow}>
            <Text style={[screenStyles.dataLabel, { color: colors.textSecondary }]}>
              Current Streak:
            </Text>
            <Text style={[screenStyles.dataValue, { color: colors.textPrimary }]}>
              {testData.currentStreak}
            </Text>
          </View>
          <View style={screenStyles.dataRow}>
            <Text style={[screenStyles.dataLabel, { color: colors.textSecondary }]}>
              Money Saved:
            </Text>
            <Text style={[screenStyles.dataValue, { color: colors.textPrimary }]}>
              Rp {testData.moneySaved.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={screenStyles.dataRow}>
            <Text style={[screenStyles.dataLabel, { color: colors.textSecondary }]}>
              Cigarettes Avoided:
            </Text>
            <Text style={[screenStyles.dataValue, { color: colors.textPrimary }]}>
              {testData.daysSinceQuit * 20}
            </Text>
          </View>
          <View style={screenStyles.dataRow}>
            <Text style={[screenStyles.dataLabel, { color: colors.textSecondary }]}>
              Health Score:
            </Text>
            <Text style={[screenStyles.dataValue, { color: colors.textPrimary }]}>
              {Math.min(100, Math.floor((testData.daysSinceQuit / 365) * 100))}%
            </Text>
          </View>
        </View>

        {/* Test Share Modal Button */}
        <TouchableOpacity
          style={[screenStyles.testButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
        >
          <MaterialIcons name="share" size={20} color="#FFFFFF" />
          <Text style={screenStyles.testButtonText}>
            Test Share Modal
          </Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={[screenStyles.featuresCard, { backgroundColor: colors.card }]}>
          <Text style={[screenStyles.featuresTitle, { color: colors.textPrimary }]}>
            ✨ Features
          </Text>
          <Text style={[screenStyles.featureItem, { color: colors.textSecondary }]}>
            • Beautiful gradient backgrounds
          </Text>
          <Text style={[screenStyles.featureItem, { color: colors.textSecondary }]}>
            • 3 professional style options
          </Text>
          <Text style={[screenStyles.featureItem, { color: colors.textSecondary }]}>
            • Dynamic stat calculations
          </Text>
          <Text style={[screenStyles.featureItem, { color: colors.textSecondary }]}>
            • Instagram Story optimized
          </Text>
          <Text style={[screenStyles.featureItem, { color: colors.textSecondary }]}>
            • Bilingual support (EN/ID)
          </Text>
        </View>
      </ScrollView>

      {/* Share Modal */}
      <CheckInShareModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        daysSinceQuit={testData.daysSinceQuit}
        currentStreak={testData.currentStreak}
        moneySaved={testData.moneySaved}
        language={language as 'en' | 'id'}
        currency={testData.currency}
      />
    </SafeAreaView>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  styleSelector: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  styleButton: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  styleDesc: {
    fontSize: 13,
  },
  cardContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dataCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 14,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 13,
    lineHeight: 22,
  },
});
