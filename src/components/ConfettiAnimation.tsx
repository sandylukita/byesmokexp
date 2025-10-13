import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
  shape: 'circle' | 'square' | 'triangle';
  width: number;
  height: number;
}

interface ConfettiAnimationProps {
  visible: boolean;
  onComplete?: () => void;
  colors?: string[];
  pieceCount?: number;
  duration?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  visible,
  onComplete,
  colors = ['#F99546', '#27AE60', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6'],
  pieceCount = 25,
  duration = 2500,
}) => {
  const opacity = useSharedValue(0);
  
  // Generate confetti pieces once using useMemo
  const confettiPieces: ConfettiPiece[] = React.useMemo(() => 
    Array.from({ length: pieceCount }, (_, index) => {
      const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 6 + Math.random() * 8; // 6-14px size range
      
      return {
        id: index,
        x: screenWidth * 0.1 + Math.random() * screenWidth * 0.8, // Keep within screen bounds
        y: -20 - Math.random() * 50, // Start higher and staggered
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.6, // Better size variation
        delay: Math.random() * 300, // Longer delay spread
        shape,
        width: shape === 'triangle' ? size * 1.2 : size,
        height: shape === 'triangle' ? size : size,
      };
    }),
    [pieceCount, colors, screenWidth]
  );

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 100 });
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, duration, opacity, onComplete]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <ConfettiPieceComponent
          key={piece.id}
          piece={piece}
          visible={visible}
          duration={duration}
        />
      ))}
    </Animated.View>
  );
};

interface ConfettiPieceProps {
  piece: ConfettiPiece;
  visible: boolean;
  duration: number;
}

const ConfettiPieceComponent: React.FC<ConfettiPieceProps> = React.memo(function ConfettiPieceComponent({ piece, visible, duration }) {
  const translateY = useSharedValue(piece.y);
  const translateX = useSharedValue(piece.x);
  const rotation = useSharedValue(piece.rotation);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      const startDelay = piece.delay;
      const fallDuration = duration - 200;
      
      // Fade in and scale in with bounce
      opacity.value = withDelay(startDelay, withTiming(1, { duration: 200 }));
      scale.value = withDelay(
        startDelay, 
        withTiming(piece.scale, { 
          duration: 300, 
          easing: Easing.out(Easing.back(1.8))
        })
      );
      
      // More realistic physics - faster acceleration, then slower
      translateY.value = withDelay(
        startDelay,
        withTiming(screenHeight + 100, { 
          duration: fallDuration,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) // Smooth acceleration
        })
      );
      
      // Zigzag motion for more natural feel
      const leftDrift = (Math.random() - 0.5) * 100;
      const rightDrift = (Math.random() - 0.5) * 80;
      
      // First drift
      translateX.value = withDelay(
        startDelay,
        withTiming(piece.x + leftDrift, { 
          duration: fallDuration * 0.6,
          easing: Easing.inOut(Easing.sin)
        })
      );
      
      // Second drift (zigzag effect)
      setTimeout(() => {
        translateX.value = withTiming(piece.x + leftDrift + rightDrift, {
          duration: fallDuration * 0.4,
          easing: Easing.inOut(Easing.sin)
        });
      }, startDelay + fallDuration * 0.6);
      
      // Varied rotation speed based on piece
      const rotationSpeed = 800 + Math.random() * 1000;
      const rotations = Math.random() < 0.5 ? 1 : -1; // Random direction
      
      rotation.value = withDelay(
        startDelay,
        withRepeat(
          withTiming(piece.rotation + (360 * rotations), { 
            duration: rotationSpeed,
            easing: Easing.linear
          }),
          -1,
          false
        )
      );
      
      // Fade out near the bottom
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 400 });
      }, startDelay + fallDuration * 0.8);
      
    } else {
      // Reset values immediately
      translateY.value = piece.y;
      translateX.value = piece.x;
      rotation.value = piece.rotation;
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible, duration, piece]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const getShapeStyle = () => {
    const baseStyle = {
      width: piece.width,
      height: piece.height,
      backgroundColor: piece.color,
    };

    switch (piece.shape) {
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: piece.width / 2,
        };
      case 'square':
        return {
          ...baseStyle,
          borderRadius: 2,
        };
      case 'triangle':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderLeftWidth: piece.width / 2,
          borderRightWidth: piece.width / 2,
          borderBottomWidth: piece.height,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: piece.color,
          borderRadius: 0,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        getShapeStyle(),
        animatedStyle,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    // Remove fixed dimensions - they're now set dynamically per piece
  },
});

export default ConfettiAnimation;