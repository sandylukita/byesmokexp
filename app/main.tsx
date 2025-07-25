import { StatusBar } from 'expo-status-bar';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../src/services/firebase';
import { NotificationService } from '../src/services/notificationService';

import AppNavigator from '../src/navigation/AppNavigator';
import LoginScreen from '../src/screens/LoginScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import SignUpScreen from '../src/screens/SignUpScreen';
import SplashScreen from '../src/screens/SplashScreen';
import { demoGetCurrentUser, demoLogout, demoRestoreUser } from '../src/services/demoAuth';
import { COLORS } from '../src/utils/constants';
import { ThemeProvider } from '../src/contexts/ThemeContext';

type AppState = 'splash' | 'login' | 'signup' | 'onboarding' | 'dashboard';

export default function Main() {
  const [appState, _setAppState] = useState<AppState>(() => {
    const initialState: AppState = 'splash';
    console.log('Main.tsx: Initial appState set to', initialState);
    return initialState;
  });

  // Initialize notification listeners on app start
  useEffect(() => {
    NotificationService.initializeListeners();
    
    return () => {
      NotificationService.removeListeners();
    };
  }, []);

  const setAppState = (newState: AppState) => {
    console.log(`Main.tsx: Changing appState from ${appState} to ${newState}`);
    _setAppState(newState);
  };
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [authStateLoaded, setAuthStateLoaded] = useState(false);

  useEffect(() => {
    // Only check for users after splash screen finishes
    if (!splashFinished) return;

    console.log('Main.tsx: Setting up auth state listener...');
    
    // Set up Firebase listener for real users
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Main.tsx: Auth state changed, user:', firebaseUser?.email || 'null');
      
      if (firebaseUser) {
        console.log('Main.tsx: Found Firebase user, navigating to dashboard/onboarding');
        setUser(firebaseUser);
        setAuthStateLoaded(true);
        // Check if user needs onboarding
        checkOnboardingStatus(firebaseUser);
        return;
      }
      
      // Only proceed to demo fallback if auth state is definitively null
      // and we haven't already loaded auth state
      if (!authStateLoaded) {
        console.log('Main.tsx: No Firebase user, checking demo users...');
        const restoredDemoUser = await demoRestoreUser();
        if (restoredDemoUser) {
          console.log('Main.tsx: Found demo user in storage, navigating to dashboard');
          setUser(restoredDemoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setAppState('dashboard');
          return;
        }

        const demoUser = demoGetCurrentUser();
        if (demoUser) {
          console.log('Main.tsx: Found demo user in memory, navigating to dashboard');
          setUser(demoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setAppState('dashboard');
          return;
        }

        // No users found, show login
        console.log('Main.tsx: No users found, showing login screen');
        setAuthStateLoaded(true);
        setAppState('login');
      }
    });

    // Clean up Firebase listener on unmount
    return unsubscribe;
  }, [splashFinished, authStateLoaded]);

  const checkOnboardingStatus = async (firebaseUser: FirebaseUser) => {
    try {
      // Check Firestore for actual onboarding completion status
      const { getUserDocument } = await import('../src/services/auth');
      const userData = await getUserDocument(firebaseUser.uid);
      
      if (userData && userData.onboardingCompleted === false) {
        setNeedsOnboarding(true);
        setAppState('onboarding');
      } else {
        setAppState('dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to dashboard if there's an error
      setAppState('dashboard');
    }
  };

  const handleSplashFinish = () => {
    setSplashFinished(true);
  };

  const handleLogin = () => {
    console.log('handleLogin called - forcing navigation to dashboard');
    setAppState('dashboard');
  };

  const handleSignUp = () => {
    // Auth state change will be handled by the listener
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    setAppState('dashboard');
  };

  const handleLogout = async () => {
    try {
      await demoLogout();
      await auth.signOut();
      setAuthStateLoaded(false);
      setAppState('login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case 'splash':
        return <SplashScreen onFinish={handleSplashFinish} />;
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onSignUp={() => setAppState('signup')}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onSignUp={handleSignUp}
            onLogin={() => setAppState('login')}
          />
        );
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        return <AppNavigator onLogout={handleLogout} />;
      default:
        return <SplashScreen onFinish={handleSplashFinish} />;
    }
  };

  return (
    <ThemeProvider>
      <SafeAreaView style={styles.container} edges={[]}>
        <StatusBar style="light" />
        {renderCurrentScreen()}
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});