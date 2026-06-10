import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type ReportStyleTheme = ThemePalette | typeof colors;

const createReportStyles = (theme: ReportStyleTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: spacing.lg, paddingBottom: 28 },
  hero: {
    backgroundColor: theme.hero,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTitle: { color: theme.textOnDark, fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: theme.textOnDarkSoft, marginTop: 4, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 10 },
  totalBox: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: { color: theme.text, fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
  totalValue: { color: theme.text, fontSize: 16, fontWeight: '900' },
  toggle: {
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.75 },
  toggleText: { color: theme.text, fontSize: 14, fontWeight: '800' },
  toggleArrow: { color: theme.textMuted, fontWeight: '900' },
  sectionLabel: { marginTop: 2, marginBottom: 8, color: theme.textSoft, fontSize: 13, fontWeight: '800' },
  table: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surface,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  th: { paddingVertical: 10, paddingHorizontal: 12, fontSize: 12, fontWeight: '900', color: theme.textSoft },
  thRight: { textAlign: 'right' },
  group: { paddingBottom: 8 },
  groupTitle: {
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 12,
    color: theme.text,
    fontSize: 13,
    fontWeight: '900',
  },
  tr: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  trPressed: { backgroundColor: theme.surfaceMuted },
  td: { paddingVertical: 12, paddingHorizontal: 12, fontSize: 14, fontWeight: '700', color: theme.text },
  tdRight: { textAlign: 'right' },
  subtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.hero,
  },
  subtotalText: { color: theme.textOnDarkSoft, fontSize: 12, fontWeight: '900', letterSpacing: 0.6 },
  subtotalValue: { color: theme.textOnDark, fontSize: 14, fontWeight: '900' },
  mobileList: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surface,
  },
  mRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
    backgroundColor: theme.surface,
  },
  mName: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 8 },
  mBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mMeta: { fontSize: 13, fontWeight: '700', color: theme.textMuted, flex: 1 },
  mMetaVal: { color: theme.text, fontWeight: '900' },
  mCost: { fontSize: 14, fontWeight: '900', color: theme.text },
  empty: { textAlign: 'center', color: theme.textMuted, fontStyle: 'italic', paddingVertical: 10 },
  assumptionText: {
    color: theme.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  insightLead: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  insightList: {
    gap: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  insightIcon: {
    marginTop: 1,
  },
  insightTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  insightTitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  insightDescription: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    fontWeight: '600',
  },
  markdownBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    padding: 12,
  },
  markdownText: {
    color: theme.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  exportActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  exportButton: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: theme.hero,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  exportButtonText: {
    color: theme.textOnDark,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
});

export const styles = createReportStyles(colors);

export function useReportStyles() {
  const palette = useThemePalette();

  return useMemo(() => createReportStyles(palette), [palette]);
}
