import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { buildDashboardSummary, type DashboardInsight, type DashboardMetric, type DashboardTone, type DashboardTopItem } from '../../features/dashboard/logic/buildDashboard';
import { useProjectStyles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';

export const title = 'Сводка проекта';

const toneMeta: Record<DashboardTone, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  ok: { color: colors.success, bg: colors.successSoft, icon: 'checkmark-circle' },
  warning: { color: colors.warning, bg: colors.warningSoft, icon: 'warning' },
  danger: { color: colors.danger, bg: colors.dangerSoft, icon: 'close-circle' },
  info: { color: colors.primary, bg: colors.primarySoft, icon: 'information-circle' },
};

function formatMetricValue(metric: DashboardMetric) {
  if (typeof metric.value === 'number') {
    const numeric = metric.suffix ? `${metric.value}${metric.suffix}` : formatCurrencyRU(metric.value);
    return numeric;
  }

  return `${metric.value}${metric.suffix ?? ''}`;
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const local = useLocalStyles();

  const meta = toneMeta[metric.tone];

  return (
    <View style={local.metricCard}>
      <View style={[local.metricIcon, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={18} color={meta.color} />
      </View>
      <Text style={local.metricValue} maxFontSizeMultiplier={1.04}>{formatMetricValue(metric)}</Text>
      <Text style={local.metricTitle} maxFontSizeMultiplier={1.1}>{metric.title}</Text>
      <Text style={local.metricHint} numberOfLines={2} maxFontSizeMultiplier={1.1}>{metric.hint}</Text>
    </View>
  );
}

function InsightCard({ insight }: { insight: DashboardInsight }) {
  const local = useLocalStyles();

  const meta = toneMeta[insight.tone];

  return (
    <View style={local.insightCard}>
      <View style={[local.insightIcon, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={local.insightTitle} maxFontSizeMultiplier={1.1}>{insight.title}</Text>
        <Text style={local.insightText} maxFontSizeMultiplier={1.12}>{insight.description}</Text>
        {insight.route && insight.actionLabel ? (
          <AnimatedPressable
            onPress={() => router.push(insight.route as Href)}
            pressedScale={0.97}
            style={local.inlineButton}
          >
            <Text style={local.inlineButtonText} maxFontSizeMultiplier={1.1}>{insight.actionLabel}</Text>
          </AnimatedPressable>
        ) : null}
      </View>
    </View>
  );
}

function TopItemRow({ item, index }: { item: DashboardTopItem; index: number }) {
  const local = useLocalStyles();

  return (
    <View style={local.topItemRow}>
      <View style={local.topItemNumber}>
        <Text style={local.topItemNumberText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={local.topItemTitle} numberOfLines={2} maxFontSizeMultiplier={1.08}>{item.name}</Text>
        <Text style={local.topItemMeta} numberOfLines={1} maxFontSizeMultiplier={1.08}>{item.category} · {item.sharePercent}% CAPEX</Text>
      </View>
      <Text style={local.topItemCost} numberOfLines={1} maxFontSizeMultiplier={1.04}>{formatCurrencyRU(item.cost)}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  const data = useData();
  const dashboard = useMemo(() => buildDashboardSummary(data), [data]);
  const budgetProgress = Math.min(100, Math.max(0, dashboard.budgetUsedPercent));

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Общая картина</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Сводка проекта</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Быстрый контроль бюджета, готовности, качества данных и самых заметных затрат.
        </Text>
      </View>

      <AppCard style={local.statusCard} delay={40}>
        <View style={local.statusHeader}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.cardEyebrow} maxFontSizeMultiplier={1.1}>Текущий статус</Text>
            <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>{dashboard.statusLabel}</Text>
            <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>
              Готовность {dashboard.readinessPercent}%, качество данных {dashboard.dataQualityScore}/100.
            </Text>
          </View>
          <View style={local.statusScore}>
            <Text style={local.statusScoreValue} maxFontSizeMultiplier={1.04}>{dashboard.readinessPercent}%</Text>
            <Text style={local.statusScoreLabel} maxFontSizeMultiplier={1.1}>готово</Text>
          </View>
        </View>

        <View style={local.budgetBox}>
          <View style={local.budgetHeader}>
            <Text style={local.budgetTitle} maxFontSizeMultiplier={1.1}>Бюджет CAPEX</Text>
            <Text style={local.budgetValue} maxFontSizeMultiplier={1.08}>
              {dashboard.budget > 0 ? `${dashboard.budgetUsedPercent}%` : 'не задан'}
            </Text>
          </View>
          <View style={local.progressTrack}>
            <View style={[local.progressFill, { width: `${budgetProgress}%` }]} />
          </View>
          <Text style={local.budgetHint} maxFontSizeMultiplier={1.1}>
            {dashboard.budget > 0
              ? dashboard.budgetRemainder >= 0
                ? `Остаток бюджета: ${formatCurrencyRU(dashboard.budgetRemainder)}.`
                : `Превышение бюджета: ${formatCurrencyRU(Math.abs(dashboard.budgetRemainder))}.`
              : 'Задайте бюджет в паспорте проекта, чтобы видеть запас.'}
          </Text>
        </View>
      </AppCard>

      <AppCard style={local.metricGridCard} delay={70}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Ключевые показатели</Text>
        <View style={local.metricGrid}>
          {dashboard.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
        </View>
      </AppCard>

      <AppCard style={local.listCard} delay={100}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Рекомендации</Text>
        {dashboard.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
      </AppCard>

      <AppCard style={local.listCard} delay={130}>
        <View style={local.cardTitleRow}>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Крупные CAPEX-позиции</Text>
          <AnimatedPressable style={local.smallButton} pressedScale={0.96} onPress={() => router.push('/it-cost/capital_expenditures' as Href)}>
            <Text style={local.smallButtonText} maxFontSizeMultiplier={1.1}>Открыть</Text>
          </AnimatedPressable>
        </View>
        {dashboard.topCapitalItems.length ? (
          dashboard.topCapitalItems.map((item, index) => <TopItemRow key={item.id} item={item} index={index} />)
        ) : (
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Капитальные позиции пока не добавлены.</Text>
        )}
      </AppCard>

      <AppCard style={local.listCard} delay={160}>
        <View style={local.cardTitleRow}>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Последние действия</Text>
          <AnimatedPressable style={local.smallButton} pressedScale={0.96} onPress={() => router.push('/it-cost/history' as Href)}>
            <Text style={local.smallButtonText} maxFontSizeMultiplier={1.1}>История</Text>
          </AnimatedPressable>
        </View>
        {dashboard.recentEvents.length ? (
          dashboard.recentEvents.map((event) => (
            <View key={event.id} style={local.eventRow}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={local.eventTitle} numberOfLines={1} maxFontSizeMultiplier={1.1}>{event.title}</Text>
                {event.description ? <Text style={local.eventText} numberOfLines={2} maxFontSizeMultiplier={1.1}>{event.description}</Text> : null}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>История пока пустая.</Text>
        )}
      </AppCard>

      <View style={styles.actionRow}>
        <AnimatedPressable style={styles.actionButton} pressedScale={0.97} onPress={() => router.push('/it-cost/export' as Href)}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Открыть отчёт</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.actionButton, styles.secondaryButton]} pressedScale={0.97} onPress={() => router.push('/it-cost/method_comparison' as Href)}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]} maxFontSizeMultiplier={1.1}>Сравнить методы</Text>
        </AnimatedPressable>
      </View>
    </AnimatedScreenScroll>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  statusCard: {
    gap: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  statusScore: {
    minWidth: 82,
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
  },
  statusScoreValue: {
    color: theme.primary,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
  },
  statusScoreLabel: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  budgetBox: {
    gap: 8,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'baseline',
  },
  budgetTitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  budgetValue: {
    color: theme.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: theme.borderSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
  },
  budgetHint: {
    color: theme.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  metricGridCard: {
    gap: spacing.md,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 138,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
    gap: 5,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: {
    color: theme.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  metricTitle: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  metricHint: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  listCard: {
    gap: spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
  },
  insightIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  insightTitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  insightText: {
    color: theme.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 3,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    marginTop: 9,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  inlineButtonText: {
    color: theme.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  smallButton: {
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  smallButtonText: {
    color: theme.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  topItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
  },
  topItemNumber: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topItemNumberText: {
    color: theme.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  topItemTitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  topItemMeta: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  topItemCost: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    maxWidth: 120,
    textAlign: 'right',
  },
  eventRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderRadius: radius.md,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
  },
  eventTitle: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  eventText: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
