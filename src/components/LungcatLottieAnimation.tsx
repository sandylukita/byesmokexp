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
} from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { User } from '../types';
import { getLungcatHealthPercentage, getLungcatHealthColor } from '../utils/lungcatHealth';
import EvolutionScreen from './EvolutionScreen';
import { debugLog } from '../utils/performanceOptimizer';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Enhanced animation cache with persistent storage
class AnimationCache {
  private memoryCache = new Map<string, any>();
  private cacheMetadata = new Map<string, { timestamp: number; size: number }>();
  private readonly CACHE_KEY = 'lungcat_animation_cache';
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
  private readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  async get(key: string): Promise<any> {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Check persistent cache
    try {
      const cachedData = await AsyncStorage.getItem(`${this.CACHE_KEY}_${key}`);
      const metadata = this.cacheMetadata.get(key);

      if (cachedData && metadata) {
        // Check if cache is still valid
        if (Date.now() - metadata.timestamp < this.CACHE_TTL) {
          const parsed = JSON.parse(cachedData);
          this.memoryCache.set(key, parsed);
          return parsed;
        } else {
          // Cache expired, remove it
          await this.remove(key);
        }
      }
    } catch (error) {
      debugLog.error(`Cache read error for ${key}:`, error);
    }

    return null;
  }

  async set(key: string, data: any): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      const size = new Blob([serialized]).size;

      // Check if adding this would exceed cache size limit
      await this.ensureCacheSpace(size);

      // Store in memory cache
      this.memoryCache.set(key, data);

      // Store metadata
      this.cacheMetadata.set(key, {
        timestamp: Date.now(),
        size
      });

      // Store in persistent cache
      await AsyncStorage.setItem(`${this.CACHE_KEY}_${key}`, serialized);

      debugLog.log(`Cached animation: ${key} (${(size / 1024).toFixed(1)}KB)`);
    } catch (error) {
      debugLog.error(`Cache write error for ${key}:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    this.cacheMetadata.delete(key);
    try {
      await AsyncStorage.removeItem(`${this.CACHE_KEY}_${key}`);
    } catch (error) {
      debugLog.error(`Cache remove error for ${key}:`, error);
    }
  }

  private async ensureCacheSpace(requiredSize: number): Promise<void> {
    const currentSize = Array.from(this.cacheMetadata.values())
      .reduce((total, metadata) => total + metadata.size, 0);

    if (currentSize + requiredSize > this.MAX_CACHE_SIZE) {
      // Remove oldest entries until we have enough space
      const sortedEntries = Array.from(this.cacheMetadata.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      let freedSpace = 0;
      for (const [key] of sortedEntries) {
        await this.remove(key);
        freedSpace += this.cacheMetadata.get(key)?.size || 0;
        if (freedSpace >= requiredSize) break;
      }

      debugLog.log(`Freed ${(freedSpace / 1024).toFixed(1)}KB of cache space`);
    }
  }

  async loadMetadata(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY));

      for (const fullKey of cacheKeys) {
        const key = fullKey.replace(`${this.CACHE_KEY}_`, '');
        const data = await AsyncStorage.getItem(fullKey);

        if (data) {
          const size = new Blob([data]).size;
          this.cacheMetadata.set(key, {
            timestamp: Date.now(), // Assume recent for existing cache
            size
          });
        }
      }

      debugLog.log(`Loaded cache metadata for ${cacheKeys.length} animations`);
    } catch (error) {
      debugLog.error('Failed to load cache metadata:', error);
    }
  }

  getCacheStats(): { count: number; sizeKB: number; memoryCount: number } {
    const totalSize = Array.from(this.cacheMetadata.values())
      .reduce((total, metadata) => total + metadata.size, 0);

    return {
      count: this.cacheMetadata.size,
      sizeKB: Math.round(totalSize / 1024),
      memoryCount: this.memoryCache.size
    };
  }
}

const animationCache = new AnimationCache();

// Lazy loading function for animations
const loadAnimation = async (stage: 'cat' | 'tiger' | 'lion', state: AnimationState): Promise<any> => {
  const cacheKey = `${stage}-${state}`;

  // Check cache first
  const cached = await animationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Import animation using static function based on stage and state
    const importFunction = ANIMATION_IMPORTS[stage][state];
    if (!importFunction) {
      throw new Error(`No import function for ${stage}-${state}`);
    }

    const animation = importFunction();

    // Cache the loaded animation
    await animationCache.set(cacheKey, animation);
    debugLog.log(`Loaded animation: ${cacheKey}`);

    return animation;
  } catch (error) {
    debugLog.error(`Failed to load animation ${cacheKey}:`, error);
    // Fallback to cat idle animation
    const fallbackKey = 'cat-idle';
    const fallbackCached = await animationCache.get(fallbackKey);

    if (fallbackCached) {
      return fallbackCached;
    }

    const fallback = ANIMATION_IMPORTS.cat.idle();
    await animationCache.set(fallbackKey, fallback);
    return fallback;
  }
};

// Preload critical animations
const preloadCriticalAnimations = async (stage: 'cat' | 'tiger' | 'lion') => {
  // Only preload idle and happy animations for immediate use
  const criticalStates: AnimationState[] = ['idle', 'happy'];

  for (const state of criticalStates) {
    await loadAnimation(stage, state);
  }

  debugLog.log(`Preloaded critical animations for ${stage} stage`);

  // Background preload next stage animations if close to evolution
  setTimeout(() => {
    preloadNextStageAnimations(stage);
  }, 1000); // Delay to not impact initial load
};

// Preload next stage animations in background
const preloadNextStageAnimations = async (currentStage: 'cat' | 'tiger' | 'lion') => {
  try {
    let nextStage: 'cat' | 'tiger' | 'lion' | null = null;

    if (currentStage === 'cat') {
      nextStage = 'tiger';
    } else if (currentStage === 'tiger') {
      nextStage = 'lion';
    }

    if (nextStage) {
      // Preload just idle and happy for next stage
      await loadAnimation(nextStage, 'idle');
      await loadAnimation(nextStage, 'happy');
      debugLog.log(`Preloaded next stage animations: ${nextStage}`);
    }
  } catch (error) {
    debugLog.log('Background preload failed (non-critical):', error);
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
  const [showEffect, setShowEffect] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionType, setEvolutionType] = useState<'catToTiger' | 'tigerToLion' | null>(null);
  const [showEvolutionScreen, setShowEvolutionScreen] = useState(false);
  const [loadedAnimationSource, setLoadedAnimationSource] = useState<any>(null);
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);

  const lottieRef = useRef<LottieView>(null);
  const effectRef = useRef<LottieView>(null);

  // Expose celebration trigger method to parent components
  React.useImperativeHandle(ref, () => ({
    triggerCelebration: () => {
      setShowEffect('celebration');
      if (effectRef.current) {
        effectRef.current.play();
      }
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
    } else {
      return 'sick';
    }
  };

  // Initialize cache and check for evolution on component mount
  useEffect(() => {
    // Initialize cache metadata on first load
    animationCache.loadMetadata();

    if (user) {
      // Log current user progress and pet stage for debugging
      const currentStage = getPetStage();
      debugLog.log(`🐾 Pet Status: ${user.totalDays || 0} days → Stage: ${currentStage.toUpperCase()} (${
        currentStage === 'cat' ? '🐱 Lungcat' :
        currentStage === 'tiger' ? '🐯 Lung Tiger' :
        '🦁 Lung Lion'
      })`);

      checkForEvolution();

      // Preload critical animations for current stage
      preloadCriticalAnimations(currentStage);

      // Log cache stats for debugging
      const cacheStats = animationCache.getCacheStats();
      debugLog.log(`Animation cache: ${cacheStats.count} total, ${cacheStats.memoryCount} in memory, ${cacheStats.sizeKB}KB`);
    }
  }, [user?.totalDays, user?.petStage]);

  // Load animation when current animation or pet stage changes
  useEffect(() => {
    loadCurrentAnimationSource();
  }, [currentAnimation, user?.petStage, isEvolving, evolutionType]);

  // Update animation based on user state
  useEffect(() => {
    // Don't interfere with temporary animations
    if (temporaryAnimation) {
      return;
    }

    const newAnimation = determineAnimationState();

    if (newAnimation !== currentAnimation) {
      setCurrentAnimation(newAnimation);

      // Small delay to ensure animation source is updated
      setTimeout(() => {
        if (lottieRef.current && !temporaryAnimation) {
          lottieRef.current.reset();
          lottieRef.current.play();
        }
      }, 100);
    }
  }, [user?.totalDays, user?.streak, user?.lastCheckIn]);

  // Handle temporary animation changes
  useEffect(() => {
    if (temporaryAnimation) {
      const validAnimation = temporaryAnimation as AnimationState;
      if (ANIMATION_IMPORTS.cat[validAnimation]) {
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

  // Handle pet interaction
  const handlePetClick = () => {
    if (!interactive) return;

    // Play celebration animation
    setCurrentAnimation('celebrate');
    setShowEffect('celebration');

    // Reset animation after celebration
    setTimeout(() => {
      const normalAnimation = determineAnimationState();
      setCurrentAnimation(normalAnimation);
      setShowEffect(null);
    }, 3000);

    // Trigger callback
    onPetClick?.();

    // Play celebration effect
    if (effectRef.current) {
      effectRef.current.play();
    }
  };

  // Load animation source lazily
  const loadCurrentAnimationSource = async () => {
    setIsLoadingAnimation(true);

    try {
      // Show evolution animation if evolving
      if (isEvolving && evolutionType) {
        setLoadedAnimationSource(EVOLUTION_ANIMATIONS[evolutionType]);
        return;
      }

      const petStage = getPetStage();
      const source = await loadAnimation(petStage, currentAnimation);
      setLoadedAnimationSource(source);
    } catch (error) {
      debugLog.error('Failed to load animation source:', error);
      // Fallback to basic cat idle animation
      setLoadedAnimationSource(require('../../assets/lungcat/animations/lungcat-idle.json'));
    } finally {
      setIsLoadingAnimation(false);
    }
  };

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
      <TouchableOpacity
        onPress={handlePetClick}
        disabled={!interactive}
        style={[styles.petContainer, { width: size, height: size }]}
        activeOpacity={0.8}
      >
        {/* Container with overflow hidden to mask white background */}
        <View style={[
          styles.animationContainer,
          {
            width: size,
            height: size,
            backgroundColor: colors.surface,
            borderRadius: size * 0.5,
            overflow: 'hidden'
          }
        ]}>
          {loadedAnimationSource ? (
            <LottieView
              key={`lungcat-${currentAnimation}-${getPetStage()}`} // Force re-render for clean animation changes
              ref={lottieRef}
              source={loadedAnimationSource}
              autoPlay={true} // Always autoplay for immediate response
              loop={!['celebrate', 'happy', 'exercising'].includes(currentAnimation)} // Don't loop temporary animations
              style={[styles.lottieAnimation, { width: size, height: size }]}
              resizeMode="contain"
              renderMode="HARDWARE" // Use hardware rendering for smoother animations
              speed={1.2} // Slightly faster for more responsive feel
              useNativeLooping={false} // Disable native looping to have more control
              cacheComposition={true}
            />
          ) : (
            // Show loading placeholder while animation loads
            <View style={[styles.loadingPlaceholder, { width: size, height: size }]}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {isLoadingAnimation ? 'Loading...' : '🐱'}
              </Text>
            </View>
          )}
        </View>

        {/* Interactive hint */}
        {interactive && (
          <View style={[styles.interactionHint, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="touch-app" size={16} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>

      {/* Effect Animation Overlay */}
      {showEffect && (
        <LottieView
          ref={effectRef}
          source={EFFECT_ANIMATIONS[showEffect]}
          autoPlay
          loop={false}
          style={[styles.effectAnimation, { width: size + 40, height: size + 40 }]}
          resizeMode="contain"
        />
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
            onPress={() => lottieRef.current?.play()}
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
  loadingPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '600',
  },
});

LungcatLottieAnimation.displayName = 'LungcatLottieAnimation';

export default LungcatLottieAnimation;