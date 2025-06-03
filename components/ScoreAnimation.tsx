import { useEffect } from 'react';
import { Animated, Easing, View } from 'react-native';
import { ScoreType } from '../types/game';

interface ScoreAnimationProps {
  scoreType: ScoreType;
  onComplete?: () => void;
}

export default function ScoreAnimation({ scoreType, onComplete }: ScoreAnimationProps) {
  const position = new Animated.Value(0);
  const scale = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  useEffect(() => {
    switch (scoreType) {
      case 'Birdie':
        // Bird flying animation
        Animated.sequence([
          Animated.timing(position, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(onComplete);
        break;

      case 'Eagle':
        // Soaring eagle animation
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(position, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(onComplete);
        break;

      case 'Bogey':
      case 'Double Bogey':
      case 'Triple Bogey':
        // Rain cloud or explosion animation
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(onComplete);
        break;

      default:
        // Simple fade for par
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(onComplete);
    }
  }, [scoreType]);

  const getEmoji = () => {
    switch (scoreType) {
      case 'Birdie':
        return '🐦';
      case 'Eagle':
        return '🦅';
      case 'Bogey':
        return '☁️';
      case 'Double Bogey':
        return '💣';
      case 'Triple Bogey':
        return '💩';
      default:
        return '⛳️';
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
          {
            translateY: position.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -100],
            }),
          },
          {
            scale: scale.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
          },
        ],
        opacity,
      }}
    >
      <View className="bg-white/80 rounded-full p-4">
        <Animated.Text className="text-4xl">{getEmoji()}</Animated.Text>
      </View>
    </Animated.View>
  );
} 