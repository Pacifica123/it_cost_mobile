import type { ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

export function AnimatedSurface({
  children,
  style,
  delay = 0,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(260)}
      layout={LinearTransition.duration(180)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
