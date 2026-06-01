import { useEffect, type ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  pressedOpacity?: number;
};

export function AnimatedPressable({
  children,
  style,
  pressedScale = 0.985,
  pressedOpacity = 0.88,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.5 : 1);

  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 140 });
  }, [disabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      scale.value = withTiming(pressedScale, { duration: 110 });
      opacity.value = withTiming(pressedOpacity, { duration: 110 });
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    scale.value = withTiming(1, { duration: 140 });
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 140 });
    onPressOut?.(event);
  };

  return (
    <ReanimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </ReanimatedPressable>
  );
}
