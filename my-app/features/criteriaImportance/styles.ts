import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type ImportanceStyleTheme = ThemePalette | typeof colors;

const createImportanceStyles = (theme: ImportanceStyleTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 120, gap: 14 },
  hero: {
    backgroundColor: theme.hero,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  badgeText: { color: theme.primary, fontSize: 12, fontWeight: '900' },
  title: { color: theme.textOnDark, fontSize: 25, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: theme.textOnDarkSoft, fontSize: 14, lineHeight: 20 },
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  sectionText: { color: theme.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  button: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonText: { color: theme.textOnDark, fontSize: 15, fontWeight: '900' },
  rankRow: {
    borderRadius: 16,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: 12,
    marginTop: 10,
  },
  rankTitle: { color: theme.text, fontSize: 15, fontWeight: '900' },
  rankMeta: { color: theme.textMuted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  winner: { borderColor: theme.primary, backgroundColor: theme.primarySoft },
  explanation: { color: theme.textSoft, fontSize: 14, lineHeight: 21 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, backgroundColor: theme.surfaceMuted, paddingHorizontal: 10, paddingVertical: 7 },
  chipText: { color: theme.textSoft, fontSize: 12, fontWeight: '800' },
  tableText: { color: theme.textSoft, fontSize: 13, lineHeight: 20 },
  muted: { color: theme.textMuted, fontSize: 13, lineHeight: 18 },
  jsonBox: { borderRadius: 14, backgroundColor: theme.hero, padding: 12, marginTop: 10 },
  jsonText: { color: theme.textOnDarkSoft, fontSize: 11, lineHeight: 16 },
});

export const importanceStyles = createImportanceStyles(colors);

export function useImportanceStyles() {
  const palette = useThemePalette();

  return useMemo(() => createImportanceStyles(palette), [palette]);
}
