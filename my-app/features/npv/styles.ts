import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';


type NpvStyleTheme = ThemePalette | typeof colors;

const createNpvStyles = (theme: NpvStyleTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: 12,
    paddingBottom: 20,
  },

  heroCard: {
    backgroundColor: theme.hero,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  heroTitle: {
    color: theme.textOnDark,
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: theme.textOnDarkSoft,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },

  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },

  label: {
    fontSize: 13,
    color: theme.textSoft,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceMuted,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.text,
    marginBottom: 8,
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: -2,
    marginBottom: 8,
  },
  error: {
    color: theme.danger,
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
    backgroundColor: theme.success,
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonPrimaryText: {
    color: theme.textOnDark,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: theme.surfaceMuted,
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonSecondaryText: {
    color: theme.text,
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
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  goodCard: {
    backgroundColor: theme.successSoft,
    borderColor: theme.success,
  },
  badCard: {
    backgroundColor: theme.dangerSoft,
    borderColor: theme.danger,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.textMuted,
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
    color: theme.text,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },

  table: {
    borderWidth: 1,
    borderColor: theme.borderSoft,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  headerRow: {
    backgroundColor: theme.success,
  },
  evenRow: {
    backgroundColor: theme.surface,
  },
  oddRow: {
    backgroundColor: theme.surfaceMuted,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontSize: 11,
    color: theme.text,
  },
  headerCell: {
    color: theme.textOnDark,
    fontWeight: '700',
  },

  positive: {
    color: theme.success,
  },
  negative: {
    color: theme.danger,
  },
});

export const styles = createNpvStyles(colors);

export function useNpvStyles() {
  const palette = useThemePalette();

  return useMemo(() => createNpvStyles(palette), [palette]);
}
