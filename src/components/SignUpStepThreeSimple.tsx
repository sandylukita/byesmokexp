import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

interface SignUpStepThreeProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  language: 'en' | 'id';
}

const SignUpStepThree: React.FC<SignUpStepThreeProps> = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onNext,
  onBack,
  loading = false,
  language,
}) => {
  // Password complexity requirements (Option A)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordLength = password.length >= 8; // Changed from 6 to 8
  const passwordsMatch = password === confirmPassword;
  const hasConfirmPassword = confirmPassword.length > 0;
  const isValid = passwordLength && hasUpperCase && hasNumber && passwordsMatch && hasConfirmPassword;

  const getPasswordStrength = () => {
    if (password.length === 0) return '';
    if (password.length < 8) return language === 'en' ? 'Too short' : 'Terlalu pendek';
    if (!hasUpperCase || !hasNumber) return language === 'en' ? 'Too weak' : 'Terlalu lemah';
    if (password.length < 12) return language === 'en' ? 'Medium' : 'Sedang';
    return language === 'en' ? 'Strong' : 'Kuat';
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength === 'Too short' || strength === 'Terlalu pendek' || strength === 'Too weak' || strength === 'Terlalu lemah') return '#FF6B6B';
    if (strength === 'Medium' || strength === 'Sedang') return '#FFD93D';
    return '#6BCF7F';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{language === 'en' ? 'Security' : 'Keamanan'}</Text>
      <Text style={styles.subtitle}>
        {language === 'en'
          ? 'Create a strong password to\nprotect your account'
          : 'Buat password yang kuat untuk\nmelindungi akun Anda'}
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.gray}
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
          autoComplete="new-password"
          autoFocus
          returnKeyType="next"
        />

        {password.length > 0 && (
          <View style={styles.passwordStrength}>
            <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
              {language === 'en' ? 'Strength: ' : 'Kekuatan: '}{getPasswordStrength()}
            </Text>
            <View style={styles.requirements}>
              <Text style={[styles.requirement, passwordLength && styles.requirementMet]}>
                {passwordLength ? '✅' : '❌'} {language === 'en' ? 'At least 8 characters' : 'Minimal 8 karakter'}
              </Text>
              <Text style={[styles.requirement, hasUpperCase && styles.requirementMet]}>
                {hasUpperCase ? '✅' : '❌'} {language === 'en' ? 'Uppercase letter (A-Z)' : 'Huruf kapital (A-Z)'}
              </Text>
              <Text style={[styles.requirement, hasNumber && styles.requirementMet]}>
                {hasNumber ? '✅' : '❌'} {language === 'en' ? 'Number (0-9)' : 'Angka (0-9)'}
              </Text>
            </View>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder={language === 'en' ? 'Confirm Password' : 'Konfirmasi Password'}
          placeholderTextColor={COLORS.gray}
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          secureTextEntry
          autoComplete="new-password"
          onSubmitEditing={() => {
            if (isValid) {
              onNext();
            }
          }}
          returnKeyType="done"
        />

        {hasConfirmPassword && (
          <Text style={[styles.helpText, { color: passwordsMatch ? '#6BCF7F' : '#FF6B6B' }]}>
            {passwordsMatch
              ? (language === 'en' ? 'Passwords match! ✅' : 'Password cocok! ✅')
              : (language === 'en' ? 'Passwords do not match ❌' : 'Password tidak cocok ❌')}
          </Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>{language === 'en' ? 'Back' : 'Kembali'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
            onPress={() => {
              if (isValid) {
                onNext();
              }
            }}
            disabled={!isValid || loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? (language === 'en' ? 'Creating...' : 'Membuat...')
                : (language === 'en' ? 'Create Account' : 'Buat Akun')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stepInfo}>{language === 'en' ? 'Step 3 of 3' : 'Langkah 3 dari 3'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
    backgroundColor: COLORS.primary,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 15,
    color: COLORS.textPrimary,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 20,
  },
  passwordStrength: {
    marginTop: 12,
    alignItems: 'center',
  },
  strengthText: {
    fontSize: 15,
    fontWeight: '600',
  },
  requirements: {
    marginTop: 12,
    gap: 6,
    alignItems: 'flex-start',
    width: '100%',
  },
  requirement: {
    fontSize: 13,
    color: '#FF6B6B',
  },
  requirementMet: {
    color: '#6BCF7F',
  },
  helpText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#FF6B6B',
    marginTop: 4,
  },
  stepInfo: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SignUpStepThree;
