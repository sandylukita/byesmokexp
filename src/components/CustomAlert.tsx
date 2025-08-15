import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  type?: 'success' | 'info' | 'warning' | 'error';
  icon?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onDismiss,
  type = 'success',
  icon
}) => {
  const { colors } = useTheme();

  const getIconName = () => {
    if (icon) return icon;
    switch (type) {
      case 'success': return 'check-circle';
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'check-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return colors.secondary;
      case 'info': return colors.info;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.secondary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <TouchableOpacity 
          style={[styles.alertContainer, { backgroundColor: colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onDismiss}
          >
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <MaterialIcons 
              name={getIconName() as any} 
              size={32} 
              color={getIconColor()} 
            />
          </View>
          
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.buttonRadius || 16,
    padding: SIZES.lg,
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    padding: SIZES.xs,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: SIZES.md,
    marginTop: SIZES.xs,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  message: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    marginBottom: SIZES.sm,
    lineHeight: 22,
  },
});