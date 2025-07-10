import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { demoGetCurrentUser, demoRestoreUser } from '../services/demoAuth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logout, updateUserDocument } from '../services/auth';

import { COLORS, SIZES, BADGES } from '../utils/constants';
import { User, Badge } from '../types';
import { calculateLevel, formatNumber } from '../utils/helpers';
import { TYPOGRAPHY } from '../utils/typography';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'badges' | 'settings'>('badges');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    console.log('Starting loadUserData in ProfileScreen...');
    try {
      // Try to restore demo user from storage first
      console.log('Attempting to restore demo user from storage...');
      const restoredUser = await demoRestoreUser();
      if (restoredUser) {
        console.log('Demo user restored from storage:', restoredUser.email);
        setUser(restoredUser);
        setLoading(false);
        return;
      }
      
      // Check current demo user in memory
      console.log('Checking for demo user in memory...');
      const demoUser = demoGetCurrentUser();
      if (demoUser) {
        console.log('Demo user found in memory:', demoUser.email);
        setUser(demoUser);
        setLoading(false);
        return;
      }

      // Fallback to Firebase
      console.log('No demo user, checking Firebase auth...');
      try {
        const currentUser = auth.currentUser;
        console.log('Firebase currentUser:', currentUser?.email);
        
        if (currentUser) {
          console.log('Getting user doc from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = { id: currentUser.uid, ...userDoc.data() } as User;
            console.log('User data loaded:', userData.email);
            setUser(userData);
          } else {
            console.log('User doc does not exist');
          }
        } else {
          console.log('No current user in Firebase auth');
        }
      } catch (firebaseError) {
        console.error('Firebase error (non-fatal):', firebaseError);
        // Don't throw, just continue without Firebase user
      }
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

  const handleAbout = () => {
    Alert.alert(
      'ByeSmoke XP v1.0.0',
      'Aplikasi ini dibuat untuk membantu Anda dalam perjalanan berhenti merokok. Lacak progres Anda, selesaikan misi harian, dan dapatkan lencana untuk setiap pencapaian.\n\nIngat, setiap hari tanpa rokok adalah kemenangan. Anda lebih kuat dari yang Anda kira!\n\nDibuat dengan semangat dan harapan.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyToggle = async () => {
    if (!user) return;
    
    const newPreference = user.settings.leaderboardDisplayPreference === 'username' ? 'displayName' : 'username';
    
    try {
      const updatedSettings = {
        ...user.settings,
        leaderboardDisplayPreference: newPreference
      };
      
      await updateUserDocument(user.id, { settings: updatedSettings });
      
      setUser({
        ...user,
        settings: updatedSettings
      });
      
      Alert.alert(
        'Pengaturan Privasi',
        `Leaderboard akan menampilkan ${newPreference === 'username' ? 'username' : 'nama lengkap'} Anda.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal mengubah pengaturan privasi');
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const levelInfo = calculateLevel(user.xp);
  const earnedBadges = BADGES.filter(badge => 
    user.badges?.some(userBadge => userBadge.id === badge.id)
  );

  const renderBadges = () => (
    <View style={styles.tabContent}>
      <View style={styles.subtitleContainer}>
        <Text style={styles.sectionSubtitle}>
          Koleksi pencapaian yang sudah kamu raih
        </Text>
      </View>
      <View style={styles.badgeSection}>
        <View style={styles.badgeGrid}>
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.some(earned => earned.id === badge.id);
            return (
              <View key={badge.id} style={styles.badgeCard}>
                <View style={[
                  styles.badgeIcon,
                  { backgroundColor: isEarned ? badge.color : COLORS.lightGray }
                ]}>
                  <MaterialIcons 
                    name={badge.icon as any} 
                    size={24} 
                    color={isEarned ? COLORS.white : COLORS.gray} 
                  />
                </View>
                <Text style={[
                  styles.badgeName,
                  !isEarned && styles.badgeNameDisabled
                ]}>
                  {badge.name}
                </Text>
                <Text style={[
                  styles.badgeDescription,
                  !isEarned && styles.badgeDescriptionDisabled
                ]}>
                  {badge.description}
                </Text>
                {!isEarned && (
                  <Text style={styles.badgeRequirement}>
                    {badge.requirement}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsSection}>
        {!user.isPremium && (
          <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
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
        )}

        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifikasi</Text>
              <Text style={styles.settingSubtitle}>Pengingat dan motivasi</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={COLORS.gray} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity 
            style={[
              styles.settingItem,
              !user.isPremium && styles.settingItemDisabled
            ]}
            disabled={!user.isPremium}
          >
            <MaterialIcons 
              name="dark-mode" 
              size={24} 
              color={user.isPremium ? COLORS.primary : COLORS.gray} 
            />
            <View style={styles.settingInfo}>
              <Text style={[
                styles.settingTitle,
                !user.isPremium && styles.settingTitleDisabled
              ]}>
                Mode Gelap
              </Text>
              <Text style={styles.settingSubtitle}>
                {user.isPremium ? 'Tema gelap untuk mata' : 'Fitur Premium'}
              </Text>
            </View>
            {!user.isPremium && (
              <MaterialIcons name="lock" size={16} color={COLORS.gray} />
            )}
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyToggle}>
            <MaterialIcons name="privacy-tip" size={24} color={COLORS.primary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Privasi Leaderboard</Text>
              <Text style={styles.settingSubtitle}>
                Tampilkan {user.settings.leaderboardDisplayPreference === 'username' ? 'username' : 'nama lengkap'} di leaderboard
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={COLORS.gray} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="help" size={24} color={COLORS.primary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Bantuan</Text>
              <Text style={styles.settingSubtitle}>FAQ dan dukungan</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={COLORS.gray} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <MaterialIcons name="info" size={24} color={COLORS.primary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Tentang</Text>
              <Text style={styles.settingSubtitle}>Versi 1.0.0</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={COLORS.gray} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={COLORS.error} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: COLORS.error }]}>
                Keluar
              </Text>
              <Text style={styles.settingSubtitle}>Logout dari akun</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'badges':
        return renderBadges();
      case 'settings':
        return renderSettings();
      default:
        return renderBadges();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'badges' && styles.activeTab]}
          onPress={() => setSelectedTab('badges')}
        >
          <MaterialIcons 
            name="emoji-events" 
            size={Math.min(width * 0.045, 18)} 
            color={selectedTab === 'badges' ? COLORS.white : COLORS.gray} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'badges' && styles.activeTabText
          ]}>
            Dinding Badge
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'settings' && styles.activeTab]}
          onPress={() => setSelectedTab('settings')}
        >
          <MaterialIcons 
            name="settings" 
            size={Math.min(width * 0.045, 18)} 
            color={selectedTab === 'settings' ? COLORS.white : COLORS.gray} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'settings' && styles.activeTabText
          ]}>
            Pengaturan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: SIZES.xl,
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
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs || 4,
  },
  subtitleContainer: {
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.md,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  badgeSection: {
    paddingBottom: SIZES.xl,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: SIZES.xl,
  },
  badgeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.sm,
    alignItems: 'center',
    width: (width - SIZES.screenPadding * 2 - SIZES.xs) / 2,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  badgeName: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs || 2,
  },
  badgeNameDisabled: {
    color: COLORS.gray,
  },
  badgeDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  badgeDescriptionDisabled: {
    color: COLORS.gray,
  },
  badgeRequirement: {
    fontSize: Math.min(width * 0.025, 10),
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: SIZES.xs || 2,
    fontWeight: '500',
  },
  settingsSection: {
    paddingBottom: SIZES.xl,
  },
  upgradeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
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
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.buttonRadius || 12,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.xs || 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.sm,
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
    color: COLORS.textPrimary,
  },
  settingTitleDisabled: {
    color: COLORS.gray,
  },
  settingSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs || 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginLeft: SIZES.screenPadding + 24 + SIZES.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.screenPadding,
    borderRadius: SIZES.buttonRadius || 12,
    padding: Math.max(width * 0.015, 6),
    marginTop: -SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Math.max(width * 0.025, 10),
    paddingHorizontal: Math.max(width * 0.015, 4),
    borderRadius: SIZES.buttonRadius || 12,
    minHeight: 60,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: Math.min(width * 0.032, 12),
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.04, 14),
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabContent: {
    paddingBottom: SIZES.xl,
  },
});

export default ProfileScreen;