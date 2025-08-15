import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Share,
    Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../services/auth';
import { demoGetCurrentUser, demoRestoreUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { NotificationService } from '../services/notificationService';
import { 
  showSubscriptionOptions, 
  formatSubscriptionStatus,
  checkSubscriptionStatus,
  SUBSCRIPTION_PLANS,
  handleSubscription
} from '../services/subscription';

import { User } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { calculateLevel } from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../utils/translations';

const { width, height } = Dimensions.get('window');

interface ProfileScreenProps {
  onLogout: () => void;
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [legalDocument, setLegalDocument] = useState<'privacy' | 'terms'>('privacy');
  const { isDarkMode, colors, toggleDarkMode, setLanguage, canUseDarkMode, updateUser } = useTheme();
  const { t, language } = useTranslation();

  useEffect(() => {
    loadUserData();
  }, []);

  // Real-time listener for Firebase user data sync
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      console.log('Setting up real-time listener for ProfileScreen...');
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (auth.currentUser && doc.exists()) {
          const userData = { id: firebaseUser.uid, ...doc.data() } as User;
          console.log('Profile real-time update received:', {
            email: userData.email,
            displayName: userData.displayName,
            isPremium: userData.isPremium,
            xp: userData.xp
          });
          
          // Update user data - Profile screen accepts all updates since user settings can change
          setUser(currentUser => {
            if (!currentUser) return userData;
            
            console.log('Accepting Profile screen Firebase update');
            return userData;
          });
        }
      }, (error) => {
        if (auth.currentUser) {
          console.error('Error in Profile real-time listener:', error);
        }
      });
      
      return () => {
        console.log('Cleaning up Profile real-time listener');
        unsubscribe();
      };
    }
  }, [auth.currentUser]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('ProfileScreen focused, reloading data...');
      
      // Add a small delay to ensure any pending updates from other screens are completed
      const timeoutId = setTimeout(() => {
        loadUserData();
      }, 100); // 100ms delay
      
      return () => clearTimeout(timeoutId);
    }, [])
  );

  const loadUserData = async () => {
    console.log('Starting loadUserData in ProfileScreen...');
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
            
            
            console.log('✓ Firebase user data loaded:', {
              email: userData.email,
              completedMissions: userData.completedMissions?.length || 0,
              badges: userData.badges?.length || 0,
              xp: userData.xp,
              totalDays: userData.totalDays
            });
            setUser(userData);
            // updateUser(userData); // Temporarily disabled to prevent infinite loop
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
        
        console.log('✓ Demo user found in memory:', {
          email: demoUser.email,
          completedMissions: demoUser.completedMissions?.length || 0,
          badges: demoUser.badges?.length || 0,
          xp: demoUser.xp,
          totalDays: demoUser.totalDays
        });
        setUser(demoUser);
        // updateUser(demoUser); // Temporarily disabled to prevent infinite loop
        setLoading(false);
        return;
      }
      
      // Try to restore demo user from storage as last resort
      console.log('No demo user in memory, checking storage...');
      const restoredUser = await demoRestoreUser();
      if (restoredUser) {
        console.log('✓ Demo user restored from storage:', {
          email: restoredUser.email,
          completedMissions: restoredUser.completedMissions?.length || 0,
          badges: restoredUser.badges?.length || 0,
          xp: restoredUser.xp,
          totalDays: restoredUser.totalDays
        });
        setUser(restoredUser);
        // updateUser(restoredUser); // Temporarily disabled to prevent infinite loop
        setLoading(false);
        return;
      }

      console.log('No user found in any data source');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t.profile.logout,
      t.profile.logoutMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.logoutConfirm,
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onLogout();
            } catch (error) {
              Alert.alert(t.common.error, t.alerts.loadError);
            }
          },
        },
      ]
    );
  };

  const handleUpgrade = () => {
    setSubscriptionModalVisible(true);
  };

  const showCustomAlert = (title: string, message: string) => {
    setModalContent({ title, message });
    setModalVisible(true);
  };

  const handleNotifications = () => {
    console.log('handleNotifications called, opening modal...');
    setNotificationModalVisible(true);
  };

  const toggleNotifications = async () => {
    if (!user) return;
    
    // If turning notifications ON, request permissions first
    if (!user.settings.notifications) {
      try {
        const permissionStatus = await NotificationService.requestPermissions();
        
        if (permissionStatus !== 'granted') {
          const message = permissionStatus === 'denied' 
            ? t.notifications.permissionDenied
            : t.notifications.permissionUndetermined;
          
          showCustomAlert(
            t.notifications.permissionRequired,
            message
          );
          return;
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        showCustomAlert(t.common.error, 'Gagal meminta izin notifikasi');
        return;
      }
    }
    
    const updatedSettings = {
      ...user.settings,
      notifications: !user.settings.notifications
    };
    
    const updatedUser = {
      ...user,
      settings: updatedSettings
    };
    
    setUser(updatedUser);
    // updateUser(updatedUser); // Temporarily disabled to prevent infinite loop

    // Handle notification scheduling
    try {
      const success = await NotificationService.rescheduleIfNeeded(
        updatedSettings.notifications,
        user.settings.reminderTime,
        language
      );
      
      if (!success && updatedSettings.notifications) {
        // If scheduling failed, revert the setting
        console.warn('Failed to schedule notifications, reverting setting');
        setUser({
          ...user,
          settings: {
            ...user.settings,
            notifications: false
          }
        });
        showCustomAlert(
          t.notifications.schedulingFailed,
          t.notifications.schedulingFailedDesc
        );
      }
    } catch (error) {
      console.error('Error managing notifications:', error);
    }
  };

  const updateReminderTime = async (time: string) => {
    if (!user) return;
    
    const updatedSettings = {
      ...user.settings,
      reminderTime: time
    };
    
    const updatedUser = {
      ...user,
      settings: updatedSettings
    };
    
    setUser(updatedUser);
    // updateUser(updatedUser); // Temporarily disabled to prevent infinite loop

    // Reschedule notification if notifications are enabled
    if (user.settings.notifications) {
      try {
        const success = await NotificationService.rescheduleIfNeeded(true, time, language);
        
        if (!success) {
          console.warn('Failed to reschedule notification for new time');
          showCustomAlert(
            t.notifications.timeChangeFailed,
            t.notifications.timeChangeFailedDesc
          );
        } else {
          console.log('Daily reminder rescheduled for', time);
        }
      } catch (error) {
        console.error('Error rescheduling notification:', error);
      }
    }
  };

  const toggleStreakNotifications = async () => {
    if (!user) return;
    
    const updatedSettings = {
      ...user.settings,
      streakNotifications: !(user.settings.streakNotifications ?? true) // Default to true
    };
    
    const updatedUser = {
      ...user,
      settings: updatedSettings
    };
    
    setUser(updatedUser);
    // updateUser(updatedUser); // Temporarily disabled to prevent infinite loop

    // Update streak notifications when setting changes
    try {
      const { NotificationService } = await import('../services/notificationService');
      if (updatedSettings.streakNotifications && updatedSettings.notifications) {
        console.log('Enabling streak notifications');
        await NotificationService.manageStreakProtection(updatedUser, language);
      } else {
        console.log('Disabling streak notifications');
        await NotificationService.cancelStreakNotifications();
      }
    } catch (error) {
      console.error('Error managing streak notifications:', error);
    }
  };

  const handleHelp = () => {
    showCustomAlert(
      t.settings.help,
      'Have any question or need help? Contact our support team at:\n\nsandy@zaynstudio.app'
    );
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'id' ? 'en' : 'id';
    setLanguage(newLanguage as Language);
  };

  const handleAbout = () => {
    showCustomAlert(
      t.settings.about,
      t.settings.aboutContent
    );
  };

  const handleInviteFriends = async () => {
    try {
      const appStoreUrl = 'https://apps.apple.com/app/byesmoke-ai'; // Update when published
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.zaynstudio.byesmokev00';
      
      const message = language === 'en' 
        ? `I'm using ByeSmoke AI to quit smoking and it's really helping! 🚭✨

Join me on this smoke-free journey. The app has AI coaching, progress tracking, and motivational features that make quitting easier.

Download ByeSmoke AI:
📱 Android: ${playStoreUrl}
📱 iOS: ${appStoreUrl}

Let's quit smoking together! 💪`
        : `Saya menggunakan ByeSmoke AI untuk berhenti merokok dan sangat membantu! 🚭✨

Bergabunglah dengan saya dalam perjalanan bebas rokok ini. Aplikasinya memiliki pelatihan AI, pelacakan progress, dan fitur motivasi yang membuat berhenti merokok jadi lebih mudah.

Download ByeSmoke AI:
📱 Android: ${playStoreUrl}
📱 iOS: ${appStoreUrl}

Mari berhenti merokok bersama! 💪`;

      const result = await Share.share({
        message: message,
        title: language === 'en' ? 'Join me on ByeSmoke AI!' : 'Bergabung dengan ByeSmoke AI!',
      });

      if (result.action === Share.sharedAction) {
        // Optionally show success message
        console.log('App invitation shared successfully');
      }
    } catch (error) {
      console.error('Error sharing app invitation:', error);
      showCustomAlert(
        language === 'en' ? 'Error' : 'Kesalahan',
        language === 'en' ? 'Failed to share invitation' : 'Gagal membagikan undangan'
      );
    }
  };

  const handlePrivacyPolicy = () => {
    setLegalDocument('privacy');
    setLegalModalVisible(true);
  };

  const handleTermsOfService = () => {
    setLegalDocument('terms');
    setLegalModalVisible(true);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      language === 'en' ? 'Delete Account' : 'Hapus Akun',
      language === 'en' 
        ? 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        : 'Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan dan semua data Anda akan dihapus secara permanen.',
      [
        {
          text: language === 'en' ? 'Cancel' : 'Batal',
          style: 'cancel'
        },
        {
          text: language === 'en' ? 'Delete' : 'Hapus',
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!user) return;

    try {
      // Show loading state
      Alert.alert(
        language === 'en' ? 'Deleting Account...' : 'Menghapus Akun...',
        language === 'en' ? 'Please wait while we delete your account.' : 'Mohon tunggu sementara kami menghapus akun Anda.'
      );

      // For Firebase users, delete from Firestore and Authentication
      if (auth.currentUser) {
        // Delete user document from Firestore
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', auth.currentUser.uid));
        
        // Delete Firebase Auth account
        const { deleteUser } = await import('firebase/auth');
        await deleteUser(auth.currentUser);
      }

      // For demo users, clear from storage
      const { demoDeleteUser } = await import('../services/demoAuth');
      await demoDeleteUser();

      // Clear local storage
      await AsyncStorage.clear();

      Alert.alert(
        language === 'en' ? 'Account Deleted' : 'Akun Dihapus',
        language === 'en' 
          ? 'Your account has been successfully deleted.'
          : 'Akun Anda telah berhasil dihapus.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Logout and navigate to login screen
              onLogout();
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Kesalahan',
        language === 'en' 
          ? 'Failed to delete account. Please try again later.'
          : 'Gagal menghapus akun. Silakan coba lagi nanti.'
      );
    }
  };


  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t.common.loading}</Text>
      </View>
    );
  }

  const levelInfo = calculateLevel(user.xp);

  const renderCustomAlert = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={[styles.modalContainer, { backgroundColor: colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {modalContent.title}
          </Text>
          <ScrollView 
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {modalContent.message}
            </Text>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );


  const renderLegalModal = () => {
    const privacyPolicyContent = `Privacy Policy for ByeSmoke AI

Last Updated: January 2025

Introduction

ByeSmoke AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ByeSmoke AI.

Information We Collect

Personal Information:
• Account Information: Email address, display name, username
• Health Data: Quit date, cigarettes per day, cigarette price, smoking habits
• Progress Data: Daily check-ins, XP points, achievements, badges, streaks
• Usage Data: App interactions, feature usage, session duration

Automatically Collected Information:
• Device Information: Device type, operating system, app version
• Technical Data: IP address, crash reports, performance data
• Analytics Data: Feature usage patterns, user engagement metrics

How We Use Your Information

We use your information to:
• Provide personalized quit-smoking coaching and recommendations
• Track your progress and calculate achievements
• Send you motivational notifications and reminders
• Improve our AI coaching algorithms
• Analyze app usage to enhance user experience
• Provide customer support
• Comply with legal obligations

Data Storage and Security

• Cloud Storage: Your data is securely stored using Firebase/Google Cloud Platform
• Encryption: All data is encrypted in transit and at rest
• Access Controls: Strict access controls limit who can view your data
• Data Retention: We retain your data as long as your account is active

Your Rights

You have the right to:
• Access: Request a copy of your personal data
• Correction: Update or correct your information
• Deletion: Delete your account and associated data
• Portability: Export your data in a machine-readable format
• Withdrawal: Withdraw consent for data processing

Contact Us

If you have questions about this Privacy Policy, contact us at:
Email: privacy@byesmoke.ai

By using ByeSmoke AI, you consent to the collection and use of your information as described in this Privacy Policy.`;

    const termsOfServiceContent = `Terms of Service for ByeSmoke AI

Last Updated: January 2025

1. Acceptance of Terms

By downloading, installing, or using ByeSmoke AI ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.

2. Description of Service

ByeSmoke AI is a mobile application designed to help users quit smoking through:
• Progress tracking and statistics
• Achievement and badge systems
• AI-powered coaching and recommendations
• Community features and referrals
• Motivational content and reminders

3. Medical Disclaimer

IMPORTANT: ByeSmoke AI is NOT a medical device or treatment. It is a wellness app for informational and motivational purposes only.

• The App does not provide medical advice, diagnosis, or treatment
• Always consult healthcare professionals for medical concerns
• Do not disregard professional medical advice because of information from the App
• In case of medical emergencies, contact emergency services immediately

4. User Accounts and Responsibilities

Account Creation:
• You must provide accurate and complete information
• You are responsible for maintaining account security
• You must be at least 13 years old to use the App
• One account per person

Prohibited Uses:
You may not:
• Use the App for illegal purposes
• Share false or misleading health information
• Attempt to hack, reverse engineer, or compromise the App
• Create multiple accounts or impersonate others
• Spam or harass other users
• Upload malicious content or viruses

5. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:
• The App is provided "AS IS" without warranties
• We are not liable for any damages arising from App use
• Our liability is limited to the amount you paid for the App
• We are not responsible for third-party content or services

6. Contact Information

For questions about these Terms, contact us at:
Email: legal@byesmoke.ai

By using ByeSmoke AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.`;

    const renderDocumentContent = (content: string) => {
      const lines = content.split('\n');
      
      return lines.map((line, index) => {
        if (line.trim() === '') {
          return <View key={index} style={{ height: 10 }} />;
        } else if (line.includes('Privacy Policy for ByeSmoke AI') || line.includes('Terms of Service for ByeSmoke AI')) {
          return (
            <Text key={index} style={[{ fontSize: 18, fontWeight: '700', marginBottom: 10, color: colors.textPrimary }]}>
              {line}
            </Text>
          );
        } else if (line.includes('Last Updated:') || line.includes('Introduction') || line.includes('Information We Collect') || line.includes('How We Use') || line.includes('Data Storage') || line.includes('Your Rights') || line.includes('Contact Us') || line.includes('Acceptance of Terms') || line.includes('Description of Service') || line.includes('Medical Disclaimer') || line.includes('User Accounts') || line.includes('Limitation of Liability')) {
          return (
            <Text key={index} style={[{ fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 8, color: colors.textPrimary }]}>
              {line}
            </Text>
          );
        } else if (line.startsWith('•')) {
          return (
            <Text key={index} style={[{ fontSize: 14, marginBottom: 4, marginLeft: 10, color: colors.textSecondary }]}>
              {line}
            </Text>
          );
        } else {
          return (
            <Text key={index} style={[{ fontSize: 14, lineHeight: 20, marginBottom: 4, color: colors.textSecondary }]}>
              {line}
            </Text>
          );
        }
      });
    };

    return (
      <Modal
        visible={legalModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLegalModalVisible(false)}
        >
          <TouchableOpacity 
            style={[styles.legalModalContainer, { backgroundColor: colors.surface }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={[styles.legalModalHeader, { borderBottomColor: colors.lightGray }]}>
              <TouchableOpacity
                style={styles.legalModalCloseButton}
                onPress={() => setLegalModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.legalModalTitle, { color: colors.textPrimary }]}>
                {legalDocument === 'privacy' 
                  ? (language === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi')
                  : (language === 'en' ? 'Terms of Service' : 'Syarat Layanan')
                }
              </Text>
              <View style={styles.legalModalHeaderSpacer} />
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.legalModalContent}
              showsVerticalScrollIndicator={false}
            >
              {renderDocumentContent(
                legalDocument === 'privacy' ? privacyPolicyContent : termsOfServiceContent
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const handleSubscriptionSelect = async (planId: string) => {
    setSubscriptionModalVisible(false);
    await handleSubscription(planId, user?.id);
  };

  const renderSubscriptionModal = () => (
    <Modal
      visible={subscriptionModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={() => setSubscriptionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.subscriptionModalContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSubscriptionModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {language === 'en' ? 'Choose Premium Plan' : 'Pilih Paket Premium'}
          </Text>
          
          <ScrollView style={styles.subscriptionScrollView} showsVerticalScrollIndicator={false}>
            {SUBSCRIPTION_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.subscriptionPlan,
                  { backgroundColor: colors.surface },
                  plan.popular && { 
                    borderColor: '#FF6B35', // Warm orange for urgency
                    borderWidth: 2,
                    backgroundColor: '#FFF5F3' // Very light warm background
                  },
                  plan.id === 'trial' && {
                    borderColor: '#00C851', // Success green for free trial
                    borderWidth: 2,
                    backgroundColor: '#F1F8E9' // Light green background
                  },
                  plan.id === 'yearly' && {
                    borderColor: '#7B68EE', // Purple for premium/luxury
                    borderWidth: 2,
                    backgroundColor: '#F8F7FF' // Very light purple background
                  },
                  plan.id === 'monthly' && {
                    borderColor: '#64B5F6', // Soft blue for standard option
                    borderWidth: 1,
                    backgroundColor: '#F3F9FF' // Very light blue background
                  }
                ]}
                onPress={() => handleSubscriptionSelect(plan.id)}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: '#FF6B35' }]}>
                    <Text style={styles.popularText}>
                      {language === 'en' ? 'POPULAR' : 'POPULER'}
                    </Text>
                  </View>
                )}
                
                {plan.id === 'trial' && (
                  <View style={[styles.popularBadge, { backgroundColor: '#00C851' }]}>
                    <Text style={styles.popularText}>
                      {language === 'en' ? 'FREE' : 'GRATIS'}
                    </Text>
                  </View>
                )}
                
                {plan.id === 'yearly' && (
                  <View style={[styles.popularBadge, { backgroundColor: '#7B68EE' }]}>
                    <Text style={styles.popularText}>
                      {language === 'en' ? 'BEST VALUE' : 'NILAI TERBAIK'}
                    </Text>
                  </View>
                )}
                
                {plan.id === 'monthly' && (
                  <View style={[styles.monthlyBadge, { backgroundColor: '#64B5F6' }]}>
                    <Text style={styles.monthlyBadgeText}>
                      {language === 'en' ? 'FLEXIBLE' : 'FLEKSIBEL'}
                    </Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: colors.textPrimary }]}>
                    {plan.name}
                  </Text>
                  <Text style={[
                    styles.planPrice, 
                    { 
                      color: plan.id === 'trial' ? '#00C851' : 
                             plan.id === 'yearly' ? '#7B68EE' :
                             plan.id === 'monthly' ? '#64B5F6' :
                             plan.popular ? '#FF6B35' : colors.primary 
                    }
                  ]}>
                    {plan.price}
                  </Text>
                  
                  {plan.id === 'yearly' && (
                    <Text style={[styles.savingsText, { color: '#FF4444' }]}>
                      {language === 'en' ? 'Save 60%' : 'Hemat 60%'}
                    </Text>
                  )}
                  <Text style={[styles.planDuration, { color: colors.textSecondary }]}>
                    {plan.duration}
                  </Text>
                </View>
                
                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <Text key={index} style={[styles.planFeature, { color: colors.textSecondary }]}>
                      {feature}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderNotificationModal = () => (
    <Modal
      visible={notificationModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setNotificationModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setNotificationModalVisible(false)}
      >
        <TouchableOpacity 
          style={[styles.modalContainer, { backgroundColor: colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setNotificationModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {t.settings.notifications}
          </Text>
          
          <View style={styles.notificationSettingsContainer}>
            {/* Notification Toggle */}
            <View style={styles.notificationSetting}>
              <Text style={[styles.notificationSettingTitle, { color: colors.textPrimary }]}>
                {t.profile.notifications}
              </Text>
              <View style={styles.notificationControlContainer}>
                <Text style={[styles.notificationStatusText, { color: colors.textSecondary }]}>
                  {user?.settings.notifications ? t.notifications.active : t.notifications.inactive}
                </Text>
                <TouchableOpacity onPress={toggleNotifications} style={styles.toggleContainer}>
                  <View style={[
                    styles.toggleSwitch, 
                    { backgroundColor: colors.gray }, 
                    user?.settings.notifications && { backgroundColor: colors.secondary }
                  ]}>
                    <View style={[
                      styles.toggleThumb, 
                      { backgroundColor: colors.surface }, 
                      user?.settings.notifications && styles.toggleThumbActive
                    ]} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Picker */}
            {user?.settings.notifications && (
              <View style={styles.notificationSetting}>
                <Text style={[styles.notificationSettingTitle, { color: colors.textPrimary }]}>
                  {t.notifications.reminderTime}
                </Text>
                <View style={styles.timePickerContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.timePickerButton, 
                      { backgroundColor: user.settings.reminderTime === '09:00' ? colors.primary : colors.lightGray }
                    ]}
                    onPress={() => updateReminderTime('09:00')}
                  >
                    <Text style={[
                      styles.timePickerText, 
                      { color: user.settings.reminderTime === '09:00' ? colors.surface : colors.textPrimary }
                    ]}>09:00</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.timePickerButton, 
                      { backgroundColor: user.settings.reminderTime === '12:00' ? colors.primary : colors.lightGray }
                    ]}
                    onPress={() => updateReminderTime('12:00')}
                  >
                    <Text style={[
                      styles.timePickerText, 
                      { color: user.settings.reminderTime === '12:00' ? colors.surface : colors.textPrimary }
                    ]}>12:00</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.timePickerButton, 
                      { backgroundColor: user.settings.reminderTime === '18:00' ? colors.primary : colors.lightGray }
                    ]}
                    onPress={() => updateReminderTime('18:00')}
                  >
                    <Text style={[
                      styles.timePickerText, 
                      { color: user.settings.reminderTime === '18:00' ? colors.surface : colors.textPrimary }
                    ]}>18:00</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Streak Notifications Toggle */}
            {user?.settings.notifications && (
              <View style={styles.notificationSetting}>
                <Text style={[styles.notificationSettingTitle, { color: colors.textPrimary }]}>
                  {language === 'en' ? 'Streak Protection' : 'Perlindungan Streak'}
                </Text>
                <Text style={[styles.notificationSettingDesc, { color: colors.textSecondary, marginBottom: SIZES.sm }]}>
                  {language === 'en' 
                    ? 'Get reminded when your streak is at risk of being lost'
                    : 'Dapatkan peringatan saat streak Anda berisiko hilang'
                  }
                </Text>
                <View style={styles.notificationControlContainer}>
                  <Text style={[styles.notificationStatusText, { color: colors.textSecondary }]}>
                    {(user?.settings.streakNotifications ?? true) 
                      ? (language === 'en' ? 'Enabled' : 'Aktif')
                      : (language === 'en' ? 'Disabled' : 'Nonaktif')
                    }
                  </Text>
                  <TouchableOpacity onPress={toggleStreakNotifications} style={styles.toggleContainer}>
                    <View style={[
                      styles.toggleSwitch, 
                      { backgroundColor: colors.gray }, 
                      (user?.settings.streakNotifications ?? true) && { backgroundColor: colors.secondary }
                    ]}>
                      <View style={[
                        styles.toggleThumb, 
                        { backgroundColor: colors.surface }, 
                        (user?.settings.streakNotifications ?? true) && styles.toggleThumbActive
                      ]} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsSection}>
        <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
          {!user.isPremium && (
            <>
              <TouchableOpacity style={styles.upgradeItem} onPress={handleUpgrade}>
                <LinearGradient
                  colors={[COLORS.accent, COLORS.accentDark]}
                  style={styles.upgradeGradient}
                >
                  <MaterialIcons name="star" size={24} color={COLORS.white} />
                  <View style={styles.upgradeInfo}>
                    <Text style={styles.upgradeTitle}>
                      {language === 'en' ? 'Try Free for 7 Days' : 'Coba Gratis 7 Hari'}
                    </Text>
                    <Text style={styles.upgradeSubtitle}>
                      {language === 'en' ? 'No payment required • Cancel anytime' : 'Tanpa pembayaran • Bisa dibatalkan kapan saja'}
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={16} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
              <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />
            </>
          )}

          <TouchableOpacity style={styles.settingItem} onPress={handleInviteFriends}>
            <MaterialIcons name="people" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                {language === 'en' ? 'Invite Friends' : 'Ajak Teman'}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {language === 'en' ? 'Share ByeSmoke AI with friends and family' : 'Bagikan ByeSmoke AI dengan teman dan keluarga'}
              </Text>
            </View>
            <MaterialIcons name="share" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleNotifications}>
            <MaterialIcons name="notifications" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{t.profile.notifications}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.profile.notificationsDesc}</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity 
            style={[
              styles.settingItem,
              !user.isPremium && styles.settingItemDisabled
            ]}
            disabled={!user.isPremium}
            onPress={user.isPremium ? toggleDarkMode : undefined}
          >
            <MaterialIcons 
              name={isDarkMode ? "dark-mode" : "light-mode"} 
              size={24} 
              color={user.isPremium ? colors.primary : colors.gray} 
            />
            <View style={styles.settingInfo}>
              <Text style={[
                { ...styles.settingTitle, color: colors.textPrimary },
                !user.isPremium && { color: colors.gray }
              ]}>
                {t.profile.darkMode}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {user.isPremium ? (isDarkMode ? t.profile.darkModeActive : t.profile.darkModeInactive) : t.profile.premiumFeature}
              </Text>
            </View>
            {user.isPremium ? (
              <View style={[
                { ...styles.toggleSwitch, backgroundColor: colors.gray }, 
                isDarkMode && { backgroundColor: colors.secondary }
              ]}>
                <View style={[
                  { ...styles.toggleThumb, backgroundColor: colors.surface }, 
                  isDarkMode && styles.toggleThumbActive
                ]} />
              </View>
            ) : (
              <MaterialIcons name="lock" size={16} color={colors.gray} />
            )}
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageToggle}>
            <MaterialIcons name="language" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{t.profile.language}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {language === 'id' ? 'Bahasa Indonesia' : 'English'}
              </Text>
            </View>
            <View style={[
              styles.toggleSwitch, 
              { backgroundColor: colors.gray }, 
              language === 'en' && { backgroundColor: colors.secondary }
            ]}>
              <View style={[
                styles.toggleThumb, 
                { backgroundColor: colors.surface }, 
                language === 'en' && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
            <MaterialIcons name="help" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{t.profile.help}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.profile.helpDesc}</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <MaterialIcons name="info" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{t.profile.about}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.profile.aboutVersion}</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
            <MaterialIcons name="privacy-tip" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                {language === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi'}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {language === 'en' ? 'How we handle your data' : 'Bagaimana kami menangani data Anda'}
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleTermsOfService}>
            <MaterialIcons name="description" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                {language === 'en' ? 'Terms of Service' : 'Syarat Layanan'}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {language === 'en' ? 'App usage terms and conditions' : 'Syarat dan ketentuan penggunaan aplikasi'}
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-forever" size={24} color={COLORS.error} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: COLORS.error }]}>
                {language === 'en' ? 'Delete Account' : 'Hapus Akun'}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {language === 'en' ? 'Permanently delete your account and data' : 'Hapus akun dan data Anda secara permanen'}
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={COLORS.error} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: COLORS.error }]}>
                {t.profile.logout}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.profile.logoutDesc}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );


  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            
            {/* Subscription Status */}
            <View style={styles.subscriptionContainer}>
              <View style={[styles.subscriptionStatus, user.isPremium ? styles.premiumStatus : styles.freeStatus]}>
                <MaterialIcons 
                  name={user.isPremium ? "star" : "star-border"} 
                  size={16} 
                  color={user.isPremium ? COLORS.accent : colors.textSecondary} 
                />
                <Text style={[styles.subscriptionText, user.isPremium ? styles.premiumText : styles.freeText]}>
                  {formatSubscriptionStatus(user)}
                </Text>
              </View>
              
              {!user.isPremium && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => showSubscriptionOptions(user.id)}
                >
                  <Text style={styles.upgradeButtonText}>
                    {language === 'en' ? 'Try Free for 7 Days' : 'Coba Gratis 7 Hari'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {renderSettings()}
        </View>
      </ScrollView>
      {renderCustomAlert()}
      {renderLegalModal()}
      {renderNotificationModal()}
      {renderSubscriptionModal()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Math.max(50, height * 0.06), // Responsive top padding for mobile
    paddingBottom: Math.max(SIZES.md, height * 0.03), // Further reduced bottom padding
    paddingHorizontal: SIZES.screenPadding,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  avatarText: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '700',
    color: COLORS.primary,
  },
  displayName: {
    ...TYPOGRAPHY.h1White,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: SIZES.xs || 4,
  },
  email: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.white,
    opacity: 0.8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.buttonRadius || 12,
    marginTop: SIZES.sm,
  },
  premiumText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.accent,
    marginLeft: SIZES.xs,
  },
  subscriptionContainer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 8,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  premiumStatus: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)', // Golden background for premium
  },
  freeStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  subscriptionText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginLeft: 6,
  },
  freeText: {
    color: COLORS.white,
    opacity: 0.9,
  },
  upgradeButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: SIZES.sm, // Reduced to match Badge Statistics spacing
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs || 4,
  },
  settingsSection: {
    paddingBottom: SIZES.md,
    paddingTop: SIZES.xs, // Reduced to match Badge Statistics spacing pattern
  },
  upgradeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginTop: SIZES.md, // Normal margin - not floating
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, // Standard shadow
    shadowRadius: 10, // Standard shadow radius
    elevation: 4, // Standard elevation
    overflow: 'hidden',
  },
  upgradeItem: {
    borderRadius: SIZES.buttonRadius / 2,
    overflow: 'hidden',
    marginVertical: SIZES.xs,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.sm,
  },
  upgradeInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  upgradeTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.white,
    flexShrink: 1,
  },
  upgradeSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    opacity: 0.9,
  },
  settingsCard: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0, // Remove padding since parent card now has responsive padding
    paddingVertical: SIZES.sm,
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  settingTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '500',
  },
  settingTitleDisabled: {},  // Color handled dynamically
  settingSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: SIZES.xs || 2,
  },
  settingDivider: {
    height: 1,
    marginLeft: SIZES.screenPadding + 24 + SIZES.md,
  },
  tabContent: {
    paddingBottom: SIZES.md,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {},  // Background handled dynamically
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Math.min(SIZES.md, width * 0.04), // Responsive padding
    paddingTop: Math.max(50, height * 0.1), // Ensure top space for status bar
    paddingBottom: Math.max(20, height * 0.05), // Ensure bottom space
  },
  modalContainer: {
    borderRadius: 20,
    padding: SIZES.md,
    width: Math.min(width * 0.9, 380), // Max width for larger screens
    maxHeight: Math.min(height * 0.85, 600), // Increased max height to fit content
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalScrollView: {
    maxHeight: Math.min(height * 0.45, 300), // Reduced for small screens
    marginBottom: SIZES.sm, // Reduced margin
  },
  modalTitle: {
    fontSize: Math.min(width * 0.05, 18), // Responsive title size, max 18px
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.sm,
    marginTop: SIZES.xs,
  },
  closeButton: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    padding: SIZES.xs,
    zIndex: 1,
  },
  modalMessage: {
    fontSize: Math.min(width * 0.035, 14), // Responsive text size, max 14px
    lineHeight: Math.min(width * 0.05, 20), // Responsive line height
    textAlign: 'left',
    paddingHorizontal: SIZES.xs,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
  },
  // Notification Modal Styles
  notificationSettingsContainer: {
    marginVertical: SIZES.xs,
  },
  notificationSetting: {
    flexDirection: 'column',
    paddingVertical: SIZES.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingHorizontal: SIZES.xs,
  },
  notificationControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  notificationStatusText: {
    fontSize: 14,
    fontWeight: '400',
  },
  toggleContainer: {
    padding: SIZES.xs,
  },
  notificationSettingInfo: {
    flex: 1,
  },
  notificationSettingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SIZES.xs,
  },
  notificationSettingDesc: {
    fontSize: 14,
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: SIZES.xs,
    flexWrap: 'wrap',
    marginTop: SIZES.xs,
  },
  timePickerButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.buttonRadius / 2,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Legal Modal Styles
  legalModalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  legalModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
  },
  legalModalCloseButton: {
    padding: SIZES.xs,
  },
  legalModalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: SIZES.sm,
  },
  legalModalHeaderSpacer: {
    width: 40,
  },
  legalModalContent: {
    flex: 1,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  // Subscription Modal Styles
  subscriptionModalContainer: {
    borderRadius: 20,
    padding: SIZES.md,
    width: Math.min(width * 0.9, 400),
    maxHeight: Math.min(height * 0.8, 600),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  subscriptionScrollView: {
    maxHeight: Math.min(height * 0.5, 400),
    marginVertical: SIZES.sm,
  },
  subscriptionPlan: {
    borderRadius: 16,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: SIZES.md,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: SIZES.sm,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  planFeatures: {
    gap: 6,
  },
  planFeature: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Additional Badge Styles
  monthlyBadge: {
    position: 'absolute',
    top: -6,
    right: SIZES.md,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  monthlyBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default ProfileScreen;