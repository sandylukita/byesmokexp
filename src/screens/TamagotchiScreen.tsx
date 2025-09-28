/**
 * Tamagotchi Screen - Full Lungcat Experience
 * 
 * Interactive pet page with feeding, playing, and health monitoring
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import LungcatLottieAnimation from '../components/LungcatLottieAnimation';
import { CustomAlert } from '../components/CustomAlert';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { User } from '../types';
import { getLungcatHealthPercentage, getLungcatHealthColor } from '../utils/lungcatHealth';
import { addDailyXP } from '../utils/helpers';
import { SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface TamagotchiScreenProps {
  // Props are optional since we'll get user from context like other screens
  user?: User;
  onUpdateUser?: (updates: Partial<User>) => Promise<void>;
}

// Pet stats interface
interface PetStats {
  happiness: number;    // 0-100
  health: number;      // 0-100
  energy: number;      // 0-100
  lastFed: number;     // timestamp
  lastPlayed: number;  // timestamp
  totalInteractions: number;
  dailyInteractions: number; // interactions today
  lastInteractionDate: string; // to track daily reset
}

export const TamagotchiScreen: React.FC<TamagotchiScreenProps> = ({
  user: propUser,
  onUpdateUser: propOnUpdateUser,
}) => {
  const { colors } = useTheme();
  const { language } = useTranslation();

  // Manage user state like other screens do
  const [user, setUser] = useState<User | null>(null);

  // Load user data from Firebase with real-time updates
  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Set up real-time listener for user data
        userUnsubscribe = onSnapshot(
          doc(db, 'users', currentUser.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              const userData = { id: currentUser.uid, ...userDoc.data() } as User;
              setUser(userData);
              console.log('🔍 TamagotchiScreen user updated:', userData.displayName, 'lastCheckIn:', userData.lastCheckIn);

              // Load persisted pet stats from user data
              if (userData.petStats) {
                setPetStats(prev => ({
                  ...prev,
                  totalInteractions: userData.petStats.totalInteractions || 0,
                  dailyInteractions: userData.petStats.dailyInteractions || 0,
                  lastInteractionDate: userData.petStats.lastInteractionDate || new Date().toDateString(),
                  lastFed: userData.petStats.lastFed || prev.lastFed,
                  lastPlayed: userData.petStats.lastPlayed || prev.lastPlayed,
                }));
              }
            }
          },
          (error) => {
            console.error('Error listening to user updates in TamagotchiScreen:', error);
          }
        );
      } else {
        setUser(null);
        if (userUnsubscribe) {
          userUnsubscribe();
          userUnsubscribe = null;
        }
      }
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };
  }, []);

  // Handle user updates
  const onUpdateUser = useCallback(async (updates: Partial<User>) => {
    if (!user || !auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating user in TamagotchiScreen:', error);
    }
  }, [user]);

  const [petStats, setPetStats] = useState<PetStats>({
    happiness: 75,
    health: 80,
    energy: 60,
    lastFed: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    lastPlayed: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    totalInteractions: 0,
    dailyInteractions: 0,
    lastInteractionDate: new Date().toDateString(),
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const [temporaryAnimation, setTemporaryAnimation] = useState<string | null>(null);
  const lungcatRef = useRef<any>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  // Calculate pet stats based on user's smoking cessation progress
  useEffect(() => {
    if (!user) return;

    const streak = user.streak || 0;
    const daysSinceQuit = user.totalDays || 0;

    // Use unified health system
    const unifiedHealth = getLungcatHealthPercentage(user);
    console.log('🔍 TamagotchiScreen unified health:', unifiedHealth, 'for user:', user?.displayName);

    // Happiness increases with longer streaks
    const baseHappiness = Math.min(30 + (streak * 1.5), 100);

    // Energy based on recent check-ins
    const timeSinceCheckIn = Date.now() - new Date(user.lastCheckIn || 0).getTime();
    const hoursGone = Math.floor(timeSinceCheckIn / (1000 * 60 * 60));
    const baseEnergy = Math.max(100 - (hoursGone * 5), 20);

    setPetStats(prev => {
      // For new users or low-streak users, sync directly with calculated values
      // For established users, preserve manual boosts
      const shouldSyncStats = streak < 7;
      const calculatedHappiness = Math.max(baseHappiness - (hoursGone > 12 ? 15 : 0), 0);

      return {
        ...prev,
        // Sync with unified health for new users, preserve boosts for established users
        health: shouldSyncStats || unifiedHealth > prev.health ? unifiedHealth : Math.max(prev.health, unifiedHealth),
        // Sync happiness for new users, preserve boosts for established users
        happiness: shouldSyncStats || calculatedHappiness > prev.happiness ? calculatedHappiness : Math.max(prev.happiness, calculatedHappiness),
        // Energy always syncs upward (immediate feedback for check-ins)
        energy: Math.max(prev.energy, baseEnergy),
        // Preserve interaction data (don't reset these)
        totalInteractions: prev.totalInteractions,
        dailyInteractions: prev.dailyInteractions,
        lastInteractionDate: prev.lastInteractionDate,
        lastFed: prev.lastFed,
        lastPlayed: prev.lastPlayed,
      };
    });
  }, [user?.streak, user?.totalDays, user?.lastCheckIn]);

  // Gradual stat decay over time to return boosted stats to normal
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setPetStats(prev => {
        const now = Date.now();
        const timeSinceLastFed = now - prev.lastFed;
        const timeSinceLastPlayed = now - prev.lastPlayed;

        // Decay stats slowly after interactions (every 30 minutes)
        const decayAmount = 2;
        const decayThreshold = 30 * 60 * 1000; // 30 minutes

        return {
          ...prev,
          happiness: Math.max(prev.happiness - (timeSinceLastFed > decayThreshold ? decayAmount : 0), 0),
          energy: Math.max(prev.energy - (timeSinceLastPlayed > decayThreshold ? decayAmount : 0), 0),
          // Health doesn't decay as it's based on unified health system
        };
      });
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(decayInterval);
  }, []);

  // Helper function to trigger temporary animations
  const triggerTemporaryAnimation = useCallback((animationType: string, duration: number = 3000) => {
    console.log('🎭 Setting temporaryAnimation to:', animationType, 'for', duration, 'ms');
    setTemporaryAnimation(animationType);
    setTimeout(() => {
      console.log('🎭 Clearing temporaryAnimation after', duration, 'ms');
      setTemporaryAnimation(null);
    }, duration);
  }, []);

  // Helper function to show custom alert
  const showCustomAlert = useCallback((title: string, message: string) => {
    setAlertConfig({
      visible: true,
      title,
      message,
    });
  }, []);

  // Get dynamic pet companion title based on stage
  const getPetCompanionTitle = () => {
    if (!user) return language === 'en' ? 'Your Pet Companion' : 'Sahabat Hewan Anda';

    // Determine current pet stage based on total days
    const totalDays = user.totalDays || 0;
    let petStage = user.petStage;

    // Auto-determine stage if not set
    if (!petStage) {
      if (totalDays >= 91) {
        petStage = 'lion';
      } else if (totalDays >= 31) {
        petStage = 'tiger';
      } else {
        petStage = 'cat';
      }
    }

    switch (petStage) {
      case 'tiger':
        return language === 'en' ? 'Your Lung Tiger Companion' : 'Sahabat Lung Tiger Anda';
      case 'lion':
        return language === 'en' ? 'Your Lung Lion Companion' : 'Sahabat Lung Lion Anda';
      default:
        return language === 'en' ? 'Your Lungcat Companion' : 'Sahabat Lungcat Anda';
    }
  };

  // Get dynamic about pet text based on stage
  const getAboutPetText = () => {
    if (!user) return '';

    const totalDays = user.totalDays || 0;
    let petStage = user.petStage;

    // Auto-determine stage if not set
    if (!petStage) {
      if (totalDays >= 91) {
        petStage = 'lion';
      } else if (totalDays >= 31) {
        petStage = 'tiger';
      } else {
        petStage = 'cat';
      }
    }

    const baseInfo = language === 'en'
      ? `Age: ${totalDays} days\n💫 Total interactions: ${petStats.totalInteractions}\n🏆 Your streak directly affects`
      : `Umur: ${totalDays} hari\n💫 Total interaksi: ${petStats.totalInteractions}\n🏆 Streak Anda langsung mempengaruhi`;

    switch (petStage) {
      case 'tiger':
        return language === 'en'
          ? `🐯 ${baseInfo} your Tiger's strength!\nYour determination has made your pet fierce and powerful!`
          : `🐯 ${baseInfo} kekuatan Tiger Anda!\nTekad Anda telah membuat hewan peliharaan Anda galak dan kuat!`;
      case 'lion':
        return language === 'en'
          ? `🦁 ${baseInfo} your Lion's majesty!\nYou've achieved mastery - your pet is now the king of health!`
          : `🦁 ${baseInfo} keagungan Lion Anda!\nAnda telah mencapai penguasaan - hewan peliharaan Anda kini raja kesehatan!`;
      default:
        return language === 'en'
          ? `🐱 ${baseInfo} your Lungcat's health!`
          : `🐱 ${baseInfo} kesehatan Lungcat Anda!`;
    }
  };

  // Get dynamic about section title
  const getAboutTitle = () => {
    if (!user) return language === 'en' ? 'About Pet' : 'Tentang Hewan';

    const totalDays = user.totalDays || 0;
    let petStage = user.petStage;

    // Auto-determine stage if not set
    if (!petStage) {
      if (totalDays >= 91) {
        petStage = 'lion';
      } else if (totalDays >= 31) {
        petStage = 'tiger';
      } else {
        petStage = 'cat';
      }
    }

    switch (petStage) {
      case 'tiger':
        return language === 'en' ? 'About Lung Tiger' : 'Tentang Lung Tiger';
      case 'lion':
        return language === 'en' ? 'About Lung Lion' : 'Tentang Lung Lion';
      default:
        return language === 'en' ? 'About Lungcat' : 'Tentang Lungcat';
    }
  };

  // Helper function to increment interactions with daily reset logic and Firebase persistence
  const incrementInteractions = useCallback(async () => {
    const today = new Date().toDateString();

    setPetStats(prev => {
      // Check if we need to reset daily counter (new day)
      const needsReset = prev.lastInteractionDate !== today;

      const newStats = {
        ...prev,
        totalInteractions: prev.totalInteractions + 1,
        dailyInteractions: needsReset ? 1 : prev.dailyInteractions + 1,
        lastInteractionDate: today,
      };

      // Persist to Firebase
      if (user && auth.currentUser) {
        updateDoc(doc(db, 'users', auth.currentUser.uid), {
          petStats: {
            totalInteractions: newStats.totalInteractions,
            dailyInteractions: newStats.dailyInteractions,
            lastInteractionDate: newStats.lastInteractionDate,
            lastFed: newStats.lastFed,
            lastPlayed: newStats.lastPlayed,
          }
        }).catch(error => {
          console.error('Error persisting pet stats:', error);
        });
      }

      return newStats;
    });
  }, [user]);

  // Interaction handlers
  const handleFeedPet = useCallback(async () => {
    if (isInteracting) return;

    // Check if user has checked in today first
    const today = new Date();
    const lastCheckInDate = user?.lastCheckIn ? new Date(user.lastCheckIn) : null;
    const hasCheckedInToday = lastCheckInDate && lastCheckInDate.toDateString() === today.toDateString();

    if (!hasCheckedInToday) {
      showCustomAlert(
        language === 'en' ? 'Check In First!' : 'Check In Dulu!',
        language === 'en'
          ? 'You need to check in today before caring for your Lungcat! Go to Dashboard → Tap "Check In Today" → Then return here!'
          : 'Anda perlu check-in hari ini sebelum merawat Lungcat! Ke Dashboard → Tap "Check In Hari Ini" → Lalu kembali ke sini!'
      );
      return;
    }

    const now = Date.now();
    const timeSinceFed = now - petStats.lastFed;
    const hoursSinceFed = timeSinceFed / (1000 * 60 * 60);

    if (hoursSinceFed < 2) {
      showCustomAlert(
        language === 'en' ? 'Not Hungry' : 'Tidak Lapar',
        language === 'en'
          ? 'Lungcat is still full! Try again in a few hours.'
          : 'Lungcat masih kenyang! Coba lagi dalam beberapa jam.'
      );
      return;
    }
    
    setIsInteracting(true);
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Trigger celebration animation and confetti effect
      triggerTemporaryAnimation('celebrate', 5000);

      // Trigger confetti celebration on lungcat (same as poke effect)
      // if (lungcatRef.current) {
      //   lungcatRef.current.triggerCelebration?.();
      // }

      const newStats = {
        happiness: Math.min(petStats.happiness + 15, 100),
        health: Math.min(petStats.health + 10, 100),
        energy: Math.min(petStats.energy + 20, 100),
        lastFed: now,
      };

      setPetStats(prev => ({
        ...prev,
        ...newStats,
      }));

      // Increment both daily and total interactions
      await incrementInteractions();

      // Persist boosted stats to Firebase so Dashboard can show them
      if (user && auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            petStats: {
              ...user.petStats,
              health: newStats.health,
              happiness: newStats.happiness,
              energy: newStats.energy,
              lastFed: newStats.lastFed,
              totalInteractions: petStats.totalInteractions + 1,
              dailyInteractions: petStats.dailyInteractions + 1,
              lastInteractionDate: petStats.lastInteractionDate,
              lastPlayed: petStats.lastPlayed,
            }
          });
        } catch (error) {
          console.error('Error persisting boosted pet stats:', error);
        }
      }

      // Award XP for interaction
      if (user) {
        const updatedDailyXP = addDailyXP(user.dailyXP, 5);
        await onUpdateUser({
          xp: (user.xp || 0) + 5,
          dailyXP: updatedDailyXP,
        });
      }

    } catch (error) {
      console.error('Error feeding pet:', error);
    } finally {
      setTimeout(() => setIsInteracting(false), 5000); // Match animation duration
    }
  }, [petStats.lastFed, isInteracting, language, onUpdateUser, user?.xp, user?.dailyXP, triggerTemporaryAnimation, showCustomAlert]);

  const handlePlayWithPet = useCallback(async () => {
    if (isInteracting) return;

    // Check if user has checked in today first
    const today = new Date();
    const lastCheckInDate = user?.lastCheckIn ? new Date(user.lastCheckIn) : null;
    const hasCheckedInToday = lastCheckInDate && lastCheckInDate.toDateString() === today.toDateString();

    if (!hasCheckedInToday) {
      showCustomAlert(
        language === 'en' ? 'Check In First!' : 'Check In Dulu!',
        language === 'en'
          ? 'You need to check in today before playing with your Lungcat! Go to Dashboard → Tap "Check In Today" → Then return here!'
          : 'Anda perlu check-in hari ini sebelum bermain dengan Lungcat! Ke Dashboard → Tap "Check In Hari Ini" → Lalu kembali ke sini!'
      );
      return;
    }

    const now = Date.now();
    const timeSincePlay = now - petStats.lastPlayed;
    const hoursSincePlay = timeSincePlay / (1000 * 60 * 60);

    if (hoursSincePlay < 1) {
      showCustomAlert(
        language === 'en' ? 'Too Tired' : 'Terlalu Capek',
        language === 'en'
          ? 'Lungcat needs some rest! Try again in an hour.'
          : 'Lungcat perlu istirahat! Coba lagi dalam satu jam.'
      );
      return;
    }

    // Check if pet has enough energy to play
    if (petStats.energy < 15) {
      showCustomAlert(
        language === 'en' ? 'Low Energy' : 'Energi Kurang',
        language === 'en'
          ? 'Lungcat is too tired to play! Try feeding first to restore energy.'
          : 'Lungcat terlalu capek untuk bermain! Coba beri makan dulu untuk mengembalikan energi.'
      );
      return;
    }
    
    setIsInteracting(true);
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Trigger exercising animation and confetti effect
      triggerTemporaryAnimation('exercising', 5000);

      // Trigger confetti celebration on lungcat (same as poke effect)
      // if (lungcatRef.current) {
      //   lungcatRef.current.triggerCelebration?.();
      // }

      const newStats = {
        happiness: Math.min(petStats.happiness + 20, 100),
        health: petStats.health, // Health doesn't change during play
        energy: Math.max(petStats.energy - 10, 0),
        lastPlayed: now,
      };

      setPetStats(prev => ({
        ...prev,
        happiness: newStats.happiness,
        energy: newStats.energy,
        lastPlayed: newStats.lastPlayed,
      }));

      // Increment both daily and total interactions
      await incrementInteractions();

      // Persist boosted stats to Firebase so Dashboard can show them
      if (user && auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            petStats: {
              ...user.petStats,
              health: newStats.health,
              happiness: newStats.happiness,
              energy: newStats.energy,
              lastPlayed: newStats.lastPlayed,
              totalInteractions: petStats.totalInteractions + 1,
              dailyInteractions: petStats.dailyInteractions + 1,
              lastInteractionDate: petStats.lastInteractionDate,
              lastFed: petStats.lastFed,
            }
          });
        } catch (error) {
          console.error('Error persisting boosted pet stats:', error);
        }
      }

      // Award XP for interaction
      if (user) {
        const updatedDailyXP = addDailyXP(user.dailyXP, 10);
        await onUpdateUser({
          xp: (user.xp || 0) + 10,
          dailyXP: updatedDailyXP,
        });
      }

    } catch (error) {
      console.error('Error playing with pet:', error);
    } finally {
      setTimeout(() => setIsInteracting(false), 5000); // Match animation duration
    }
  }, [petStats.lastPlayed, isInteracting, language, onUpdateUser, user?.xp, user?.dailyXP, triggerTemporaryAnimation, showCustomAlert]);

  const handlePetInteraction = useCallback(async () => {
    // Trigger happy animation for poke - shorter duration for responsiveness
    triggerTemporaryAnimation('happy', 2000);

    const newStats = {
      happiness: Math.min(petStats.happiness + 5, 100),
      health: petStats.health, // Health doesn't change during poke
      energy: petStats.energy, // Energy doesn't change during poke
    };

    setPetStats(prev => ({
      ...prev,
      happiness: newStats.happiness,
    }));

    // Increment both daily and total interactions
    await incrementInteractions();

    // Persist boosted stats to Firebase so Dashboard can show them
    if (user && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          petStats: {
            ...user.petStats,
            health: newStats.health,
            happiness: newStats.happiness,
            energy: newStats.energy,
            totalInteractions: petStats.totalInteractions + 1,
            dailyInteractions: petStats.dailyInteractions + 1,
            lastInteractionDate: petStats.lastInteractionDate,
            lastFed: petStats.lastFed,
            lastPlayed: petStats.lastPlayed,
          }
        });
      } catch (error) {
        console.error('Error persisting boosted pet stats:', error);
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [incrementInteractions, triggerTemporaryAnimation, petStats, user]);

  // Get status text based on stats
  const getPetStatusText = () => {
    const avgStats = (petStats.happiness + petStats.health + petStats.energy) / 3;
    
    if (avgStats >= 80) {
      return language === 'en' ? '🌟 Excellent' : '🌟 Sangat Baik';
    } else if (avgStats >= 60) {
      return language === 'en' ? '😊 Good' : '😊 Baik';
    } else if (avgStats >= 40) {
      return language === 'en' ? '😐 Okay' : '😐 Lumayan';
    } else {
      return language === 'en' ? '😟 Needs Care' : '😟 Perlu Perhatian';
    }
  };

  // Get simple recovery status text
  const getLungcatRecoveryStatus = () => {
    if (!user) {
      return language === 'en' ? 'Your Lungcat is waiting for you!' : 'Lungcat Anda menunggu Anda!';
    }

    const streak = user.streak || 0;

    if (streak >= 30) {
      return language === 'en' ? 'Your Lungcat is thriving!' : 'Lungcat Anda berkembang pesat!';
    } else if (streak >= 7) {
      return language === 'en' ? 'Your Lungcat is healthy!' : 'Lungcat Anda sehat!';
    } else if (streak > 0) {
      return language === 'en' ? 'Your Lungcat is recovering!' : 'Lungcat Anda sedang pulih!';
    } else {
      return language === 'en' ? 'Your Lungcat needs care!' : 'Lungcat Anda butuh perawatan!';
    }
  };

  // Get detailed healing information
  const getHealingInformation = () => {
    if (!user) {
      return language === 'en' ? 'Start your journey to help your Lungcat grow strong and healthy!' : 'Mulai perjalanan Anda untuk membantu Lungcat tumbuh kuat dan sehat!';
    }

    const streak = user.streak || 0;

    if (streak >= 30) {
      return language === 'en' ? 'Perfect health achieved! Keep up the amazing care!' : 'Kesehatan sempurna tercapai! Teruskan perawatan yang luar biasa!';
    } else if (streak >= 7) {
      return language === 'en' ? 'Great progress! Your daily care is working perfectly!' : 'Progress bagus! Perawatan harian Anda bekerja dengan sempurna!';
    } else if (streak > 0) {
      const daysNeeded = 7 - streak;
      return language === 'en'
        ? `${daysNeeded} more days to heal! Keep checking in daily!`
        : `${daysNeeded} hari lagi untuk sembuh! Terus check-in harian!`;
    } else {
      return language === 'en' ? 'Start daily check-ins to begin the healing journey!' : 'Mulai check-in harian untuk memulai perjalanan penyembuhan!';
    }
  };



  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Image
              source={require('../../assets/images/lungcat.png')}
              style={styles.headerLungcatImage}
            />
            <Text style={[styles.headerTitle, { color: colors.white }]}>
              {getPetCompanionTitle()}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Pet Display */}
      <View style={[styles.petContainer, { backgroundColor: colors.surface }]}>
        <LungcatLottieAnimation
          ref={lungcatRef}
          user={user}
          size={200}
          interactive={true}
          onPetClick={handlePetInteraction}
          temporaryAnimation={temporaryAnimation}
          showStatusBar={false}
        />

        {/* Lungcat Recovery Status */}
        <Text style={[styles.streakGuidanceText, { color: colors.textPrimary }]}>
          {getLungcatRecoveryStatus()}
        </Text>

        {/* Healing Information */}
        <Text style={[styles.healingInfoText, { color: colors.textSecondary }]}>
          {getHealingInformation()}
        </Text>
      </View>

      {/* Interaction Buttons - Moved up for better visibility */}
      <View style={[styles.actionsContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.actionsTitle, { color: colors.textPrimary }]}>
          {language === 'en' ? 'Show Some Love' : 'Kasih Sayang'}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={handleFeedPet}
            disabled={isInteracting}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>
              {language === 'en' ? 'Feed' : 'Beri Makan'}
            </Text>
            <Text style={[styles.actionButtonSubtext, { color: colors.white }]}>
              +15 ❤️ +10 😊 +20 ⚡ +5 XP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handlePlayWithPet}
            disabled={isInteracting}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>
              {language === 'en' ? 'Play' : 'Bermain'}
            </Text>
            <Text style={[styles.actionButtonSubtext, { color: colors.white }]}>
              +20 😊 -10 ⚡ +10 XP
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pet Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>
          {language === 'en' ? 'Lungcat Stats' : 'Statistik Lungcat'}
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <MaterialIcons name="favorite" size={24} color={colors.error} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Health' : 'Kesehatan'}
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {Math.round(petStats.health)}%
            </Text>
            <View style={[styles.statBar, { backgroundColor: colors.lightGray }]}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${petStats.health}%`,
                    backgroundColor: getLungcatHealthColor(user, colors)
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="mood" size={24} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Happiness' : 'Kebahagiaan'}
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {Math.round(petStats.happiness)}%
            </Text>
            <View style={[styles.statBar, { backgroundColor: colors.lightGray }]}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${petStats.happiness}%`,
                    backgroundColor: colors.primary
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="flash-on" size={24} color={colors.secondary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Energy' : 'Energi'}
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {Math.round(petStats.energy)}%
            </Text>
            <View style={[styles.statBar, { backgroundColor: colors.lightGray }]}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${petStats.energy}%`,
                    backgroundColor: colors.secondary
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </View>


      {/* Pet Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
          {getAboutTitle()}
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {getAboutPetText()}
        </Text>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: SIZES.screenPadding,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLungcatImage: {
    width: 48,
    height: 48,
    marginRight: 4,
    borderRadius: 24,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1White,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    textAlign: 'center',
  },
  petContainer: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: -SIZES.md,
    marginBottom: 4,
    borderRadius: SIZES.cardRadius,
    alignItems: 'center',
    paddingVertical: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  streakGuidanceText: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.md,
    lineHeight: 20,
  },
  healingInfoText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SIZES.xs,
    paddingHorizontal: SIZES.md,
    lineHeight: 18,
    opacity: 0.8,
  },
  statsContainer: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.xs,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
    borderRadius: SIZES.cardRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginTop: SIZES.xs,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    marginBottom: SIZES.xs,
  },
  statBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsContainer: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.xs,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
    borderRadius: SIZES.cardRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionsTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.md,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  actionButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionButtonSubtext: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
  messageContainer: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.md,
    borderRadius: SIZES.cardRadius,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageGradient: {
    padding: SIZES.lg,
  },
  messageText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoContainer: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.xs,
    marginBottom: SIZES.xl,
    padding: SIZES.lg,
    borderRadius: SIZES.cardRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    marginBottom: SIZES.md,
  },
  infoText: {
    ...TYPOGRAPHY.bodyMedium,
    lineHeight: 22,
  },
});

export default TamagotchiScreen;