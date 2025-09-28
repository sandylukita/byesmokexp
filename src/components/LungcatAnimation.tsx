/**
 * Lungcat Animation Component
 * 
 * Handles PNG sequence animations for the Tamagotchi pet
 * Supports different emotional states and activities
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { User } from '../types';

const { width } = Dimensions.get('window');

// Animation types
type AnimationType = 'idle' | 'happy' | 'sick' | 'celebrate' | 'sleeping' | 'exercising';

interface LungcatAnimationProps {
  user: User;
  size?: number;
  interactive?: boolean;
  onPetClick?: () => void;
}

// Animation frame sequences (you'll replace these with actual PNG paths)
const ANIMATION_FRAMES = {
  idle: [
    require('../assets/lungcat/idle/lungcat-idle-1.png'),
    require('../assets/lungcat/idle/lungcat-idle-2.png'),
    require('../assets/lungcat/idle/lungcat-idle-3.png'),
  ],
  happy: [
    require('../assets/lungcat/happy/lungcat-happy-1.png'),
    require('../assets/lungcat/happy/lungcat-happy-2.png'),
    require('../assets/lungcat/happy/lungcat-happy-3.png'),
    require('../assets/lungcat/happy/lungcat-happy-4.png'),
  ],
  sick: [
    require('../assets/lungcat/sick/lungcat-sick-1.png'),
    require('../assets/lungcat/sick/lungcat-sick-2.png'),
  ],
  celebrate: [
    require('../assets/lungcat/celebrate/lungcat-celebrate-1.png'),
    require('../assets/lungcat/celebrate/lungcat-celebrate-2.png'),
    require('../assets/lungcat/celebrate/lungcat-celebrate-3.png'),
    require('../assets/lungcat/celebrate/lungcat-celebrate-4.png'),
    require('../assets/lungcat/celebrate/lungcat-celebrate-5.png'),
  ],
  sleeping: [
    require('../assets/lungcat/sleeping/lungcat-sleeping-1.png'),
    require('../assets/lungcat/sleeping/lungcat-sleeping-2.png'),
  ],
  exercising: [
    require('../assets/lungcat/exercising/lungcat-exercising-1.png'),
    require('../assets/lungcat/exercising/lungcat-exercising-2.png'),
    require('../assets/lungcat/exercising/lungcat-exercising-3.png'),
  ],
};

// Animation timing (milliseconds per frame)
const ANIMATION_TIMING = {
  idle: 800,        // Slow breathing
  happy: 300,       // Quick bouncing
  sick: 1000,       // Slow, labored
  celebrate: 200,   // Fast celebration
  sleeping: 1500,   // Very slow
  exercising: 400,  // Medium pace
};

export const LungcatAnimation: React.FC<LungcatAnimationProps> = ({
  user,
  size = 150,
  interactive = true,
  onPetClick,
}) => {
  const { colors } = useTheme();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>('idle');
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Animation refs
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const frameInterval = useRef<NodeJS.Timeout | null>(null);

  // Determine animation based on user state
  const determineAnimation = (): AnimationType => {
    const daysSinceQuit = user.totalDays || 0;
    const streak = user.streak || 0;
    const lastCheckIn = user.lastCheckIn;
    
    // Check if user hasn't checked in today (sleeping/inactive)
    const today = new Date();
    const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn) : null;
    const isToday = lastCheckInDate && 
      lastCheckInDate.toDateString() === today.toDateString();
    
    if (!isToday && daysSinceQuit > 0) {
      return 'sleeping';
    }
    
    // Health-based states
    if (daysSinceQuit === 0) {
      return 'sick';
    } else if (streak >= 30) {
      return 'happy';
    } else if (streak >= 7) {
      return 'idle';
    } else {
      return 'sick';
    }
  };

  // Start frame animation
  useEffect(() => {
    const animation = determineAnimation();
    setCurrentAnimation(animation);
    
    if (isPlaying) {
      const frames = ANIMATION_FRAMES[animation];
      const timing = ANIMATION_TIMING[animation];
      
      frameInterval.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, timing);
    }
    
    return () => {
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
      }
    };
  }, [user.totalDays, user.streak, user.lastCheckIn, isPlaying]);

  // Handle pet interaction
  const handlePetClick = () => {
    if (!interactive) return;
    
    // Trigger celebration animation
    setCurrentAnimation('celebrate');
    setCurrentFrame(0);
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset to normal animation after celebration
    setTimeout(() => {
      const normalAnimation = determineAnimation();
      setCurrentAnimation(normalAnimation);
    }, 2000);
    
    onPetClick?.();
  };

  // Get current frame source
  const getCurrentFrame = () => {
    const frames = ANIMATION_FRAMES[currentAnimation];
    return frames[currentFrame % frames.length];
  };

  // Get pet status text
  const getStatusText = () => {
    switch (currentAnimation) {
      case 'happy':
        return '😊 Sehat & Bahagia!';
      case 'sick':
        return '😷 Perlu Perhatian';
      case 'celebrate':
        return '🎉 Merayakan!';
      case 'sleeping':
        return '😴 Istirahat';
      case 'exercising':
        return '💪 Olahraga';
      default:
        return '🫁 Bernapas Sehat';
    }
  };

  // Get health percentage based on user data
  const getHealthPercentage = () => {
    const streak = user.streak || 0;
    if (streak === 0) return 20;
    if (streak < 7) return 40;
    if (streak < 30) return 70;
    if (streak < 90) return 85;
    return 100;
  };

  return (
    <View style={[styles.container, { width: size + 60, height: size + 80 }]}>
      {/* Pet Status */}
      <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {getStatusText()}
        </Text>
        
        {/* Health Bar */}
        <View style={[styles.healthBarContainer, { backgroundColor: colors.lightGray }]}>
          <View 
            style={[
              styles.healthBar, 
              { 
                width: `${getHealthPercentage()}%`,
                backgroundColor: getHealthPercentage() > 60 ? colors.success : 
                               getHealthPercentage() > 30 ? colors.warning : colors.error
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.healthText, { color: colors.textSecondary }]}>
          ❤️ {getHealthPercentage()}%
        </Text>
      </View>

      {/* Animated Pet */}
      <TouchableOpacity 
        onPress={handlePetClick}
        disabled={!interactive}
        style={[styles.petContainer, { width: size, height: size }]}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.petImageContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: bounceAnim }
              ]
            }
          ]}
        >
          <Image
            source={getCurrentFrame()}
            style={[styles.petImage, { width: size, height: size }]}
            resizeMode="contain"
          />
          
          {/* Interactive hint */}
          {interactive && (
            <View style={[styles.interactionHint, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="touch-app" size={16} color={colors.white} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Pet Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.petName, { color: colors.textPrimary }]}>
          Lungcat
        </Text>
        <Text style={[styles.petAge, { color: colors.textSecondary }]}>
          Usia: {user.totalDays || 0} hari
        </Text>
      </View>

      {/* Play/Pause Animation Control */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  healthBarContainer: {
    width: 100,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  healthBar: {
    height: '100%',
    borderRadius: 3,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  petContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    borderRadius: 12,
  },
  interactionHint: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginTop: 16,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  petAge: {
    fontSize: 12,
    fontWeight: '500',
  },
  controlButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LungcatAnimation;