import { Alert, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { buildProjectReadiness } from '../../../features/project/logic/readiness';
import { getNextCalculationStep } from '../../../features/project/logic/nextStep';
import { validateProjectData } from '../../../features/validation/logic/validateProjectData';
import { SectionsMenu } from '../../../components/SectionsMenu';
import { AppCard, AnimatedPressable, AnimatedScreenScroll } from '../../../shared/ui';
import { styles } from '../../../features/home/styles';
import { useData } from '../../../store/data/DataContext';

export const entry = true;
export const title = 'Меню ИТ';
export const tab = true;

const MAIN_SERVICE_ROUTES = [
  '/it-cost/settings',
  '/it-cost/diagnostics',
  '/it-cost/app_update',
];


function ProjectStatusCard() {
  const data = useData();
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

  const confirmDemoReset = () => {
    Alert.alert(
      'Загрузить демо-данные?',
      'Текущие введённые данные будут заменены демонстрационным примером.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Загрузить', onPress: data.resetDemoData },
      ]
    );
  };

  const confirmEmptyReset = () => {
    Alert.alert(
      'Очистить расчёт?',
      'Позиции ТО, ПО, OPEX и электропотребление будут очищены. Категории останутся базовыми.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Очистить', style: 'destructive', onPress: data.resetEmptyProject },
      ]
    );
  };

  return (
    <AppCard style={styles.statusCard} delay={40}>
      <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.12}>Состояние проекта</Text>

      <View style={styles.statusGrid}>
        <View style={styles.statusPill}>
          <Text style={styles.statusValue} maxFontSizeMultiplier={1.1}>{readiness.percent}%</Text>
          <Text style={styles.statusLabel} maxFontSizeMultiplier={1.1}>готовность</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusValue} maxFontSizeMultiplier={1.1}>{validation.score}/100</Text>
          <Text style={styles.statusLabel} maxFontSizeMultiplier={1.1}>качество данных</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusValue} maxFontSizeMultiplier={1.1}>{data.capitalData.length}/{data.operatingData.length}</Text>
          <Text style={styles.statusLabel} maxFontSizeMultiplier={1.1}>CAPEX / OPEX</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusValue} maxFontSizeMultiplier={1.1}>{hardwareCount}/{softwareCount}</Text>
          <Text style={styles.statusLabel} maxFontSizeMultiplier={1.1}>ТО / ПО</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusValue} maxFontSizeMultiplier={1.1}>{savedLabel}</Text>
          <Text style={styles.statusLabel} maxFontSizeMultiplier={1.1}>автосохранение</Text>
        </View>
      </View>

      <View style={styles.continueBox}>
        <Text style={styles.continueTitle} maxFontSizeMultiplier={1.12}>Продолжить: {nextStep.title}</Text>
        <Text style={styles.continueText} maxFontSizeMultiplier={1.12}>{nextStep.description}</Text>
        <AnimatedPressable style={styles.continueButton} onPress={() => router.push(nextStep.route)} pressedScale={0.97}>
          <Text style={styles.continueButtonText} maxFontSizeMultiplier={1.1}>{nextStep.actionLabel}</Text>
        </AnimatedPressable>
      </View>

      <View style={styles.actionRowCompact}>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/dashboard' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Сводка</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/projects' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Проекты</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/item_catalog' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Каталог</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/backups' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Копии</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/financial_charts' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Графики</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={confirmDemoReset} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Демо</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.actionButton, styles.actionButtonDanger]} onPress={confirmEmptyReset} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Очистить</Text>
        </AnimatedPressable>
      </View>
    </AppCard>
  );
}


export default function MenuInTabs() {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <AnimatedScreenScroll
      style={styles.screen}
      contentContainerStyle={[styles.page, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <ProjectStatusCard />

      <AppCard style={styles.menuCard} delay={80}>
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.12}>Разделы</Text>
        <SectionsMenu variant="all" hideEntries searchable mode="grouped" excludeRoutes={MAIN_SERVICE_ROUTES} />
      </AppCard>
    </AnimatedScreenScroll>
  );
}
