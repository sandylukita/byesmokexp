import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

// Secure environment configuration
export const ENV_CONFIG = {
  // Firebase configuration from environment variables
  FIREBASE: {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  
  // Gemini API configuration
  GEMINI: {
    apiKey: Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  },
  
  // AdMob configuration
  ADMOB: {
    interstitialAndroid: Constants.expoConfig?.extra?.adMobInterstitialAndroid || process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID,
    interstitialIOS: Constants.expoConfig?.extra?.adMobInterstitialIOS || process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS,
    rewardedAndroid: Constants.expoConfig?.extra?.adMobRewardedAndroid || process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
    rewardedIOS: Constants.expoConfig?.extra?.adMobRewardedIOS || process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
  },
};

// Security validation functions
export const isValidApiKey = (key: string | undefined): boolean => {
  return Boolean(key && key.length > 20 && !key.includes('your_') && !key.includes('xxxxxxxx'));
};

export const validateEnvironmentConfig = (): void => {
  const requiredKeys = [
    { path: 'FIREBASE.apiKey', value: ENV_CONFIG.FIREBASE.apiKey },
    { path: 'FIREBASE.authDomain', value: ENV_CONFIG.FIREBASE.authDomain },
    { path: 'FIREBASE.projectId', value: ENV_CONFIG.FIREBASE.projectId },
    { path: 'GEMINI.apiKey', value: ENV_CONFIG.GEMINI.apiKey }
  ];
  
  const missingKeys: string[] = [];
  const invalidKeys: string[] = [];
  
  requiredKeys.forEach(({ path, value }) => {
    if (!value) {
      missingKeys.push(path);
    } else if (path.includes('apiKey') && !isValidApiKey(value)) {
      invalidKeys.push(path);
    }
  });
  
  if (missingKeys.length > 0 || invalidKeys.length > 0) {
    const isDev = __DEV__;
    let message = '';
    
    if (missingKeys.length > 0) {
      message += `Missing: ${missingKeys.join(', ')}`;
    }
    if (invalidKeys.length > 0) {
      message += `${message ? '; ' : ''}Invalid: ${invalidKeys.join(', ')}`;
    }
    
    if (isDev) {
      console.warn('⚠️ Security Warning:', message);
      console.warn('📝 Please create .env file or configure app.config.js with required keys');
    } else {
      throw new Error(`Configuration Error: ${message}`);
    }
  }
};

interface Config {
  environment: Environment;
  apiUrl: string;
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  enableLogging: boolean;
  enableDemoMode: boolean;
  firebase: {
    enableAnalytics: boolean;
    enableCrashlytics: boolean;
  };
  features: {
    enableReferrals: boolean;
    enableNotifications: boolean;
    enableOfflineMode: boolean;
  };
}

const getEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  
  // Check if this is a staging build
  const releaseChannel = (Constants.expoConfig as any)?.releaseChannel;
  if (releaseChannel === 'staging') {
    return 'staging';
  }
  
  return 'production';
};

const developmentConfig: Config = {
  environment: 'development',
  apiUrl: 'http://localhost:3000',
  enableAnalytics: false, // Disabled in development
  enableErrorTracking: true, // Enabled for debugging
  enableLogging: true,
  enableDemoMode: true,
  firebase: {
    enableAnalytics: false,
    enableCrashlytics: false,
  },
  features: {
    enableReferrals: true,
    enableNotifications: true,
    enableOfflineMode: true,
  },
};

const stagingConfig: Config = {
  environment: 'staging',
  apiUrl: 'https://staging-api.byesmoke.ai',
  enableAnalytics: true,
  enableErrorTracking: true,
  enableLogging: true,
  enableDemoMode: true, // Allow demo for testing
  firebase: {
    enableAnalytics: true,
    enableCrashlytics: true,
  },
  features: {
    enableReferrals: true,
    enableNotifications: true,
    enableOfflineMode: true,
  },
};

const productionConfig: Config = {
  environment: 'production',
  apiUrl: 'https://api.byesmoke.ai',
  enableAnalytics: true,
  enableErrorTracking: true,
  enableLogging: false, // Disabled in production
  enableDemoMode: false, // Disabled in production
  firebase: {
    enableAnalytics: true,
    enableCrashlytics: true,
  },
  features: {
    enableReferrals: true,
    enableNotifications: true,
    enableOfflineMode: true,
  },
};

const getConfig = (): Config => {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'development':
      return developmentConfig;
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    default:
      return developmentConfig;
  }
};

export const config = getConfig();

// Convenience exports
export const isDevelopment = config.environment === 'development';
export const isStaging = config.environment === 'staging';
export const isProduction = config.environment === 'production';

// Feature flags
export const canUseAnalytics = config.enableAnalytics;
export const canUseErrorTracking = config.enableErrorTracking;
export const canUseDemoMode = config.enableDemoMode;
export const canUseLogging = config.enableLogging;

// Logging utility that respects environment
export const log = {
  debug: (...args: any[]) => {
    if (canUseLogging) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (canUseLogging) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (canUseLogging || !isProduction) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
};

// Security status logging for development
export const logSecurityStatus = (): void => {
  if (__DEV__) {
    const firebaseConfigured = isValidApiKey(ENV_CONFIG.FIREBASE.apiKey || '');
    const geminiConfigured = isValidApiKey(ENV_CONFIG.GEMINI.apiKey || '');
    
    console.log('🔐 Security Status:');
    console.log(`  Firebase API Key: ${firebaseConfigured ? '✅ Configured' : '❌ Missing/Invalid'}`);
    console.log(`  Gemini API Key: ${geminiConfigured ? '✅ Configured' : '❌ Missing/Invalid'}`);
    console.log(`  Environment: ${config.environment}`);
  }
};

// Initialize validation on import (development only)
if (__DEV__) {
  validateEnvironmentConfig();
  logSecurityStatus();
}

export default config;