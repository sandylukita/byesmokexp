import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🚭</Text>
          <Text style={styles.title}>ByeSmoke AI</Text>
          <Text style={styles.subtitle}>Mulai Hidup Sehat Hari Ini</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Smart Experience • Gamified Journey</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: SIZES.lg,
  },
  title: {
    ...TYPOGRAPHY.h1White,
    marginBottom: SIZES.spacingSm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLargeWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.bodySmallWhite,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default SplashScreen;