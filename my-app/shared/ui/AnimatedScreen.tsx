import type { ReactNode } from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const ReanimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function AnimatedScreenScroll({
  children,
  style,
  contentContainerStyle,
  ...rest
}: ScrollViewProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ReanimatedScrollView
      {...rest}
      entering={FadeIn.duration(180)}
      style={style}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </ReanimatedScrollView>
  );
}
