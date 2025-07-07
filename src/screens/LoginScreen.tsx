import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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
import { signIn } from '../services/auth';
import { demoSignIn } from '../services/demoAuth';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface LoginScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Silakan isi email dan password');
      return;
    }

    console.log('Login attempt with:', email, password);
    setLoading(true);
    try {
      // Try demo authentication first for testing
      console.log('Trying demo authentication...');
      await demoSignIn(email, password);
      console.log('Demo authentication successful');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Calling onLogin callback');
      onLogin();
    } catch (error: any) {
      console.log('Demo auth failed:', error.message);
      // If demo auth fails, try Firebase auth
      try {
        console.log('Trying Firebase authentication...');
        await signIn(email, password);
        console.log('Firebase authentication successful');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        console.log('Calling onLogin callback');
        onLogin();
      } catch (firebaseError: any) {
        console.log('Firebase auth failed:', firebaseError.message);
        Alert.alert('Error', error.message || 'Gagal masuk');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    console.log('Test login button clicked');
    setEmail('admin@byerokok.app');
    setPassword('password123');
    console.log('Credentials set, calling handleLogin directly');
    
    // Call login directly without timeout
    try {
      console.log('Trying demo authentication directly...');
      await demoSignIn('admin@byerokok.app', 'password123');
      console.log('Demo authentication successful, calling onLogin');
      onLogin();
    } catch (error) {
      console.log('Demo auth failed:', error);
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.logo}>🚭</Text>
              <Text style={styles.title}>Selamat Datang</Text>
              <Text style={styles.subtitle}>Masuk ke akun ByeSmoke XP</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
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
                style={styles.testButton}
                onPress={handleTestLogin}
              >
                <Text style={styles.testButtonText}>Login Admin (Test)</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Belum punya akun? </Text>
                <TouchableOpacity onPress={() => {
                  console.log('LoginScreen: onSignUp called');
                  onSignUp();
                }}>
                  <Text style={styles.linkText}>Daftar sekarang</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  logo: {
    fontSize: 60,
    marginBottom: SIZES.spacingLg,
  },
  title: {
    ...TYPOGRAPHY.h1White,
    marginBottom: SIZES.spacingSm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLargeWhite,
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    marginTop: SIZES.xl,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius || 16,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    minHeight: SIZES.buttonHeight,
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.buttonRadius || 16,
    padding: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.md,
    minHeight: SIZES.buttonHeight,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  testButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: SIZES.buttonRadius || 16,
    padding: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.md,
    minHeight: SIZES.buttonHeight,
    justifyContent: 'center',
  },
  testButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.xl,
  },
  footerText: {
    ...TYPOGRAPHY.bodyMediumWhite,
  },
  linkText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;