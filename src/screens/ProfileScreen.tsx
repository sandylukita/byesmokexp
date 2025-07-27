import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
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
} from 'react-native';
import { logout } from '../services/auth';
import { demoGetCurrentUser, demoRestoreUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { NotificationService } from '../services/notificationService';

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
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const { isDarkMode, colors, toggleDarkMode, setLanguage, canUseDarkMode, updateUser } = useTheme();
  const { t, language } = useTranslation();

  useEffect(() => {
    loadUserData();
  }, []);

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
            updateUser(userData);
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
        updateUser(demoUser);
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
        updateUser(restoredUser);
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
    Alert.alert(
      t.premium.title,
      t.premium.subtitle + '\n\n' + Object.values(t.premium.features).join('\n'),
      [{ text: t.common.ok }]
    );
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
          
          Alert.alert(
            t.notifications.permissionRequired,
            message,
            [
              { text: t.notifications.cancel, style: 'cancel' },
              { 
                text: t.notifications.openSettings, 
                onPress: () => {
                  // Could open app settings here in production
                  console.log('Should open app settings');
                }
              }
            ]
          );
          return;
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        Alert.alert(t.common.error, 'Gagal meminta izin notifikasi');
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
    updateUser(updatedUser);

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
        Alert.alert(
          t.notifications.schedulingFailed,
          t.notifications.schedulingFailedDesc,
          [{ text: t.common.ok }]
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
    updateUser(updatedUser);

    // Reschedule notification if notifications are enabled
    if (user.settings.notifications) {
      try {
        const success = await NotificationService.rescheduleIfNeeded(true, time, language);
        
        if (!success) {
          console.warn('Failed to reschedule notification for new time');
          Alert.alert(
            t.notifications.timeChangeFailed,
            t.notifications.timeChangeFailedDesc,
            [{ text: t.common.ok }]
          );
        } else {
          console.log('Daily reminder rescheduled for', time);
        }
      } catch (error) {
        console.error('Error rescheduling notification:', error);
      }
    }
  };

  const handleHelp = () => {
    showCustomAlert(
      t.settings.help,
      t.settings.helpContent
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
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
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
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>{t.common.close}</Text>
          </TouchableOpacity>
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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
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
          </View>
          
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setNotificationModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>{t.common.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
                    <Text style={styles.upgradeTitle}>{t.profile.upgrade}</Text>
                    <Text style={styles.upgradeSubtitle}>
                      {t.premium.subtitle}
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={16} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
              <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />
            </>
          )}

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
            
            {user.isPremium && (
              <View style={styles.premiumBadge}>
                <MaterialIcons name="star" size={16} color={COLORS.accent} />
                <Text style={styles.premiumText}>{t.profile.premium}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {renderSettings()}
        </View>
      </ScrollView>
      {renderCustomAlert()}
      {renderNotificationModal()}
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
    maxHeight: Math.min(height * 0.75, 500), // Reduced max height for small screens
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
  },
  modalMessage: {
    fontSize: Math.min(width * 0.035, 14), // Responsive text size, max 14px
    lineHeight: Math.min(width * 0.05, 20), // Responsive line height
    textAlign: 'left',
    paddingHorizontal: SIZES.xs,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: SIZES.sm, // Reduced vertical padding
    paddingHorizontal: SIZES.md, // Reduced horizontal padding
    alignItems: 'center',
    marginTop: SIZES.xs, // Reduced top margin
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: Math.min(width * 0.04, 16), // Responsive font size
    fontWeight: '600',
  },
  // Notification Modal Styles
  notificationSettingsContainer: {
    marginVertical: SIZES.sm, // Reduced margin for compact layout
  },
  notificationSetting: {
    flexDirection: 'column',
    paddingVertical: SIZES.sm, // Reduced padding for compact layout
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
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
    marginBottom: SIZES.sm,
  },
  notificationSettingDesc: {
    fontSize: 14,
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: SIZES.xs,
    flexWrap: 'wrap',
    marginTop: SIZES.sm,
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
});

export default ProfileScreen;