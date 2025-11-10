/**
 * CheckInShareModal Component
 *
 * Modal that appears after check-in with share options
 * Includes preview of share card and action buttons
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ShareCard } from './ShareCard';
import { shareAchievementCard } from '../services/shareService';
import { COLORS, SIZES } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface CheckInShareModalProps {
  visible: boolean;
  onClose: () => void;
  daysSinceQuit: number;
  currentStreak: number;
  moneySaved: number;
  communityRank?: string;
  language: 'en' | 'id';
  currency: 'IDR' | 'USD';
}

export const CheckInShareModal: React.FC<CheckInShareModalProps> = ({
  visible,
  onClose,
  daysSinceQuit,
  currentStreak,
  moneySaved,
  communityRank,
  language,
  currency,
}) => {
  const shareCardRef = useRef<View>(null);
  const [loading, setLoading] = useState(false);
  const { colors, isDarkMode } = useTheme();

  const handleShare = async (action: 'instagram' | 'save' | 'share') => {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const success = await shareAchievementCard(shareCardRef, action);

      if (success && action === 'save') {
        // Auto-close modal after successful save
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      // Error sharing - silently fail or show alert
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          disabled={loading}
        />
        <BlurView intensity={90} style={styles.container} pointerEvents="box-none">
          <View style={styles.modalWrapper}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              {/* Close Button - Outside ScrollView for iOS visibility */}
              <View style={styles.closeButtonContainer} pointerEvents="box-none">
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' },
                    Platform.OS === 'ios' && styles.closeButtonIOS
                  ]}
                  onPress={handleClose}
                  disabled={loading}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
                alwaysBounceVertical={Platform.OS === 'ios'}
                keyboardShouldPersistTaps="handled"
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {language === 'en' ? '🎉 Check-In Complete!' : '🎉 Check-In Berhasil!'}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {language === 'en'
                      ? 'Share your achievement with friends'
                      : 'Bagikan pencapaian Anda'}
                  </Text>
                </View>

                {/* Share Card Preview */}
                <View style={styles.cardContainer}>
                  <ShareCard
                    ref={shareCardRef}
                    daysSinceQuit={daysSinceQuit}
                    currentStreak={currentStreak}
                    moneySaved={moneySaved}
                    communityRank={communityRank}
                    language={language}
                    currency={currency}
                    style="dark"
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  {/* Share Achievement - Primary Button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      { backgroundColor: isDarkMode ? '#667eea' : '#667eea' }
                    ]}
                    onPress={() => handleShare('share')}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <View style={styles.buttonContent}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                        <MaterialIcons name="share" size={22} color="#ffffff" />
                      </View>
                      <Text style={[styles.primaryButtonText, { color: '#ffffff' }]}>
                        {language === 'en' ? 'Share Achievement' : 'Bagikan Pencapaian'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Save to Photos - Secondary Button */}
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      { backgroundColor: isDarkMode ? '#1e2a4a' : '#f0f4ff' }
                    ]}
                    onPress={() => handleShare('save')}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <View style={styles.buttonContent}>
                      <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#2a3a5a' : '#ffffff' }]}>
                        <MaterialIcons name="file-download" size={20} color="#667eea" />
                      </View>
                      <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
                        {language === 'en' ? 'Save to Photos' : 'Simpan ke Galeri'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Skip Button */}
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Skip for now' : 'Lewati'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Loading Indicator */}
              {loading && (
                <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    height: height * 0.70,
    width: width - 40,
    maxWidth: 400,
  },
  modalContent: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
    pointerEvents: 'box-none',
  },
  closeButton: {
    margin: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonIOS: {
    marginTop: Platform.OS === 'ios' ? 12 : 8,
    shadowOpacity: 0.3,
  },
  scrollView: {
    flex: 1,
    width: '100%',
    borderRadius: 24,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 60, // Space for close button
    paddingBottom: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
