import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type OptimizationStyleTheme = ThemePalette | typeof colors;

const createOptimizationStyles = (theme: OptimizationStyleTheme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  hero: {
    backgroundColor: theme.hero,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: {
    color: theme.textOnDark,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: theme.textOnDark,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: theme.textOnDarkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  sectionText: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  segmentActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },
  segmentText: {
    color: theme.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: theme.primary,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: theme.textSoft,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: 12,
    color: theme.text,
    fontSize: 15,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  button: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonText: {
    color: theme.textOnDark,
    fontSize: 15,
    fontWeight: '900',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '46%',
    borderRadius: 18,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: 12,
  },
  statValue: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  solutionCard: {
    borderRadius: 18,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: 12,
    marginTop: 10,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  solutionTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '900',
  },
  solutionMeta: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  scorePill: {
    backgroundColor: theme.successSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scorePillText: {
    color: theme.success,
    fontSize: 12,
    fontWeight: '900',
  },
  itemText: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  muted: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  warning: {
    color: theme.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  explanationBox: {
    borderRadius: 18,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    padding: 12,
    marginBottom: 12,
    gap: 5,
  },
  explanationTitle: {
    color: theme.primary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    marginBottom: 2,
  },
  explanationText: {
    color: theme.primary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});

export const optimizationStyles = createOptimizationStyles(colors);

export function useOptimizationStyles() {
  const palette = useThemePalette();

  return useMemo(() => createOptimizationStyles(palette), [palette]);
}
