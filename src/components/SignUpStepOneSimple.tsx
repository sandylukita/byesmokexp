import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

interface SignUpStepOneProps {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  language: 'en' | 'id';
}

const SignUpStepOne: React.FC<SignUpStepOneProps> = ({
  name,
  onNameChange,
  onNext,
  language,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{language === 'en' ? 'Hello!' : 'Halo!'}</Text>
      <Text style={styles.subtitle}>
        {language === 'en'
          ? 'First step towards a healthy life.\nWhat is your name?'
          : 'Langkah pertama menuju hidup sehat.\nSiapa nama Anda?'}
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={language === 'en' ? 'Full Name' : 'Nama Lengkap'}
          placeholderTextColor={COLORS.gray}
          value={name}
          onChangeText={onNameChange}
          autoCapitalize="words"
          autoComplete="name"
          autoFocus
          onSubmitEditing={() => {
            if (name.trim()) {
              onNext();
            }
          }}
          returnKeyType="next"
        />

        {name.length > 0 && (
          <Text style={styles.helpText}>
            {language === 'en'
              ? `Looking good, ${name.split(' ')[0]}! 🎉`
              : `Terlihat bagus, ${name.split(' ')[0]}! 🎉`}
          </Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (name.trim()) {
              onNext();
            }
          }}
        >
          <Text style={styles.buttonText}>{language === 'en' ? 'Continue' : 'Lanjutkan'}</Text>
        </TouchableOpacity>

        <Text style={styles.stepInfo}>{language === 'en' ? 'Step 1 of 3' : 'Langkah 1 dari 3'}</Text>
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
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
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
  stepInfo: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SignUpStepOne;
