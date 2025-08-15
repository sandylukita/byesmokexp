import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import BadgeStatisticsScreen from '../screens/BadgeStatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SwipeableTabNavigator from '../components/SwipeableTabNavigator';
import { COLORS, SIZES } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

// Define tab routes for swipe navigation
const TAB_ROUTES = ['Dashboard', 'Progress', 'BadgeStats', 'Profile'];

// Create wrapper components - SwipeableTabNavigator temporarily disabled
const DashboardWrapper: React.FC<{ onLogout: () => void; navigation: any; route: any }> = ({ onLogout, navigation, route }) => (
  <DashboardScreen onLogout={onLogout} />
);

const ProgressWrapper: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => (
  <ProgressScreen />
);

const BadgeStatsWrapper: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => (
  <BadgeStatisticsScreen />
);

const ProfileWrapper: React.FC<{ onLogout: () => void; navigation: any; route: any }> = ({ onLogout, navigation, route }) => (
  <ProfileScreen onLogout={onLogout} navigation={navigation} />
);

const AppNavigator: React.FC<AppNavigatorProps> = ({ onLogout }) => {
  const { colors } = useTheme();
  
  // Simplified components without useMemo to test touch issues
  const DashboardComponent = ({ navigation, route }: any) => <DashboardWrapper onLogout={onLogout} navigation={navigation} route={route} />;
  const ProgressComponent = ({ navigation, route }: any) => <ProgressWrapper navigation={navigation} route={route} />;
  const BadgeStatsComponent = ({ navigation, route }: any) => <BadgeStatsWrapper navigation={navigation} route={route} />;
  const ProfileComponent = ({ navigation, route }: any) => <ProfileWrapper onLogout={onLogout} navigation={navigation} route={route} />;
  
  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
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
  );
};

export default AppNavigator;