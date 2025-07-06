import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../services/firebase';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [quitDate, setQuitDate] = useState(new Date());
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [cigarettePrice, setCigarettePrice] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: 'Kapan Kamu Mulai Berhenti?',
      subtitle: 'Pilih tanggal mulai perjalanan sehat',
      component: 'date'
    },
    {
      title: 'Berapa Batang Per Hari?',
      subtitle: 'Masukkan jumlah rokok yang biasa dikonsumsi',
      component: 'cigarettes'
    },
    {
      title: 'Berapa Harga Per Bungkus?',
      subtitle: 'Untuk menghitung penghematan',
      component: 'price'
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!cigarettesPerDay || !cigarettePrice) {
      Alert.alert('Error', 'Silakan isi semua data');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          quitDate: quitDate.toISOString(),
          cigarettesPerDay: parseInt(cigarettesPerDay) || 0,
          cigarettePrice: parseFloat(cigarettePrice) || 0,
        });
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onComplete();
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.component) {
      case 'date':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.dateText}>
              {quitDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Text style={styles.dateSubtext}>
              Hari ini adalah awal yang sempurna!
            </Text>
          </View>
        );
      case 'cigarettes':
        return (
          <View style={styles.stepContent}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 12"
              placeholderTextColor={COLORS.gray}
              value={cigarettesPerDay}
              onChangeText={setCigarettesPerDay}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.inputLabel}>batang per hari</Text>
          </View>
        );
      case 'price':
        return (
          <View style={styles.stepContent}>
            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>Rp</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="25000"
                placeholderTextColor={COLORS.gray}
                value={cigarettePrice}
                onChangeText={setCigarettePrice}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            <Text style={styles.inputLabel}>per bungkus</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.progressBar}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentStep && styles.progressDotActive
                  ]}
                />
              ))}
            </View>
            <Text style={styles.stepCounter}>
              {currentStep + 1} dari {steps.length}
            </Text>
          </View>

          <View style={styles.main}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
            
            {renderStepContent()}
          </View>

          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handlePrevious}
                >
                  <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.nextButton, loading && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={loading}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 
                    ? (loading ? 'Menyimpan...' : 'Mulai Perjalanan') 
                    : 'Lanjut'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.screenPadding,
  },
  header: {
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.white,
  },
  stepCounter: {
    ...TYPOGRAPHY.bodySmallWhite,
    opacity: 0.8,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1White,
    textAlign: 'center',
    marginBottom: SIZES.spacingMd,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SIZES.spacingXxl,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  dateText: {
    ...TYPOGRAPHY.h4White,
    textAlign: 'center',
    marginBottom: SIZES.spacingMd,
  },
  dateSubtext: {
    ...TYPOGRAPHY.bodyMediumWhite,
    opacity: 0.8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLg,
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    textAlign: 'center',
    minWidth: 120,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    marginTop: SIZES.spacingMd,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  currencySymbol: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginRight: SIZES.spacingSm,
  },
  priceInput: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    minWidth: 150,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    minHeight: SIZES.buttonHeight,
    justifyContent: 'center',
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  nextButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    minHeight: SIZES.buttonHeight,
    justifyContent: 'center',
    flex: 1,
    marginLeft: SIZES.md,
  },
  nextButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default OnboardingScreen;