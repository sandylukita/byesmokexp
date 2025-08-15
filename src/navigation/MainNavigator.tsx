import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import LegalScreen from '../screens/LegalScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

const Stack = createNativeStackNavigator();

export type MainStackParamList = {
  AppTabs: undefined;
  Legal: {
    document?: 'privacy' | 'terms';
  };
  Subscription: {
    userId?: string;
  };
};

interface MainNavigatorProps {
  onLogout: () => void;
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ onLogout }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTabs">
        {() => <AppNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Legal" 
        component={LegalScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Subscription"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      >
        {({ navigation, route }) => (
          <SubscriptionScreen
            onClose={() => navigation.goBack()}
            userId={route.params?.userId}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainNavigator;