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
import { log } from '../src/config/environment';

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
import ErrorBoundary from '../src/components/ErrorBoundary';

type AppState = 'splash' | 'login' | 'signup' | 'onboarding' | 'dashboard';

export default function Main() {
  log.debug('🔥🔥🔥 MAIN COMPONENT STARTED - App is starting (debug version)');
  
  // Debug function to check Firebase auth persistence
  const debugFirebaseAuth = async () => {
    try {
      const currentUser = auth.currentUser;
      log.debug('🔥 DEBUG: Firebase currentUser on startup:', {
        hasCurrentUser: !!currentUser,
        uid: currentUser?.uid,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified
      });
      
      // Also check AsyncStorage directly
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const keys = await AsyncStorage.default.getAllKeys();
      const firebaseKeys = keys.filter(key => key.includes('firebase') || key.includes('auth'));
      log.debug('🔥 DEBUG: Firebase-related AsyncStorage keys:', firebaseKeys);
      
      // Check if there are any auth tokens
      const authKeys = keys.filter(key => key.includes('authUser') || key.includes('token'));
      log.debug('🔥 DEBUG: Auth-related AsyncStorage keys:', authKeys);
    } catch (error) {
      log.debug('🔥 DEBUG: Error checking Firebase auth:', error);
    }
  };
  
  const navigationRef = useRef<any>(null);
  const [appState, _setAppState] = useState<AppState>(() => {
    const initialState: AppState = 'splash';
    log.debug('Main.tsx: Initial appState set to', initialState);
    return initialState;
  });

  // Initialize notification listeners, error tracking, and ads on app start
  useEffect(() => {
    NotificationService.initializeListeners();
    // errorTracker.initialize(); // Temporarily disabled error tracking

    // Defer AdMob initialization to improve initial load time
    // This prevents blocking the main thread during app startup
    const adInitTimer = setTimeout(() => {
      initializeAds(); // Initialize AdMob for rewarded video ads
    }, 2000); // Delay by 2 seconds to prioritize UI rendering

    return () => {
      NotificationService.removeListeners();
      clearTimeout(adInitTimer);
    };
  }, []);

  const setAppState = (newState: AppState) => {
    if (appState === newState) {
      console.log(`🎯 setAppState ignored: already in state ${newState}`);
      return;
    }
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
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    log.debug('🔥🔥🔥 MAIN USEEFFECT TRIGGERED - Setting up auth');
    
    // Debug Firebase auth state on startup
    debugFirebaseAuth();
    
    // Simplified auth initialization - just check demo users, let onAuthStateChanged handle Firebase
    const initializeAuth = async () => {
      try {
        log.debug('🔐 Checking demo users...');
        
        // Check demo user in storage first
        const restoredDemoUser = await demoRestoreUser();
        if (restoredDemoUser) {
          log.debug('🚀 FOUND: Demo user in storage, going to dashboard');
          setUser(restoredDemoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setSplashFinished(true);
          setAppState('dashboard');
          return;
        }
        
        // Check demo user in memory
        const memoryDemoUser = demoGetCurrentUser();
        if (memoryDemoUser) {
          log.debug('🚀 FOUND: Demo user in memory, going to dashboard');
          setUser(memoryDemoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setSplashFinished(true);
          setAppState('dashboard');
          return;
        }
        
        log.debug('🔐 No demo users found, waiting for Firebase auth state...');
        // Don't set any state here - let onAuthStateChanged handle Firebase users
        
      } catch (error) {
        log.error('❌ Error in auth initialization:', error);
        // Fallback to login on any error
        setAuthStateLoaded(true);
        setSplashFinished(true);
        setAppState('login');
      }
    };
    
    // Start auth initialization immediately
    initializeAuth();
    
    // Set up Firebase listener for auth state changes - this is the primary auth handler
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      log.debug('🔐 AUTH STATE CHANGE - User:', firebaseUser?.email || 'null');
      
      // Mark Firebase as initialized once the first auth state change fires
      if (!firebaseInitialized) {
        log.debug('🔥 Firebase auth initialized');
        setFirebaseInitialized(true);
      }
      
      if (firebaseUser) {
        log.debug('🔐 AUTH CHANGE: User logged in, checking onboarding');
        setUser(firebaseUser);
        setAuthStateLoaded(true);
        setSplashFinished(true);
        await handleDashboardNavigation(firebaseUser);
      } else {
        log.debug('🔐 AUTH CHANGE: User logged out, checking demo users');
        const demoUser = await demoRestoreUser() || demoGetCurrentUser();
        if (demoUser) {
          setUser(demoUser as unknown as FirebaseUser);
          setAuthStateLoaded(true);
          setSplashFinished(true);
          setAppState('dashboard');
        } else {
          setUser(null);
          setAuthStateLoaded(true);
          setSplashFinished(true);
          setAppState('login');
        }
      }
    });

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, []); // Remove dependencies to run once on mount
  
  // Handle onboarding check only when going to dashboard with a Firebase user
  const handleDashboardNavigation = async (firebaseUser: FirebaseUser) => {
    log.debug('🚀 Handling dashboard navigation for Firebase user:', firebaseUser.email);
    
    try {
      await checkOnboardingStatus(firebaseUser);
    } catch (error) {
      log.debug('📱 ❌ Onboarding check failed, defaulting to dashboard:', error instanceof Error ? error.message : String(error));
      setAppState('dashboard');
    }
  };

  const checkOnboardingStatus = async (firebaseUser: FirebaseUser) => {
    log.debug('🔍 Starting checkOnboardingStatus for user:', firebaseUser.email);
    
    // Add a maximum timeout for the entire function to prevent infinite hanging
    const functionTimeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('checkOnboardingStatus function timeout after 5 seconds'));
      }, 5000); // 5 second total timeout for faster loading
    });
    
    const checkOnboardingPromise = async (): Promise<void> => {
      try {
        // Check Firestore for actual onboarding completion status
        const { getUserDocument } = await import('../src/services/auth');
      
      // Retry logic for newly created users with timeout handling
      let userData = null;
      const maxRetries = 2;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 Attempting to get user document, attempt ${attempt}/${maxRetries}`);
        
        try {
          // Create a proper timeout promise that actually rejects
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Firebase request timeout after 2 seconds'));
            }, 2000); // Optimized for faster loading
          });
          
          const userDocPromise = getUserDocument(firebaseUser.uid);
          userData = await Promise.race([userDocPromise, timeoutPromise]);
          
          if (userData) {
            console.log(`✅ User document found for ${firebaseUser.email}`, userData.onboardingCompleted);
            log.debug('📊 User data details:', {
              onboardingCompleted: userData.onboardingCompleted,
              xp: userData.xp,
              streak: userData.streak,
              hasProgress: userData.xp > 0 || userData.streak > 0
            });
            break; // Exit loop on success
          }
        } catch (error) {
          console.log(`⚠️ Error getting user document (attempt ${attempt}/${maxRetries}):`, error instanceof Error ? error.message : String(error));
          
          // If this was the last attempt, we'll handle fallback outside the loop
          if (attempt < maxRetries) {
            log.debug('🔄 Retrying in 500ms...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Faster retry
          } else {
            log.debug('🚨 All attempts failed, proceeding with fallback logic');
          }
        }
      }
      
      log.debug('🔍 Checking onboarding status...');
      
      if (userData && userData.onboardingCompleted === false) {
        log.debug('📝 User has onboardingCompleted = false');
        // Check if this is an existing user with progress data
        const hasExistingProgress = userData.xp > 0 || userData.streak > 0 || 
                                   (userData.dailyXP && Object.keys(userData.dailyXP).length > 0) ||
                                   (userData.badges && userData.badges.length > 0);
        
        log.debug('🎯 Has existing progress:', hasExistingProgress);
        
        if (hasExistingProgress) {
          log.debug('✅ Existing user with progress, skipping onboarding and going to dashboard');
          // Auto-complete onboarding for existing users to prevent data loss
          const { updateUserDocument } = await import('../src/services/auth');
          try {
            await updateUserDocument(userData.id, { onboardingCompleted: true });
            log.debug('🚀 Setting app state to dashboard (existing user)');
            setAppState('dashboard');
          } catch (error) {
            log.error('Error auto-completing onboarding:', error);
            setNeedsOnboarding(true);
            setAppState('onboarding');
          }
        } else {
          log.debug('📋 New user, going to onboarding');
          setNeedsOnboarding(true);
          setAppState('onboarding');
        }
      } else if (userData && userData.onboardingCompleted === true) {
        log.debug('✅ User has completed onboarding, going to dashboard');
        log.debug('🚀 Setting app state to dashboard (completed onboarding)');
        setAppState('dashboard');
      } else {
        // No user document found after retries - proceed with reasonable defaults
        log.debug('🔄 No user document found after retries');
        
        // For Firebase users who can't load their document due to network issues,
        // default to dashboard instead of onboarding to avoid data loss
        log.debug('🔄 Firebase user but no document found - defaulting to dashboard (faster fallback)');
        setAppState('dashboard');
      }
    } catch (error) {
      log.error('❌ Error checking onboarding status (likely Firebase timeout):', error);
      
      // Aggressive fallback - if we have a Firebase user, just go to dashboard
      // This prevents users from getting stuck on splash screen
      if (firebaseUser) {
        log.debug('🔄 Firebase timeout - sending user directly to dashboard');
        setAuthStateLoaded(true);
        setAppState('dashboard');
      } else {
        log.debug('🔄 No Firebase user - going to login screen');
        setAuthStateLoaded(true);
        setAppState('login');
      }
    }
    };
    
    // Race between the main function and the timeout
    try {
      await Promise.race([checkOnboardingPromise(), functionTimeoutPromise]);
    } catch (timeoutError) {
      log.error('🚨 checkOnboardingStatus function timed out:', timeoutError instanceof Error ? timeoutError.message : String(timeoutError));
      // Aggressive timeout fallback - prioritize user experience over perfect data loading
      log.debug('🚀 TIMEOUT FALLBACK: Sending user to dashboard to prevent hanging');
      setAuthStateLoaded(true);
      setAppState('dashboard'); // Always go to dashboard on timeout to avoid user frustration
    }
  };

  const handleSplashFinish = () => {
    log.debug('🎬 Splash screen finished, but keeping splash visible until auth is ready');
    log.debug('🎬 Splash finish state:', {
      currentAuthStateLoaded: authStateLoaded,
      hasUser: !!user,
      currentAppState: appState
    });
    
    // Don't immediately set splash finished - wait for auth to be ready
    if (authStateLoaded) {
      log.debug('🎬 Auth already loaded, can proceed');
      setSplashFinished(true);
    } else {
      log.debug('🎬 Auth not ready, extending splash screen');
      // No timeout - let Firebase auth handle navigation completely
    }
  };

  const handleLogin = async () => {
    log.debug('🚀 handleLogin called - let Firebase auth state listener handle navigation');

    // Don't manually navigate - let the onAuthStateChanged listener handle it
    // This ensures user data is loaded before navigating to dashboard
    // The listener at line 141 will detect the auth state change and handle navigation properly
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
      log.debug('🔓 Logging out user...');
      
      // Clear demo user first
      await demoLogout();
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Reset all state
      setUser(null);
      setAuthStateLoaded(false);
      setNeedsOnboarding(false);
      setSplashFinished(false); // Reset splash to show loading during logout
      
      // Wait a moment then show splash briefly before login
      setTimeout(() => {
        setSplashFinished(true);
        setAuthStateLoaded(true);
        setAppState('login');
      }, 500);
      
      log.debug('✅ User logged out successfully');
    } catch (error) {
      log.error('Error signing out:', error);
      // Fallback - force to login screen
      setUser(null);
      setAppState('login');
    }
  };

  const renderCurrentScreen = () => {
    log.debug('🎯 MAIN.TSX: renderCurrentScreen called with appState:', appState);
    try {
      switch (appState) {
        case 'splash':
          log.debug('🎯 MAIN.TSX: Rendering SplashScreen');
          return <SplashScreen onFinish={handleSplashFinish} />;
        case 'login':
          log.debug('🎯 MAIN.TSX: Rendering LoginScreen');
          return (
            <LoginScreen
              onLogin={handleLogin}
              onSignUp={() => setAppState('signup')}
            />
          );
        case 'signup':
          log.debug('🎯 MAIN.TSX: Rendering SignUpScreen');
          return (
            <SignUpScreen
              onSignUp={handleSignUp}
              onLogin={() => setAppState('login')}
            />
          );
        case 'onboarding':
          log.debug('🎯 MAIN.TSX: Rendering OnboardingScreen');
          return <OnboardingScreen onComplete={handleOnboardingComplete} />;
        case 'dashboard':
          log.debug('🎯 MAIN.TSX: Rendering Dashboard with NavigationContainer');
          return (
            <NavigationContainer 
              ref={navigationRef}
              onReady={() => {
                log.debug('🧭 NavigationContainer is ready');
                if (navigationRef.current) {
                  setSubscriptionNavigation(navigationRef.current);
                }
              }}
            >
              <MainNavigator onLogout={handleLogout} />
            </NavigationContainer>
          );
        default:
          log.debug('⚠️ Unknown appState, falling back to splash:', appState);
          return <SplashScreen onFinish={handleSplashFinish} />;
      }
    } catch (error) {
      log.error('❌ Error rendering screen:', error);
      return (
        <View style={{ flex: 1, backgroundColor: '#F0EBE8', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#40302B', fontSize: 16 }}>Loading...</Text>
        </View>
      );
    }
  };

  const currentScreen = renderCurrentScreen();
  
  console.log('🎯🎯🎯 MAIN.TSX: About to render with appState:', appState, 'authStateLoaded:', authStateLoaded, 'user:', !!user);
  console.log('🎯🎯🎯 MAIN.TSX: Current screen type:', typeof currentScreen);
  console.log('🎯🎯🎯 MAIN.TSX: Current screen:', currentScreen?.type?.displayName || currentScreen?.type?.name || 'Unknown');

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaView style={styles.container} edges={[]}>
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: '#F0EBE8' }}>
            {currentScreen}
          </View>
        </SafeAreaView>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});