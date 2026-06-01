import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },

  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#eff6ff',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#cbd5e1',
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: -5,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },

  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748b',
  },
  sectionCounter: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  sectionCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338ca',
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
    backgroundColor: '#2563eb',
  },
  buttonSecondary: {
    backgroundColor: '#e2e8f0',
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
  },
  buttonGhost: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextDark: {
    color: '#0f172a',
  },

  emptyBox: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },

  configTabs: {
    paddingVertical: 4,
    paddingRight: 6,
  },
  configTab: {
    minWidth: 132,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 10,
  },
  configTabActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  configTabTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  configTabTitleActive: {
    color: '#1d4ed8',
  },
  configTabMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  configTabMetaActive: {
    color: '#1e40af',
  },

  selectedCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbeafe',
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
    color: '#0f172a',
    marginBottom: 2,
    flexShrink: 1,
  },
  selectedCardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    flexShrink: 1,
  },
  selectedPill: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selectedPillText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '800',
  },

  deviceCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
    marginBottom: 2,
  },
  deviceSubtitle: {
    fontSize: 13,
    color: '#64748b',
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
    color: '#334155',
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 16,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    color: '#0f172a',
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
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  segmentTextActive: {
    color: '#ffffff',
  },

  resultBox: {
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#0f172a',
  },

  toggleChip: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  toggleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338ca',
  },

  jsonBox: {
    borderRadius: 16,
    backgroundColor: '#0f172a',
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
    color: '#e2e8f0',
  },

  mt12: {
    marginTop: 12,
  },
});
