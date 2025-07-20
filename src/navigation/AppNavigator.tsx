import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

const TAB_ROUTES = ['Dashboard', 'Progress', 'BadgeStats', 'Profile'];

const getCurrentTabIndex = (routeName: string): number => {
  return TAB_ROUTES.indexOf(routeName);
};

interface SwipeableScreenProps {
  children: React.ReactNode;
  routeName: string;
  navigation: any;
}

const SwipeableScreen: React.FC<SwipeableScreenProps> = ({ children, routeName, navigation }) => {
  const currentTabIndex = getCurrentTabIndex(routeName);
  
  return (
    <SwipeableTabNavigator
      navigation={navigation}
      currentTabIndex={currentTabIndex}
      tabRoutes={TAB_ROUTES}
    >
      {children}
    </SwipeableTabNavigator>
  );
};

const AppNavigator: React.FC<AppNavigatorProps> = ({ onLogout }) => {
  const { colors } = useTheme();
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
        >
          {({ navigation }) => (
            <SwipeableScreen routeName="Dashboard" navigation={navigation}>
              <DashboardScreen onLogout={onLogout} />
            </SwipeableScreen>
          )}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Progress" 
          options={{ 
            tabBarLabel: 'Progress',
          }}
        >
          {({ navigation }) => (
            <SwipeableScreen routeName="Progress" navigation={navigation}>
              <ProgressScreen />
            </SwipeableScreen>
          )}
        </Tab.Screen>
        
        <Tab.Screen 
          name="BadgeStats" 
          options={{ 
            tabBarLabel: 'Badge Stats',
          }}
        >
          {({ navigation }) => (
            <SwipeableScreen routeName="BadgeStats" navigation={navigation}>
              <BadgeStatisticsScreen />
            </SwipeableScreen>
          )}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Profile" 
          options={{ 
            tabBarLabel: 'Profil',
          }}
        >
          {({ navigation }) => (
            <SwipeableScreen routeName="Profile" navigation={navigation}>
              <ProfileScreen onLogout={onLogout} />
            </SwipeableScreen>
          )}
        </Tab.Screen>
      </Tab.Navigator>
  );
};

export default AppNavigator;