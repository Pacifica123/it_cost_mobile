import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { buildAmortizationRows, getAmortizationSummary } from '../../features/planning/logic/amortization';
import { projectStyles as styles } from '../../features/project/styles';
import { AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';
import { useData } from '../../store/data/DataContext';

export const title = 'Амортизация и срок службы';

export default function AmortizationScreen() {
  const data = useData();
  const rows = useMemo(() => buildAmortizationRows(data.capitalData, data.categories), [data.capitalData, data.categories]);
  const summary = useMemo(() => getAmortizationSummary(rows), [rows]);

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Финансы</Text>
        </View>
        <Text style={styles.heroTitle}>Амортизация</Text>
        <Text style={styles.heroText}>Расчёт условной ежемесячной амортизации по CAPEX-позициям с типовыми сроками службы.</Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Итоги</Text>
        <View style={local.metrics}>
          <Metric label="CAPEX" value={formatCurrencyRU(summary.total)} />
          <Metric label="Амортизация/мес" value={formatCurrencyRU(summary.monthly)} />
          <Metric label="ТО/мес" value={formatCurrencyRU(summary.hardwareMonthly)} />
          <Metric label="ПО/мес" value={formatCurrencyRU(summary.softwareMonthly)} />
        </View>
        <Text style={styles.cardText}>
          Сроки применяются автоматически: ПО — 12 месяцев, клиентское оборудование — 36 месяцев, серверы и сеть — 48 месяцев.
        </Text>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Позиции</Text>
        {rows.length === 0 ? (
          <Text style={styles.cardText}>CAPEX-позиции не заполнены.</Text>
        ) : rows.map((row) => (
          <View key={row.id} style={local.row}>
            <View style={local.rowText}>
              <Text style={local.rowTitle}>{row.name}</Text>
              <Text style={local.rowSub}>{row.kind} · {row.quantity} шт. · {row.months} мес.</Text>
            </View>
            <View style={local.amountBox}>
              <Text style={local.amount}>{formatCurrencyRU(row.monthly)}</Text>
              <Text style={local.amountSub}>в месяц</Text>
            </View>
          </View>
        ))}
      </AppCard>
    </AnimatedScreenScroll>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={local.metric}>
      <Text style={local.metricValue}>{value}</Text>
      <Text style={local.metricLabel}>{label}</Text>
    </View>
  );
}

const local = StyleSheet.create({
  cardGap: { gap: spacing.md },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { flexGrow: 1, flexBasis: 130, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, padding: 12 },
  metricValue: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '700', marginTop: 2 },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surfaceMuted, padding: 12 },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 14, lineHeight: 19, fontWeight: '900' },
  rowSub: { color: colors.textMuted, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 2 },
  amountBox: { alignItems: 'flex-end' },
  amount: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900' },
  amountSub: { color: colors.textMuted, fontSize: 11, lineHeight: 14, fontWeight: '700' },
});
