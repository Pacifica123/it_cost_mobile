import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing, useThemePalette } from '../theme';
import { getUiDensityPaddingFor, useUiDensity } from '../utils/appPreferences';
import { AnimatedSurface } from './AnimatedSurface';

export function AppCard({
  children,
  style,
  delay = 0,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const basePadding = typeof flattenedStyle.padding === 'number' ? flattenedStyle.padding : spacing.lg;
  const baseRadius = typeof flattenedStyle.borderRadius === 'number' ? flattenedStyle.borderRadius : radius.xl;
  const density = useUiDensity();
  const palette = useThemePalette();
  const densityRadius = density === 'compact' ? Math.max(radius.md, baseRadius - 4) : density === 'large' ? baseRadius + 4 : baseRadius;

  return (
    <AnimatedSurface
      delay={delay}
      style={[
        styles.card,
        style,
        {
          padding: getUiDensityPaddingFor(density, basePadding),
          borderRadius: densityRadius,
          backgroundColor: palette.surface,
          borderColor: palette.borderSoft,
        },
      ]}
    >
      {children}
    </AnimatedSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card,
  },
});
