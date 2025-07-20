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

import { User } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { calculateLevel } from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ProfileScreenProps {
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const { isDarkMode, colors, toggleDarkMode, canUseDarkMode, updateUser } = useTheme();

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
      'Keluar',
      'Apakah kamu yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onLogout();
            } catch (error) {
              Alert.alert('Error', 'Gagal keluar dari akun');
            }
          },
        },
      ]
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Dapatkan Kekuatan Penuh ByeSmoke XP',
      'Jadilah pahlawan bagi diri sendiri dengan dukungan penuh dari AI personal motivator kami. Bantuan Anda juga sangat berarti agar aplikasi ini terus berkembang.\n\n🤖 Misi & Motivasi Personal dari AI\n✅ 3 Misi Harian (lebih banyak XP!)\n🌙 Mode Gelap Eksklusif\n🚫 Pengalaman Bebas Iklan\n❤️ Dukung Developer Independen',
      [{ text: 'OK' }]
    );
  };

  const showCustomAlert = (title: string, message: string) => {
    setModalContent({ title, message });
    setModalVisible(true);
  };

  const handleNotifications = () => {
    showCustomAlert(
      'Pengaturan Notifikasi',
      'Fitur pengaturan notifikasi akan segera tersedia. Anda akan dapat mengatur:\n\n• Pengingat check-in harian\n• Motivasi dan tips kesehatan\n• Update pencapaian badge\n• Reminder misi harian\n\nTerima kasih atas kesabaran Anda!'
    );
  };

  const handleHelp = () => {
    showCustomAlert(
      'Bantuan & Dukungan',
      'Butuh bantuan? Berikut beberapa cara untuk mendapatkan dukungan:\n\n• FAQ dan panduan akan segera tersedia\n• Tim dukungan siap membantu\n• Komunitas pengguna ByeSmoke\n\nUntuk bantuan langsung, hubungi tim pengembang melalui menu feedback.'
    );
  };

  const handleAbout = () => {
    showCustomAlert(
      'ByeSmoke XP v1.0.0',
      'Aplikasi ini dibuat untuk membantu Anda dalam perjalanan berhenti merokok. Lacak progres Anda, selesaikan misi harian, dan dapatkan lencana untuk setiap pencapaian.\n\nIngat, setiap hari tanpa rokok adalah kemenangan. Anda lebih kuat dari yang Anda kira!\n\nDibuat dengan semangat dan harapan.'
    );
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
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
          <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
            {modalContent.message}
          </Text>
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Tutup</Text>
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
                    <Text style={styles.upgradeTitle}>Upgrade ke Premium</Text>
                    <Text style={styles.upgradeSubtitle}>
                      Nikmati fitur lengkap ByeSmoke XP
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
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Notifikasi</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Pengingat dan motivasi</Text>
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
                Mode Gelap
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {user.isPremium ? (isDarkMode ? 'Aktif' : 'Nonaktif') : 'Fitur Premium'}
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

          <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
            <MaterialIcons name="help" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Bantuan</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>FAQ dan dukungan</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <MaterialIcons name="info" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Tentang</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Versi 1.0.0</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray} />
          </TouchableOpacity>

          <View style={[styles.settingDivider, { backgroundColor: colors.lightGray }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={COLORS.error} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: COLORS.error }]}>
                Keluar
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Logout dari akun</Text>
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
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {renderSettings()}
        </View>
      </ScrollView>
      {renderCustomAlert()}
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
    padding: SIZES.screenPadding,
  },
  modalContainer: {
    borderRadius: 20,
    padding: SIZES.lg,
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: SIZES.lg,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;