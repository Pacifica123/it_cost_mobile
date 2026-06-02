import { StyleSheet, Text, View } from 'react-native';

import { buildDiagnostics } from '../../features/diagnostics/logic/buildDiagnostics';
import { projectStyles as styles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import { AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';

export const title = 'Диагностика приложения';

const toneColor = {
  ok: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.primary,
};

export default function DiagnosticsScreen() {
  const data = useData();
  const report = buildDiagnostics(data);

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Сервис</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Диагностика</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Быстрая проверка сохранения, структуры данных, размера проекта, истории и готовности расчёта.
        </Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Общее состояние</Text>
        <View style={local.grid}>
          <View style={local.pill}>
            <Text style={local.value} maxFontSizeMultiplier={1.1}>v{report.schemaVersion}</Text>
            <Text style={local.label} maxFontSizeMultiplier={1.1}>структура</Text>
          </View>
          <View style={local.pill}>
            <Text style={local.value} maxFontSizeMultiplier={1.1}>{report.estimatedSizeLabel}</Text>
            <Text style={local.label} maxFontSizeMultiplier={1.1}>размер</Text>
          </View>
          <View style={local.pill}>
            <Text style={local.value} maxFontSizeMultiplier={1.1}>{data.lastSavedAt ? 'да' : 'ожидание'}</Text>
            <Text style={local.label} maxFontSizeMultiplier={1.1}>автосохранение</Text>
          </View>
        </View>
      </AppCard>

      {report.items.map((item, index) => (
        <AppCard key={item.id} delay={index * 14} style={local.itemCard}>
          <View style={[local.statusDot, { backgroundColor: toneColor[item.tone] }]} />
          <View style={local.itemTextWrap}>
            <Text style={local.itemTitle} maxFontSizeMultiplier={1.12}>{item.title}</Text>
            <Text style={local.itemValue} maxFontSizeMultiplier={1.12}>{item.value}</Text>
          </View>
        </AppCard>
      ))}
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    minWidth: 110,
    flexGrow: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  itemCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
  },
  itemTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  itemValue: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 2,
  },
});
