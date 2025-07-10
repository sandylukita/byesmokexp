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
import { signUp } from '../services/auth';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface SignUpScreenProps {
  onSignUp: () => void;
  onLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onLogin }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Silakan isi semua field');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak sama');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, username);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Berhasil', 'Akun berhasil dibuat!', [
        { text: 'OK', onPress: onSignUp }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal membuat akun');
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
              <Text style={styles.title}>Bergabung</Text>
              <Text style={styles.subtitle}>Mulai perjalanan hidup sehat</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                placeholderTextColor={COLORS.gray}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.gray}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
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
                autoComplete="new-password"
              />
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi Password"
                placeholderTextColor={COLORS.gray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Membuat Akun...' : 'Daftar'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Sudah punya akun? </Text>
                <TouchableOpacity onPress={onLogin}>
                  <Text style={styles.linkText}>Masuk sekarang</Text>
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

export default SignUpScreen;