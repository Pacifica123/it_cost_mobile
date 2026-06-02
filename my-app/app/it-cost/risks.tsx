import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { buildRisksSummary, type RiskLevel } from '../../features/risks/logic/buildRisks';
import { projectStyles as styles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors } from '../../shared/theme';

export const title = 'Риски и рекомендации';

const levelMeta: Record<RiskLevel, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  critical: { label: 'критично', color: colors.danger, icon: 'alert-circle' },
  high: { label: 'высокий', color: '#EA580C', icon: 'warning' },
  medium: { label: 'средний', color: colors.warning, icon: 'information-circle' },
  low: { label: 'низкий', color: colors.primary, icon: 'checkmark-circle' },
};

function RiskCard({ item }: { item: ReturnType<typeof buildRisksSummary>['risks'][number] }) {
  const meta = levelMeta[item.level];
  return (
    <AppCard style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Ionicons name={meta.icon} size={22} color={meta.color} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={1.1}>{item.title}</Text>
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{item.description}</Text>
          <Text style={[styles.cardText, { marginTop: 8, fontWeight: '900' }]} maxFontSizeMultiplier={1.12}>
            Рекомендация: {item.recommendation}
          </Text>
        </View>
        <Text style={{ color: meta.color, fontSize: 12, fontWeight: '900' }} maxFontSizeMultiplier={1.1}>{meta.label}</Text>
      </View>
      {item.route ? (
        <AnimatedPressable style={[styles.actionButton, styles.secondaryButton]} onPress={() => router.push(item.route as Href)} pressedScale={0.97}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]} maxFontSizeMultiplier={1.1}>Открыть раздел</Text>
        </AnimatedPressable>
      ) : null}
    </AppCard>
  );
}

export default function RisksScreen() {
  const data = useData();
  const summary = buildRisksSummary(data);

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Экспертная проверка</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Риски и рекомендации</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Автоматическая оценка слабых мест расчёта: бюджет, дубли, OPEX, безопасность, резервирование и полнота данных.
        </Text>
      </View>

      <AppCard style={{ gap: 12 }}>
        <Text style={styles.cardEyebrow} maxFontSizeMultiplier={1.1}>Индекс устойчивости</Text>
        <Text style={styles.readinessTitle} maxFontSizeMultiplier={1.05}>{summary.score}/100</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Общий статус: {summary.label}. Чем выше значение, тем меньше замечаний найдено в расчёте.</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${summary.score}%`, backgroundColor: summary.score >= 75 ? colors.success : summary.score >= 50 ? colors.warning : colors.danger }]} />
        </View>
      </AppCard>

      {summary.risks.length === 0 ? (
        <AppCard>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Замечаний не найдено</Text>
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Расчёт выглядит устойчиво. Можно переходить к отчёту или сравнению методов.</Text>
        </AppCard>
      ) : summary.risks.map((risk) => <RiskCard key={risk.id} item={risk} />)}
    </AnimatedScreenScroll>
  );
}
