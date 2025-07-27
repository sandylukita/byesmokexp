import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomAlert } from '../components/CustomAlert';
import { demoGetCurrentUser, demoRestoreUser, demoUpdateUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { upgradeUserToPremium } from '../services/auth';
import { generateAIMotivation, generateAIMilestoneInsight } from '../services/gemini';

import { BentoCard, BentoGrid } from '../components/BentoGrid';
import { Mission, User } from '../types';
import { COLORS, DARK_COLORS, SIZES, STATIC_MISSIONS } from '../utils/constants';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../utils/translations';
import { completeMission, checkAndAwardBadges } from '../services/gamification';
import { useTheme } from '../contexts/ThemeContext';
import {
    calculateDaysSinceQuit,
    calculateLevel,
    calculateMoneySaved,
    calculateStreak,
    canCheckInToday,
    formatCurrency,
    formatNumber,
    generateMissionId,
    getGreeting,
    getRandomMotivation,
    getDailyMotivation,
    needsNewDailyMotivation,
    getMotivationContent,
    shouldTriggerAIInsight,
    updateAICallCounter,
    addDailyXP,
} from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';

const { width, height } = Dimensions.get('window');

interface DashboardScreenProps {
  onLogout: () => void;
}


const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [isLocallyUpdating, setIsLocallyUpdating] = useState(false);
  const [dailyMotivation, setDailyMotivation] = useState<string>('');
  const missionInitRef = useRef<string>(''); // Track last initialized user+date
  const { t, language, translate } = useTranslation();
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });
  const { colors, updateUser } = useTheme();

  const showCustomAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  // Cache daily motivation for premium users
  const cacheDailyMotivation = async (user: User, motivation: string) => {
    if (!user.isPremium) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // Update local state immediately
      setDailyMotivation(motivation);
      
      // Update user object
      const updatedUser = {
        ...user,
        lastMotivationDate: today,
        dailyMotivation: motivation
      };
      
      // Update Firebase if it's a real user
      if (auth.currentUser) {
        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, {
          lastMotivationDate: today,
          dailyMotivation: motivation
        });
        console.log('✅ Daily motivation cached to Firebase');
      } else {
        // Update demo user
        await demoUpdateUser(user.id, {
          lastMotivationDate: today,
          dailyMotivation: motivation
        });
        console.log('✅ Daily motivation cached for demo user');
      }
      
      // Update context user
      updateUser(updatedUser);
    } catch (error) {
      console.error('Error caching daily motivation:', error);
    }
  };

  // Set up Firebase Auth state listener to handle session restoration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser?.email || 'no user');
      
      if (firebaseUser) {
        // Firebase user is authenticated, load their data
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            console.log('✅ Firebase user data loaded from auth state change:', userData.email);
            console.log('  - Completed missions count:', userData.completedMissions?.length || 0);
            console.log('  - Completed missions:', userData.completedMissions?.map(m => ({ id: m.id, completedAt: m.completedAt })) || []);
            setUser(userData);
            updateUser(userData);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading Firebase user data:', error);
        }
      }
      
      // No Firebase user or error loading, try demo user
      await loadUserData();
    });
    
    // Timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Set up real-time listener for Firebase user data
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      console.log('Setting up real-time listener for Firebase user data...');
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        // Check if user is still authenticated before processing
        if (auth.currentUser && doc.exists()) {
          const userData = { id: firebaseUser.uid, ...doc.data() } as User;
          console.log('Real-time update received for user data:', {
            email: userData.email,
            xp: userData.xp,
            totalDays: userData.totalDays,
            streak: userData.streak,
            isLocallyUpdating
          });
          
          // Only update if the data is actually newer (higher XP or different lastCheckIn)
          setUser(currentUser => {
            if (!currentUser) return userData;
            
            // Don't update if we're locally updating or if the incoming data seems stale
            if (isLocallyUpdating) {
              console.log('Ignoring real-time update during local update');
              return currentUser;
            }
            
            // If incoming XP is lower than current, it might be stale data
            if (userData.xp < currentUser.xp) {
              console.log('Ignoring stale XP data from Firebase:', userData.xp, 'vs current:', currentUser.xp);
              return currentUser;
            }
            
            // If XP is the same but lastCheckIn is older, it might be stale
            if (userData.xp === currentUser.xp && userData.lastCheckIn && currentUser.lastCheckIn) {
              const incomingCheckIn = new Date(userData.lastCheckIn);
              const currentCheckIn = new Date(currentUser.lastCheckIn);
              if (incomingCheckIn < currentCheckIn) {
                console.log('Ignoring stale check-in data from Firebase');
                return currentUser;
              }
            }
            
            console.log('Accepting Firebase update');
            return userData;
          });
        }
      }, (error) => {
        // Only log error if user is still authenticated
        if (auth.currentUser) {
          console.error('Error in real-time listener:', error);
        }
      });
      
      return () => {
        console.log('Cleaning up real-time listener');
        unsubscribe();
      };
    }
  }, [auth.currentUser]);

  // Auto-sync totalDays and migrate longestStreak for existing users
  useEffect(() => {
    if (user) {
      const calculatedDays = calculateDaysSinceQuit(new Date(user.quitDate));
      const needsMigration = user.longestStreak === undefined;
      const needsTotalDaysSync = calculatedDays > user.totalDays + 1;
      
      if (needsMigration || needsTotalDaysSync) {
        const updates: Partial<User> = {};
        
        if (needsTotalDaysSync) {
          updates.totalDays = calculatedDays;
        }
        
        if (needsMigration) {
          // Initialize longestStreak with current streak value for existing users
          updates.longestStreak = user.streak || 0;
          console.log('Migrating longestStreak for existing user:', user.email, 'streak:', user.streak);
        }
        
        const demoUser = demoGetCurrentUser();
        if (demoUser && demoUser.id === user.id) {
          demoUpdateUser(user.id, updates);
        } else {
          // For Firebase users, update immediately for migration
          if (needsMigration) {
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
              updateDoc(doc(db, 'users', user.id), updates).catch(console.error);
            }
          }
        }
        
        setUser({ ...user, ...updates });
      }
    }
  }, [user?.quitDate, user?.totalDays, user?.longestStreak]);

  // Initialize mission completion state when user data is loaded
  useEffect(() => {
    if (user && user.completedMissions !== undefined && !loading && user.id) {
      const initializeMissionState = async () => {
        const today = new Date().toDateString();
        const initKey = `${user.id}-${today}`;
        
        // Skip if already initialized for this user+date
        if (missionInitRef.current === initKey) {
          console.log('🔄 Skipping mission init - already done for:', initKey);
          return;
        }
        
        // Add a small delay to ensure Firebase data is fully synchronized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const lastResetDate = await AsyncStorage.getItem('lastMissionReset');
          
          // Always load today's completed missions from persistent storage
          console.log('🔄 Mission state initialization (after login):');
          console.log('  - User ID:', user.id);
          console.log('  - User email:', user.email);
          console.log('  - User isPremium:', user.isPremium);
          console.log('  - Today:', today);
          console.log('  - Total completed missions:', user.completedMissions?.length || 0);
          console.log('  - Loading state:', loading);
          console.log('  - Last reset date:', lastResetDate);
          
          // Debug each mission's date
          const allMissions = user.completedMissions || [];
          console.log('  - All completed missions with dates:');
          allMissions.forEach((m, index) => {
            const missionDate = m.completedAt ? new Date(m.completedAt).toDateString() : 'null';
            const isToday = missionDate === today;
            console.log(`    ${index}: ${m.id} - ${missionDate} - isToday: ${isToday}`);
          });
          
          console.log('  - Raw completedMissions data:', JSON.stringify(user.completedMissions, null, 2));
          
          const todayCompletedMissions = allMissions
            .filter(m => {
              if (!m.completedAt) return false;
              
              // Handle both Firebase Timestamp and regular Date objects
              let completedDate;
              if (m.completedAt && typeof m.completedAt.toDate === 'function') {
                // Firebase Timestamp
                completedDate = m.completedAt.toDate();
              } else {
                // Regular Date or string
                completedDate = new Date(m.completedAt);
              }
              
              const isToday = completedDate.toDateString() === today;
              console.log(`  - Mission ${m.id}: ${completedDate.toDateString()} === ${today} ? ${isToday}`);
              return isToday;
            })
            .map(m => m.id);
          
          console.log('  - Today completed missions:', todayCompletedMissions);
          
          setCompletedMissions(todayCompletedMissions);
          console.log('  - ✅ Set completed missions state to:', todayCompletedMissions);
          
          // Update the reset date if needed
          if (lastResetDate !== today) {
            await AsyncStorage.setItem('lastMissionReset', today);
            console.log('  - Updated reset date to:', today);
          }
          
          // Mark this initialization as complete
          missionInitRef.current = initKey;
          console.log('  - ✅ Mission state initialization complete for:', initKey);
        } catch (error) {
          console.error('Error initializing mission state:', error);
        }
      };
      
      initializeMissionState();
    }
  }, [user?.id, loading, user?.completedMissions]); // Also trigger when completedMissions is loaded
  
  // Reset initialization tracking when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      missionInitRef.current = '';
      setCompletedMissions([]);
      console.log('🔄 Reset mission state - user logged out');
    }
  }, [user]);


  // Handle hybrid motivation system (contextual + AI insights)
  useEffect(() => {
    if (user) {
      const handleHybridMotivation = async () => {
        const motivationData = getMotivationContent(user);
        
        if (motivationData.shouldUseAI) {
          console.log(`🤖 AI insight triggered: ${motivationData.triggerType}`);
          try {
            // Call AI for milestone or streak recovery insight
            const aiTrigger = shouldTriggerAIInsight(user);
            const aiInsight = await generateAIMilestoneInsight(user, aiTrigger.triggerType, aiTrigger.triggerData);
            
            // Update AI call counter and cache insight
            const counterUpdate = updateAICallCounter(user);
            const updatedUser = {
              ...user,
              ...counterUpdate,
              lastAIInsight: aiInsight
            };
            
            // Save to database
            try {
              if (auth.currentUser) {
                const userDoc = doc(db, 'users', user.id);
                await updateDoc(userDoc, {
                  ...counterUpdate,
                  lastAIInsight: aiInsight
                });
                console.log('✅ AI insight cached to Firebase');
              } else {
                await demoUpdateUser(user.id, {
                  ...counterUpdate,
                  lastAIInsight: aiInsight
                });
                console.log('✅ AI insight cached for demo user');
              }
            } catch (error) {
              console.error('Error saving AI insight:', error);
            }
            
            setDailyMotivation(aiInsight);
            updateUser(updatedUser);
            console.log(`✅ AI insight generated for ${motivationData.triggerType}`);
            
          } catch (error) {
            console.error('Error generating AI insight:', error);
            // Fallback to contextual quote
            const fallbackContent = getDailyMotivation(user, language as Language);
            setDailyMotivation(fallbackContent);
          }
        } else {
          // Use existing content (cached AI or contextual quotes)
          setDailyMotivation(motivationData.content);
          if (motivationData.isAIGenerated) {
            console.log('✅ Using cached AI insight');
          } else {
            console.log('✅ Using contextual motivation');
          }
        }
      };
      
      handleHybridMotivation();
    }
  }, [user?.id, user?.isPremium, user?.totalDays, user?.streak, user?.lastAICallDate]);

  const loadUserData = async () => {
    console.log('Starting loadUserData...');
    try {
      // First priority: Check Firebase authentication for real users
      console.log('Checking Firebase auth first...');
      try {
        const currentUser = auth.currentUser;
        console.log('Firebase currentUser:', currentUser?.email);
        
        if (currentUser) {
          console.log('Getting user doc from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = { id: currentUser.uid, ...userDoc.data() } as User;
            console.log('Firebase user data loaded:', userData.email);
            setUser(userData);
            updateUser(userData);
            setLoading(false);
            return;
          } else {
            console.log('User doc does not exist in Firestore');
          }
        } else {
          console.log('No current user in Firebase auth');
        }
      } catch (firebaseError) {
        console.error('Firebase error, falling back to demo:', firebaseError);
        // Continue to demo fallback
      }

      // Fallback to demo data for development/testing
      console.log('No Firebase user, checking for demo user in memory...');
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        console.log('Demo user found in memory:', demoUser.email);
        setUser(demoUser);
        updateUser(demoUser);
        setLoading(false);
        return;
      }
      
      // Try to restore demo user from storage as last resort
      console.log('Attempting to restore demo user from storage...');
      const restoredUser = await demoRestoreUser();
      if (restoredUser) {
        console.log('Demo user restored from storage:', restoredUser.email);
        setUser(restoredUser);
        updateUser(restoredUser);
        setLoading(false);
        return;
      }

      console.log('No user found in any data source');
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try logging in again.');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    if (!user || !canCheckInToday(user.lastCheckIn)) {
      Alert.alert('Info', t.dashboard.checkedIn + '!');
      return;
    }

    setCheckingIn(true);
    setIsLocallyUpdating(true);
    try {
      const streakInfo = calculateStreak(user.lastCheckIn);
      const newStreak = streakInfo.streakReset ? 1 : user.streak + 1;
      const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);
      const newTotalDays = calculateDaysSinceQuit(new Date(user.quitDate));
      const checkInXP = 10; // Base XP for check-in
      const newXP = user.xp + checkInXP;
      const updatedDailyXP = addDailyXP(user.dailyXP, checkInXP);
      
      const updates = {
        lastCheckIn: new Date(),
        streak: newStreak,
        longestStreak: newLongestStreak,
        totalDays: newTotalDays,
        xp: newXP,
        dailyXP: updatedDailyXP,
      };

      // Try Firebase update first for real users
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          const userDoc = doc(db, 'users', user.id);
          await updateDoc(userDoc, {
            lastCheckIn: new Date().toISOString(),
            streak: newStreak,
            longestStreak: newLongestStreak,
            totalDays: newTotalDays,
            xp: newXP,
            dailyXP: updatedDailyXP,
          });
          console.log('✓ Firebase: Check-in data updated successfully');
        } catch (firebaseError) {
          console.error('Firebase error during check-in, trying demo fallback:', firebaseError);
          
          // Fallback to demo update if Firebase fails
          const demoUser = demoGetCurrentUser();
          if (demoUser) {
            await demoUpdateUser(user.id, updates);
            console.log('✓ Demo: Check-in data updated as fallback');
          } else {
            throw firebaseError; // Re-throw if no fallback available
          }
        }
      } else {
        // Fallback to demo update for development/testing
        const demoUser = demoGetCurrentUser();
        if (demoUser) {
          await demoUpdateUser(user.id, updates);
          console.log('✓ Demo: Check-in data updated (development mode)');
        }
      }

      const updatedUser = {
        ...user,
        ...updates,
      };
      
      // Update local state immediately to prevent UI flicker
      setUser(updatedUser);
      
      // Check for new badges after check-in
      try {
        const newBadges = await checkAndAwardBadges(user.id, updatedUser);
        if (newBadges.length > 0) {
          updatedUser.badges = [...user.badges, ...newBadges];
          
          // Update badges in Firebase for Firebase users, demo for others
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            // Firebase users are already updated by checkAndAwardBadges
            console.log('New badges awarded to Firebase user:', newBadges.length);
          } else {
            // Update demo user in-memory data with new badges
            const demoUser = demoGetCurrentUser();
            if (demoUser && demoUser.id === user.id) {
              await demoUpdateUser(user.id, {
                badges: updatedUser.badges,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking badges:', error);
      }

      // Update user again if badges were added
      if (updatedUser.badges.length > user.badges.length) {
        setUser(updatedUser);
      }

      // Mark check-in mission as completed and record it permanently
      if (!completedMissions.includes('daily-checkin')) {
        setCompletedMissions(prev => [...prev, 'daily-checkin']);
        
        // Find the daily check-in mission and complete it
        const checkInMission = generateDailyMissions().find(m => m.id === 'daily-checkin');
        if (checkInMission) {
          try {
            const firebaseUser = auth.currentUser;
            
            if (firebaseUser) {
              // Handle Firebase user check-in mission
              const result = await completeMission(user.id, checkInMission, updatedUser);
              if (result.success) {
                // Update user with completed mission
                updatedUser.completedMissions = [...(updatedUser.completedMissions || []), {
                  ...checkInMission,
                  isCompleted: true,
                  completedAt: new Date(),
                }];
                if (result.newBadges.length > 0) {
                  updatedUser.badges = [...updatedUser.badges, ...result.newBadges];
                }
                setUser(updatedUser);
              }
            } else {
              // Handle demo user check-in mission
              const demoUser = demoGetCurrentUser();
              if (demoUser && demoUser.id === user.id) {
                const completedMission = {
                  ...checkInMission,
                  isCompleted: true,
                  completedAt: new Date(),
                };
                
                updatedUser.completedMissions = [...(updatedUser.completedMissions || []), completedMission];
                
                // Update demo user with completed mission
                await demoUpdateUser(user.id, {
                  completedMissions: updatedUser.completedMissions,
                });
                
                setUser(updatedUser);
              }
            }
          } catch (error) {
            console.error('Error recording check-in mission:', error);
          }
        }
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Show success message with badge notification if any
      let message = `${t.dashboard.checkInSuccess} +10 XP\n${t.dashboard.streak}: ${newStreak} ${t.dashboard.daysSinceQuit.split(' ')[0]}`;
      if (updatedUser.badges.length > user.badges.length) {
        const newBadgesCount = updatedUser.badges.length - user.badges.length;
        message += `\n🏆 ${t.dashboard.newBadges}: ${newBadgesCount}`;
      }
      
      // Optional: Show daily XP info for development
      // const today = new Date();
      // const todayKey = today.getFullYear() + '-' + 
      //                 String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      //                 String(today.getDate()).padStart(2, '0');
      // const todayXP = updatedUser.dailyXP?.[todayKey] || 0;
      // message += `\nDebug: Daily XP today: ${todayXP}`;
      
      Alert.alert(
        t.dashboard.checkInSuccess, 
        message, 
        [{ text: 'OK', style: 'default' }],
        { 
          cancelable: true,
          userInterfaceStyle: colors === DARK_COLORS ? 'dark' : 'light'
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal melakukan check-in');
    } finally {
      setCheckingIn(false);
      // Reset the local updating flag after a short delay to allow Firebase to sync
      setTimeout(() => {
        setIsLocallyUpdating(false);
      }, 2000);
    }
  };

  // Helper function to get localized mission data
  const getLocalizedMission = (missionId: string) => {
    const missionTranslations = {
      'daily-checkin': {
        title: t.missions.checkInDaily,
        description: t.missions.checkInDailyDesc,
      },
      'drink-water': {
        title: t.missions.drinkWater,
        description: t.missions.drinkWaterDesc,
      },
      'exercise': {
        title: t.missions.exercise,
        description: t.missions.exerciseDesc,
      },
      'meditation': {
        title: t.missions.meditation,
        description: t.missions.meditationDesc,
      },
      'healthy-snack': {
        title: t.missions.healthySnack,
        description: t.missions.healthySnackDesc,
      },
    };

    return missionTranslations[missionId as keyof typeof missionTranslations] || {
      title: missionId,
      description: missionId,
    };
  };

  const generateDailyMissions = (): Mission[] => {
    // Create a date-based seed for consistent daily randomization
    const today = new Date();
    const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    
    // Simple seeded random function based on date
    const seedRandom = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    // Always include daily check-in as first mission
    const checkInMission = STATIC_MISSIONS[0]; // daily-checkin is always first
    
    // Get other missions (excluding daily check-in)
    const otherMissions = STATIC_MISSIONS.slice(1);
    
    // Number of additional missions based on premium status
    const additionalMissionsCount = user?.isPremium ? 3 : 0;
    
    // Shuffle other missions based on today's date seed
    const seed = seedRandom(dateString + (user?.id || 'demo'));
    const shuffledMissions = [...otherMissions];
    
    // Fisher-Yates shuffle with seeded random
    for (let i = shuffledMissions.length - 1; i > 0; i--) {
      const j = Math.floor(((seed + i) % 1000) / 1000 * (i + 1));
      [shuffledMissions[i], shuffledMissions[j]] = [shuffledMissions[j], shuffledMissions[i]];
    }
    
    // Combine check-in mission with randomly selected additional missions
    const selectedMissions = [checkInMission, ...shuffledMissions.slice(0, additionalMissionsCount)];
    
    // Debug logging
    console.log('🎲 Daily missions randomization:', {
      dateString,
      seed,
      isPremium: user?.isPremium,
      totalMissions: selectedMissions.length,
      missionIds: selectedMissions.map(m => m.id)
    });
    
    const hasCheckedInToday = !canCheckInToday(user?.lastCheckIn);
    
    return selectedMissions.map(mission => {
      let isCompleted = false;
      let completedAt = null;
      
      if (mission.id === 'daily-checkin') {
        isCompleted = hasCheckedInToday;
        completedAt = hasCheckedInToday ? user?.lastCheckIn || new Date() : null;
      } else {
        // Check if mission was completed today from stored user data
        const today = new Date().toDateString();
        const todayCompletion = user?.completedMissions?.find(
          m => {
            if (m.id !== mission.id || !m.completedAt) return false;
            
            // Handle both Firebase Timestamp and regular Date objects
            let completedDate;
            if (m.completedAt && typeof m.completedAt.toDate === 'function') {
              // Firebase Timestamp
              completedDate = m.completedAt.toDate();
            } else {
              // Regular Date or string
              completedDate = new Date(m.completedAt);
            }
            
            return completedDate.toDateString() === today;
          }
        );
        
        // Prioritize persistent data over local state for accuracy
        // If there's a persistent completion for today, use that; otherwise check local state
        isCompleted = todayCompletion ? true : completedMissions.includes(mission.id);
        completedAt = todayCompletion?.completedAt || (completedMissions.includes(mission.id) ? new Date() : null);
        
        // DEBUG: Log mission completion check
        console.log(`Mission ${mission.id} check:`, {
          todayCompletion: !!todayCompletion,
          inLocalState: completedMissions.includes(mission.id),
          finalIsCompleted: isCompleted
        });
      }
      
      const localizedMission = getLocalizedMission(mission.id);
      
      return {
        ...mission,
        id: mission.id,
        title: localizedMission.title,
        description: localizedMission.description,
        isCompleted,
        completedAt,
        isAIGenerated: false,
      };
    });
  };

  const handleMissionToggle = async (mission: Mission) => {
    console.log('🎯 Mission toggle:', mission.id, mission.isCompleted ? 'unchecking' : 'checking');
    
    if (mission.id === 'daily-checkin') {
      // If it's the daily check-in mission, trigger the check-in process
      await handleCheckIn();
    } else {
      // For other missions, toggle completion status
      if (mission.isCompleted) {
        console.log('  - Unchecking mission:', mission.id);
        setCompletedMissions(prev => prev.filter(id => id !== mission.id));
      } else {
        console.log('  - Checking mission:', mission.id);
        setCompletedMissions(prev => [...prev, mission.id]);
        setIsLocallyUpdating(true);
        
        // Actually complete the mission
        try {
          // Check if Firebase user first
          const firebaseUser = auth.currentUser;
          
          if (firebaseUser) {
            // Handle Firebase user mission completion
            console.log('  - Completing Firebase mission:', mission.id);
            const result = await completeMission(user.id, mission, user);
            console.log('  - Mission completion result:', result.success, 'XP:', result.xpAwarded);
            
            if (result.success) {
              // Update user data to reflect XP and badge changes including daily XP
              const updatedDailyXP = addDailyXP(user.dailyXP, result.xpAwarded);
              const updatedUser = {
                ...user,
                xp: user.xp + result.xpAwarded,
                dailyXP: updatedDailyXP,
                completedMissions: [...(user.completedMissions || []), {
                  ...mission,
                  isCompleted: true,
                  completedAt: new Date(),
                }],
                badges: [...user.badges, ...result.newBadges],
              };
              console.log('  - Updated user with completed missions count:', updatedUser.completedMissions?.length);
              setUser(updatedUser);
              
              // Show success message if XP was awarded
              if (result.xpAwarded > 0) {
                // Debug: Show updated daily XP
                const today = new Date();
                const todayKey = today.getFullYear() + '-' + 
                                String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(today.getDate()).padStart(2, '0');
                const todayXP = updatedUser.dailyXP?.[todayKey] || 0;
                
                showCustomAlert(
                  t.dashboard.missionCompleted, 
                  `${t.dashboard.xpEarned}: ${result.xpAwarded} XP!`
                );
              }
              
              // Show badge notification if new badges were earned
              if (result.newBadges.length > 0) {
                Alert.alert(
                  t.dashboard.newBadge, 
                  translate('dashboard.badgeEarned', { count: result.newBadges.length }),
                  [{ text: 'OK', style: 'default' }],
                  { 
                    cancelable: true,
                    userInterfaceStyle: colors === DARK_COLORS ? 'dark' : 'light'
                  }
                );
              }
            }
          } else {
            // Handle demo user mission completion
            const demoUser = demoGetCurrentUser();
            if (demoUser && demoUser.id === user.id) {
              const completedMission = {
                ...mission,
                isCompleted: true,
                completedAt: new Date(),
              };
              
              const newXP = user.xp + mission.xpReward;
              const updatedDailyXP = addDailyXP(user.dailyXP, mission.xpReward);
              const updatedCompletedMissions = [...(user.completedMissions || []), completedMission];
              
              // Check for new badges
              const updatedUser = {
                ...user,
                xp: newXP,
                dailyXP: updatedDailyXP,
                completedMissions: updatedCompletedMissions,
              };
              
              const newBadges = await checkAndAwardBadges(user.id, updatedUser);
              
              // Update demo user with new data
              await demoUpdateUser(user.id, {
                xp: newXP,
                dailyXP: updatedDailyXP,
                completedMissions: updatedCompletedMissions,
                badges: [...user.badges, ...newBadges],
              });
              console.log('Demo user updated after mission completion:', {
                xp: newXP,
                missionsCount: updatedCompletedMissions.length,
                badgesCount: [...user.badges, ...newBadges].length
              });
              
              // Update local state
              setUser({
                ...updatedUser,
                badges: [...user.badges, ...newBadges],
              });
              console.log('Local state updated after mission completion');
              
              if (mission.xpReward > 0) {
                // Debug: Show updated daily XP for demo users too
                const today = new Date();
                const todayKey = today.getFullYear() + '-' + 
                                String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(today.getDate()).padStart(2, '0');
                const todayXP = updatedDailyXP?.[todayKey] || 0;
                
                showCustomAlert(
                  t.dashboard.missionCompleted, 
                  `${t.dashboard.xpEarned}: ${mission.xpReward} XP!`
                );
              }
              
              if (newBadges.length > 0) {
                Alert.alert(
                  t.dashboard.newBadge, 
                  translate('dashboard.badgeEarned', { count: newBadges.length }),
                  [{ text: 'OK', style: 'default' }],
                  { 
                    cancelable: true,
                    userInterfaceStyle: colors === DARK_COLORS ? 'dark' : 'light'
                  }
                );
              }
            }
          }
        } catch (error) {
          console.error('Error completing mission:', error);
          Alert.alert('Error', 'Gagal menyelesaikan misi');
        } finally {
          // Reset the local updating flag after a short delay
          setTimeout(() => {
            setIsLocallyUpdating(false);
          }, 2000);
        }
      }
    }
  };

  const handleUpgradeToPremium = async () => {
    if (user?.email === 'sandy@mail.com') {
      try {
        const success = await upgradeUserToPremium(user.email);
        if (success) {
          Alert.alert('Success', 'Account upgraded to premium!');
          // Reload user data to reflect changes
          await loadUserData();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to upgrade to premium');
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>Gagal memuat data pengguna</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadUserData}>
          <Text style={[styles.retryButtonText, { color: colors.white }]}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const levelInfo = calculateLevel(user.xp);
  // For existing users, sync totalDays with calculated value if they differ significantly
  const calculatedDays = calculateDaysSinceQuit(new Date(user.quitDate));
  const daysSinceQuit = Math.max(user.totalDays, calculatedDays); // Use the higher value
  
  
  const moneySaved = calculateMoneySaved(daysSinceQuit, user.cigarettesPerDay, user.cigarettePrice);
  const canCheckIn = canCheckInToday(user.lastCheckIn);
  const dailyMissions = generateDailyMissions();

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{getGreeting(user.displayName)}</Text>
            <Text style={styles.headerSubtext}>{levelInfo.nextLevelXP - user.xp} XP {language === 'en' ? 'to next level' : 'ke level berikutnya'}</Text>
            <Text style={styles.headerMotivation}>{language === 'en' ? 'Keep going, champion! 🚀' : 'Terus semangat, juara! 🚀'}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Level Card - Final structure with next level */}
      <View style={[styles.levelCardFinal, { backgroundColor: colors.surface }]}>
        {/* Top row */}
        <View style={styles.levelTopRow}>
          <MaterialIcons name="emoji-events" size={24} color={colors.accent} style={styles.levelIcon} />
          <Text style={[styles.levelBadgeText, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">{levelInfo.title}</Text>
          <Text style={[styles.levelXPTextLarge, { color: colors.textPrimary }]}>{user.xp} XP</Text>
        </View>
        {/* Middle: Progress bar and level names */}
        <View style={styles.levelProgressRow}>
          <View style={[styles.levelProgressBar, { backgroundColor: colors.lightGray }]}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.levelProgressFill, { width: `${Math.round(levelInfo.progress * 100)}%` }]}
            />
          </View>
          <View style={styles.levelProgressLabelsRow}>
            <Text style={[styles.levelProgressLabelLeft, { color: colors.textSecondary }]}>{`Level ${levelInfo.level}`}</Text>
            <Text style={[styles.levelProgressLabelRight, { color: colors.textSecondary }]}>{`Level ${levelInfo.level + 1}`}</Text>
          </View>
        </View>
        
        {/* Check-in Button - Now part of level card */}
        <TouchableOpacity
          style={[styles.levelCheckInButton, !canCheckIn && styles.checkInButtonDisabled]}
          onPress={handleCheckIn}
          disabled={!canCheckIn || checkingIn}
        >
          <LinearGradient
            colors={canCheckIn ? [colors.secondary, colors.secondaryDark] : [colors.gray, colors.darkGray]}
            style={styles.levelCheckInGradient}
          >
            {checkingIn ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color={colors.white} />
                <Text style={styles.levelCheckInText}>
                  {canCheckIn ? t.dashboard.checkIn : t.dashboard.checkedIn}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Temporary upgrade button for sandy@mail.com */}
      {user?.email === 'sandy@mail.com' && !user?.isPremium && (
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
          onPress={handleUpgradeToPremium}
        >
          <Text style={[styles.upgradeButtonText, { color: colors.white }]}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}

      {/* Statistics Row - Two cards side by side */}
      <View style={styles.statsRowContainer}>
        {/* Streak and Total Days Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(231, 76, 60, 0.15)' }]}>
              <MaterialIcons name="local-fire-department" size={20} color={colors.error} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatNumber(user.streak)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.dashboard.streak}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.lightGray }]} />
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(249, 149, 70, 0.15)' }]}>
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatNumber(daysSinceQuit)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{language === 'en' ? 'Days' : 'Hari'}</Text>
          </View>
        </View>

        {/* Money Saved Card */}
        <View style={[styles.statsCard, styles.statsCardLast, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(39, 174, 96, 0.15)' }]}>
              <MaterialIcons name="savings" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatCurrency(moneySaved).replace('Rp', '').trim()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.dashboard.moneySaved}</Text>
          </View>
        </View>
      </View>

      {/* Section Title */}
      <View style={[styles.sectionHeader, { marginTop: SIZES.xs }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.dashboard.dailyMissions}</Text>
      </View>

      {/* Daily Missions Card */}
      <View style={[styles.missionCardContainer, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.accent + '20', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.missionCardGradient}
        >
        {dailyMissions.map((mission) => (
          <TouchableOpacity 
            key={mission.id} 
            style={styles.missionItem}
            onPress={() => handleMissionToggle(mission)}
            disabled={mission.id === 'daily-checkin' && mission.isCompleted}
          >
            <View style={styles.missionCheckbox}>
              <MaterialIcons 
                name={mission.isCompleted ? "check-circle" : "radio-button-unchecked"} 
                size={24} 
                color={mission.isCompleted ? colors.secondary : colors.gray} 
              />
            </View>
            <View style={styles.missionInfo}>
              <Text style={[
                styles.missionTitle, 
                { color: colors.textPrimary },
                mission.isCompleted && styles.missionTitleCompleted
              ]}>
                {mission.title}
              </Text>
              <Text style={[
                styles.missionDescription, 
                { color: colors.textSecondary },
                mission.isCompleted && styles.missionDescriptionCompleted
              ]}>
                {mission.description}
              </Text>
            </View>
            <View style={styles.missionReward}>
              <Text style={[
                styles.missionXP, 
                { color: colors.textPrimary },
                mission.isCompleted && styles.missionXPCompleted
              ]}>
                +{mission.xpReward} XP
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {!user.isPremium && (
          <View style={styles.upgradePrompt}>
            <Text style={[styles.upgradePromptText, { color: colors.textSecondary }]}>{t.premium.features.threeMissions}</Text>
            <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.upgradeButtonText, { color: colors.white }]}>Upgrade Premium</Text>
            </TouchableOpacity>
          </View>
        )}
        </LinearGradient>
      </View>

      {/* Motivation Section Title */}
      <View style={[styles.sectionHeader, { marginTop: SIZES.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.dashboard.personalMotivator}</Text>
      </View>

      {/* Personal Motivator Card */}
      <View style={[styles.motivationCardContainer, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.accentAlt + '20', colors.accentAlt + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.motivationCardGradient}
        >
        {user.isPremium ? (
          <Text style={[styles.motivationText, { color: colors.textPrimary }]}>{dailyMotivation || getDailyMotivation(user, language as Language)}</Text>
        ) : (
          <View style={styles.lockedContent}>
            <MaterialIcons name="psychology" size={32} color={colors.accent} />
            <Text style={[styles.lockedText, { color: colors.textPrimary }]}>{t.dashboard.personalMotivatorDesc}</Text>
            <Text style={[styles.lockedSubtext, { color: colors.textSecondary }]}>{t.premium.features.dailyMotivation + ' + ' + t.premium.features.personalConsultation}</Text>
            <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.upgradeButtonText, { color: colors.white }]}>{t.dashboard.activateMotivator}</Text>
            </TouchableOpacity>
          </View>
        )}
        </LinearGradient>
      </View>
    </ScrollView>
    
    <CustomAlert
      visible={customAlert.visible}
      title={customAlert.title}
      message={customAlert.message}
      type={customAlert.type}
      onDismiss={hideCustomAlert}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.screenPadding,
  },
  errorText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.spacingLg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.buttonRadius || 16,
  },
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  header: {
    paddingTop: Math.max(50, height * 0.06), // Responsive top padding for mobile
    paddingBottom: Math.max(SIZES.xl, height * 0.08), // Responsive bottom padding for floating card
    paddingHorizontal: SIZES.screenPadding,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center', // Center the text horizontally
  },
  greeting: {
    ...TYPOGRAPHY.h1White,
    fontSize: Math.min(width * 0.055, 22), // Responsive font size for mobile
    lineHeight: Math.min(width * 0.07, 28),
    marginBottom: SIZES.xs || 4,
    textAlign: 'center',
  },
  headerSubtext: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: Math.min(width * 0.04, 16), // Responsive font size
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.xs || 2,
    textAlign: 'center',
  },
  headerMotivation: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: Math.min(width * 0.035, 14), // Responsive font size
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  logoutButton: {
    padding: Math.max(SIZES.sm, width * 0.03), // Responsive padding for better mobile touch target
    borderRadius: SIZES.buttonRadius / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background for better visibility
  },
  content: {
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: SIZES.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.cardPadding,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelContainer: {
    marginBottom: SIZES.md,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TYPOGRAPHY.bodyLargePrimary,
    fontWeight: '600',
    marginVertical: SIZES.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmallSecondary,
  },
  checkInButton: {
    marginBottom: SIZES.md,
    borderRadius: SIZES.borderRadiusLg,
    overflow: 'hidden',
  },
  checkInButtonDisabled: {
    opacity: 0.7,
  },
  checkInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
  },
  checkInText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    marginLeft: SIZES.sm,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  upgradeButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.buttonRadius || 12,
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: Math.min(width * 0.032, 12),
    lineHeight: Math.min(width * 0.04, 16),
    flexShrink: 1,
    textAlign: 'center',
  },
  upgradePrompt: {
    marginTop: SIZES.md,
    padding: SIZES.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius || 12,
    alignItems: 'center',
  },
  upgradePromptText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
    lineHeight: 18,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  missionCheckbox: {
    marginRight: SIZES.sm,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  missionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  missionDescription: {
    ...TYPOGRAPHY.bodySmallSecondary,
    marginTop: SIZES.spacingXs,
  },
  missionDescriptionCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  missionReward: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.buttonRadius || 12,
  },
  missionXP: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
  },
  missionXPCompleted: {
    opacity: 0.6,
  },
  motivationText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  lockedText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
    fontWeight: '600',
  },
  lockedSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.md,
    lineHeight: 18,
  },

  // Level Card - Final structure with next level (floating design optimized for mobile)
  levelCardFinal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: -Math.max(SIZES.lg, height * 0.04), // Responsive negative margin for floating effect
    marginBottom: Math.max(SIZES.md, height * 0.025), // Responsive bottom margin
    padding: Math.max(SIZES.sm, width * 0.04), // Responsive padding
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, // Slightly increased shadow for better mobile visibility
    shadowRadius: 12, // Increased shadow radius
    elevation: 6, // Increased elevation for Android
  },
  levelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.xs || 4,
  },
  levelIcon: {
    marginRight: SIZES.sm,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'left',
  },
  levelXPTextLarge: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  levelProgressRow: {
    marginBottom: SIZES.xs || 4,
  },
  levelProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  levelProgressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  levelProgressLabelLeft: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'left',
    flex: 1,
  },
  levelProgressLabelRight: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  levelBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
  },
  levelSubtitleFinal: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'left',
  },
  levelToNextBadge: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '700',
    minWidth: 120,
    textAlign: 'right',
  },

  // Statistics Row - Two cards side by side
  statsRowContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.screenPadding,
    marginTop: 2,
    marginBottom: SIZES.xs || 4,
  },
  statsCard: {
    width: '49%',
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    paddingVertical: SIZES.sm,
    paddingHorizontal: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '2%',
    minHeight: 75,
  },
  statsCardLast: {
    marginRight: 0,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 2,
  },
  statCircleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs || 4,
  },
  statValue: {
    ...TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SIZES.xs || 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Bento-specific styles
  bentoStatsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoStatsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacingSm,
  },
  bentoStatsValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SIZES.spacingXs,
  },
  bentoStatsLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  bentoCheckInCard: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  bentoCheckInButton: {
    borderRadius: SIZES.buttonRadius || 12,
    overflow: 'hidden',
  },
  bentoCheckInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.buttonRadius || 12,
  },
  
  bentoLevelContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bentoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.spacingSm,
    paddingVertical: SIZES.spacingXs,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.spacingSm,
  },
  bentoBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginLeft: SIZES.spacingXs,
    fontWeight: '500',
    flex: 1,
  },
  
  bentoMissionsCard: {
    minHeight: 160,
  },
  missionCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 0,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  bentoMotivationCard: {
    minHeight: 'auto',
  },
  motivationCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 0,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  missionCardGradient: {
    padding: SIZES.sm,
    minHeight: 160,
    flex: 1,
  },
  motivationCardGradient: {
    padding: SIZES.sm,
    minHeight: 'auto',
    flex: 1,
  },
  levelTopLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  bentoGridContainer: {
    marginTop: SIZES.xs || 4,
  },
  
  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs || 4,
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  
  // Level card check-in button styles
  levelCheckInButton: {
    marginTop: 0,
    borderRadius: SIZES.buttonRadius || 12,
    overflow: 'hidden',
  },
  levelCheckInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.buttonRadius || 12,
  },
  levelCheckInText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    marginLeft: SIZES.sm,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.sm,
    padding: SIZES.sm,
    borderRadius: SIZES.buttonRadius || 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: Math.min(width * 0.032, 12),
    lineHeight: Math.min(width * 0.04, 16),
    flexShrink: 1,
    textAlign: 'center',
  },
});

export default DashboardScreen;