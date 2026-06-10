import type { ReactNode } from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useThemePalette } from '../theme';

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
  const palette = useThemePalette();

  return (
    <ReanimatedScrollView
      {...rest}
      entering={FadeIn.duration(180)}
      style={[{ backgroundColor: palette.bg }, style, { backgroundColor: palette.bg }]}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </ReanimatedScrollView>
  );
}
