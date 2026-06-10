import { useMemo } from 'react';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { compareOptimizationMethods, type MethodComparisonRow } from '../../features/methodComparison/logic/compareMethods';
import { useProjectStyles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';

export const title = 'Сравнение методов';

const methodIcon: Record<MethodComparisonRow['id'], ComponentProps<typeof Ionicons>['name']> = {
  ga: 'git-network-outline',
  ahp: 'git-compare-outline',
  hybrid: 'shuffle-outline',
  pareto: 'analytics-outline',
};

function MethodCard({ row, index }: { row: MethodComparisonRow; index: number }) {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  return (
    <AppCard delay={index * 45} style={local.methodCard}>
      <View style={local.methodHeader}>
        <View style={local.methodIcon}>
          <Ionicons name={methodIcon[row.id]} size={21} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={local.methodTitle} maxFontSizeMultiplier={1.12}>{row.method}</Text>
          <Text style={local.methodScore} maxFontSizeMultiplier={1.1}>{row.scoreLabel}</Text>
        </View>
      </View>
      <Text style={local.winner} maxFontSizeMultiplier={1.12}>{row.winner}</Text>
      <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{row.description}</Text>
    </AppCard>
  );
}

export default function MethodComparisonScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  const data = useData();
  const report = useMemo(() => compareOptimizationMethods(data), [data]);

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>GA · AHP · Pareto</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Сравнение методов</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Этот экран объясняет, почему разные методы оптимизации могут рекомендовать разные конфигурации.
        </Text>
      </View>

      <AppCard delay={40} style={local.summaryCard}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Итог сравнения</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{report.conclusion}</Text>
        <View style={local.factRow}>
          <Text style={local.fact} maxFontSizeMultiplier={1.1}>Кандидатов: {report.candidateCount}</Text>
          <Text style={local.fact} maxFontSizeMultiplier={1.1}>Бюджет: {formatCurrencyRU(report.budgetUsed)}</Text>
          <Text style={local.fact} maxFontSizeMultiplier={1.1}>Pareto: {report.paretoCount}</Text>
        </View>
      </AppCard>

      {report.status === 'ok' ? (
        report.rows.map((row, index) => <MethodCard key={row.id} row={row} index={index + 2} />)
      ) : (
        <AppCard delay={90} style={local.summaryCard}>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Недостаточно данных</Text>
          {report.notes.map((note) => (
            <Text key={note} style={local.note} maxFontSizeMultiplier={1.12}>• {note}</Text>
          ))}
          <View style={styles.actionRow}>
            <AnimatedPressable style={styles.actionButton} pressedScale={0.97} onPress={() => router.push('/it-cost/capital_expenditures' as Href)}>
              <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Добавить CAPEX</Text>
            </AnimatedPressable>
          </View>
        </AppCard>
      )}

      <AppCard delay={260} style={local.summaryCard}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Как объяснить результат</Text>
        {report.notes.map((note) => (
          <Text key={note} style={local.note} maxFontSizeMultiplier={1.12}>• {note}</Text>
        ))}
        <Text style={local.note} maxFontSizeMultiplier={1.12}>
          • Если методы расходятся, это не ошибка: Pareto не выбирает единственного победителя, AHP зависит от экспертных весов, а GA зависит от ограничений и функции приспособленности.
        </Text>
      </AppCard>
    </AnimatedScreenScroll>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  summaryCard: {
    gap: spacing.sm,
  },
  factRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  fact: {
    color: theme.text,
    backgroundColor: theme.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  methodCard: {
    gap: spacing.sm,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primarySoft,
  },
  methodTitle: {
    color: theme.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  methodScore: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    marginTop: 1,
  },
  winner: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    backgroundColor: theme.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  note: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
