import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7FB' },

  content: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 },
  grow: { flex: 1 },
  headerContent: { flex: 1, minWidth: 0 },
  spacerSm: { height: 12 },

  // Типографика
  h1: { fontSize: 22, fontWeight: '900', color: '#111827' },
  muted: { marginTop: 4, color: '#6B7280', fontSize: 13 },

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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E9F0',
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
  deleteLinkText: { color: '#EF4444', fontWeight: '900' },

  // Карточка
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7E9F0',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0 : 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '900', color: '#111827' },

  metaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  metaBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  metaLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '800' },
  metaValue: { fontSize: 14, color: '#111827', fontWeight: '900' },
  metaSub: { marginTop: 2, fontSize: 11, color: '#6B7280', fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#EEF0F6', marginTop: 12, marginBottom: 10 },

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
  btnPrimary: { backgroundColor: '#2563EB' },
  btnGhost: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E9F0' },
  btnDanger: { backgroundColor: '#EF4444' },
  btnText: { color: '#FFFFFF', fontWeight: '900', flexShrink: 1 },
  btnTextGhost: { color: '#111827' },
  btnTextDanger: { color: '#FFFFFF' },

  // Чипы
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '100%',
  },
  chipNeutral: { backgroundColor: '#F7F8FC', borderColor: '#EEF0F6' },
  chipBlue: { backgroundColor: '#EEF4FF', borderColor: '#DCE7FF' },
  chipGreen: { backgroundColor: '#ECFDF5', borderColor: '#CFFAE5' },
  chipText: { fontSize: 12, fontWeight: '900', color: '#111827' },

  // Пустое состояние
  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7E9F0',
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  emptyText: { marginTop: 6, textAlign: 'center', color: '#6B7280', lineHeight: 18 },

  // Модалка
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center' },
  modalWrap: { paddingHorizontal: 14 },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E9F0',
  },
  modalTitle: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 10 },

  label: { fontSize: 12, color: '#6B7280', fontWeight: '900', marginTop: 8, marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#EEF0F6',
    color: '#111827',
  },

  pickerBox: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF0F6',
    backgroundColor: '#F7F8FC',
  },

  switchRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: { fontSize: 13, fontWeight: '800', color: '#111827' },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },

  // Confirm
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E9F0',
  },
  confirmTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  confirmText: { marginTop: 6, color: '#374151', lineHeight: 18 },
  confirmBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
