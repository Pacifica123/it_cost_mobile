import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type CatalogStyleTheme = ThemePalette | typeof colors;

const createCatalogStyles = (theme: CatalogStyleTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    gap: 12,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 900,
  },

  topBar: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },

  screenTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.text,
    lineHeight: 22,
    includeFontPadding: false,
  },

  topActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },

  chipText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },


  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.surface,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },

  emptyTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },

  menuSearchBox: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: 12,
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
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },

  catalogTools: {
    borderRadius: 18,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: 12,
    gap: 10,
  },

  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  sortChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  sortChipActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },

  sortChipText: {
    color: theme.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },

  sortChipTextActive: {
    color: theme.primary,
  },

  undoBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.warning,
    backgroundColor: theme.warningSoft,
    padding: 12,
    gap: 8,
  },

  undoText: {
    color: theme.warning,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },

  categoryCard: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 1 },
      default: {},
    }),
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 10,
  },

  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: theme.text,
    lineHeight: 20,
    includeFontPadding: false,
    flexShrink: 1,
  },

  nameCell: {
    flex: 3,
  },
  priceCell: {
    flex: 1,
  },

  badge: {
    minWidth: 34,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.text,
    lineHeight: 16,
    includeFontPadding: false,
  },

  table: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surface,
  },

  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.surfaceMuted,
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderSoft,
    backgroundColor: theme.surface,
  },

  rowAlt: {
    backgroundColor: theme.surfaceMuted,
  },

  rowSelected: {
    backgroundColor: theme.successSoft,
  },

  cell: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    lineHeight: 18,
    includeFontPadding: false,
  },

  cellHeader: {
    fontWeight: '900',
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 16,
    includeFontPadding: false,
  },

  cellRight: {
    textAlign: 'right',
  },

  cellCenter: {
    textAlign: 'center',
  },

  actionBar: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },

  actionEdit: {
    backgroundColor: theme.warningSoft,
    borderColor: theme.warning,
  },

  actionDelete: {
    backgroundColor: theme.dangerSoft,
    borderColor: theme.danger,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.text,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    padding: 16,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.55)',
  },

  modalCard: {
    backgroundColor: theme.surface,
    borderRadius: Platform.OS === 'web' ? 22 : 24,
    borderTopLeftRadius: Platform.OS === 'web' ? 22 : 24,
    borderTopRightRadius: Platform.OS === 'web' ? 22 : 24,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    width: '100%',
    maxWidth: 720,
    maxHeight: '88%',
    alignSelf: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: Platform.OS === 'web' ? 10 : -6 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },

  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: theme.text,
    lineHeight: 20,
    includeFontPadding: false,
  },

  iconClose: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '800',
    color: theme.textSoft,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    fontSize: 14,
    color: theme.text,
  },

  inputError: {
    borderColor: theme.danger,
    backgroundColor: theme.dangerSoft,
  },

  errorText: {
    marginTop: 5,
    color: theme.danger,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },

  hint: {
    marginTop: 8,
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 16,
    includeFontPadding: false,
  },

  pickerWrap: {
    borderWidth: Platform.OS === 'web' ? 0 : 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceMuted,
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: Platform.OS === 'android' ? 2 : 0,
  },

  picker: {
    height: 52,
    ...(Platform.OS === 'web'
      ? ({
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 14,
          backgroundColor: theme.surfaceMuted,
          paddingHorizontal: 12,
          outlineStyle: 'none',
        } as any)
      : null),
  },

  swipeActions: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  swipeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  swipeEdit: {
    backgroundColor: theme.warningSoft,
    borderColor: theme.warning,
  },
  swipeDelete: {
    backgroundColor: theme.dangerSoft,
    borderColor: theme.danger,
  },

  modalButtons: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: theme.hero,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: theme.textOnDark,
    fontSize: 14,
    fontWeight: '900',
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },

  secondaryBtnText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '900',
  },
});

export const exploreStyles = createCatalogStyles(colors);

export function useCatalogStyles() {
  const palette = useThemePalette();

  return useMemo(() => createCatalogStyles(palette), [palette]);
}
