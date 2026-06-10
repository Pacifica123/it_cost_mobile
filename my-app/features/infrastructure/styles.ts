import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type InfrastructureStyleTheme = ThemePalette | typeof colors;

const createInfrastructureStyles = (theme: InfrastructureStyleTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },

  content: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 },
  grow: { flex: 1 },
  headerContent: { flex: 1, minWidth: 0 },
  spacerSm: { height: 12 },

  // Типографика
  h1: { fontSize: 22, fontWeight: '900', color: theme.text },
  muted: { marginTop: 4, color: theme.textMuted, fontSize: 13 },

  // Список
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Детали
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20 },
  pressed: { opacity: 0.7 },
  cardPressed: { opacity: 0.92 },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },

  headerCard: { paddingBottom: 12 },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  deleteLink: { marginTop: 10, alignSelf: 'flex-start' },
  deleteLinkText: { color: theme.danger, fontWeight: '900' },

  // Карточка
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0 : 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '900', color: theme.text },

  metaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  metaBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  metaLabel: { fontSize: 12, color: theme.textMuted, marginBottom: 4, fontWeight: '800' },
  metaValue: { fontSize: 14, color: theme.text, fontWeight: '900' },
  metaSub: { marginTop: 2, fontSize: 11, color: theme.textMuted, fontWeight: '700' },

  divider: { height: 1, backgroundColor: theme.surfaceMuted, marginTop: 12, marginBottom: 10 },

  cardBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  // Кнопки
  btn: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnPrimary: { backgroundColor: theme.primary },
  btnGhost: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.borderSoft },
  btnDanger: { backgroundColor: theme.danger },
  btnText: { color: theme.textOnDark, fontWeight: '900', flexShrink: 1 },
  btnTextGhost: { color: theme.text },
  btnTextDanger: { color: theme.textOnDark },

  // Чипы
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '100%',
  },
  chipNeutral: { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSoft },
  chipBlue: { backgroundColor: theme.primarySoft, borderColor: theme.primary },
  chipGreen: { backgroundColor: theme.successSoft, borderColor: theme.success },
  chipText: { fontSize: 12, fontWeight: '900', color: theme.text },

  // Пустое состояние
  empty: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: theme.text },
  emptyText: { marginTop: 6, textAlign: 'center', color: theme.textMuted, lineHeight: 18 },

  // Модалка
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center' },
  modalWrap: { paddingHorizontal: 14 },
  modal: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  modalTitle: { fontSize: 16, fontWeight: '900', color: theme.text, marginBottom: 10 },

  label: { fontSize: 12, color: theme.textMuted, fontWeight: '900', marginTop: 8, marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    color: theme.text,
  },

  pickerBox: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
  },

  switchRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: { fontSize: 13, fontWeight: '800', color: theme.text },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },

  // Confirm
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  confirmCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  confirmTitle: { fontSize: 16, fontWeight: '900', color: theme.text },
  confirmText: { marginTop: 6, color: theme.textSoft, lineHeight: 18 },
  confirmBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
});

export const styles = createInfrastructureStyles(colors);

export function useInfrastructureStyles() {
  const palette = useThemePalette();

  return useMemo(() => createInfrastructureStyles(palette), [palette]);
}
