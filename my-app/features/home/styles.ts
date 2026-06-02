import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing } from '../../shared/theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  decorBlob1: {
    position: 'absolute',
    top: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(99,102,241,0.22)',
  },
  decorBlob2: {
    position: 'absolute',
    top: 60,
    right: -140,
    width: 340,
    height: 340,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
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
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    ...shadows.card,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    color: colors.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(17,24,39,0.7)',
  },

  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    ...shadows.soft,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(17,24,39,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 8,
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
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  menuSearchInput: {
    flex: 1,
    minHeight: 44,
    color: colors.text,
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
    backgroundColor: colors.surface,
  },

  menuEmptyText: {
    color: colors.textMuted,
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
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
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
    backgroundColor: 'rgba(17,24,39,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuItemText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    color: colors.text,
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    ...shadows.soft,
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
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  statusValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  statusHint: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    marginBottom: 10,
  },

  continueBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.22)',
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    gap: 6,
    marginBottom: 10,
  },
  continueTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  continueText: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  continueButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  continueButtonText: {
    color: colors.textOnDark,
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
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(239,68,68,0.24)',
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
});
