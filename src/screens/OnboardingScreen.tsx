import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../services/firebase';
import { demoGetCurrentUser, demoUpdateOnboardingData } from '../services/demoAuth';
import { COLORS, SIZES } from '../utils/constants';
import { generatePersonalizedGreeting } from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
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

  const steps = [
    {
      title: 'Selamat Datang!',
      subtitle: 'Mari mulai perjalanan bebas rokok bersama ByeSmoke AI',
      component: 'welcome'
    },
    {
      title: 'Berapa Lama Merokok?',
      subtitle: 'Berapa tahun Anda sudah merokok?',
      component: 'years'
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
    },
    {
      title: 'Mengapa Ingin Berhenti?',
      subtitle: 'Pilih alasan utama Anda',
      component: 'reasons'
    },
    {
      title: 'Mencoba Berhenti?',
      subtitle: 'Berapa kali Anda sudah mencoba?',
      component: 'attempts'
    },
    {
      title: 'Kapan Mulai Berhenti?',
      subtitle: 'Pilih tanggal mulai perjalanan sehat',
      component: 'date'
    },
    {
      title: 'Selamat!',
      subtitle: 'Perjalanan hidup sehat Anda dimulai sekarang',
      component: 'completion'
    }
  ];

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    
    switch (step.component) {
      case 'welcome':
        return true; // Welcome step doesn't need validation
      case 'years':
        if (!smokingYears || smokingYears.trim() === '') {
          Alert.alert('Field Required', 'Silakan masukkan berapa lama Anda sudah merokok');
          return false;
        }
        return true;
      case 'cigarettes':
        if (!cigarettesPerDay || cigarettesPerDay.trim() === '') {
          Alert.alert('Field Required', 'Silakan masukkan jumlah rokok per hari');
          return false;
        }
        return true;
      case 'price':
        if (!cigarettePrice || cigarettePrice.trim() === '') {
          Alert.alert('Field Required', 'Silakan masukkan harga per bungkus rokok');
          return false;
        }
        return true;
      case 'reasons':
        if (selectedReasons.length === 0) {
          Alert.alert('Field Required', 'Silakan pilih minimal satu alasan untuk berhenti merokok');
          return false;
        }
        return true;
      case 'attempts':
        if (!previousAttempts) {
          Alert.alert('Field Required', 'Silakan pilih berapa kali Anda sudah mencoba berhenti');
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
          const greeting = generatePersonalizedGreeting({
            smokingYears: parseInt(smokingYears) || 0,
            cigarettesPerDay: parseInt(cigarettesPerDay) || 0,
            cigarettePrice: parseFloat(cigarettePrice) || 0,
            quitReasons: selectedReasons,
            previousAttempts: parseInt(previousAttempts) || 0
          });
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
      Alert.alert('Data Belum Lengkap', `Silakan lengkapi: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const onboardingData = {
        quitDate: quitDate.toISOString(),
        cigarettesPerDay: parseInt(cigarettesPerDay) || 0,
        cigarettePrice: parseFloat(cigarettePrice) || 0,
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
          
          // For existing premium users (like sandy@mail.com), only update onboarding-specific fields
          // This preserves their existing XP, streak, badges, dailyXP, etc.
          const { getUserDocument } = await import('../services/auth');
          const existingUser = await getUserDocument(user.uid);
          
          const updateData: any = {
            onboardingCompleted: true,
            onboardingDate: new Date().toISOString(),
            cigarettesPerDay: parseInt(cigarettesPerDay) || 0,
            cigarettePrice: parseFloat(cigarettePrice) || 0,
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
    
    const quitReasonOptions = [
      { id: 'health', label: 'Kesehatan' },
      { id: 'family', label: 'Keluarga' },
      { id: 'money', label: 'Keuangan' },
      { id: 'fitness', label: 'Kebugaran' },
      { id: 'appearance', label: 'Penampilan' },
      { id: 'pregnancy', label: 'Kehamilan' }
    ];
    
    switch (step.component) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.welcomeText}>
              Anda telah mengambil langkah pertama menuju hidup yang lebih sehat.
            </Text>
          </View>
        );
      case 'years':
        return (
          <View style={[styles.stepContent, { 
            marginTop: focusedInput === 'years' ? 4 : 8 
          }]}>
            <View style={[styles.inputContainer, { 
              marginTop: focusedInput === 'years' ? 8 : 12, 
              marginBottom: focusedInput === 'years' ? 8 : 16 
            }]}>
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
            <Text style={[styles.inputLabel, { 
              marginTop: 0, 
              marginBottom: focusedInput === 'years' ? 4 : 6 
            }]}>tahun *</Text>
            <Text style={[styles.requiredText, { 
              marginTop: focusedInput === 'years' ? 1 : 2 
            }]}>Wajib diisi</Text>
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
            <Text style={styles.hintText}>Pilih satu atau lebih *</Text>
            <Text style={styles.requiredText}>Wajib dipilih</Text>
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
                    {option === '0' ? '0 kali' : `${option} kali`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.requiredText}>Wajib dipilih</Text>
          </View>
        );
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
              {personalizedGreeting?.message || 'Anda telah mengambil langkah pertama menuju hidup yang lebih sehat.'}
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
                {loading ? 'Menyimpan...' : 'Mulai Perjalanan Sehat'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'cigarettes':
        return (
          <View style={[styles.stepContent, { 
            marginTop: focusedInput === 'cigarettes' ? 4 : 8 
          }]}>
            <View style={[styles.inputContainer, { 
              marginTop: focusedInput === 'cigarettes' ? 8 : 12, 
              marginBottom: focusedInput === 'cigarettes' ? 8 : 16 
            }]}>
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
            <Text style={[styles.inputLabel, { 
              marginTop: 0, 
              marginBottom: focusedInput === 'cigarettes' ? 4 : 6 
            }]}>batang per hari *</Text>
            <Text style={[styles.requiredText, { 
              marginTop: focusedInput === 'cigarettes' ? 1 : 2 
            }]}>Wajib diisi</Text>
          </View>
        );
      case 'price':
        return (
          <View style={[styles.stepContent, { 
            marginTop: focusedInput === 'price' ? 4 : 8 
          }]}>
            <View style={[styles.priceContainer, { 
              marginTop: focusedInput === 'price' ? 8 : 12, 
              marginBottom: focusedInput === 'price' ? 8 : 16 
            }]}>
              <Text style={styles.currencySymbol}>Rp</Text>
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
                  <Text style={styles.pricePlaceholderText}>25000</Text>
                )}
              </View>
            </View>
            <Text style={[styles.inputLabel, { 
              marginTop: 0, 
              marginBottom: focusedInput === 'price' ? 4 : 6 
            }]}>per bungkus *</Text>
            <Text style={[styles.requiredText, { 
              marginTop: focusedInput === 'price' ? 1 : 2 
            }]}>Wajib diisi</Text>
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
                    ? (loading ? 'Menyimpan...' : 'Mulai Perjalanan Sehat') 
                    : currentStep === steps.length - 2
                    ? 'Lihat Ringkasan'
                    : 'Lanjut'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
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
    marginBottom: SIZES.spacingXxl + 10,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 72,
    marginBottom: SIZES.spacingLg,
  },
  welcomeText: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: SIZES.spacingLg,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingMd,
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
    marginTop: SIZES.spacingSm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingSm,
  },
  placeholderText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.gray,
    opacity: 0.6,
    textAlign: 'center',
    pointerEvents: 'none',
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
  },
  priceInputContainer: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricePlaceholderText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.gray,
    opacity: 0.6,
    textAlign: 'center',
    pointerEvents: 'none',
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
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
    marginBottom: SIZES.spacingMd,
  },
  dateSubtext: {
    ...TYPOGRAPHY.bodyMediumWhite,
    opacity: 0.8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.spacingLg,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    minWidth: 120,
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    marginTop: SIZES.spacingLg,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SIZES.spacingSm,
  },
  priceInput: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 150,
    textAlign: 'center',
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
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