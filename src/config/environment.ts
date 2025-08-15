import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

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
  const releaseChannel = Constants.expoConfig?.releaseChannel;
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

export default config;