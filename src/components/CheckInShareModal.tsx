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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ShareCard } from './ShareCard';
import { shareAchievementCard } from '../services/shareService';
import { COLORS, SIZES } from '../utils/constants';

const { width } = Dimensions.get('window');

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
      <BlurView intensity={90} style={styles.container}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {language === 'en' ? '🎉 Check-In Complete!' : '🎉 Check-In Berhasil!'}
            </Text>
            <Text style={styles.headerSubtitle}>
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
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Instagram Story */}
            <TouchableOpacity
              style={[styles.actionButton, styles.instagramButton]}
              onPress={() => handleShare('instagram')}
              disabled={loading}
            >
              <View style={styles.instagramGradient}>
                <MaterialIcons name="photo-camera" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {language === 'en' ? 'Instagram Story' : 'Instagram Story'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Save to Gallery */}
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={() => handleShare('save')}
              disabled={loading}
            >
              <MaterialIcons name="save-alt" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {language === 'en' ? 'Save Image' : 'Simpan Gambar'}
              </Text>
            </TouchableOpacity>

            {/* More Options */}
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => handleShare('share')}
              disabled={loading}
            >
              <MaterialIcons name="share" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {language === 'en' ? 'More Options' : 'Opsi Lain'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={loading}
          >
            <MaterialIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  instagramButton: {
    backgroundColor: '#E1306C',
  },
  instagramGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: -50,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
