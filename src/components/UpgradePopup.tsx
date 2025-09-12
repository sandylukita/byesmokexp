import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { SIZES } from '../utils/constants';

const { width, height } = Dimensions.get('window');

interface UpgradePopupProps {
  visible: boolean;
  onTryFree: () => void;
  onDismiss: () => void;
  daysSinceRegistration?: number;
}

export const UpgradePopup: React.FC<UpgradePopupProps> = ({
  visible,
  onTryFree,
  onDismiss,
  daysSinceRegistration = 3,
}) => {
  const { colors } = useTheme();
  const { t, language } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={[colors.secondary + '20', colors.primary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Rocket Icon */}
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '30' }]}>
              <MaterialIcons name="rocket-launch" size={48} color={colors.secondary} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={[styles.badge, { color: colors.secondary, backgroundColor: colors.secondary + '20' }]}>
                {language === 'en' ? `Day ${daysSinceRegistration}` : `Hari ${daysSinceRegistration}`}
              </Text>
              
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {language === 'en' 
                  ? "🎉 You're Doing Amazing!" 
                  : "🎉 Kamu Luar Biasa!"
                }
              </Text>
              
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {language === 'en'
                  ? `${daysSinceRegistration} days smoke-free! Ready to unlock your full potential? Get premium features for just $1.00 - cheaper than 2 cigarette packs!`
                  : `${daysSinceRegistration} hari bebas rokok! Siap buka potensi penuhmu? Dapatkan fitur premium cuma Rp 14.900 - lebih murah dari 2 batang rokok!`
                }
              </Text>

              {/* Features List */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                    {language === 'en' ? 'AI Daily Missions' : 'Misi Harian AI'}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                    {language === 'en' ? 'Personal Motivation' : 'Motivasi Personal'}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                    {language === 'en' ? 'Advanced Analytics' : 'Analitik Mendalam'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={onTryFree}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>
                {t.upgradeBanner.tryFree}
              </Text>
            </TouchableOpacity>

            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {language === 'en' 
                ? 'No payment required • Cancel anytime'
                : 'Tanpa pembayaran • Bisa dibatalkan kapan saja'
              }
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.screenPadding,
  },
  popup: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: SIZES.buttonRadius + 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  gradient: {
    padding: SIZES.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  content: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: SIZES.sm,
    overflow: 'hidden',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.lg,
  },
  featuresList: {
    width: '100%',
    gap: SIZES.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: SIZES.xl,
    borderRadius: SIZES.buttonRadius,
    minWidth: 200,
    marginBottom: SIZES.sm,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});