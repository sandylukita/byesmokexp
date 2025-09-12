import React, { useMemo, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DashboardScreen from '../screens/DashboardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import BadgeStatisticsScreen from '../screens/BadgeStatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SwipeableTabNavigator from '../components/SwipeableTabNavigator';
import CravingModal from '../components/CravingModal';
import { COLORS, SIZES } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

// Define tab routes for swipe navigation
const TAB_ROUTES = ['Dashboard', 'Progress', 'BadgeStats', 'Profile'];

// Create wrapper components - SwipeableTabNavigator temporarily disabled
const DashboardWrapper: React.FC<{ onLogout: () => void; navigation: any; route: any }> = ({ onLogout, navigation, route }) => {
  console.log('🎯 DashboardWrapper rendering');
  return <DashboardScreen onLogout={onLogout} />;
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

// SOS Screen - dummy component since SOS button just opens modal
const SOSScreen: React.FC = () => <View style={{ flex: 1 }} />;

const AppNavigator: React.FC<AppNavigatorProps> = ({ onLogout }) => {
  const { colors } = useTheme();
  const [showCravingModal, setShowCravingModal] = useState(false);
  
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
  
  return (
    <>
    <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            // Special handling for SOS button
            if (route.name === 'SOS') {
              return (
                <View style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: 30, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: 10 
                }}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FF5252']}
                    style={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 30, 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                    }}
                  >
                    <MaterialIcons name="notification-important" size={24} color="white" />
                  </LinearGradient>
                </View>
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
          name="SOS" 
          options={{ 
            tabBarLabel: 'SOS',
            tabBarLabelStyle: {
              fontSize: SIZES.xs - 1,
              fontWeight: '700',
              color: '#FF5252',
            },
          }}
          component={SOSScreen}
          listeners={{
            tabPress: (e) => {
              // Prevent default navigation
              e.preventDefault();
              // Open craving modal instead
              setShowCravingModal(true);
            },
          }}
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