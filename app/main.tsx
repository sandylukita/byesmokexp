import { StatusBar } from 'expo-status-bar';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { auth } from '../src/services/firebase';

import AppNavigator from '../src/navigation/AppNavigator';
import LoginScreen from '../src/screens/LoginScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import SignUpScreen from '../src/screens/SignUpScreen';
import SplashScreen from '../src/screens/SplashScreen';
import { demoGetCurrentUser, demoLogout, demoRestoreUser } from '../src/services/demoAuth';
import { COLORS } from '../src/utils/constants';

type AppState = 'splash' | 'login' | 'signup' | 'onboarding' | 'dashboard';

export default function Main() {
  const [appState, _setAppState] = useState<AppState>(() => {
    const initialState: AppState = 'splash';
    console.log('Main.tsx: Initial appState set to', initialState);
    return initialState;
  });

  const setAppState = (newState: AppState) => {
    console.log(`Main.tsx: Changing appState from ${appState} to ${newState}`);
    _setAppState(newState);
  };
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Only check for users after splash screen finishes
    if (!splashFinished) return;

    // Check Firebase authentication first for real users
    (async () => {
      console.log('Main.tsx: Attempting to restore user on app start...');
      
      // First, set up Firebase listener for real users
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          console.log('Main.tsx: Found Firebase user, navigating to dashboard/onboarding');
          setUser(firebaseUser);
          // Check if user needs onboarding
          checkOnboardingStatus(firebaseUser);
          return;
        }
        
        // If no Firebase user, fallback to demo users for development/testing
        console.log('Main.tsx: No Firebase user, checking demo users...');
        const restoredDemoUser = await demoRestoreUser();
        if (restoredDemoUser) {
          console.log('Main.tsx: Found demo user in storage, navigating to dashboard');
          setUser(restoredDemoUser as unknown as FirebaseUser);
          setAppState('dashboard');
          return;
        }

        const demoUser = demoGetCurrentUser();
        if (demoUser) {
          console.log('Main.tsx: Found demo user in memory, navigating to dashboard');
          setUser(demoUser as unknown as FirebaseUser);
          setAppState('dashboard');
          return;
        }

        // No users found, show login
        console.log('Main.tsx: No users found, showing login screen');
        setAppState('login');
      });

      // Clean up Firebase listener on unmount
      return unsubscribe;
    })();
  }, [splashFinished]);

  const checkOnboardingStatus = async (firebaseUser: FirebaseUser) => {
    try {
      // In a real app, you'd check Firestore for user data
      // For now, we'll assume new users need onboarding
      const userCreationTime = new Date(firebaseUser.metadata.creationTime || '');
      const now = new Date();
      const timeDiff = now.getTime() - userCreationTime.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      // If account was created less than 1 hour ago, show onboarding
      if (hoursDiff < 1) {
        setNeedsOnboarding(true);
        setAppState('onboarding');
      } else {
        setAppState('dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
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
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});