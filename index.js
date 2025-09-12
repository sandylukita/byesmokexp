import { registerRootComponent } from 'expo';
import Main from './app/main';

console.log('🔥🔥🔥 INDEX.JS: Starting app registration');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Main);

console.log('🔥🔥🔥 INDEX.JS: App registration complete');