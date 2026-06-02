import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { buildProfilePlans, getProfileLabel, pickBestAffordablePlan, planToCapitalData, planToOperatingData } from '../../features/planning/logic/kitPlanner';
import { projectStyles as styles } from '../../features/project/styles';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';
import { formatNumber, toNumberSafe } from '../../shared/utils/number';
import { useData } from '../../store/data/DataContext';

export const title = 'Автоподбор под бюджет';

export default function BudgetAutopickScreen() {
  const data = useData();
  const [seatsRaw, setSeatsRaw] = useState(String(data.projectMeta.targetClientSeats || 5));
  const [budgetRaw, setBudgetRaw] = useState(String(data.projectMeta.budget || 500000));

  const seats = Math.max(1, Math.round(toNumberSafe(seatsRaw)));
  const budget = Math.max(0, Math.round(toNumberSafe(budgetRaw)));
  const plans = useMemo(
    () => buildProfilePlans({ seats, budget, needServer: true, useCloud: false, needPrinting: true, needWifi: true, needBackup: true }),
    [budget, seats]
  );
  const best = useMemo(() => pickBestAffordablePlan(plans), [plans]);

  const applyBest = () => {
    Alert.alert('Применить подобранный комплект?', `${best.title}: CAPEX ${formatCurrencyRU(best.capexTotal)}.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Добавить',
        onPress: () => {
          data.setProjectMeta({ budget, targetClientSeats: seats });
          data.setCapitalData((current) => [...planToCapitalData(best), ...current]);
          data.setOperatingData((current) => [...planToOperatingData(best), ...current]);
          Alert.alert('Комплект добавлен', 'Подобранный вариант добавлен в проект.');
        },
      },
    ]);
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Автоподбор</Text>
        </View>
        <Text style={styles.heroTitle}>Подбор под бюджет</Text>
        <Text style={styles.heroText}>Сравнивает минимальный, сбалансированный и производительный комплект, затем предлагает лучший доступный вариант.</Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Ограничения</Text>
        <View style={local.row2}>
          <View style={local.col}>
            <Text style={local.label}>Рабочих мест</Text>
            <TextInput value={seatsRaw ? formatNumber(seatsRaw) : ''} onChangeText={setSeatsRaw} keyboardType="numeric" style={local.input} />
          </View>
          <View style={local.col}>
            <Text style={local.label}>Бюджет</Text>
            <TextInput value={budgetRaw ? formatNumber(budgetRaw) : ''} onChangeText={setBudgetRaw} keyboardType="numeric" style={local.input} />
          </View>
        </View>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Рекомендуемый вариант</Text>
        <Text style={local.bestTitle}>{best.title}</Text>
        <Text style={styles.cardText}>{best.fitsBudget ? 'Комплект укладывается в бюджет.' : 'Ни один вариант не укладывается в бюджет, показан самый дешёвый ориентир.'}</Text>
        <View style={local.metrics}>
          <Metric label="CAPEX" value={formatCurrencyRU(best.capexTotal)} />
          <Metric label="Остаток/превышение" value={formatCurrencyRU(Math.abs(best.budgetDelta))} tone={best.fitsBudget ? 'good' : 'bad'} />
          <Metric label="OPEX/мес" value={formatCurrencyRU(best.monthlyOpex)} />
        </View>
        <AnimatedPressable style={styles.actionButton} onPress={applyBest} pressedScale={0.97}>
          <Text style={styles.actionButtonText}>Добавить рекомендуемый комплект</Text>
        </AnimatedPressable>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Все варианты</Text>
        {plans.map((plan) => (
          <View key={plan.profile} style={local.planRow}>
            <View style={local.planTextBox}>
              <Text style={local.planTitle}>{getProfileLabel(plan.profile)}</Text>
              <Text style={local.planSub}>{plan.description}</Text>
            </View>
            <View style={local.planAmounts}>
              <Text style={local.planAmount}>{formatCurrencyRU(plan.capexTotal)}</Text>
              <Text style={[local.planStatus, plan.fitsBudget ? local.good : local.bad]}>{plan.fitsBudget ? 'ок' : 'дорого'}</Text>
            </View>
          </View>
        ))}
      </AppCard>
    </AnimatedScreenScroll>
  );
}

function Metric({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'good' | 'bad' }) {
  return (
    <View style={local.metric}>
      <Text style={[local.metricValue, tone === 'good' && local.good, tone === 'bad' && local.bad]}>{value}</Text>
      <Text style={local.metricLabel}>{label}</Text>
    </View>
  );
}

const local = StyleSheet.create({
  cardGap: { gap: spacing.md },
  row2: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  label: { color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '900', textTransform: 'uppercase', marginBottom: 6 },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceMuted, paddingHorizontal: 14, color: colors.text, fontSize: 16, fontWeight: '800' },
  bestTitle: { color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: '900' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { flexGrow: 1, flexBasis: 130, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, padding: 12 },
  metricValue: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '700', marginTop: 2 },
  good: { color: colors.success },
  bad: { color: colors.danger },
  planRow: { flexDirection: 'row', gap: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderSoft, padding: 12, backgroundColor: colors.surfaceMuted },
  planTextBox: { flex: 1, minWidth: 0 },
  planTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '900' },
  planSub: { color: colors.textSoft, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 2 },
  planAmounts: { alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  planAmount: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900' },
  planStatus: { fontSize: 11, lineHeight: 14, fontWeight: '900', textTransform: 'uppercase' },
});
