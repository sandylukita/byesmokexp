import { StatusBar } from 'expo-status-bar';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { auth } from '../src/services/firebase';
import { NotificationService } from '../src/services/notificationService';
import { errorTracker } from '../src/services/errorTracking';
import { initializeAds } from '../src/services/adMob';

import MainNavigator from '../src/navigation/MainNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../src/screens/LoginScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import SignUpScreen from '../src/screens/SignUpScreen';
import SplashScreen from '../src/screens/SplashScreen';
import { demoGetCurrentUser, demoLogout, demoRestoreUser } from '../src/services/demoAuth';
import { setSubscriptionNavigation } from '../src/services/subscription';
import { COLORS } from '../src/utils/constants';
import { ThemeProvider } from '../src/contexts/ThemeContext';

type AppState = 'splash' | 'login' | 'signup' | 'onboarding' | 'dashboard';

export default function Main() {
  const navigationRef = useRef<any>(null);
  const [appState, _setAppState] = useState<AppState>(() => {
    const initialState: AppState = 'splash';
    console.log('Main.tsx: Initial appState set to', initialState);
    return initialState;
  });

  // Initialize notification listeners, error tracking, and ads on app start
  useEffect(() => {
    NotificationService.initializeListeners();
    // errorTracker.initialize(); // Temporarily disabled error tracking
    // initializeAds(); // Temporarily disabled AdMob
    
    return () => {
      NotificationService.removeListeners();
    };
  }, []);

  const setAppState = (newState: AppState) => {
    console.log(`🎯 setAppState called: ${appState} -> ${newState}`);
    _setAppState(newState);
    
    // Force re-render by updating a separate counter
    setForceRender(prev => prev + 1);
  };
  
  const [forceRender, setForceRender] = useState(0);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [authStateLoaded, setAuthStateLoaded] = useState(false);

  useEffect(() => {
    // Only check for users after splash screen finishes
    if (!splashFinished) {
      console.log('⏳ Splash not finished yet, skipping auth state listener setup');
      return;
    }

    console.log('🔐 Splash finished! Setting up auth state listener...');
    
    // Safety timeout to prevent infinite hanging
    const safetyTimeout = setTimeout(() => {
      console.log('⚠️ Safety timeout reached - forcing navigation to prevent infinite hang');
      setAuthStateLoaded(true);
      setAppState('login');
    }, 15000); // 15 second safety net
    
    // Set up Firebase listener for real users
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Main.tsx: Auth state changed, user:', firebaseUser?.email || 'null');
      
      if (firebaseUser) {
        console.log('Main.tsx: Found Firebase user, navigating to dashboard/onboarding');
        clearTimeout(safetyTimeout); // Clear safety timeout since auth succeeded
        setUser(firebaseUser);
        setAuthStateLoaded(true);
        // Check if user needs onboarding with timeout
        try {
          await checkOnboardingStatus(firebaseUser);
        } catch (onboardingError) {
          console.error('❌ Error in checkOnboardingStatus, defaulting to dashboard:', onboardingError);
          setAppState('dashboard');
        }
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

    // Clean up Firebase listener and safety timeout on unmount
    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [splashFinished, authStateLoaded]);

  const checkOnboardingStatus = async (firebaseUser: FirebaseUser) => {
    try {
      // Check Firestore for actual onboarding completion status
      const { getUserDocument } = await import('../src/services/auth');
      
      // Retry logic for newly created users with timeout handling
      let userData = null;
      let retries = 2; // Reduced retries for faster fallback
      
      while (retries > 0 && !userData) {
        console.log(`🔄 Attempting to get user document, retries left: ${retries}`);
        
        try {
          // Create a promise that times out after 3 seconds per attempt
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('getUserDocument timeout')), 3000);
          });
          
          const userDocPromise = getUserDocument(firebaseUser.uid);
          userData = await Promise.race([userDocPromise, timeoutPromise]);
          
          if (userData) {
            console.log(`✅ User document found for ${firebaseUser.email}`, userData.onboardingCompleted);
            console.log('📊 User data details:', {
              onboardingCompleted: userData.onboardingCompleted,
              xp: userData.xp,
              streak: userData.streak,
              hasProgress: userData.xp > 0 || userData.streak > 0
            });
          }
        } catch (timeoutError) {
          console.log(`⚠️ Timeout getting user document for ${firebaseUser.email}, retries left: ${retries-1}`);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Shorter wait between retries
          }
        }
      }
      
      console.log('🔍 Checking onboarding status...');
      
      if (userData && userData.onboardingCompleted === false) {
        console.log('📝 User has onboardingCompleted = false');
        // Check if this is an existing user with progress data
        const hasExistingProgress = userData.xp > 0 || userData.streak > 0 || 
                                   (userData.dailyXP && Object.keys(userData.dailyXP).length > 0) ||
                                   (userData.badges && userData.badges.length > 0);
        
        console.log('🎯 Has existing progress:', hasExistingProgress);
        
        if (hasExistingProgress) {
          console.log('✅ Existing user with progress, skipping onboarding and going to dashboard');
          // Auto-complete onboarding for existing users to prevent data loss
          const { updateUserDocument } = await import('../src/services/auth');
          try {
            await updateUserDocument(userData.id, { onboardingCompleted: true });
            console.log('🚀 Setting app state to dashboard (existing user)');
            setAppState('dashboard');
          } catch (error) {
            console.error('Error auto-completing onboarding:', error);
            setNeedsOnboarding(true);
            setAppState('onboarding');
          }
        } else {
          console.log('📋 New user, going to onboarding');
          setNeedsOnboarding(true);
          setAppState('onboarding');
        }
      } else if (userData && userData.onboardingCompleted === true) {
        console.log('✅ User has completed onboarding, going to dashboard');
        console.log('🚀 Setting app state to dashboard (completed onboarding)');
        setAppState('dashboard');
      } else {
        // No user document found after retries - check if we should fallback to demo
        console.log('🔄 No user document found after retries');
        console.log('🔄 Checking for demo user fallback due to Firebase connection issues...');
        
        // Try demo user as fallback when Firebase is unreachable
        const demoUser = demoGetCurrentUser();
        if (demoUser) {
          console.log('✅ Found demo user as fallback, navigating to dashboard');
          setUser(demoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setAppState('dashboard');
          return;
        }
        
        // If no demo user either, go to onboarding
        console.log('🔄 No demo user found, going to onboarding');
        setNeedsOnboarding(true);
        setAppState('onboarding');
      }
    } catch (error) {
      console.error('❌ Error checking onboarding status (likely Firebase timeout):', error);
      
      // Fallback to demo user when Firebase fails
      console.log('🔄 Firebase failed, attempting demo user fallback...');
      try {
        const demoUser = demoGetCurrentUser();
        if (demoUser) {
          console.log('✅ Successfully loaded demo user as Firebase fallback');
          setUser(demoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setAppState('dashboard');
          return;
        }
        
        // Try restoring demo user from storage
        const restoredDemoUser = await demoRestoreUser();
        if (restoredDemoUser) {
          console.log('✅ Successfully restored demo user from storage');
          setUser(restoredDemoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setAppState('dashboard');
          return;
        }
      } catch (demoError) {
        console.error('❌ Demo user fallback also failed:', demoError);
      }
      
      // Final fallback - go to login
      console.log('🔄 All fallbacks failed, going to login screen');
      setAuthStateLoaded(true);
      setAppState('login');
    }
  };

  const handleSplashFinish = () => {
    console.log('🎬 Splash screen finished, setting splashFinished to true');
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
    try {
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
          return (
            <NavigationContainer 
              ref={navigationRef}
              onReady={() => {
                console.log('🧭 NavigationContainer is ready');
                if (navigationRef.current) {
                  setSubscriptionNavigation(navigationRef.current);
                }
              }}
            >
              <MainNavigator onLogout={handleLogout} />
            </NavigationContainer>
          );
        default:
          console.log('⚠️ Unknown appState, falling back to splash:', appState);
          return <SplashScreen onFinish={handleSplashFinish} />;
      }
    } catch (error) {
      console.error('❌ Error rendering screen:', error);
      return <SplashScreen onFinish={handleSplashFinish} />;
    }
  };

  const currentScreen = renderCurrentScreen();

  return (
    <ThemeProvider>
      <SafeAreaView style={styles.container} edges={[]}>
        <StatusBar style="light" />
        {currentScreen}
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