import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type HomeStyleTheme = ThemePalette | typeof colors;

const createHomeStyles = (theme: HomeStyleTheme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  decorBlob1: {
    position: 'absolute',
    top: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
  },
  decorBlob2: {
    position: 'absolute',
    top: 60,
    right: -140,
    width: 340,
    height: 340,
    borderRadius: radius.pill,
    backgroundColor: theme.successSoft,
  },

  page: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 900,
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 18,
    gap: spacing.md,
  },

  headerCard: {
    backgroundColor: theme.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    ...shadows.card,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    color: theme.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: theme.textSoft,
  },

  menuCard: {
    backgroundColor: theme.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    ...shadows.soft,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.textMuted,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  compactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  compactHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  menuList: {
    paddingHorizontal: 4,
    paddingBottom: 6,
    paddingTop: 8,
    gap: spacing.sm + 2,
  },

  menuSearchBox: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  menuSearchInput: {
    flex: 1,
    minHeight: 44,
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    paddingVertical: 0,
  },

  menuSearchClear: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },

  menuEmptyText: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    paddingVertical: spacing.md,
    textAlign: 'center',
  },


  menuGroup: {
    gap: spacing.sm,
  },
  menuGroupTitle: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  menuGroupList: {
    gap: spacing.sm,
  },

  menuItem: {
    minHeight: 72,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuItemPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: theme.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuItemText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    color: theme.text,
  },
  statusCard: {
    backgroundColor: theme.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    ...shadows.soft,
  },

  progressSummary: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  progressSummaryTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  progressSummaryTitle: {
    color: theme.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  progressSummarySubtitle: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  detailsButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  detailsButtonText: {
    color: theme.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },

  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 12,
  },
  statusPill: {
    minWidth: 108,
    flexGrow: 1,
    borderRadius: radius.md,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  statusValue: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  statusLabel: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  statusHint: {
    color: theme.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    marginBottom: 10,
  },

  continueBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
    padding: spacing.md,
    gap: 6,
    marginBottom: 10,
  },
  continueTitle: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  continueText: {
    color: theme.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  continueButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  continueButtonText: {
    color: theme.textOnDark,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  actionRowCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: theme.dangerSoft,
    borderColor: theme.danger,
  },
  actionButtonText: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },


  badgePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.primarySoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  badgePillText: {
    color: theme.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  hubTitle: {
    color: theme.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  hubSubtitle: {
    color: theme.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    marginTop: 6,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hubTile: {
    flexGrow: 1,
    flexBasis: 210,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  serviceCard: {
    backgroundColor: theme.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    ...shadows.soft,
  },
  serviceHeaderRow: {
    gap: 4,
  },
  serviceHint: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    paddingHorizontal: 6,
    marginTop: -3,
    marginBottom: 8,
  },
  serviceShortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceShortcut: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 72,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  serviceTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  serviceTitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  serviceSubtitle: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 2,
  },
});

export const styles = createHomeStyles(colors);

export function useHomeStyles() {
  const palette = useThemePalette();

  return useMemo(() => createHomeStyles(palette), [palette]);
}
