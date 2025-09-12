import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';
import { useTranslation } from '../hooks/useTranslation';

interface HealthDisclaimerProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const HealthDisclaimer: React.FC<HealthDisclaimerProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const { t } = useTranslation();

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem('health_disclaimer_accepted', 'true');
      onAccept();
    } catch (error) {
      console.error('Error saving disclaimer acceptance:', error);
      onAccept(); // Continue anyway
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Important Notice',
      'You must accept the health disclaimer to use this app. The app provides motivational support only and is not medical advice.',
      [
        { text: 'Review Again', style: 'default' },
        { text: 'Exit App', style: 'destructive', onPress: onDecline },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDecline}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Important Health Disclaimer</Text>
          <Text style={styles.subtitle}>Please read carefully before using ByeSmoke AI</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 Not Medical Advice</Text>
            <Text style={styles.text}>
              ByeSmoke AI is a motivational and habit-tracking tool only. It is NOT a medical device, 
              healthcare service, or medical advice platform.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍⚕️ Consult Healthcare Professionals</Text>
            <Text style={styles.text}>
              Always consult with qualified healthcare professionals before, during, and after your 
              quit-smoking journey. They can provide personalized medical advice and support.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Motivational Tool Only</Text>
            <Text style={styles.text}>
              All progress calculations, health benefits, and statistics are estimates for 
              motivational purposes only and should not be considered medical measurements.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Emergency Situations</Text>
            <Text style={styles.text}>
              In case of medical emergencies or severe withdrawal symptoms, contact emergency 
              services immediately. Do not rely on this app for emergency medical situations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Individual Results Vary</Text>
            <Text style={styles.text}>
              Success rates and health improvements vary significantly among individuals. This app 
              cannot guarantee successful smoking cessation or specific health outcomes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Your Responsibility</Text>
            <Text style={styles.text}>
              You are responsible for your health decisions. Use this app as a supportive tool 
              alongside professional medical care, not as a replacement for it.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              By continuing, you acknowledge that you understand this is a motivational app only 
              and will seek appropriate medical advice for your health needs.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}
          >
            <Text style={styles.declineButtonText}>I Don't Agree</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Text style={styles.acceptButtonText}>I Understand & Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  warningBox: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

// Hook to check if disclaimer has been accepted
export const useHealthDisclaimer = () => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    checkDisclaimerStatus();
  }, []);

  const checkDisclaimerStatus = async () => {
    try {
      const accepted = await AsyncStorage.getItem('health_disclaimer_accepted');
      setDisclaimerAccepted(accepted === 'true');
    } catch (error) {
      console.error('Error checking disclaimer status:', error);
      setDisclaimerAccepted(false);
    } finally {
      setLoading(false);
    }
  };

  const acceptDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  const resetDisclaimer = async () => {
    try {
      await AsyncStorage.removeItem('health_disclaimer_accepted');
      setDisclaimerAccepted(false);
    } catch (error) {
      console.error('Error resetting disclaimer:', error);
    }
  };

  return {
    disclaimerAccepted,
    loading,
    acceptDisclaimer,
    resetDisclaimer,
  };
};

export default HealthDisclaimer;