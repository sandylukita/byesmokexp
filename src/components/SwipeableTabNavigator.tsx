import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeableTabNavigatorProps {
  children: React.ReactNode;
  navigation: BottomTabNavigationProp<any>;
  currentTabIndex: number;
  tabRoutes: string[];
}

const SwipeableTabNavigator: React.FC<SwipeableTabNavigatorProps> = ({
  children,
  navigation,
  currentTabIndex,
  tabRoutes,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentTabIndex);

  const navigateToTab = (index: number) => {
    if (index >= 0 && index < tabRoutes.length) {
      navigation.navigate(tabRoutes[index]);
      setActiveIndex(index);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderEnd: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      
      // Determine if we should switch tabs
      const shouldSwipeLeft = dx > SCREEN_WIDTH / 3 || vx > 0.5;
      const shouldSwipeRight = dx < -SCREEN_WIDTH / 3 || vx < -0.5;
      
      let newIndex = activeIndex;
      
      if (shouldSwipeLeft && activeIndex > 0) {
        newIndex = activeIndex - 1;
      } else if (shouldSwipeRight && activeIndex < tabRoutes.length - 1) {
        newIndex = activeIndex + 1;
      }
      
      // Navigate to new tab if index changed
      if (newIndex !== activeIndex) {
        navigateToTab(newIndex);
      }
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default SwipeableTabNavigator;