import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors, type ThemePalette, useThemePalette } from '../../shared/theme';

type ElectricityTheme = ThemePalette | typeof colors;

const createElectricityStyles = (theme: ElectricityTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  listScreenContent: {
    padding: 12,
    paddingTop: 12,
  },
  sectionTitle1: {
    marginTop: 0,
    marginBottom: 2,
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  emptyText: {
    paddingVertical: 18,
    fontSize: 14,
    color: theme.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    backgroundColor: theme.surface,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardDeleted: {
    opacity: 0.55,
  },
  deletedText: {
    textDecorationLine: 'line-through',
  },
  cardTop: {
    gap: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  fieldInline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.surfaceMuted,
    minWidth: 140,
  },
  inlineLabel: {
    fontSize: 12,
    color: theme.textMuted,
  },
  inlineValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginLeft: 10,
  },
  cardBottom: {
    marginTop: 10,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  restore: {
    color: theme.primary,
    fontWeight: '800',
  },
  form: {
    paddingBottom: 8,
    marginTop: 4,
  },
  collapseHeader: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: theme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  collapseHeaderPressed: {
    opacity: 0.9,
  },
  collapseHeaderMain: {
    flex: 1,
  },
  collapseSummary: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: theme.textSoft,
  },
  collapseToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collapseToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  collapseChevron: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.primary,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  formHeaderText: {
    flex: 1,
  },
  formSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: theme.textMuted,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.surface,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  paramCard: {
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.surface,
    marginBottom: 10,
  },
  paramCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  paramTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
  },
  unitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: theme.primarySoft,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.primary,
  },
  paramDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: theme.textMuted,
  },
  inputShell: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: theme.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputStrong: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  inputUnitText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textMuted,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surface,
  },
  quickChipActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textSoft,
  },
  quickChipTextActive: {
    color: theme.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: theme.surfaceMuted,
    color: theme.text,
  },
  resultCollapseHeader: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: theme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultCollapseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  resultBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 20,
    padding: 14,
    backgroundColor: theme.surface,
  },
  resultTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: theme.text,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.primarySoft,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  resultMetricCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: 16,
    padding: 14,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  resultMetricCardPrimary: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },
  resultMetricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textMuted,
    marginBottom: 8,
  },
  resultMetricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    lineHeight: 28,
  },
  resultMetricUnit: {
    marginTop: 4,
    fontSize: 13,
    color: theme.textSoft,
  },
  resultStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  resultStatChip: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  resultStatLabel: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 2,
  },
  resultStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },
  resultSubcard: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  resultSubcardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textMuted,
    marginBottom: 4,
  },
  resultSubcardText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  resultHint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: theme.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCenterWrap: {
    width: '100%',
    paddingHorizontal: 16,
  },
  modalCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalTitle: {
    fontWeight: '800',
    marginBottom: 12,
    fontSize: 17,
    color: theme.text,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.surfaceMuted,
  },
  modalBtnSecondaryText: {
    color: theme.text,
    fontWeight: '700',
  },
  modalBtnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.primary,
  },
  modalBtnPrimaryText: {
    color: theme.textOnDark,
    fontWeight: '700',
  },
});

export const styles = createElectricityStyles(colors);

export function useElectricityStyles() {
  const palette = useThemePalette();

  return useMemo(() => createElectricityStyles(palette), [palette]);
}
