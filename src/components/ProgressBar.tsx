import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View 
          style={[
            styles.fill,
            { width: `${progress}%` }
          ]} 
        />
      </View>
      <View style={styles.steps}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.step,
              index + 1 <= currentStep && styles.stepActive,
              index + 1 === currentStep && styles.stepCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.sm,
    paddingHorizontal: 2,
  },
  step: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepActive: {
    backgroundColor: COLORS.secondary,
  },
  stepCurrent: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default ProgressBar;