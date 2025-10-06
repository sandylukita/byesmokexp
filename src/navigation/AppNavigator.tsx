import React, { useMemo, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { TouchableOpacity, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { showInterstitialAd, canShowAd } from '../services/adMob';
import { log } from '../config/environment';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import DashboardScreen from '../screens/DashboardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import BadgeStatisticsScreen from '../screens/BadgeStatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TamagotchiScreen from '../screens/TamagotchiScreen';
import SwipeableTabNavigator from '../components/SwipeableTabNavigator';
import CravingModal from '../components/CravingModal';
import { COLORS, SIZES } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

// Define tab routes for swipe navigation
const TAB_ROUTES = ['Dashboard', 'Progress', 'Tamagotchi', 'BadgeStats', 'Profile'];

// Create wrapper components - SwipeableTabNavigator temporarily disabled
const DashboardWrapper: React.FC<{ onLogout: () => void; navigation: any; route: any }> = ({ onLogout, navigation, route }) => {
  console.log('🎯 DashboardWrapper rendering');
  return <DashboardScreen onLogout={onLogout} navigation={navigation} />;
};

const ProgressWrapper: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => (
  <ProgressScreen />
);

const BadgeStatsWrapper: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => (
  <BadgeStatisticsScreen />
);

const ProfileWrapper: React.FC<{ onLogout: () => void; navigation: any; route: any }> = ({ onLogout, navigation, route }) => (
  <ProfileScreen onLogout={onLogout} navigation={navigation} />
);

const TamagotchiWrapper: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => (
  <TamagotchiScreen
    user={null} // Will be passed from parent
    onUpdateUser={async () => {}} // Will be passed from parent
  />
);

const AppNavigator: React.FC<AppNavigatorProps> = ({ onLogout }) => {
  const { colors } = useTheme();
  const [showCravingModal, setShowCravingModal] = useState(false);
  const [userIsPremium, setUserIsPremium] = useState(false);

  // Monitor user's premium status for ad decisions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserIsPremium(userData.isPremium || false);
            log.debug('🎯 User premium status updated:', userData.isPremium);
          }
        } catch (error) {
          log.error('Error fetching user premium status:', error);
          setUserIsPremium(false); // Default to non-premium on error
        }
      } else {
        setUserIsPremium(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Custom tab bar button component for Tamagotchi with ads
  const TamagotchiTabButton = (props: any) => {
    const { children, onPress, style, ...otherProps } = props;

    const handleTamagotchiPress = async () => {
      try {
        // Check if we can show an ad before navigating to Tamagotchi
        if (!userIsPremium && canShowAd(userIsPremium)) {
          log.debug('🎯 Showing ad before Tamagotchi tab navigation');

          // Show interstitial ad first
          const adShown = await showInterstitialAd(userIsPremium, 'tamagotchi_tab_navigation');

          // Small delay after ad, then navigate
          setTimeout(() => {
            onPress && onPress();
          }, adShown ? 500 : 100);
        } else {
          // Direct navigation for premium users or when ad not available
          log.debug('🎯 Direct Tamagotchi tab navigation (premium user or ad not available)');
          onPress && onPress();
        }
      } catch (error) {
        // Fallback - always allow navigation even if ads fail
        log.error('Error in Tamagotchi tab navigation with ads:', error);
        onPress && onPress();
      }
    };

    return (
      <TouchableOpacity
        onPress={handleTamagotchiPress}
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
          },
          style
        ]}
        {...otherProps}
      >
        {children}
      </TouchableOpacity>
    );
  };
  
  // Memoize components to prevent recreation on theme/language changes
  const DashboardComponent = useMemo(() => 
    ({ navigation, route }: any) => <DashboardWrapper onLogout={onLogout} navigation={navigation} route={route} />, 
    [onLogout]
  );
  const ProgressComponent = useMemo(() => 
    ({ navigation, route }: any) => <ProgressWrapper navigation={navigation} route={route} />, 
    []
  );
  const BadgeStatsComponent = useMemo(() => 
    ({ navigation, route }: any) => <BadgeStatsWrapper navigation={navigation} route={route} />, 
    []
  );
  const ProfileComponent = useMemo(() => 
    ({ navigation, route }: any) => <ProfileWrapper onLogout={onLogout} navigation={navigation} route={route} />, 
    [onLogout]
  );
  const TamagotchiComponent = useMemo(() => 
    ({ navigation, route }: any) => <TamagotchiWrapper navigation={navigation} route={route} />, 
    []
  );
  
  return (
    <>
    <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Tamagotchi') {
              return (
                <Image
                  source={require('../../assets/images/lungcat.png')}
                  style={{
                    width: size,
                    height: size,
                    tintColor: color,
                  }}
                  resizeMode="contain"
                />
              );
            }

            let iconName: keyof typeof MaterialIcons.glyphMap;
            switch (route.name) {
              case 'Dashboard':
                iconName = 'home';
                break;
              case 'Progress':
                iconName = 'trending-up';
                break;
              case 'BadgeStats':
                iconName = 'emoji-events';
                break;
              case 'Profile':
                iconName = 'person';
                break;
              default:
                iconName = 'home';
            }

            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.lightGray,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: SIZES.xs,
            fontWeight: '500',
            color: colors.textSecondary,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          options={{ 
            tabBarLabel: 'Beranda',
          }}
          component={DashboardComponent}
        />
        
        <Tab.Screen 
          name="Progress" 
          options={{ 
            tabBarLabel: 'Progress',
          }}
          component={ProgressComponent}
        />
        
        <Tab.Screen
          name="Tamagotchi"
          options={{
            tabBarLabel: 'Lungcat',
            tabBarLabelStyle: {
              fontSize: SIZES.xs,
              fontWeight: '600',
              color: colors.textSecondary,
            },
            tabBarButton: TamagotchiTabButton,
          }}
          component={TamagotchiComponent}
        />
        
        <Tab.Screen 
          name="BadgeStats" 
          options={{ 
            tabBarLabel: 'Achievements',
          }}
          component={BadgeStatsComponent}
        />
        
        <Tab.Screen 
          name="Profile" 
          options={{ 
            tabBarLabel: 'Profil',
          }}
          component={ProfileComponent}
        />
      </Tab.Navigator>
      
      {/* Craving Support Modal - Now handled at navigation level */}
      <CravingModal 
        visible={showCravingModal}
        onClose={() => setShowCravingModal(false)}
      />
    </>
  );
};

export default AppNavigator;