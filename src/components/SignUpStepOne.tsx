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

interface SignUpStepOneProps {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
}

const SignUpStepOne: React.FC<SignUpStepOneProps> = ({
  name,
  onNameChange,
  onNext,
}) => {
  const [focused, setFocused] = useState(false);

  const handleNext = () => {
    if (name.trim()) {
      onNext();
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Halo! 👋</Text>
        <Text style={styles.subtitle}>
          Langkah pertama menuju hidup sehat.{'\n'}Siapa nama Anda?
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            focused && styles.inputFocused,
          ]}
          placeholder="Nama Lengkap"
          placeholderTextColor={COLORS.gray}
          value={name}
          onChangeText={onNameChange}
          autoCapitalize="words"
          autoComplete="name"
          autoFocus
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={handleNext}
          returnKeyType="next"
        />
        
        {name.length > 0 && (
          <Text style={styles.helpText}>
            Terlihat bagus, {name.split(' ')[0]}! 🎉
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
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
        
        <Text style={styles.stepInfo}>Langkah 1 dari 3</Text>
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
  buttonContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: SIZES.xxl,
    alignItems: 'center',
    width: '100%',
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

export default SignUpStepOne;