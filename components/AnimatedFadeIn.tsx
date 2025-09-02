import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

interface AnimatedFadeInProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialOpacity?: number;
}

const AnimatedFadeIn: React.FC<AnimatedFadeInProps> = ({
  children,
  duration = 800,
  delay = 0,
  initialOpacity = 0,
  style,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(initialOpacity)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedFadeIn;