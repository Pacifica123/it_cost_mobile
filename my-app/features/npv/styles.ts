import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  content: {
    padding: 12,
    paddingBottom: 20,
  },

  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  label: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 8,
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: -2,
    marginBottom: 8,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonSecondaryText: {
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  goodCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  badCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryValueSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },

  table: {
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    backgroundColor: '#16a34a',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f8fafc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontSize: 11,
    color: '#0f172a',
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: '700',
  },

  positive: {
    color: '#15803d',
  },
  negative: {
    color: '#dc2626',
  },
});
