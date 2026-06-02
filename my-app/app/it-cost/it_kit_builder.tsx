import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { buildKitPlan, planToCapitalData, planToOperatingData, type KitProfile } from '../../features/planning/logic/kitPlanner';
import { projectStyles as styles } from '../../features/project/styles';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';
import { formatNumber, toNumberSafe } from '../../shared/utils/number';
import { useData } from '../../store/data/DataContext';

export const title = 'Конструктор ИТ-комплекта';

const profiles: Array<{ id: KitProfile; label: string }> = [
  { id: 'minimal', label: 'Минимальный' },
  { id: 'balanced', label: 'Сбалансированный' },
  { id: 'performance', label: 'Производительный' },
];

function Toggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} pressedScale={0.96} style={[local.chip, active && local.chipActive]}>
      <Text style={[local.chipText, active && local.chipTextActive]} maxFontSizeMultiplier={1.1}>{label}</Text>
    </AnimatedPressable>
  );
}

export default function ItKitBuilderScreen() {
  const data = useData();
  const [seatsRaw, setSeatsRaw] = useState(String(data.projectMeta.targetClientSeats || 5));
  const [budgetRaw, setBudgetRaw] = useState(String(data.projectMeta.budget || 500000));
  const [profile, setProfile] = useState<KitProfile>('balanced');
  const [needServer, setNeedServer] = useState(true);
  const [useCloud, setUseCloud] = useState(false);
  const [needPrinting, setNeedPrinting] = useState(true);
  const [needWifi, setNeedWifi] = useState(true);
  const [needBackup, setNeedBackup] = useState(true);

  const seats = Math.max(1, Math.round(toNumberSafe(seatsRaw)));
  const budget = Math.max(0, Math.round(toNumberSafe(budgetRaw)));
  const plan = useMemo(
    () => buildKitPlan({ seats, budget, profile, needServer, useCloud, needPrinting, needWifi, needBackup }),
    [budget, needBackup, needPrinting, needServer, needWifi, profile, seats, useCloud]
  );

  const applyPlan = () => {
    Alert.alert('Добавить комплект?', `Будет добавлено CAPEX: ${plan.capitalItems.length}, OPEX: ${plan.operatingItems.length}.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Добавить',
        onPress: () => {
          data.setProjectMeta({ budget, targetClientSeats: seats });
          data.setCapitalData((current) => [...planToCapitalData(plan), ...current]);
          data.setOperatingData((current) => [...planToOperatingData(plan), ...current]);
          Alert.alert('Комплект добавлен', 'Позиции добавлены в текущий проект.');
        },
      },
    ]);
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Подбор</Text>
        </View>
        <Text style={styles.heroTitle}>Конструктор ИТ-комплекта</Text>
        <Text style={styles.heroText}>Укажите рабочие места и нужные компоненты, а приложение соберёт примерный комплект оборудования, ПО и OPEX.</Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Параметры</Text>
        <View style={local.row2}>
          <View style={local.col}>
            <Text style={local.label}>Рабочих мест</Text>
            <TextInput value={seatsRaw ? formatNumber(seatsRaw) : ''} onChangeText={setSeatsRaw} keyboardType="numeric" style={local.input} placeholder="5" />
          </View>
          <View style={local.col}>
            <Text style={local.label}>Бюджет CAPEX</Text>
            <TextInput value={budgetRaw ? formatNumber(budgetRaw) : ''} onChangeText={setBudgetRaw} keyboardType="numeric" style={local.input} placeholder="500000" />
          </View>
        </View>

        <Text style={local.label}>Тип комплекта</Text>
        <View style={local.chipsWrap}>
          {profiles.map((item) => <Toggle key={item.id} label={item.label} active={profile === item.id} onPress={() => setProfile(item.id)} />)}
        </View>

        <Text style={local.label}>Компоненты</Text>
        <View style={local.chipsWrap}>
          <Toggle label="Локальный сервер" active={needServer && !useCloud} onPress={() => { setNeedServer(true); setUseCloud(false); }} />
          <Toggle label="Облако" active={useCloud} onPress={() => { setUseCloud(true); setNeedServer(false); }} />
          <Toggle label="Печать" active={needPrinting} onPress={() => setNeedPrinting((value) => !value)} />
          <Toggle label="Wi‑Fi" active={needWifi} onPress={() => setNeedWifi((value) => !value)} />
          <Toggle label="Резервирование" active={needBackup} onPress={() => setNeedBackup((value) => !value)} />
        </View>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>{plan.title}</Text>
        <Text style={styles.cardText}>{plan.description}</Text>
        <View style={local.metrics}>
          <Metric label="CAPEX" value={formatCurrencyRU(plan.capexTotal)} />
          <Metric label="OPEX/мес" value={formatCurrencyRU(plan.monthlyOpex)} />
          <Metric label="1 год" value={formatCurrencyRU(plan.totalFirstYear)} />
          <Metric label="Бюджет" value={plan.fitsBudget ? 'ок' : 'превышен'} tone={plan.fitsBudget ? 'good' : 'bad'} />
        </View>

        <Text style={local.subTitle}>Что будет добавлено</Text>
        {[...plan.capitalItems.map((item) => `${item.name} × ${item.quantity}`), ...plan.operatingItems.map((item) => `${item.name} / мес`)].map((line) => (
          <Text key={line} style={local.listText}>• {line}</Text>
        ))}

        {plan.risks.length > 0 ? (
          <View style={local.warningBox}>
            {plan.risks.map((risk) => <Text key={risk} style={local.warningText}>⚠ {risk}</Text>)}
          </View>
        ) : null}

        <AnimatedPressable style={styles.actionButton} onPress={applyPlan} pressedScale={0.97}>
          <Text style={styles.actionButtonText}>Добавить комплект в проект</Text>
        </AnimatedPressable>
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
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceMuted, paddingVertical: 10, paddingHorizontal: 12 },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { color: colors.textSoft, fontWeight: '900' },
  chipTextActive: { color: colors.primary },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { flexGrow: 1, flexBasis: 130, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, padding: 12 },
  metricValue: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '700', marginTop: 2 },
  good: { color: colors.success },
  bad: { color: colors.danger },
  subTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '900' },
  listText: { color: colors.textSoft, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  warningBox: { borderRadius: radius.md, backgroundColor: colors.warningSoft, padding: 12, gap: 4 },
  warningText: { color: colors.warning, fontSize: 12, lineHeight: 17, fontWeight: '800' },
});
