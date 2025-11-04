import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomAlert } from '../components/CustomAlert';
import { auth, db } from '../services/firebase';
import { demoGetCurrentUser, demoUpdateOnboardingData } from '../services/demoAuth';
import { COLORS, SIZES } from '../utils/constants';
import { generatePersonalizedGreeting } from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';
import { useTranslation } from '../hooks/useTranslation';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  console.log('🎯 OnboardingScreen RENDERED');
  const { language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [quitDate, setQuitDate] = useState(new Date());
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [cigarettePrice, setCigarettePrice] = useState('');
  const [smokingYears, setSmokingYears] = useState('');
  const [quitReason, setQuitReason] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [previousAttempts, setPreviousAttempts] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [personalizedGreeting, setPersonalizedGreeting] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'info' | 'warning' | 'error'>('warning');

  const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'warning') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const steps = [
    {
      title: language === 'en' ? 'Welcome!' : 'Selamat Datang!',
      subtitle: language === 'en' ? 'Start your smoke-free journey with ByeSmoke AI' : 'Mari mulai perjalanan bebas rokok bersama ByeSmoke AI',
      component: 'welcome'
    },
    {
      title: language === 'en' ? 'How Long Have You Smoked?' : 'Berapa Lama Merokok?',
      subtitle: language === 'en' ? 'How many years have you been smoking?' : 'Berapa tahun Anda sudah merokok?',
      component: 'years'
    },
    {
      title: language === 'en' ? 'How Many Per Day?' : 'Berapa Batang Per Hari?',
      subtitle: language === 'en' ? 'Enter the number of cigarettes you usually consume' : 'Masukkan jumlah rokok yang biasa dikonsumsi',
      component: 'cigarettes'
    },
    {
      title: language === 'en' ? "What's the Price Per Pack?" : 'Berapa Harga Per Bungkus?',
      subtitle: language === 'en' ? 'To calculate your savings' : 'Untuk menghitung penghematan',
      component: 'price'
    },
    {
      title: language === 'en' ? 'Why Quit?' : 'Mengapa Ingin Berhenti?',
      subtitle: language === 'en' ? 'Choose your main reason' : 'Pilih alasan utama Anda',
      component: 'reasons'
    },
    {
      title: language === 'en' ? 'Previous Attempts?' : 'Mencoba Berhenti?',
      subtitle: language === 'en' ? 'How many times have you tried?' : 'Berapa kali Anda sudah mencoba?',
      component: 'attempts'
    },
    {
      title: language === 'en' ? 'When to Start?' : 'Kapan Mulai Berhenti?',
      subtitle: language === 'en' ? 'Choose your healthy journey start date' : 'Pilih tanggal mulai perjalanan sehat',
      component: 'date'
    },
    {
      title: language === 'en' ? 'Congratulations!' : 'Selamat!',
      subtitle: language === 'en' ? 'Your healthy life journey begins now' : 'Perjalanan hidup sehat Anda dimulai sekarang',
      component: 'completion'
    }
  ];

  console.log('🎯 OnboardingScreen state:', { currentStep, totalSteps: steps.length });

  const validateCurrentStep = () => {
    const step = steps[currentStep];

    switch (step.component) {
      case 'welcome':
        return true; // Welcome step doesn't need validation
      case 'years':
        if (!smokingYears || smokingYears.trim() === '') {
          showAlert(
            language === 'en' ? 'Field Required' : 'Field Required',
            language === 'en' ? 'Please enter how long you have been smoking' : 'Silakan masukkan berapa lama Anda sudah merokok',
            'warning'
          );
          return false;
        }
        return true;
      case 'cigarettes':
        if (!cigarettesPerDay || cigarettesPerDay.trim() === '') {
          showAlert(
            language === 'en' ? 'Field Required' : 'Field Required',
            language === 'en' ? 'Please enter the number of cigarettes per day' : 'Silakan masukkan jumlah rokok per hari',
            'warning'
          );
          return false;
        }
        return true;
      case 'price':
        if (!cigarettePrice || cigarettePrice.trim() === '') {
          showAlert(
            language === 'en' ? 'Field Required' : 'Field Required',
            language === 'en' ? 'Please enter the price per pack' : 'Silakan masukkan harga per bungkus rokok',
            'warning'
          );
          return false;
        }
        return true;
      case 'reasons':
        if (selectedReasons.length === 0) {
          showAlert(
            language === 'en' ? 'Field Required' : 'Field Required',
            language === 'en' ? 'Please select at least one reason to quit smoking' : 'Silakan pilih minimal satu alasan untuk berhenti merokok',
            'warning'
          );
          return false;
        }
        return true;
      case 'attempts':
        if (!previousAttempts) {
          showAlert(
            language === 'en' ? 'Field Required' : 'Field Required',
            language === 'en' ? 'Please select how many times you have tried to quit' : 'Silakan pilih berapa kali Anda sudah mencoba berhenti',
            'warning'
          );
          return false;
        }
        return true;
      case 'date':
        return true; // Date has default value
      case 'completion':
        return true; // Completion step doesn't need validation
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Validate current step before proceeding
      if (validateCurrentStep()) {
        // Generate personalized greeting when moving to completion step
        if (currentStep === steps.length - 2) {
          // Convert price to IDR for calculation
          const USD_TO_IDR_RATE = 15700;
          const priceValue = parseFloat(cigarettePrice) || 0;
          const priceInIDR = language === 'en' ? priceValue * USD_TO_IDR_RATE : priceValue;

          const greeting = generatePersonalizedGreeting({
            smokingYears: parseInt(smokingYears) || 0,
            cigarettesPerDay: parseInt(cigarettesPerDay) || 0,
            cigarettePrice: priceInIDR,
            quitReasons: selectedReasons,
            previousAttempts: parseInt(previousAttempts) || 0
          }, language);
          setPersonalizedGreeting(greeting);
        }
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentStep(currentStep + 1);
      }
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    // Final validation before completing onboarding
    const missingFields = [];
    if (!smokingYears || smokingYears.trim() === '') missingFields.push('Lama merokok');
    if (!cigarettesPerDay || cigarettesPerDay.trim() === '') missingFields.push('Jumlah rokok per hari');
    if (!cigarettePrice || cigarettePrice.trim() === '') missingFields.push('Harga per bungkus');
    if (selectedReasons.length === 0) missingFields.push('Alasan berhenti merokok');
    if (!previousAttempts) missingFields.push('Jumlah percobaan sebelumnya');
    
    if (missingFields.length > 0) {
      showAlert(
        language === 'en' ? 'Incomplete Data' : 'Data Belum Lengkap',
        language === 'en' ? `Please complete: ${missingFields.join(', ')}` : `Silakan lengkapi: ${missingFields.join(', ')}`,
        'warning'
      );
      return;
    }

    setLoading(true);
    try {
      // Convert cigarette price to IDR if user is using English (USD)
      // All prices are stored in IDR as the base currency
      const USD_TO_IDR_RATE = 15700;
      const priceValue = parseFloat(cigarettePrice) || 0;
      const priceInIDR = language === 'en' ? priceValue * USD_TO_IDR_RATE : priceValue;

      console.log('💰 Price conversion:', {
        language,
        enteredPrice: priceValue,
        priceInIDR,
        isUSD: language === 'en'
      });

      const onboardingData = {
        quitDate: quitDate.toISOString(),
        cigarettesPerDay: parseInt(cigarettesPerDay) || 0,
        cigarettePrice: priceInIDR,
        smokingYears: parseInt(smokingYears) || 0,
        quitReasons: selectedReasons,
        previousAttempts: parseInt(previousAttempts) || 0,
        onboardingCompleted: true,
        onboardingDate: new Date().toISOString()
      };

      // Check if it's a demo user or Firebase user
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        // Save to demo user data
        await demoUpdateOnboardingData(onboardingData);
      } else {
        // Save to Firebase - preserve existing user data for premium users
        const user = auth.currentUser;
        if (user) {
          const userDoc = doc(db, 'users', user.uid);
          
          // For existing premium users (like sandy@zaynstudio.app), only update onboarding-specific fields
          // This preserves their existing XP, streak, badges, dailyXP, etc.
          const { getUserDocument } = await import('../services/auth');
          const existingUser = await getUserDocument(user.uid);
          
          const updateData: any = {
            onboardingCompleted: true,
            onboardingDate: new Date().toISOString(),
            cigarettesPerDay: parseInt(cigarettesPerDay) || 0,
            cigarettePrice: priceInIDR,
            smokingYears: parseInt(smokingYears) || 0,
            quitReasons: selectedReasons,
            previousAttempts: parseInt(previousAttempts) || 0
          };
          
          // Only update quitDate if user doesn't have existing progress
          if (!existingUser || (existingUser.xp === 0 && existingUser.streak === 0 && (!existingUser.dailyXP || Object.keys(existingUser.dailyXP).length === 0))) {
            // New user - set quit date
            updateData.quitDate = quitDate.toISOString();
            console.log('New user detected, setting quit date');
          } else {
            console.log('Existing user detected, preserving quit date and progress data');
            // For existing users with progress, preserve their original quit date
          }
          
          await updateDoc(userDoc, updateData);
        }
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onComplete();
    } catch (error) {
      showAlert(
        'Error',
        language === 'en' ? 'Failed to save data' : 'Gagal menyimpan data',
        'error'
      );
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
    
    const quitReasonOptions = [
      { id: 'health', label: language === 'en' ? 'Health' : 'Kesehatan' },
      { id: 'family', label: language === 'en' ? 'Family' : 'Keluarga' },
      { id: 'money', label: language === 'en' ? 'Money' : 'Keuangan' },
      { id: 'fitness', label: language === 'en' ? 'Fitness' : 'Kebugaran' },
      { id: 'appearance', label: language === 'en' ? 'Appearance' : 'Penampilan' },
      { id: 'pregnancy', label: language === 'en' ? 'Pregnancy' : 'Kehamilan' }
    ];
    
    switch (step.component) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.welcomeText}>
              {language === 'en'
                ? "You've taken the first step towards a healthier life."
                : 'Anda telah mengambil langkah pertama menuju hidup yang lebih sehat.'
              }
            </Text>
          </View>
        );
      case 'years':
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={focusedInput === 'years' || smokingYears ? '' : ''}
                placeholderTextColor="transparent"
                value={smokingYears}
                onChangeText={setSmokingYears}
                onFocus={() => setFocusedInput('years')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                maxLength={2}
              />
              {focusedInput !== 'years' && !smokingYears && (
                <Text style={styles.placeholderText}>5</Text>
              )}
            </View>
            <Text style={styles.inputLabel}>{language === 'en' ? 'years *' : 'tahun *'}</Text>
            <Text style={styles.requiredText}>{language === 'en' ? 'Required' : 'Wajib diisi'}</Text>
          </View>
        );
      case 'reasons':
        return (
          <View style={[styles.stepContent, { marginTop: 8, marginBottom: 20 }]}>
            <View style={styles.reasonsGrid}>
              {quitReasonOptions.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonButton,
                    selectedReasons.includes(reason.id) && styles.reasonButtonSelected
                  ]}
                  onPress={() => {
                    if (selectedReasons.includes(reason.id)) {
                      setSelectedReasons(selectedReasons.filter(r => r !== reason.id));
                    } else {
                      setSelectedReasons([...selectedReasons, reason.id]);
                    }
                  }}
                >
                  <Text style={[
                    styles.reasonButtonText,
                    selectedReasons.includes(reason.id) && styles.reasonButtonTextSelected
                  ]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hintText}>{language === 'en' ? 'Select one or more *' : 'Pilih satu atau lebih *'}</Text>
            <Text style={styles.requiredText}>{language === 'en' ? 'Required' : 'Wajib dipilih'}</Text>
          </View>
        );
      case 'attempts':
        return (
          <View style={[styles.stepContent, { marginTop: 20 }]}>
            <View style={styles.attemptsContainer}>
              {['0', '1-2', '3-5', '5+'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.attemptButton,
                    previousAttempts === option && styles.attemptButtonSelected
                  ]}
                  onPress={() => setPreviousAttempts(option)}
                >
                  <Text style={[
                    styles.attemptButtonText,
                    previousAttempts === option && styles.attemptButtonTextSelected
                  ]}>
                    {language === 'en'
                      ? (option === '0' ? '0 times' : `${option} times`)
                      : (option === '0' ? '0 kali' : `${option} kali`)
                    }
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.requiredText}>{language === 'en' ? 'Required' : 'Wajib dipilih'}</Text>
          </View>
        );
      case 'date':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.dateText}>
              {quitDate.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Text style={styles.dateSubtext}>
              {language === 'en' ? 'Today is the perfect start!' : 'Hari ini adalah awal yang sempurna!'}
            </Text>
          </View>
        );
      case 'completion':
        return (
          <ScrollView 
            style={styles.completionScrollView}
            contentContainerStyle={styles.completionContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.completionEmoji}>🎉</Text>
            
            <Text style={styles.completionHeadline}>
              {personalizedGreeting?.headline || 'Selamat! Perjalanan Anda dimulai!'}
            </Text>
            
            <Text style={styles.completionMessage}>
              {personalizedGreeting?.message || (language === 'en'
                ? "You've taken the first step towards a healthier life."
                : 'Anda telah mengambil langkah pertama menuju hidup yang lebih sehat.')
              }
            </Text>
            
            {personalizedGreeting && (
              <View style={styles.highlightsContainer}>
                <View style={styles.highlightCard}>
                  <Text style={styles.highlightIcon}>💰</Text>
                  <Text style={styles.highlightText}>
                    {personalizedGreeting.financialHighlight}
                  </Text>
                </View>
                
                <View style={styles.highlightCard}>
                  <Text style={styles.highlightIcon}>❤️</Text>
                  <Text style={styles.highlightText}>
                    {personalizedGreeting.healthHighlight}
                  </Text>
                </View>
              </View>
            )}
            
            <Text style={styles.motivationalNote}>
              {personalizedGreeting?.motivationalNote || 'Mari mulai perjalanan sehat bersama ByeSmoke AI!'}
            </Text>
            
            <TouchableOpacity
              style={[styles.nextButton, { marginTop: 30, marginHorizontal: 0 }, loading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>
                {loading
                  ? (language === 'en' ? 'Saving...' : 'Menyimpan...')
                  : (language === 'en' ? 'Start Healthy Journey' : 'Mulai Perjalanan Sehat')
                }
              </Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'cigarettes':
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={focusedInput === 'cigarettes' || cigarettesPerDay ? '' : ''}
                placeholderTextColor="transparent"
                value={cigarettesPerDay}
                onChangeText={setCigarettesPerDay}
                onFocus={() => setFocusedInput('cigarettes')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                maxLength={2}
              />
              {focusedInput !== 'cigarettes' && !cigarettesPerDay && (
                <Text style={styles.placeholderText}>12</Text>
              )}
            </View>
            <Text style={styles.inputLabel}>{language === 'en' ? 'cigarettes per day *' : 'batang per hari *'}</Text>
            <Text style={styles.requiredText}>{language === 'en' ? 'Required' : 'Wajib diisi'}</Text>
          </View>
        );
      case 'price':
        const currencySymbol = language === 'en' ? '$' : 'Rp';
        const pricePlaceholder = language === 'en' ? '2' : '25000';
        return (
          <View style={styles.stepContent}>
            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder={focusedInput === 'price' || cigarettePrice ? '' : ''}
                  placeholderTextColor="transparent"
                  value={cigarettePrice}
                  onChangeText={setCigarettePrice}
                  onFocus={() => setFocusedInput('price')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {focusedInput !== 'price' && !cigarettePrice && (
                  <Text style={styles.pricePlaceholderText}>{pricePlaceholder}</Text>
                )}
              </View>
            </View>
            <Text style={styles.inputLabel}>{language === 'en' ? 'per pack *' : 'per bungkus *'}</Text>
            <Text style={styles.requiredText}>{language === 'en' ? 'Required' : 'Wajib diisi'}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.background}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
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
          </View>
        </ScrollView>
        
        {steps[currentStep].component !== 'completion' && (
          <View style={styles.fixedFooter}>
            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handlePrevious}
                >
                  <Text style={styles.backButtonText}>{language === 'en' ? 'Back' : 'Kembali'}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.nextButton, loading && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={loading}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1
                    ? (loading
                        ? (language === 'en' ? 'Saving...' : 'Menyimpan...')
                        : (language === 'en' ? 'Start Healthy Journey' : 'Mulai Perjalanan Sehat')
                      )
                    : currentStep === steps.length - 2
                    ? (language === 'en' ? 'View Summary' : 'Lihat Ringkasan')
                    : (language === 'en' ? 'Next' : 'Lanjut')
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140, // Increased space for fixed footer
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.screenPadding,
  },
  header: {
    paddingTop: 50,
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 6,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 120, // Increased space for button to prevent cutoff
  },
  title: {
    ...TYPOGRAPHY.h1White,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 72,
    marginBottom: SIZES.lg,
  },
  welcomeText: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: SIZES.lg,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
  },
  reasonButton: {
    backgroundColor: COLORS.neutral,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 6,
    borderWidth: 1,
    borderColor: COLORS.neutralDark,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  reasonButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutralDark,
    textAlign: 'center',
  },
  reasonButtonTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  requiredText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  placeholderText: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: '400',
    color: COLORS.gray,
    opacity: 0.6,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  priceInputContainer: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricePlaceholderText: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: '400',
    color: COLORS.gray,
    opacity: 0.6,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 16,
  },
  completionScrollView: {
    flex: 1,
    width: '100%',
  },
  completionContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  completionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  completionHeadline: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  completionMessage: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  highlightsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  highlightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  highlightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.9,
    flex: 1,
    lineHeight: 18,
  },
  motivationalNote: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  attemptsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attemptButton: {
    backgroundColor: COLORS.neutral,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.neutralDark,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  attemptButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  attemptButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.neutralDark,
    textAlign: 'center',
  },
  attemptButtonTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  dateText: {
    ...TYPOGRAPHY.h4White,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  dateSubtext: {
    ...TYPOGRAPHY.bodyMediumWhite,
    opacity: 0.8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    minWidth: 100,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    marginTop: 8,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    marginTop: 8,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SIZES.sm,
  },
  priceInput: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 180,
    textAlign: 'center',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 50,
    paddingHorizontal: SIZES.screenPadding,
  },
  footer: {
    paddingBottom: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default OnboardingScreen;