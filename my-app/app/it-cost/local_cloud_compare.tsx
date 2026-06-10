import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { buildLocalCloudComparison } from '../../features/planning/logic/kitPlanner';
import { useProjectStyles } from '../../features/project/styles';
import { AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';
import { formatNumber, toNumberSafe } from '../../shared/utils/number';
import { useData } from '../../store/data/DataContext';

export const title = 'Локально vs облако';

export default function LocalCloudCompareScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  const data = useData();
  const [seatsRaw, setSeatsRaw] = useState(String(data.projectMeta.targetClientSeats || 5));
  const [budgetRaw, setBudgetRaw] = useState(String(data.projectMeta.budget || 500000));
  const seats = Math.max(1, Math.round(toNumberSafe(seatsRaw)));
  const budget = Math.max(0, Math.round(toNumberSafe(budgetRaw)));
  const result = useMemo(() => buildLocalCloudComparison(seats, budget), [budget, seats]);

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Сравнение</Text>
        </View>
        <Text style={styles.heroTitle}>Локально vs облако</Text>
        <Text style={styles.heroText}>Сравнение стартовых и трёхлетних расходов для локального сервера и облачного размещения.</Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Параметры</Text>
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

      <View style={local.compareGrid}>
        <CompareCard title="Локальный сервер" capex={result.local.capexTotal} opex={result.local.monthlyOpex} total3={result.localThreeYear} active={result.recommended === 'local'} />
        <CompareCard title="Облачный вариант" capex={result.cloud.capexTotal} opex={result.cloud.monthlyOpex} total3={result.cloudThreeYear} active={result.recommended === 'cloud'} />
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Вывод</Text>
        <Text style={styles.cardText}>
          {result.recommended === 'local'
            ? `Локальный вариант выгоднее на горизонте 3 лет примерно на ${formatCurrencyRU(result.delta)}. Он дороже на старте, но обычно снижает регулярные платежи.`
            : `Облачный вариант выгоднее на горизонте 3 лет примерно на ${formatCurrencyRU(result.delta)}. Он снижает стартовые вложения, но требует контроля ежемесячных платежей.`}
        </Text>
      </AppCard>
    </AnimatedScreenScroll>
  );
}

function CompareCard({ title, capex, opex, total3, active }: { title: string; capex: number; opex: number; total3: number; active: boolean }) {
  const local = useLocalStyles();

  return (
    <AppCard style={[local.compareCard, active && local.compareCardActive]}>
      <Text style={local.compareTitle}>{title}</Text>
      <Text style={local.compareLine}>CAPEX: {formatCurrencyRU(capex)}</Text>
      <Text style={local.compareLine}>OPEX/мес: {formatCurrencyRU(opex)}</Text>
      <Text style={local.compareTotal}>3 года: {formatCurrencyRU(total3)}</Text>
      {active ? <Text style={local.recommendBadge}>рекомендуется</Text> : null}
    </AppCard>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  cardGap: { gap: spacing.md },
  row2: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  label: { color: theme.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '900', textTransform: 'uppercase', marginBottom: 6 },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surfaceMuted, paddingHorizontal: 14, color: theme.text, fontSize: 16, fontWeight: '800' },
  compareGrid: { gap: spacing.md },
  compareCard: { gap: 8 },
  compareCardActive: { borderColor: theme.primary, backgroundColor: theme.surfaceMuted },
  compareTitle: { color: theme.text, fontSize: 17, lineHeight: 22, fontWeight: '900' },
  compareLine: { color: theme.textSoft, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  compareTotal: { color: theme.text, fontSize: 15, lineHeight: 20, fontWeight: '900', marginTop: 4 },
  recommendBadge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, color: theme.primary, backgroundColor: theme.primarySoft, overflow: 'hidden', fontWeight: '900', fontSize: 12 },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
