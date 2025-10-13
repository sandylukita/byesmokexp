import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface SignUpSuccessProps {
  name: string;
  onContinue: () => void;
}

const SignUpSuccess: React.FC<SignUpSuccessProps> = ({
  name,
  onContinue,
}) => {
  const firstName = name.split(' ')[0];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        <Text style={styles.title}>
          Selamat, {firstName}!
        </Text>
        
        <Text style={styles.subtitle}>
          Akun Anda berhasil dibuat.{'\n'}
          Mari mulai perjalanan sehat Anda!
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>Raih pencapaian</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💪</Text>
            <Text style={styles.featureText}>Pantau kemajuan</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Capai target</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={onContinue}
        >
          <Text style={styles.buttonText}>
            Mulai Sekarang
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.welcomeText}>
          Selamat datang di ByeSmoke AI! 🚭
        </Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  successIcon: {
    fontSize: 60,
  },
  title: {
    ...TYPOGRAPHY.h1White,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLargeWhite,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: SIZES.xxl,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SIZES.sm,
    width: 32,
  },
  featureText: {
    ...TYPOGRAPHY.bodyMediumWhite,
    opacity: 0.9,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.buttonRadius,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xxl,
    alignItems: 'center',
    width: '100%',
    height: 52,
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontSize: SIZES.bodyMedium,
  },
  welcomeText: {
    ...TYPOGRAPHY.bodySmallWhite,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default SignUpSuccess;