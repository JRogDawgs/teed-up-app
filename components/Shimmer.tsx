import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export default function Shimmer({ width = '100%', height = 20, borderRadius = 4, className = '' }: ShimmerProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      className={`overflow-hidden bg-gray-800 ${className}`}
      style={{ width, height, borderRadius }}
    >
      <Animated.View
        className="absolute inset-0"
        style={{
          transform: [{ translateX }],
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );
} 