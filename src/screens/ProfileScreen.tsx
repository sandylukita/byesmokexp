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
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logout } from '../services/auth';

import { COLORS, SIZES, BADGES } from '../utils/constants';
import { User, Badge } from '../types';
import { calculateLevel, formatNumber } from '../utils/helpers';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = { id: currentUser.uid, ...userDoc.data() } as User;
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
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
      'Upgrade ke Premium',
      'Fitur premium akan segera tersedia! Dapatkan akses ke:\n\n• Misi AI personal\n• Mode gelap\n• Bebas iklan\n• Analytics mendalam',
      [{ text: 'OK' }]
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
  const earnedBadges = BADGES.filter(badge => 
    user.badges.some(userBadge => userBadge.id === badge.id)
  );

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
        
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {levelInfo.level}</Text>
          <Text style={styles.levelTitle}>{levelInfo.title}</Text>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>{user.xp} XP</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistik Akun</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="emoji-events" size={24} color={COLORS.accent} />
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>Badge</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="assignment-turned-in" size={24} color={COLORS.secondary} />
              <Text style={styles.statValue}>{user.completedMissions?.length || 0}</Text>
              <Text style={styles.statLabel}>Misi Selesai</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={24} color={COLORS.error} />
              <Text style={styles.statValue}>{user.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="calendar-today" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{user.totalDays}</Text>
              <Text style={styles.statLabel}>Total Hari</Text>
            </View>
          </View>
        </View>

        {/* Badge Wall */}
        <View style={styles.badgeSection}>
          <Text style={styles.sectionTitle}>Dinding Badge</Text>
          <Text style={styles.sectionSubtitle}>
            Koleksi pencapaian yang sudah kamu raih
          </Text>
          
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

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          
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

            <TouchableOpacity style={styles.settingItem}>
              <MaterialIcons name="help" size={24} color={COLORS.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Bantuan</Text>
                <Text style={styles.settingSubtitle}>FAQ dan dukungan</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color={COLORS.gray} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem}>
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
    marginBottom: SIZES.lg,
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
    fontSize: SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  displayName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  email: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.sm,
  },
  premiumText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginLeft: SIZES.xs,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  levelTitle: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.sm,
  },
  xpContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadius,
  },
  xpText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: SIZES.xl,
  },
  statsSection: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  sectionSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    alignItems: 'center',
    width: (width - SIZES.screenPadding * 2 - SIZES.md) / 2,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: SIZES.xs,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  badgeSection: {
    marginBottom: SIZES.xl,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    alignItems: 'center',
    width: (width - SIZES.screenPadding * 2 - SIZES.md) / 2,
    marginBottom: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  badgeNameDisabled: {
    color: COLORS.gray,
  },
  badgeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  badgeDescriptionDisabled: {
    color: COLORS.gray,
  },
  badgeRequirement: {
    fontSize: SIZES.xs,
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: SIZES.xs,
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: SIZES.xl,
  },
  upgradeCard: {
    borderRadius: SIZES.borderRadiusLg,
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.cardPadding,
  },
  upgradeInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  upgradeTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  upgradeSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.cardPadding,
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  settingTitle: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingTitleDisabled: {
    color: COLORS.gray,
  },
  settingSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginLeft: SIZES.screenPadding + 24 + SIZES.md,
  },
});

export default ProfileScreen;