import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SwipeableTabNavigator from '../components/SwipeableTabNavigator';
import { COLORS, SIZES } from '../utils/constants';

const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

const TAB_ROUTES = ['Dashboard', 'Progress', 'Leaderboard', 'Profile'];

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
              case 'Leaderboard':
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
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: COLORS.lightGray,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: SIZES.xs,
            fontWeight: '500',
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
          name="Leaderboard" 
          options={{ 
            tabBarLabel: 'Leaderboard',
          }}
        >
          {({ navigation }) => (
            <SwipeableScreen routeName="Leaderboard" navigation={navigation}>
              <LeaderboardScreen />
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