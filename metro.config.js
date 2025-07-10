const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for expo-modules-core resolution issue
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-modules-core') {
    return {
      filePath: require.resolve('expo-modules-core'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Add Firebase module resolution
config.resolver.platforms = [...config.resolver.platforms, 'native', 'web'];
config.resolver.alias = {
  ...config.resolver.alias,
  'firebase/app': 'firebase/app',
  'firebase/auth': 'firebase/auth',
  'firebase/firestore': 'firebase/firestore',
  'firebase/storage': 'firebase/storage',
};

// Fix AsyncStorage mergeOptions issue
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

module.exports = config;