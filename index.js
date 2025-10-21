// CRITICAL: Disable red box BEFORE any imports
if (__DEV__) {
  // Completely disable LogBox/RedBox
  const { LogBox } = require('react-native');
  LogBox.ignoreAllLogs(true);

  // Override console methods
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    if (args[0]?.includes?.('Malformed calls from JS')) return;
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (args[0]?.includes?.('Malformed calls from JS')) return;
    originalError(...args);
  };
}

import { registerRootComponent } from 'expo';
import Main from './app/main';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Main);