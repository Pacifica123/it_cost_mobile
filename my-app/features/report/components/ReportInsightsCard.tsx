import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '../../../shared/theme';
import { AppCard } from '../../../shared/ui/AppCard';
import { styles } from '../styles';
import type { ReportInsight } from '../types';

const iconByTone: Record<ReportInsight['tone'], ComponentProps<typeof Ionicons>['name']> = {
  ok: 'checkmark-circle-outline',
  warning: 'alert-circle-outline',
  info: 'information-circle-outline',
};

const colorByTone: Record<ReportInsight['tone'], string> = {
  ok: colors.success,
  warning: colors.warning,
  info: colors.primary,
};

export function ReportInsightsCard({ insights }: { insights: ReportInsight[] }) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Проверка расчёта</Text>
      <Text style={styles.insightLead} maxFontSizeMultiplier={1.12}>
        Это быстрый контроль полноты данных перед расчётом или выгрузкой отчёта.
      </Text>

      <View style={styles.insightList}>
        {insights.map((insight) => (
          <View key={insight.id} style={styles.insightItem}>
            <Ionicons
              name={iconByTone[insight.tone]}
              size={19}
              color={colorByTone[insight.tone]}
              style={styles.insightIcon}
            />
            <View style={styles.insightTextWrap}>
              <Text style={styles.insightTitle} maxFontSizeMultiplier={1.1}>{insight.title}</Text>
              <Text style={styles.insightDescription} maxFontSizeMultiplier={1.1}>{insight.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
