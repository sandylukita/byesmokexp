import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface SignUpStepThreeProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const SignUpStepThree: React.FC<SignUpStepThreeProps> = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onNext,
  onBack,
  loading = false,
}) => {
  const [focusedField, setFocusedField] = useState<string>('');

  const handleNext = () => {
    if (isValid) {
      onNext();
    }
  };

  const passwordsMatch = password === confirmPassword;
  const passwordLength = password.length >= 6;
  const hasConfirmPassword = confirmPassword.length > 0;
  const isValid = passwordLength && passwordsMatch && hasConfirmPassword;

  const getPasswordStrength = () => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'Terlalu pendek';
    if (password.length < 8) return 'Sedang';
    return 'Kuat';
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength === 'Terlalu pendek') return '#FF6B6B';
    if (strength === 'Sedang') return '#FFD93D';
    return '#6BCF7F';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Keamanan 🔐</Text>
        <Text style={styles.subtitle}>
          Buat password yang kuat untuk{'\n'}melindungi akun Anda
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            focusedField === 'password' && styles.inputFocused,
          ]}
          placeholder="Password"
          placeholderTextColor={COLORS.gray}
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
          autoComplete="new-password"
          autoFocus
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField('')}
          returnKeyType="next"
          onSubmitEditing={() => {
            // Focus next input
          }}
        />
        
        {password.length > 0 && (
          <View style={styles.passwordStrength}>
            <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
              Kekuatan: {getPasswordStrength()}
            </Text>
            {!passwordLength && (
              <Text style={styles.errorText}>
                Minimal 6 karakter
              </Text>
            )}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            focusedField === 'confirmPassword' && styles.inputFocused,
            { marginTop: SIZES.md }
          ]}
          placeholder="Konfirmasi Password"
          placeholderTextColor={COLORS.gray}
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          secureTextEntry
          autoComplete="new-password"
          onFocus={() => setFocusedField('confirmPassword')}
          onBlur={() => setFocusedField('')}
          onSubmitEditing={handleNext}
          returnKeyType="done"
        />

        {hasConfirmPassword && (
          <Text style={[
            styles.helpText,
            { color: passwordsMatch ? '#6BCF7F' : '#FF6B6B' }
          ]}>
            {passwordsMatch ? 'Password cocok! ✅' : 'Password tidak cocok ❌'}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>
              Kembali
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              (!isValid || loading) && styles.buttonDisabled
            ]}
            onPress={handleNext}
            disabled={!isValid || loading}
          >
            <Text style={[
              styles.buttonText,
              (!isValid || loading) && styles.buttonTextDisabled
            ]}>
              {loading ? 'Membuat...' : 'Buat Akun'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.stepInfo}>Langkah 3 dari 3</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SIZES.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1White,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLargeWhite,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -SIZES.xxl,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: SIZES.md,
    fontSize: SIZES.bodyMedium,
    color: COLORS.textPrimary,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
    textAlignVertical: 'center',
  },
  inputFocused: {
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  passwordStrength: {
    marginTop: SIZES.sm,
    alignItems: 'center',
  },
  strengthText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    fontWeight: '600',
  },
  helpText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    textAlign: 'center',
    marginTop: SIZES.sm,
    opacity: 0.9,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmallWhite,
    color: '#FF6B6B',
    marginTop: SIZES.xs,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SIZES.sm,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontSize: SIZES.bodyMedium,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontSize: SIZES.bodyMedium,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  stepInfo: {
    ...TYPOGRAPHY.bodySmallWhite,
    opacity: 0.7,
    marginTop: SIZES.sm,
  },
});

export default SignUpStepThree;