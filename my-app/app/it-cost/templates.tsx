import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { projectTemplates, type ProjectTemplate } from '../../features/project/logic/templates';
import { projectStyles as styles } from '../../features/project/styles';
import { buildReport } from '../../features/report/logic/buildReport';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';

export const title = 'Шаблоны проектов';

function TemplateCard({ template, onApply }: { template: ProjectTemplate; onApply: () => void }) {
  const report = buildReport(template.state);

  return (
    <AppCard style={local.templateCard}>
      <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>{template.title}</Text>
      <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{template.subtitle}</Text>
      <View style={local.statsRow}>
        <View style={local.statPill}>
          <Text style={local.statValue} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(template.state.projectMeta.budget)}</Text>
          <Text style={local.statLabel} maxFontSizeMultiplier={1.1}>бюджет</Text>
        </View>
        <View style={local.statPill}>
          <Text style={local.statValue} maxFontSizeMultiplier={1.1}>{template.state.projectMeta.targetClientSeats}</Text>
          <Text style={local.statLabel} maxFontSizeMultiplier={1.1}>мест</Text>
        </View>
        <View style={local.statPill}>
          <Text style={local.statValue} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(report.grandTotalAnnual)}</Text>
          <Text style={local.statLabel} maxFontSizeMultiplier={1.1}>итог за год</Text>
        </View>
      </View>
      <AnimatedPressable style={styles.actionButton} pressedScale={0.97} onPress={onApply}>
        <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Применить шаблон</Text>
      </AnimatedPressable>
    </AppCard>
  );
}

export default function TemplatesScreen() {
  const data = useData();

  const applyTemplate = (template: ProjectTemplate) => {
    Alert.alert(
      'Применить шаблон?',
      'Текущий расчёт будет заменён данными выбранного шаблона.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Применить',
          onPress: () => {
            data.applyProjectTemplate(template.state);
            router.replace('/it-cost/project' as Href);
          },
        },
      ]
    );
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Готовые сценарии</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Шаблоны проектов</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Быстрый старт для типовых расчётов. Шаблон заменяет текущие данные и сразу сохраняется локально.
        </Text>
      </View>

      {projectTemplates.map((template) => (
        <TemplateCard key={template.id} template={template} onApply={() => applyTemplate(template)} />
      ))}
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  templateCard: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexGrow: 1,
    flexBasis: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
});
