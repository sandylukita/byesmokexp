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
    paddingHorizontal: SIZES.xl,
    maxWidth: 350,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  logo: {
    fontSize: 48,
    marginBottom: SIZES.sm,
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
    marginTop: SIZES.lg,
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
});

export default LoginScreen;