import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';
import { translations, Language } from '../utils/translations';
import { detectDeviceLanguage } from '../utils/translations';

interface SplashScreenProps {
  onFinish: () => void;
  language?: Language;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, language }) => {
  // Detect language if not provided
  const currentLanguage = language || detectDeviceLanguage();
  const t = translations[currentLanguage];

  useEffect(() => {
    console.log('🎬 SplashScreen: Component mounted, starting timer...');
    const timer = setTimeout(() => {
      console.log('🎬 SplashScreen: Timer finished, calling onFinish()');
      onFinish();
    }, 500); // Shortened for debugging

    return () => {
      console.log('🎬 SplashScreen: Cleaning up timer');
      clearTimeout(timer);
    };
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>ByeSmoke AI</Text>
          <Text style={styles.subtitle}>{t.splash.subtitle}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.splash.footer}</Text>
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
    width: 100,
    height: 100,
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