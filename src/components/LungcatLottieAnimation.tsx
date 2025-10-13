/**
 * Lungcat Lottie Animation Component
 *
 * Uses Lottie JSON animations for smooth, scalable pet animations
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { User } from '../types';
import { getLungcatHealthPercentage, getLungcatHealthColor } from '../utils/lungcatHealth';
import EvolutionScreen from './EvolutionScreen';
import { debugLog } from '../utils/performanceOptimizer';

const { width } = Dimensions.get('window');

// Animation states
type AnimationState = 'idle' | 'happy' | 'sick' | 'celebrate' | 'sleeping' | 'exercising';

interface LungcatLottieAnimationProps {
  user: User | null;
  size?: number;
  interactive?: boolean;
  onPetClick?: () => void;
  showStatusBar?: boolean; // New prop to hide status info
  temporaryAnimation?: string | null; // For triggering temporary animations
}

// Static animation imports for React Native bundler compatibility
const ANIMATION_IMPORTS = {
  cat: {
    idle: () => require('../../assets/lungcat/animations/lungcat-idle.json'),
    happy: () => require('../../assets/lungcat/animations/lungcat-happy.json'),
    sick: () => require('../../assets/lungcat/animations/lungcat-sick.json'),
    celebrate: () => require('../../assets/lungcat/animations/lungcat-celebrate.json'),
    sleeping: () => require('../../assets/lungcat/animations/lungcat-sleeping.json'),
    exercising: () => require('../../assets/lungcat/animations/lungcat-exercising.json'),
  },
  tiger: {
    idle: () => require('../../assets/lungcat/animations/lungtiger-idle.json'),
    happy: () => require('../../assets/lungcat/animations/lungtiger-happy.json'),
    sick: () => require('../../assets/lungcat/animations/lungtiger-sick.json'),
    celebrate: () => require('../../assets/lungcat/animations/lungtiger-celebrate.json'),
    sleeping: () => require('../../assets/lungcat/animations/lungtiger-sleeping.json'),
    exercising: () => require('../../assets/lungcat/animations/lungtiger-exercising.json'),
  },
  lion: {
    idle: () => require('../../assets/lungcat/animations/lunglion-idle.json'),
    happy: () => require('../../assets/lungcat/animations/lunglion-happy.json'),
    sick: () => require('../../assets/lungcat/animations/lunglion-sick.json'),
    celebrate: () => require('../../assets/lungcat/animations/lunglion-celebrate.json'),
    sleeping: () => require('../../assets/lungcat/animations/lunglion-sleeping.json'),
    exercising: () => require('../../assets/lungcat/animations/lunglion-exercising.json'),
  },
};

// Simple animation loading function
const loadAnimation = (stage: 'cat' | 'tiger' | 'lion', state: AnimationState): any => {
  try {
    const importFunction = ANIMATION_IMPORTS[stage][state];
    if (!importFunction) {
      return ANIMATION_IMPORTS.cat.idle();
    }
    return importFunction();
  } catch (error) {
    return ANIMATION_IMPORTS.cat.idle();
  }
};

// Special effects
const EFFECT_ANIMATIONS = {
  celebration: require('../../assets/lungcat/effects/celebration-confetti.json'),
  levelUp: require('../../assets/lungcat/effects/level-up-sparkles.json'),
  healing: require('../../assets/lungcat/effects/healing-glow.json'),
};

// Evolution animations
const EVOLUTION_ANIMATIONS = {
  catToTiger: require('../../assets/lungcat/animations/evolutions/cat-to-tiger-evolution.json'),
  tigerToLion: require('../../assets/lungcat/animations/evolutions/tiger-to-lion-evolution.json'),
};

export const LungcatLottieAnimation = React.forwardRef<any, LungcatLottieAnimationProps>(({
  user,
  size = 200,
  interactive = true,
  onPetClick,
  showStatusBar = true,
  temporaryAnimation = null,
}, ref) => {
  const { colors } = useTheme();
  const [currentAnimation, setCurrentAnimation] = useState<AnimationState>('idle');

  // Debug log props - DISABLED for performance
  // useEffect(() => {
  //   debugLog.log('🔧 LungcatLottieAnimation props:', { interactive, hasOnPetClick: !!onPetClick, temporaryAnimation });
  // }, [interactive, onPetClick, temporaryAnimation]);
  const [showEffect, setShowEffect] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionType, setEvolutionType] = useState<'catToTiger' | 'tigerToLion' | null>(null);
  const [showEvolutionScreen, setShowEvolutionScreen] = useState(false);
  const lottieRef = useRef<LottieView>(null);
  const bounceValue = useRef(new Animated.Value(1)).current;

  // Initialize animation state when user loads
  useEffect(() => {
    if (user) {
      const initialAnimation = determineAnimationState();
      setCurrentAnimation(initialAnimation);
    }
  }, [user]);

  // Force play animation when source changes
  useEffect(() => {
    if (lottieRef.current) {
      // Small delay to ensure LottieView is ready
      setTimeout(() => {
        lottieRef.current?.play();
      }, 100);
    }
  }, [currentAnimation]);

  // Simple breathing animation
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, [bounceValue]);

  // Expose celebration trigger method to parent components
  React.useImperativeHandle(ref, () => ({
    triggerCelebration: () => {
      setShowEffect('celebration');
      // Clear effect after animation
      setTimeout(() => {
        setShowEffect(null);
      }, 3000);
    }
  }));

  // Check if pet should evolve and trigger evolution
  const checkForEvolution = async () => {
    if (!user) return;

    const totalDays = user.totalDays || 0;
    const today = new Date().toISOString().split('T')[0];

    // Skip if already checked today
    if (user.lastEvolutionCheck === today) return;

    // Determine current stage using same logic as getPetStage
    let currentStage: 'cat' | 'tiger' | 'lion' = 'cat';
    if (user.petStage) {
      currentStage = user.petStage;
    } else {
      if (totalDays >= 91) {
        currentStage = 'lion';
      } else if (totalDays >= 31) {
        currentStage = 'tiger';
      } else {
        currentStage = 'cat';
      }
    }

    let shouldEvolve = false;
    let newStage: 'tiger' | 'lion' | null = null;
    let evolutionAnimation: 'catToTiger' | 'tigerToLion' | null = null;

    // Check evolution conditions
    if (currentStage === 'cat' && totalDays >= 31) {
      shouldEvolve = true;
      newStage = 'tiger';
      evolutionAnimation = 'catToTiger';
    } else if (currentStage === 'tiger' && totalDays >= 91) {
      shouldEvolve = true;
      newStage = 'lion';
      evolutionAnimation = 'tigerToLion';
    }

    if (shouldEvolve && newStage && evolutionAnimation) {
      // Show full-screen evolution experience
      setEvolutionType(evolutionAnimation);
      setShowEvolutionScreen(true);

      // Pet is evolving - keep this log for debugging major events
      debugLog.log(`🎉 EVOLUTION TRIGGERED! ${totalDays} days → ${currentStage.toUpperCase()} evolving to ${newStage?.toUpperCase()}!`);
    }
  };

  // Determine current pet stage based on user progress
  const getPetStage = (): 'cat' | 'tiger' | 'lion' => {
    // Check if user has manually set stage (for backwards compatibility)
    if (user?.petStage) {
      return user.petStage;
    }

    // Auto-determine stage based on total days
    const totalDays = user?.totalDays || 0;

    if (totalDays >= 91) {
      return 'lion';
    } else if (totalDays >= 31) {
      return 'tiger';
    } else {
      return 'cat';
    }
  };

  // Determine animation state based on user health
  const determineAnimationState = (): AnimationState => {
    if (!user) return 'idle';

    const daysSinceQuit = user.totalDays || 0;
    const streak = user.streak || 0;
    const lastCheckIn = user.lastCheckIn;

    // Check if user hasn't checked in today
    const today = new Date();
    const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn) : null;
    const isToday = lastCheckInDate &&
      lastCheckInDate.toDateString() === today.toDateString();

    if (!isToday && daysSinceQuit > 0) {
      return 'sleeping';
    }

    // Health-based states
    if (daysSinceQuit === 0 || streak === 0) {
      return 'sick';
    } else if (streak >= 30) {
      return 'happy';
    } else if (streak >= 7) {
      return 'idle';
    } else if (streak >= 3) {
      return 'idle';  // Show improvement for streaks 3-6
    } else {
      return 'sick';  // Streaks 1-2 still show sick
    }
  };

  // Check for evolution on component mount
  useEffect(() => {
    if (user) {
      checkForEvolution();
    }
  }, [user?.totalDays, user?.petStage]);

  // Static images don't need loading logic - simplified for production

  // Update animation based on user state
  useEffect(() => {
    // Don't interfere with temporary animations
    if (temporaryAnimation) {
      return;
    }

    const newAnimation = determineAnimationState();

    if (newAnimation !== currentAnimation) {
      setCurrentAnimation(newAnimation);
    }
  }, [user?.totalDays, user?.streak, user?.lastCheckIn]);

  // Handle temporary animation changes
  useEffect(() => {
    if (temporaryAnimation) {
      const validAnimation = temporaryAnimation as AnimationState;
      const petStage = getPetStage();

      // Check if the current pet stage has this animation
      if (ANIMATION_IMPORTS[petStage][validAnimation]) {
        setCurrentAnimation(validAnimation);
      }
    } else {
      // When temporary animation ends, revert to normal state
      const normalAnimation = determineAnimationState();
      if (currentAnimation !== normalAnimation) {
        setCurrentAnimation(normalAnimation);
      }
    }
  }, [temporaryAnimation]);

  // Handle pet interaction - use parent callback directly


  // Get pet name based on current stage
  const getPetName = () => {
    const petStage = getPetStage();
    switch (petStage) {
      case 'tiger':
        return '🐯 Lung Tiger';
      case 'lion':
        return '🦁 Lung Lion';
      default:
        return '🐱 Lungcat';
    }
  };

  // Get pet status text with helpful streak information
  const getStatusText = () => {
    const streak = user?.streak || 0;

    switch (currentAnimation) {
      case 'happy':
        return '😊 Sehat & Bahagia!';
      case 'sick':
        if (streak === 0) {
          return '😷 Perlu Check-in Harian';
        } else if (streak < 7) {
          return `😷 Perlu ${7 - streak} Hari Lagi`;
        }
        return '😷 Perlu Perhatian';
      case 'celebrate':
        return '🎉 Merayakan!';
      case 'sleeping':
        return '😴 Belum Check-in Hari Ini';
      case 'exercising':
        return '💪 Olahraga';
      default:
        return '🫁 Bernapas Sehat';
    }
  };

  // Get health percentage using unified system
  const getHealthPercentage = () => {
    return getLungcatHealthPercentage(user);
  };

  // Get Lottie animation source based on current pet stage and state
  const getAnimationSource = () => {
    const petStage = getPetStage();
    // IMPORTANT: Use temporaryAnimation if available, otherwise use currentAnimation
    const animationState = temporaryAnimation || currentAnimation;

    try {
      if (ANIMATION_IMPORTS[petStage] && ANIMATION_IMPORTS[petStage][animationState]) {
        return ANIMATION_IMPORTS[petStage][animationState]();
      }

      // Fallback to idle animation of the same stage
      if (ANIMATION_IMPORTS[petStage] && ANIMATION_IMPORTS[petStage].idle) {
        return ANIMATION_IMPORTS[petStage].idle();
      }

      // Ultimate fallback to cat idle
      return ANIMATION_IMPORTS.cat.idle();
    } catch (error) {
      return ANIMATION_IMPORTS.cat.idle();
    }
  };

  // Handle evolution screen completion
  const handleEvolutionComplete = () => {
    setShowEvolutionScreen(false);
    setEvolutionType(null);
  };

  return (
    <View style={[
      styles.container,
      {
        width: showStatusBar ? size + 80 : size,
        height: showStatusBar ? size + 100 : size
      }
    ]}>
      {/* Pet Status - Only show if showStatusBar is true */}
      {showStatusBar && (
        <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>
            {getPetName()}
          </Text>
          <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
            {getStatusText()}
          </Text>

          {/* Health Bar */}
          <View style={[styles.healthBarContainer, { backgroundColor: colors.lightGray }]}>
            <View
              style={[
                styles.healthBar,
                {
                  width: `${getHealthPercentage()}%`,
                  backgroundColor: getLungcatHealthColor(user, colors)
                }
              ]}
            />
          </View>

          <Text style={[styles.healthText, { color: colors.textSecondary }]}>
            ❤️ {getHealthPercentage()}% • Day {user?.totalDays || 0}
          </Text>
        </View>
      )}

      {/* Main Lottie Animation */}
      <View style={[styles.petContainer, { width: size, height: size }]}>
        {/* Container with overflow hidden to mask white background */}
        <View
          style={[
            styles.animationContainer,
            {
              width: size,
              height: size,
              backgroundColor: colors.surface,
              borderRadius: size * 0.5,
              overflow: 'hidden'
            }
          ]}
        >
          {/* Dynamic LottieView with streak-based animations */}
          <LottieView
            key={`${getPetStage()}-${temporaryAnimation || currentAnimation}`}
            source={getAnimationSource()}
            autoPlay
            loop
            style={{
              width: size,
              height: size,
            }}
          />
        </View>

        {/* Transparent touch overlay on top */}
        {interactive && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
            onPress={() => {
              if (onPetClick) {
                onPetClick();
              }
            }}
            activeOpacity={0.8}
          />
        )}

        {/* Interactive hint */}
        {interactive && (
          <View style={[styles.interactionHint, { backgroundColor: colors.primary }]} pointerEvents="none">
            <MaterialIcons name="touch-app" size={16} color={colors.white} />
          </View>
        )}
      </View>

      {/* Effect Animation - Simple emoji for reliable performance */}
      {showEffect && (
        <View style={[styles.effectAnimation, { width: size + 40, height: size + 40 }]}>
          <Text style={{ fontSize: 48, textAlign: 'center' }}>🎉</Text>
        </View>
      )}

      {/* Controls - Only show if showStatusBar is true */}
      {showStatusBar && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.secondary }]}
            onPress={() => {
              // Static images don't need refresh - maintained for UI consistency
            }}
          >
            <MaterialIcons name="refresh" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Evolution Screen */}
      <EvolutionScreen
        visible={showEvolutionScreen}
        evolutionType={evolutionType}
        onComplete={handleEvolutionComplete}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  healthBarContainer: {
    width: 120,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  healthBar: {
    height: '100%',
    borderRadius: 4,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  petContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  animationContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lottieAnimation: {
    // Lottie fills the container
  },
  effectAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    zIndex: 10,
  },
  interactionHint: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

LungcatLottieAnimation.displayName = 'LungcatLottieAnimation';

export default LungcatLottieAnimation;