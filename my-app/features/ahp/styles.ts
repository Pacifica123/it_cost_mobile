import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type AhpStyleTheme = ThemePalette | typeof colors;

const createAhpStyles = (theme: AhpStyleTheme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },

  hero: {
    backgroundColor: theme.hero,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: theme.textOnDark,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.textOnDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.textOnDarkSoft,
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: -5,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 5,
    minHeight: 88,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 16,
  },

  panel: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
  },
  sectionCounter: {
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  sectionCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },

  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 10,
  },
  buttonCell: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonCompact: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonPrimary: {
    backgroundColor: theme.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.surfaceMuted,
  },
  buttonDanger: {
    backgroundColor: theme.danger,
  },
  buttonGhost: {
    backgroundColor: theme.dangerSoft,
    borderWidth: 1,
    borderColor: theme.danger,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: theme.textOnDark,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextDark: {
    color: theme.text,
  },

  emptyBox: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },

  configTabs: {
    paddingVertical: 4,
    paddingRight: 6,
  },
  configTab: {
    minWidth: 132,
    backgroundColor: theme.surfaceMuted,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    marginRight: 10,
  },
  configTabActive: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  configTabTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  configTabTitleActive: {
    color: theme.primary,
  },
  configTabMeta: {
    fontSize: 12,
    color: theme.textMuted,
  },
  configTabMetaActive: {
    color: theme.primary,
  },

  selectedCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.primary,
    overflow: 'hidden',
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedCardInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    marginBottom: 8,
  },
  selectedCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 2,
    flexShrink: 1,
  },
  selectedCardSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
    flexShrink: 1,
  },
  selectedPill: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    backgroundColor: theme.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selectedPillText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  deviceCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceHeaderLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 2,
  },
  deviceSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
  },

  field: {
    marginBottom: 12,
  },
  inlineField: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSoft,
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    color: theme.text,
    fontSize: 15,
  },

  doubleRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },

  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  segmentButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSoft,
  },
  segmentTextActive: {
    color: theme.textOnDark,
  },

  resultBox: {
    borderRadius: 16,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: 14,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.text,
  },

  toggleChip: {
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  toggleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },

  jsonBox: {
    borderRadius: 16,
    backgroundColor: theme.hero,
    padding: 14,
    marginTop: 4,
  },
  jsonText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 12,
    lineHeight: 18,
    color: theme.textOnDarkSoft,
  },

  mt12: {
    marginTop: 12,
  },
});

export const styles = createAhpStyles(colors);

export function useAhpStyles() {
  const palette = useThemePalette();

  return useMemo(() => createAhpStyles(palette), [palette]);
}
