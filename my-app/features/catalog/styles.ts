import { Platform, StyleSheet } from 'react-native';

export const exploreStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
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
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
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
    color: '#111827',
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
    backgroundColor: 'rgba(17,24,39,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
  },

  chipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },


  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
  },

  emptyTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    color: 'rgba(17,24,39,0.6)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },

  menuSearchBox: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(17,24,39,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  menuSearchInput: {
    flex: 1,
    minHeight: 44,
    color: '#111827',
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
    backgroundColor: '#fff',
  },

  catalogTools: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
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
    borderColor: 'rgba(17,24,39,0.08)',
    backgroundColor: 'rgba(17,24,39,0.04)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  sortChipActive: {
    borderColor: 'rgba(59,130,246,0.35)',
    backgroundColor: 'rgba(59,130,246,0.12)',
  },

  sortChipText: {
    color: '#111827',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },

  sortChipTextActive: {
    color: '#1D4ED8',
  },

  undoBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.22)',
    backgroundColor: 'rgba(245,158,11,0.12)',
    padding: 12,
    gap: 8,
  },

  undoText: {
    color: '#92400E',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },

  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
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
    color: '#111827',
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
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 16,
    includeFontPadding: false,
  },

  table: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
    backgroundColor: '#fff',
  },

  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(17,24,39,0.05)',
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(17,24,39,0.06)',
    backgroundColor: '#FFFFFF',
  },

  rowAlt: {
    backgroundColor: 'rgba(17,24,39,0.02)',
  },

  rowSelected: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },

  cell: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    lineHeight: 18,
    includeFontPadding: false,
  },

  cellHeader: {
    fontWeight: '900',
    color: 'rgba(17,24,39,0.7)',
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
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderColor: 'rgba(245,158,11,0.22)',
  },

  actionDelete: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderColor: 'rgba(239,68,68,0.18)',
  },

  actionText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
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
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: Platform.OS === 'web' ? 22 : 24,
    borderTopLeftRadius: Platform.OS === 'web' ? 22 : 24,
    borderTopRightRadius: Platform.OS === 'web' ? 22 : 24,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
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
    color: '#111827',
    lineHeight: 20,
    includeFontPadding: false,
  },

  iconClose: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(17,24,39,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(17,24,39,0.7)',
  },

  input: {
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.10)',
    backgroundColor: 'rgba(17,24,39,0.04)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    fontSize: 14,
    color: '#111827',
  },

  inputError: {
    borderColor: 'rgba(220,38,38,0.55)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },

  errorText: {
    marginTop: 5,
    color: '#B91C1C',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },

  hint: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(17,24,39,0.6)',
    lineHeight: 16,
    includeFontPadding: false,
  },

  pickerWrap: {
    borderWidth: Platform.OS === 'web' ? 0 : 1,
    borderColor: 'rgba(17,24,39,0.10)',
    backgroundColor: 'rgba(17,24,39,0.04)',
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: Platform.OS === 'android' ? 2 : 0,
  },

  picker: {
    height: 52,
    ...(Platform.OS === 'web'
      ? ({
          borderWidth: 1,
          borderColor: 'rgba(17,24,39,0.10)',
          borderRadius: 14,
          backgroundColor: 'rgba(17,24,39,0.04)',
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
    backgroundColor: 'rgba(245,158,11,0.16)',
    borderColor: 'rgba(245,158,11,0.24)',
  },
  swipeDelete: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.20)',
  },

  modalButtons: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.06)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },

  secondaryBtnText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },
});