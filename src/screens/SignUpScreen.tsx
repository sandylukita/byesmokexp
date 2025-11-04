import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signUp, signInWithGoogle } from '../services/auth';
import { COLORS, SIZES } from '../utils/constants';
import SignUpStepOne from '../components/SignUpStepOneSimple';
import SignUpStepTwo from '../components/SignUpStepTwoSimple';
import SignUpStepThree from '../components/SignUpStepThreeSimple';
import SignUpSuccess from '../components/SignUpSuccess';
import ProgressBar from '../components/ProgressBar';
import { CustomConfirmDialog } from '../components/CustomConfirmDialog';
import { useTranslation } from '../hooks/useTranslation';

interface SignUpScreenProps {
  onSignUp: () => void;
  onLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onLogin }) => {
  const { language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalSteps = 4;

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      // The signUp function now handles all validation internally
      await signUp(email, password, confirmPassword, name);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(4); // Go to success step
    } catch (error: any) {
      setErrorMessage(
        error.message ||
          (language === 'en' ? 'Failed to create account' : 'Gagal membuat akun')
      );
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onSignUp();
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSignUp();
    } catch (error: any) {
      setErrorMessage(
        error.message ||
          (language === 'en' ? 'Google Sign-Up failed' : 'Pendaftaran Google gagal')
      );
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SignUpStepOne
            name={name}
            onNameChange={setName}
            onNext={handleNext}
            language={language}
          />
        );
      case 2:
        return (
          <SignUpStepTwo
            email={email}
            onEmailChange={setEmail}
            onNext={handleNext}
            onBack={handleBack}
            language={language}
          />
        );
      case 3:
        return (
          <SignUpStepThree
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onNext={handleSignUp}
            onBack={handleBack}
            loading={loading}
            language={language}
          />
        );
      case 4:
        return (
          <SignUpSuccess
            name={name}
            onContinue={handleSuccess}
          />
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
        {currentStep < 4 && (
          <ProgressBar currentStep={currentStep} totalSteps={3} />
        )}
        {currentStep === 1 && (
          <View style={styles.googleButtonContainer}>
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleSignUp}
              disabled={loading}
            >
              <MaterialIcons name="login" size={20} color={COLORS.textPrimary} style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>
                {language === 'en' ? 'Continue with Google' : 'Lanjutkan dengan Google'}
              </Text>
            </TouchableOpacity>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>
                {language === 'en' ? 'OR' : 'ATAU'}
              </Text>
              <View style={styles.divider} />
            </View>
          </View>
        )}
        {renderCurrentStep()}
        {currentStep === 1 && (
          <View style={styles.loginPrompt}>
            <TouchableOpacity onPress={onLogin} style={styles.loginPromptButton}>
              <Text style={styles.loginPromptText}>
                {language === 'en'
                  ? 'Already have an account? Sign in now'
                  : 'Sudah punya akun? Masuk sekarang'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <CustomConfirmDialog
          visible={showErrorDialog}
          title="Error"
          message={errorMessage}
          confirmText="OK"
          cancelText=""
          onConfirm={() => setShowErrorDialog(false)}
          onCancel={() => setShowErrorDialog(false)}
          type="danger"
          icon="error"
        />
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
  loginPrompt: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loginPromptButton: {
    padding: 12,
  },
  loginPromptText: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
  googleButtonContainer: {
    paddingHorizontal: SIZES.xl,
    marginTop: SIZES.lg,
  },
  googleButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  googleButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
    marginRight: SIZES.xs,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.white,
    opacity: 0.3,
  },
  dividerText: {
    color: COLORS.white,
    marginHorizontal: SIZES.sm,
    opacity: 0.7,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SignUpScreen;