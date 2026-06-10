import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { buildScenarioComparison } from '../../features/scenarios/logic/buildScenarios';
import { useProjectStyles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { useThemePalette } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';

export const title = 'Сценарии расчёта';

export default function ScenariosScreen() {
  const styles = useProjectStyles();
  const palette = useThemePalette();
  const data = useData();
  const comparison = buildScenarioComparison(data);
  const toneColor = {
    ok: palette.success,
    warning: palette.warning,
    danger: palette.danger,
    info: palette.primary,
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Варианты</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Сценарии расчёта</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Сравнение текущего проекта с типовыми сценариями: минимальный офис, локальный сервер и облачная инфраструктура.
        </Text>
      </View>

      {comparison.recommended ? (
        <AppCard style={{ gap: 10 }}>
          <Text style={styles.cardEyebrow} maxFontSizeMultiplier={1.1}>Рекомендуемый ориентир</Text>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={1.1}>{comparison.recommended.title}</Text>
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{comparison.recommended.summary}</Text>
        </AppCard>
      ) : null}

      {comparison.items.map((item) => (
        <AppCard key={item.id} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.cardTitle} maxFontSizeMultiplier={1.1}>{item.title}</Text>
              <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{item.subtitle}</Text>
            </View>
            <Text style={{ color: toneColor[item.tone], fontSize: 12, fontWeight: '900' }} maxFontSizeMultiplier={1.1}>
              {item.tone === 'danger' ? 'риск' : item.tone === 'warning' ? 'проверить' : 'ок'}
            </Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaPill}>
              <Text style={styles.metaValue} maxFontSizeMultiplier={1.05}>{formatCurrencyRU(item.capitalTotal)}</Text>
              <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>CAPEX</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaValue} maxFontSizeMultiplier={1.05}>{formatCurrencyRU(item.annualTotal)}</Text>
              <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>1 год</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaValue} maxFontSizeMultiplier={1.05}>{formatCurrencyRU(item.monthlyRunRate)}</Text>
              <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>ежемесячно</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaValue} maxFontSizeMultiplier={1.05}>{item.qualityScore}/100</Text>
              <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>качество</Text>
            </View>
          </View>

          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{item.summary}</Text>
        </AppCard>
      ))}

      <AppCard style={{ gap: 10 }}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Что делать дальше</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Откройте шаблоны, если хотите заменить текущий проект одним из сценариев, или используйте сравнение как ориентир.</Text>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/templates' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Открыть шаблоны</Text>
        </AnimatedPressable>
      </AppCard>
    </AnimatedScreenScroll>
  );
}
