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
      
      // Retry logic for newly created users
      let userData = null;
      let retries = 3;
      
      while (retries > 0 && !userData) {
        userData = await getUserDocument(firebaseUser.uid);
        if (!userData) {
          console.log('User document not found, retrying...', retries);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          retries--;
        }
      }
      
      if (userData && userData.onboardingCompleted === false) {
        // Check if this is an existing user with progress data
        const hasExistingProgress = userData.xp > 0 || userData.streak > 0 || 
                                   (userData.dailyXP && Object.keys(userData.dailyXP).length > 0) ||
                                   (userData.badges && userData.badges.length > 0);
        
        if (hasExistingProgress) {
          console.log('Existing user with progress, skipping onboarding');
          // Auto-complete onboarding for existing users to prevent data loss
          const { updateUserDocument } = await import('../src/services/auth');
          try {
            await updateUserDocument(userData.id, { onboardingCompleted: true });
            setAppState('dashboard');
          } catch (error) {
            console.error('Error auto-completing onboarding:', error);
            setNeedsOnboarding(true);
            setAppState('onboarding');
          }
        } else {
          setNeedsOnboarding(true);
          setAppState('onboarding');
        }
      } else if (userData && userData.onboardingCompleted === true) {
        setAppState('dashboard');
      } else {
        // New user without document yet - go to onboarding
        console.log('No user document found after retries, going to onboarding');
        setNeedsOnboarding(true);
        setAppState('onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // For new users, if there's an error reading their document, go to onboarding
      setNeedsOnboarding(true);
      setAppState('onboarding');
    }
  };

  const handleSplashFinish = () => {
    setSplashFinished(true);
  };

  const handleLogin = async () => {
    console.log('handleLogin called - checking user onboarding status');
    // Let the auth state listener handle the navigation
    // Don't force navigation here, let checkOnboardingStatus decide
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