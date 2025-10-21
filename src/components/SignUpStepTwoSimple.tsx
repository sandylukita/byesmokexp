import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

interface SignUpStepTwoProps {
  email: string;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  onBack: () => void;
  language: 'en' | 'id';
}

const SignUpStepTwo: React.FC<SignUpStepTwoProps> = ({
  email,
  onEmailChange,
  onNext,
  onBack,
  language,
}) => {
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValid = email.trim().length > 0 && isValidEmail(email);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{language === 'en' ? 'Account Email' : 'Email Akun'}</Text>
      <Text style={styles.subtitle}>
        {language === 'en'
          ? 'Enter your email address for\nyour ByeSmoke account'
          : 'Masukkan alamat email untuk\nakun ByeSmoke Anda'}
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          onSubmitEditing={() => {
            if (isValid) {
              onNext();
            }
          }}
          returnKeyType="next"
        />

        {email.length > 0 && isValidEmail(email) && (
          <Text style={styles.helpText}>
            {language === 'en' ? 'Valid email! ✉️ ✅' : 'Email valid! ✉️ ✅'}
          </Text>
        )}

        {email.length > 0 && !isValidEmail(email) && (
          <Text style={styles.errorText}>
            {language === 'en' ? 'Invalid email format' : 'Format email tidak valid'}
          </Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>{language === 'en' ? 'Back' : 'Kembali'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={() => {
              if (isValid) {
                onNext();
              }
            }}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>{language === 'en' ? 'Continue' : 'Lanjutkan'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stepInfo}>{language === 'en' ? 'Step 2 of 3' : 'Langkah 2 dari 3'}</Text>
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
  helpText: {
    fontSize: 15,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.8,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 12,
  },
  stepInfo: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SignUpStepTwo;
