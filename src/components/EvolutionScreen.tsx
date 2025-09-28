/**
 * Evolution Screen Component
 *
 * Full-screen evolution experience when pet evolves to next stage
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Evolution animations
const EVOLUTION_ANIMATIONS = {
  catToTiger: require('../../assets/lungcat/animations/evolutions/cat-to-tiger-evolution.json'),
  tigerToLion: require('../../assets/lungcat/animations/evolutions/tiger-to-lion-evolution.json'),
};

interface EvolutionScreenProps {
  visible: boolean;
  evolutionType: 'catToTiger' | 'tigerToLion' | null;
  onComplete: () => void;
}

export const EvolutionScreen: React.FC<EvolutionScreenProps> = ({
  visible,
  evolutionType,
  onComplete,
}) => {
  const { colors } = useTheme();
  const lottieRef = useRef<LottieView>(null);

  // Auto-complete after animation duration
  useEffect(() => {
    if (visible && evolutionType) {
      // Evolution animation duration (4 seconds) + 1 second for text
      const timer = setTimeout(() => {
        onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, evolutionType, onComplete]);

  // Get evolution details
  const getEvolutionDetails = () => {
    switch (evolutionType) {
      case 'catToTiger':
        return {
          title: '🎉 Evolution!',
          subtitle: 'Your Lungcat has evolved!',
          newStage: '🐯 Lung Tiger',
          description: 'You\'ve built incredible strength and determination in your smoke-free journey!',
          achievement: 'Day 31 Milestone Reached',
        };
      case 'tigerToLion':
        return {
          title: '👑 Ultimate Evolution!',
          subtitle: 'Your Lung Tiger has evolved!',
          newStage: '🦁 Lung Lion',
          description: 'You are now the king of health! Your mastery over addiction is legendary!',
          achievement: 'Day 90 Milestone Reached',
        };
      default:
        return {
          title: 'Evolution',
          subtitle: 'Your pet is evolving!',
          newStage: 'New Form',
          description: 'Congratulations on your progress!',
          achievement: 'Milestone Reached',
        };
    }
  };

  const evolutionDetails = getEvolutionDetails();

  if (!visible || !evolutionType) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Background gradient effect */}
        <View style={[styles.backgroundGlow, { backgroundColor: colors.primary + '20' }]} />

        {/* Evolution Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            ref={lottieRef}
            source={EVOLUTION_ANIMATIONS[evolutionType]}
            autoPlay={true}
            loop={false}
            style={styles.evolutionAnimation}
            resizeMode="contain"
            speed={1}
          />
        </View>

        {/* Evolution Text */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {evolutionDetails.title}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
            {evolutionDetails.subtitle}
          </Text>

          <View style={styles.newStageContainer}>
            <Text style={[styles.newStage, { color: colors.primary }]}>
              {evolutionDetails.newStage}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {evolutionDetails.description}
          </Text>

          <View style={[styles.achievementBadge, { backgroundColor: colors.secondary }]}>
            <MaterialIcons name="military-tech" size={20} color={colors.white} />
            <Text style={[styles.achievementText, { color: colors.white }]}>
              {evolutionDetails.achievement}
            </Text>
          </View>
        </View>

        {/* Skip button */}
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: colors.surface }]}
          onPress={onComplete}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Tap to continue
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  animationContainer: {
    width: width * 0.8,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  evolutionAnimation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  newStageContainer: {
    marginBottom: 20,
  },
  newStage: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    opacity: 0.7,
  },
  skipText: {
    fontSize: 14,
    marginRight: 8,
  },
});

export default EvolutionScreen;