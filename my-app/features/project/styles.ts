import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';

type ProjectStyleTheme = ThemePalette | typeof colors;

const createProjectStyles = (theme: ProjectStyleTheme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 34,
    gap: spacing.md,
  },
  hero: {
    backgroundColor: theme.hero,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 12,
  },
  badgeText: {
    color: theme.textOnDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  heroTitle: {
    color: theme.textOnDark,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroText: {
    color: theme.textOnDarkSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    marginTop: 8,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  cardEyebrow: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    color: theme.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  metaPill: {
    flexGrow: 1,
    flexBasis: 130,
    borderRadius: radius.md,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: 12,
  },
  metaValue: {
    color: theme.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  metaLabel: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButton: {
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  dangerButton: {
    backgroundColor: theme.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.18)',
  },
  actionButtonText: {
    color: theme.textOnDark,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: theme.text,
  },
  readinessCard: {
    gap: 12,
  },
  readinessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  readinessTitle: {
    color: theme.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    marginTop: 2,
  },
  readinessBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  readinessBadgeText: {
    color: theme.text,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
  },
  checkList: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  checkIcon: {
    marginTop: 1,
  },
  checkTitleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  checkTitle: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  checkStatus: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  checkDescription: {
    color: theme.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  stepCard: {
    gap: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  stepTitle: {
    flex: 1,
    color: theme.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  stepHint: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  stepButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  stepButtonText: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  chartCard: {
    gap: 12,
  },
  barList: {
    gap: 12,
  },
  barRow: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'baseline',
  },
  barLabel: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  barValue: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textAlign: 'right',
    flexShrink: 1,
  },
  barTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceMuted,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});

export const projectStyles = createProjectStyles(colors);

export function useProjectStyles() {
  const palette = useThemePalette();

  return useMemo(() => createProjectStyles(palette), [palette]);
}
