import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { projectStyles as styles } from '../../features/project/styles';
import { validateProjectData, type ValidationIssue } from '../../features/validation/logic/validateProjectData';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';

export const title = 'Проверка данных';

const severityMeta = {
  error: { label: 'Ошибка', icon: 'close-circle' as const, color: colors.danger, bg: colors.dangerSoft },
  warning: { label: 'Предупреждение', icon: 'warning' as const, color: colors.warning, bg: colors.warningSoft },
  info: { label: 'Инфо', icon: 'information-circle' as const, color: colors.primary, bg: colors.primarySoft },
};

function IssueCard({ issue }: { issue: ValidationIssue }) {
  const meta = severityMeta[issue.severity];
  return (
    <View style={local.issueCard}>
      <View style={[local.issueIcon, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={19} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={local.issueTitleRow}>
          <Text style={local.issueArea} maxFontSizeMultiplier={1.1}>{issue.area}</Text>
          <Text style={[local.issueSeverity, { color: meta.color }]} maxFontSizeMultiplier={1.1}>{meta.label}</Text>
        </View>
        <Text style={local.issueTitle} maxFontSizeMultiplier={1.12}>{issue.title}</Text>
        <Text style={local.issueDescription} maxFontSizeMultiplier={1.12}>{issue.description}</Text>
      </View>
    </View>
  );
}

export default function ValidationScreen() {
  const data = useData();
  const report = useMemo(() => validateProjectData(data), [data]);

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Контроль качества</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Проверка данных</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Экран показывает, можно ли безопасно запускать расчёты и формировать итоговый отчёт.
        </Text>
      </View>

      <AppCard delay={40} style={local.summaryCard}>
        <Text style={local.score} maxFontSizeMultiplier={1.05}>{report.score}/100</Text>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>{report.canCalculate ? 'Расчёт разрешён' : 'Нужно исправить ошибки'}</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{report.summary}</Text>
        <View style={local.statsRow}>
          <Text style={local.statText} maxFontSizeMultiplier={1.1}>Ошибки: {report.errors.length}</Text>
          <Text style={local.statText} maxFontSizeMultiplier={1.1}>Предупреждения: {report.warnings.length}</Text>
          <Text style={local.statText} maxFontSizeMultiplier={1.1}>Инфо: {report.infos.length}</Text>
        </View>
        <View style={styles.actionRow}>
          <AnimatedPressable style={styles.actionButton} pressedScale={0.97} onPress={() => router.push('/it-cost/quick_start' as Href)}>
            <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Открыть быстрый расчёт</Text>
          </AnimatedPressable>
        </View>
      </AppCard>

      <AppCard delay={80} style={local.listCard}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Найденные замечания</Text>
        {report.issues.length ? (
          report.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        ) : (
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Критичных замечаний нет. Данные выглядят готовыми для расчёта и отчёта.</Text>
        )}
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  summaryCard: {
    gap: spacing.sm,
  },
  score: {
    color: colors.primary,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statText: {
    color: colors.textSoft,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  listCard: {
    gap: spacing.sm,
  },
  issueCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  issueIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'baseline',
  },
  issueArea: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  issueSeverity: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  issueTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 2,
  },
  issueDescription: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    marginTop: 2,
  },
});
