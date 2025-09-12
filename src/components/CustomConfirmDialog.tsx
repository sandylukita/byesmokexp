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

interface CustomConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
  icon?: string;
}

export const CustomConfirmDialog: React.FC<CustomConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'warning',
  icon
}) => {
  const { colors } = useTheme();

  const getIconName = () => {
    if (icon) return icon;
    switch (type) {
      case 'warning': return 'warning';
      case 'danger': return 'error';
      case 'info': return 'info';
      default: return 'help';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning': return colors.warning || '#FF9500';
      case 'danger': return colors.error || '#FF3B30';
      case 'info': return colors.info || '#007AFF';
      default: return colors.primary;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger': return colors.error || '#FF3B30';
      default: return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity 
          style={[styles.dialogContainer, { backgroundColor: colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons 
              name={getIconName() as any} 
              size={40} 
              color={getIconColor()} 
            />
          </View>
          
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            {cancelText ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: colors.lightGray }
                  ]}
                  onPress={onCancel}
                >
                  <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: getConfirmButtonColor() }
                  ]}
                  onPress={onConfirm}
                >
                  <Text style={[styles.buttonText, { color: colors.white }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.singleButton,
                  { backgroundColor: getConfirmButtonColor() }
                ]}
                onPress={onConfirm}
              >
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.buttonRadius || 16,
    padding: SIZES.lg,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
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
    marginBottom: SIZES.lg,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: SIZES.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.buttonRadius || 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  singleButton: {
    width: '100%',
  },
  buttonText: {
    ...TYPOGRAPHY.buttonMedium,
    fontWeight: '600',
  },
});