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

interface SignUpStepTwoProps {
  email: string;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SignUpStepTwo: React.FC<SignUpStepTwoProps> = ({
  email,
  onEmailChange,
  onNext,
  onBack,
}) => {
  const [focusedField, setFocusedField] = useState<string>('');

  const handleNext = () => {
    if (email.trim() && isValidEmail(email)) {
      onNext();
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValid = email.trim().length > 0 && isValidEmail(email);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Email Akun ✉️</Text>
        <Text style={styles.subtitle}>
          Masukkan alamat email untuk{'\n'}akun ByeSmoke Anda
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            focusedField === 'email' && styles.inputFocused,
          ]}
          placeholder="Email"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField('')}
          onSubmitEditing={handleNext}
          returnKeyType="next"
        />

        {email.length > 0 && isValidEmail(email) && (
          <Text style={styles.helpText}>
            Email valid! ✉️ ✅
          </Text>
        )}
        
        {email.length > 0 && !isValidEmail(email) && (
          <Text style={styles.errorText}>
            Format email tidak valid
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>
              Kembali
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              !isValid && styles.buttonDisabled
            ]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={[
              styles.buttonText,
              !isValid && styles.buttonTextDisabled
            ]}>
              Lanjutkan
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.stepInfo}>Langkah 2 dari 3</Text>
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
  helpText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    textAlign: 'center',
    marginTop: SIZES.sm,
    opacity: 0.8,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    textAlign: 'center',
    marginTop: SIZES.sm,
    color: COLORS.error || '#FF6B6B',
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

export default SignUpStepTwo;