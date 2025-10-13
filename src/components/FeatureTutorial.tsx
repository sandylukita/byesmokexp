import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Animated
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { TYPOGRAPHY } from '../utils/typography';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'center';
  action?: string;
}

interface FeatureTutorialProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  language: 'en' | 'id';
}

const FeatureTutorial: React.FC<FeatureTutorialProps> = ({ 
  visible, 
  onComplete, 
  onSkip, 
  language 
}) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const tutorialSteps: TutorialStep[] = language === 'en' ? [
    {
      id: 'welcome',
      title: '🎉 Welcome to ByeSmoke!',
      description: 'Your AI-powered companion for quitting smoking. Let\'s discover what makes this app special!',
      position: 'center'
    },
    {
      id: 'missions',
      title: '🎯 Daily Missions',
      description: 'Complete engaging daily missions to build healthy habits and earn XP. Each mission is designed to support your quit journey!',
      position: 'top',
      action: 'Tap to see missions'
    },
    {
      id: 'progress',
      title: '📊 Track Your Progress',
      description: 'Monitor your streak, money saved, and health improvements. Visual progress keeps you motivated!',
      position: 'bottom',
      action: 'View your stats'
    },
    {
      id: 'ai_motivation',
      title: '🤖 AI Motivation',
      description: 'Get personalized, contextual motivation powered by advanced AI. Your personal coach available 24/7!',
      position: 'center',
      action: 'Try AI motivation'
    },
    {
      id: 'community',
      title: '👥 Community Features',
      description: 'Connect with others on the same journey. See leaderboards, badges, and community statistics!',
      position: 'bottom',
      action: 'Explore community'
    },
    {
      id: 'ready',
      title: '🚀 You\'re All Set!',
      description: 'You now know the key features. Remember: every small step counts toward your smoke-free future!',
      position: 'center'
    }
  ] : [
    {
      id: 'welcome',
      title: '🎉 Selamat Datang di ByeSmoke!',
      description: 'Teman AI untuk berhenti merokok. Mari jelajahi fitur-fitur istimewa aplikasi ini!',
      position: 'center'
    },
    {
      id: 'missions',
      title: '🎯 Misi Harian',
      description: 'Selesaikan misi harian yang menarik untuk membangun kebiasaan sehat dan dapatkan XP!',
      position: 'top',
      action: 'Ketuk untuk lihat misi'
    },
    {
      id: 'progress',
      title: '📊 Pantau Kemajuan',
      description: 'Monitor streak, uang yang dihemat, dan perbaikan kesehatan. Progress visual memotivasi Anda!',
      position: 'bottom',
      action: 'Lihat statistik Anda'
    },
    {
      id: 'ai_motivation',
      title: '🤖 Motivasi AI',
      description: 'Dapatkan motivasi personal yang disesuaikan dengan AI canggih. Pelatih pribadi 24/7!',
      position: 'center',
      action: 'Coba motivasi AI'
    },
    {
      id: 'community',
      title: '👥 Fitur Komunitas',
      description: 'Terhubung dengan sesama pejuang. Lihat leaderboard, badge, dan statistik komunitas!',
      position: 'bottom',
      action: 'Jelajahi komunitas'
    },
    {
      id: 'ready',
      title: '🚀 Siap Memulai!',
      description: 'Kini Anda tahu fitur utamanya. Ingat: setiap langkah kecil menuju hidup bebas rokok!',
      position: 'center'
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.tutorialContainer, 
            { backgroundColor: colors.surface },
            { opacity: fadeAnim }
          ]}
        >
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {currentStep + 1} / {tutorialSteps.length}
            </Text>
          </View>

          {/* Tutorial content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {currentStepData.title}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {currentStepData.description}
            </Text>
            
            {currentStepData.action && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <Text style={[styles.actionText, { color: colors.background }]}>
                  {currentStepData.action}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Navigation buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, { borderColor: colors.border }]}
              onPress={handleSkip}
            >
              <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'Skip' : 'Lewati'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.navButtonGroup}>
              {currentStep > 0 && (
                <TouchableOpacity 
                  style={[styles.navButton, { borderColor: colors.border }]}
                  onPress={handlePrevious}
                >
                  <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>
                    {language === 'en' ? 'Back' : 'Kembali'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <Text style={[styles.nextButtonText, { color: colors.background }]}>
                  {currentStep === tutorialSteps.length - 1 
                    ? (language === 'en' ? 'Get Started!' : 'Mulai!')
                    : (language === 'en' ? 'Next' : 'Lanjut')
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'System',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  navButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default FeatureTutorial;