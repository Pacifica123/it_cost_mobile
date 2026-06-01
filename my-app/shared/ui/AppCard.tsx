import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';
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
  return <AnimatedSurface delay={delay} style={[styles.card, style]}>{children}</AnimatedSurface>;
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
