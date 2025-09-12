import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { SIZES } from '../utils/constants';

interface UpgradeBannerProps {
  onTryFree: () => void;
  onDismiss: () => void;
  onUpgradeNow: () => void;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  onTryFree,
  onDismiss,
  onUpgradeNow,
}) => {
  const { colors } = useTheme();
  const { t, language } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={[colors.secondary + '20', colors.secondary + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Dismiss Button */}
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
            <MaterialIcons name="rocket-launch" size={24} color={colors.secondary} />
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t.upgradeBanner.title}
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {t.upgradeBanner.message}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onTryFree}
          >
            <Text style={styles.primaryButtonText}>
              {t.upgradeBanner.tryFree}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs || 4,
    borderRadius: SIZES.buttonRadius || 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    padding: SIZES.md,
    borderRadius: SIZES.buttonRadius || 12,
    position: 'relative',
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    paddingRight: 32, // Make room for dismiss button
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#28A745', // Green color for primary action
    minWidth: 200,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: SIZES.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});