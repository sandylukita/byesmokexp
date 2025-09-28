import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback, useMemo } from 'react';
import {
    Image,
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
import { signIn } from '../services/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { demoSignIn } from '../services/demoAuth';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';
import { debugLog } from '../utils/performanceOptimizer';

interface LoginScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  const showCustomAlert = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  }, []);

  const hideCustomAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

  // Memoize text input handlers to prevent re-creation on every render
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      showCustomAlert('Kesalahan', 'Silakan masukkan email Anda terlebih dahulu');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showCustomAlert(
        'Berhasil',
        'Email reset password telah dikirim ke ' + email + '. Silakan cek inbox atau folder spam Anda.',
        'success'
      );
    } catch (error: any) {
      let errorMessage = 'Gagal mengirim email reset password';

      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak ditemukan. Silakan periksa email Anda atau daftar akun baru.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
      }

      showCustomAlert('Kesalahan', errorMessage);
    }
  }, [email, showCustomAlert]);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      showCustomAlert('Kesalahan', 'Silakan isi email dan password');
      return;
    }

    debugLog.log('Login attempt for:', email);
    setLoading(true);
    try {
      // Try demo authentication first for testing
      debugLog.log('Trying demo authentication...');
      await demoSignIn(email, password);
      debugLog.log('Demo authentication successful');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      debugLog.log('Calling onLogin callback');
      onLogin();
    } catch (error: any) {
      debugLog.log('Demo auth failed:', error.message);
      // If demo auth fails, try Firebase auth
      try {
        debugLog.log('Trying Firebase authentication...');
        await signIn(email, password);
        debugLog.log('Firebase authentication successful');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        debugLog.log('Calling onLogin callback');
        onLogin();
      } catch (firebaseError: any) {
        debugLog.log('Firebase auth failed:', firebaseError.message);
        showCustomAlert('Kesalahan', firebaseError.message || 'Gagal masuk');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, showCustomAlert, onLogin]);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Image 
                source={require('../../assets/images/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit={true}>
                Selamat Datang
              </Text>
              <Text style={styles.subtitle}>Masuk ke akun ByeSmoke AI</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Masuk...' : 'Masuk'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Belum punya akun? </Text>
                <TouchableOpacity onPress={onSignUp}>
                  <Text style={styles.linkText}>Daftar sekarang</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onDismiss={hideCustomAlert}
      />
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
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
    justifyContent: 'center',
  },
  content: {
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.xl,
    maxWidth: 350,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: SIZES.sm,
  },
  title: {
    ...TYPOGRAPHY.h1White,
    fontSize: 28, // Reduced from 32 to fit better on iPhone
    lineHeight: 34, // Adjusted line height
    marginBottom: SIZES.spacingSm,
    textAlign: 'center' as const,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    marginTop: SIZES.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    marginBottom: SIZES.sm,
    fontSize: SIZES.bodyMedium,
    color: COLORS.textPrimary,
    height: 48,
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.buttonRadius,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    marginTop: SIZES.sm,
    height: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  footerText: {
    ...TYPOGRAPHY.bodyMediumWhite,
  },
  linkText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    fontWeight: '500',
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
});

export default LoginScreen;