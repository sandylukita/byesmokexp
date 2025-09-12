import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { TYPOGRAPHY } from '../utils/typography';
import { logCraving } from '../services/cravingService';
import { demoGetCurrentUser } from '../services/demoAuth';

const { width } = Dimensions.get('window');

interface CravingModalProps {
  visible: boolean;
  onClose: () => void;
}

type CravingMethod = 'breathing' | 'distraction' | 'reasons';

const CravingModal: React.FC<CravingModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedIntensity, setSelectedIntensity] = useState<number>(3);
  const [activeMethod, setActiveMethod] = useState<CravingMethod | null>(null);
  const [breathCount, setBreathCount] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [timer, setTimer] = useState<number>(0);
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [tappedCircles, setTappedCircles] = useState<number[]>([]);
  const [currentTarget, setCurrentTarget] = useState<number>(1);

  // Breathing timer logic
  useEffect(() => {
    if (activeMethod === 'breathing' && sessionStarted) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
        
        // 4-7-8 breathing pattern (4 seconds inhale, 7 hold, 8 exhale, 1 pause)
        const cycleTime = timer % 20;
        if (cycleTime < 4) setBreathPhase('inhale');
        else if (cycleTime < 11) setBreathPhase('hold1');
        else if (cycleTime < 19) setBreathPhase('exhale');
        else setBreathPhase('hold2');
        
        // Complete cycle
        if (cycleTime === 19) {
          setBreathCount(prev => prev + 1);
          if (breathCount + 1 >= 4) { // 4 cycles = ~1.5 minutes
            handleMethodComplete('breathing');
            return;
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeMethod, sessionStarted, timer, breathCount]);

  const handleIntensitySelect = (intensity: number) => {
    setSelectedIntensity(intensity);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMethodSelect = (method: CravingMethod) => {
    setActiveMethod(method);
    setSessionStarted(true);
    
    if (method === 'breathing') {
      setBreathCount(0);
      setTimer(0);
      setBreathPhase('inhale');
    }
    
    if (method === 'reasons') {
      // Show reasons immediately and complete
      setTimeout(() => handleMethodComplete('reasons'), 3000);
    }
    
    if (method === 'distraction') {
      setTappedCircles([]);
      setCurrentTarget(1);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCircleTap = (circleNumber: number) => {
    if (circleNumber === currentTarget) {
      // Correct circle tapped
      const newTapped = [...tappedCircles, circleNumber];
      setTappedCircles(newTapped);
      setCurrentTarget(currentTarget + 1);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Check if all circles completed (1, 2, 3, 4)
      if (newTapped.length >= 4) {
        // Add small delay to show completion
        setTimeout(() => handleMethodComplete('distraction'), 500);
      }
    } else {
      // Wrong circle - restart the sequence
      setTappedCircles([]);
      setCurrentTarget(1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleMethodComplete = async (method: CravingMethod) => {
    try {
      await logCraving(selectedIntensity, method);
      console.log('✓ Craving session completed:', method);
    } catch (error) {
      console.log('⚠️ Could not log craving:', error);
    }
    
    setActiveMethod(null);
    setSessionStarted(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const getUserReasons = () => {
    const user = demoGetCurrentUser();
    return [
      'Better health',
      'Save money', 
      'For my family',
      user?.displayName ? `I promised ${user.displayName}` : 'I made a promise'
    ];
  };

  const renderIntensitySelector = () => (
    <View style={styles.intensityContainer}>
      <Text style={[styles.intensityTitle, { color: colors.textPrimary }]}>
        How intense is your craving?
      </Text>
      <View style={styles.intensityButtons}>
        {[1, 2, 3, 4, 5].map(intensity => (
          <TouchableOpacity
            key={intensity}
            style={[
              styles.intensityButton,
              { 
                backgroundColor: selectedIntensity === intensity ? colors.primary : colors.surface,
                borderColor: colors.primary 
              }
            ]}
            onPress={() => handleIntensitySelect(intensity)}
          >
            <Text style={[
              styles.intensityText,
              { color: selectedIntensity === intensity ? colors.white : colors.textPrimary }
            ]}>
              {intensity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMethodButtons = () => (
    <View style={styles.methodContainer}>
      <TouchableOpacity
        style={[styles.methodButton, { backgroundColor: colors.secondary }]}
        onPress={() => handleMethodSelect('breathing')}
      >
        <MaterialIcons name="air" size={32} color={colors.white} />
        <Text style={[styles.methodTitle, { color: colors.white }]}>
          4-7-8 Breathing
        </Text>
        <Text style={[styles.methodDesc, { color: colors.white }]}>
          2 minutes guided breathing
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodButton, { backgroundColor: colors.accent }]}
        onPress={() => handleMethodSelect('distraction')}
      >
        <MaterialIcons name="games" size={32} color={colors.white} />
        <Text style={[styles.methodTitle, { color: colors.white }]}>
          Quick Distraction
        </Text>
        <Text style={[styles.methodDesc, { color: colors.white }]}>
          30 second focus game
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodButton, { backgroundColor: colors.primary }]}
        onPress={() => handleMethodSelect('reasons')}
      >
        <MaterialIcons name="favorite" size={32} color={colors.white} />
        <Text style={[styles.methodTitle, { color: colors.white }]}>
          Remember Why
        </Text>
        <Text style={[styles.methodDesc, { color: colors.white }]}>
          Your personal reasons
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBreathingSession = () => (
    <View style={styles.breathingContainer}>
      <Text style={[styles.breathingTitle, { color: colors.textPrimary }]}>
        4-7-8 Breathing
      </Text>
      
      <View style={[styles.breathingCircle, { borderColor: colors.secondary }]}>
        <Text style={[styles.breathingPhase, { color: colors.secondary }]}>
          {breathPhase === 'inhale' && 'Inhale'}
          {breathPhase === 'hold1' && 'Hold'}
          {breathPhase === 'exhale' && 'Exhale'}
          {breathPhase === 'hold2' && 'Pause'}
        </Text>
        <Text style={[styles.breathingCount, { color: colors.textSecondary }]}>
          {breathCount + 1}/4
        </Text>
      </View>
      
      <Text style={[styles.breathingInstruction, { color: colors.textSecondary }]}>
        Follow the rhythm and breathe deeply
      </Text>
    </View>
  );

  const renderReasons = () => (
    <View style={styles.reasonsContainer}>
      <Text style={[styles.reasonsTitle, { color: colors.textPrimary }]}>
        Why You Decided to Quit:
      </Text>
      {getUserReasons().map((reason, index) => (
        <View key={index} style={styles.reasonItem}>
          <MaterialIcons name="favorite" size={20} color={colors.error} />
          <Text style={[styles.reasonText, { color: colors.textPrimary }]}>
            {reason}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderDistraction = () => (
    <View style={styles.distractionContainer}>
      <Text style={[styles.distractionTitle, { color: colors.textPrimary }]}>
        Tap the Circles in Order
      </Text>
      <Text style={[styles.distractionProgress, { color: colors.primary }]}>
        Next: {currentTarget} | Progress: {tappedCircles.length}/4
      </Text>
      <View style={styles.distractionGame}>
        {[1, 2, 3, 4].map(item => {
          const isCompleted = tappedCircles.includes(item);
          const isNext = item === currentTarget;
          const circleColor = isCompleted 
            ? colors.success 
            : isNext 
              ? colors.primary 
              : colors.accent;
              
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.distractionCircle, 
                { 
                  backgroundColor: circleColor,
                  opacity: isCompleted ? 0.7 : 1,
                  transform: [{ scale: isNext ? 1.1 : 1 }]
                }
              ]}
              onPress={() => handleCircleTap(item)}
            >
              <Text style={[styles.distractionNumber, { color: colors.white }]}>
                {isCompleted ? '✓' : item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.distractionDesc, { color: colors.textSecondary }]}>
        {tappedCircles.length === 0 
          ? 'Tap circle 1 to start' 
          : `Great! Now tap circle ${currentTarget}`}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Craving Support
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!activeMethod && (
            <>
              {renderIntensitySelector()}
              {renderMethodButtons()}
            </>
          )}

          {activeMethod === 'breathing' && renderBreathingSession()}
          {activeMethod === 'reasons' && renderReasons()}
          {activeMethod === 'distraction' && renderDistraction()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: 'bold',
  },
  intensityContainer: {
    marginBottom: 20,
  },
  intensityTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: 'bold',
  },
  methodContainer: {
    gap: 12,
  },
  methodButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  methodTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: 'bold',
    flex: 1,
  },
  methodDesc: {
    ...TYPOGRAPHY.bodySmall,
    opacity: 0.9,
  },
  breathingContainer: {
    alignItems: 'center',
  },
  breathingTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: 30,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingPhase: {
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
  },
  breathingCount: {
    ...TYPOGRAPHY.bodyLarge,
    marginTop: 5,
  },
  breathingInstruction: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
  },
  reasonsContainer: {
    gap: 15,
  },
  reasonsTitle: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
    marginBottom: 10,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  reasonText: {
    ...TYPOGRAPHY.bodyLarge,
    flex: 1,
  },
  distractionContainer: {
    alignItems: 'center',
    gap: 20,
  },
  distractionTitle: {
    ...TYPOGRAPHY.h3,
  },
  distractionProgress: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  distractionGame: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  distractionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distractionNumber: {
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
  },
  distractionDesc: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
  },
});

export default CravingModal;