import { Alert, Text, View } from 'react-native';
import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { buildProjectReadiness } from '../../../features/project/logic/readiness';
import { getNextCalculationStep } from '../../../features/project/logic/nextStep';
import { validateProjectData } from '../../../features/validation/logic/validateProjectData';
import { AppCard, AnimatedPressable, AnimatedScreenScroll } from '../../../shared/ui';
import { useHomeStyles } from '../../../features/home/styles';
import { radius, useThemePalette } from '../../../shared/theme';
import { getScreenIcon } from '../../../shared/icons/getScreenIcon';
import { useData } from '../../../store/data/DataContext';
import { Ionicons } from '@expo/vector-icons';

export const entry = true;
export const title = 'Меню ИТ';
export const tab = true;

const MAIN_QUICK_ACTION_ROUTES = [
  '/it-cost/project_hub',
  '/it-cost/calculations_hub',
  '/it-cost/analytics_hub',
  '/it-cost/report_hub',
  '/it-cost/service_hub',
  '/it-cost/settings',
  '/it-cost/diagnostics',
  '/it-cost/app_update',
];

const mainSections = [
  {
    title: 'Проект',
    subtitle: 'паспорт, импорт, копии',
    route: '/it-cost/project_hub' as Href,
  },
  {
    title: 'Расчёты',
    subtitle: 'ТО, ПО, CAPEX, OPEX',
    route: '/it-cost/calculations_hub' as Href,
  },
  {
    title: 'Аналитика',
    subtitle: 'сводка, риски, методы',
    route: '/it-cost/analytics_hub' as Href,
  },
  {
    title: 'Отчёт',
    subtitle: 'готовность и выгрузка',
    route: '/it-cost/report_hub' as Href,
  },
];

function ProjectStatusCard() {
  const styles = useHomeStyles();

  const [showDetails, setShowDetails] = useState(false);
  const data = useData();
  const palette = useThemePalette();
  const hardwareCount = data.capitalData.filter((item) => item.kind === 'hardware').length;
  const softwareCount = data.capitalData.filter((item) => item.kind === 'software').length;
  const readiness = buildProjectReadiness(data);
  const validation = validateProjectData(data);
  const nextStep = getNextCalculationStep(data);
  const savedLabel = data.lastSavedAt
    ? data.lastSavedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : data.isHydrated
      ? 'ожидание'
      : 'загрузка';

  return (
    <AppCard style={styles.statusCard} delay={40}>
      <Text style={[styles.sectionTitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.12}>Текущий шаг</Text>

      <View style={[styles.progressSummary, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}> 
        <View style={styles.progressSummaryTextWrap}>
          <Text style={[styles.progressSummaryTitle, { color: palette.text }]} maxFontSizeMultiplier={1.08}>{readiness.percent}% готовности</Text>
          <Text style={[styles.progressSummarySubtitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.08}>качество данных: {validation.score}/100</Text>
        </View>
        <AnimatedPressable
          onPress={() => setShowDetails((value) => !value)}
          style={[styles.detailsButton, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}
          pressedScale={0.96}
        >
          <Text style={[styles.detailsButtonText, { color: palette.text }]}>{showDetails ? 'Скрыть' : 'Детали'}</Text>
        </AnimatedPressable>
      </View>

      {showDetails ? (
        <View style={styles.statusGrid}>
          <View style={[styles.statusPill, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}> 
            <Text style={[styles.statusValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{data.capitalData.length}/{data.operatingData.length}</Text>
            <Text style={[styles.statusLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>CAPEX / OPEX</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}> 
            <Text style={[styles.statusValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{hardwareCount}/{softwareCount}</Text>
            <Text style={[styles.statusLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>ТО / ПО</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}> 
            <Text style={[styles.statusValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{savedLabel}</Text>
            <Text style={[styles.statusLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>автосохранение</Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.continueBox, { backgroundColor: palette.primarySoft, borderColor: palette.isDark ? 'rgba(96,165,250,0.35)' : 'rgba(59,130,246,0.22)' }]}> 
        <Text style={[styles.continueTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Продолжить: {nextStep.title}</Text>
        <Text style={[styles.continueText, { color: palette.textSoft }]} maxFontSizeMultiplier={1.12}>{nextStep.description}</Text>
        <AnimatedPressable style={[styles.continueButton, { backgroundColor: palette.primary }]} onPress={() => router.push(nextStep.route)} pressedScale={0.97}>
          <Text style={[styles.continueButtonText, { color: palette.textOnDark }]} maxFontSizeMultiplier={1.1}>{nextStep.actionLabel}</Text>
        </AnimatedPressable>
      </View>
    </AppCard>
  );
}

function StartGuideCard() {
  const styles = useHomeStyles();

  const data = useData();
  const palette = useThemePalette();

  const confirmDemoReset = () => {
    Alert.alert(
      'Загрузить пример?',
      'Текущий расчёт будет заменён примером с демонстрационными данными.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Загрузить', onPress: data.resetDemoData },
      ]
    );
  };

  const confirmEmptyReset = () => {
    Alert.alert(
      'Создать новый расчёт?',
      'Текущий расчёт будет очищен. При включённом автобэкапе перед очисткой будет создана резервная копия.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Создать', style: 'destructive', onPress: data.resetEmptyProject },
      ]
    );
  };

  return (
    <AppCard style={styles.statusCard} delay={20}>
      <Text style={[styles.sectionTitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.12}>С чего начать</Text>
      <Text style={[styles.statusHint, { color: palette.textSoft }]} maxFontSizeMultiplier={1.12}>
        Один главный путь: 1) проект, 2) расчёты, 3) аналитика, 4) отчёт. Остальные инструменты доступны внутри разделов.
      </Text>
      <View style={styles.actionRowCompact}>
        <AnimatedPressable style={[styles.actionButton, { backgroundColor: palette.primary, borderColor: palette.primary }]} onPress={() => router.push('/it-cost/calculations_hub' as Href)} pressedScale={0.97}>
          <Text style={[styles.actionButtonText, { color: palette.textOnDark }]} maxFontSizeMultiplier={1.1}>Начать расчёт</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.actionButton, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]} onPress={confirmDemoReset} pressedScale={0.97}>
          <Text style={[styles.actionButtonText, { color: palette.text }]} maxFontSizeMultiplier={1.1}>Загрузить пример</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.actionButton, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]} onPress={() => router.push('/it-cost/export' as Href)} pressedScale={0.97}>
          <Text style={[styles.actionButtonText, { color: palette.text }]} maxFontSizeMultiplier={1.1}>Открыть отчёт</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.actionButton, { backgroundColor: palette.dangerSoft, borderColor: palette.isDark ? 'rgba(248,113,113,0.28)' : 'rgba(239,68,68,0.24)' }]} onPress={confirmEmptyReset} pressedScale={0.97}>
          <Text style={[styles.actionButtonText, { color: palette.text }]} maxFontSizeMultiplier={1.1}>Новый расчёт</Text>
        </AnimatedPressable>
      </View>
    </AppCard>
  );
}

function SectionTile({ title: itemTitle, subtitle, route, index }: { title: string; subtitle: string; route: Href; index: number }) {
  const styles = useHomeStyles();

  const palette = useThemePalette();
  const icon = getScreenIcon(itemTitle);

  return (
    <AnimatedPressable
      onPress={() => router.push(route)}
      pressedScale={0.975}
      style={[styles.hubTile, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}
      accessibilityRole="button"
      accessibilityLabel={itemTitle}
    >
      <View style={[styles.serviceIconWrap, { backgroundColor: palette.surface, borderColor: palette.borderSoft, borderRadius: radius.md }]}> 
        <Ionicons name={icon} size={20} color={index === 0 ? palette.primary : palette.text} />
      </View>
      <View style={styles.serviceTextWrap}>
        <Text style={[styles.serviceTitle, { color: palette.text }]} maxFontSizeMultiplier={1.08}>{itemTitle}</Text>
        <Text style={[styles.serviceSubtitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.08}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
    </AnimatedPressable>
  );
}

function MainSectionsCard() {
  const styles = useHomeStyles();

  const palette = useThemePalette();

  return (
    <AppCard style={styles.menuCard} delay={80}>
      <Text style={[styles.sectionTitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.12}>Основные разделы</Text>
      <View style={styles.hubGrid}>
        {mainSections.map((section, index) => <SectionTile key={section.title} {...section} index={index} />)}
      </View>
    </AppCard>
  );
}

export default function MenuInTabs() {
  const styles = useHomeStyles();

  const tabBarHeight = useBottomTabBarHeight();
  const palette = useThemePalette();

  return (
    <AnimatedScreenScroll
      style={[styles.screen, { backgroundColor: palette.bg }]}
      contentContainerStyle={[styles.page, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <ProjectStatusCard />
      <StartGuideCard />
      <MainSectionsCard />
    </AnimatedScreenScroll>
  );
}
