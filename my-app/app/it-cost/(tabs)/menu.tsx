import { Alert, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ReadinessCard } from '../../../features/project/components/ReadinessCard';
import { buildProjectReadiness } from '../../../features/project/logic/readiness';
import { SectionsMenu } from '../../../components/SectionsMenu';
import { AppCard, AnimatedPressable, AnimatedScreenScroll } from '../../../shared/ui';
import { styles } from '../../../features/home/styles';
import { useData } from '../../../store/data/DataContext';

export const entry = true;
export const title = 'Меню ИТ';
export const tab = true;

function ProjectStatusCard() {
  const data = useData();
  const hardwareCount = data.capitalData.filter((item) => item.kind === 'hardware').length;
  const softwareCount = data.capitalData.filter((item) => item.kind === 'software').length;
  const readiness = buildProjectReadiness(data);
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
      <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.12}>Состояние проекта · готовность {readiness.percent}%</Text>

      <View style={styles.statusGrid}>
        <View style={styles.statusPill}>
          <Text style={styles.statusValue} maxFontSizeMultiplier={1.1}>{data.capitalData.length}</Text>
          <Text style={styles.statusLabel} maxFontSizeMultiplier={1.1}>CAPEX позиций</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusValue} maxFontSizeMultiplier={1.1}>{data.operatingData.length}</Text>
          <Text style={styles.statusLabel} maxFontSizeMultiplier={1.1}>OPEX позиций</Text>
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

      <Text style={styles.statusHint} maxFontSizeMultiplier={1.12}>
        Данные сохраняются локально на устройстве через AsyncStorage после каждого изменения.
      </Text>

      <View style={styles.actionRow}>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/templates' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Шаблоны</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/history' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>История</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/quick_start' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Быстрый расчёт</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/validation' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Проверка данных</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={() => router.push('/it-cost/project_io' as Href)} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Импорт/экспорт</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButton} onPress={confirmDemoReset} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Загрузить демо</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.actionButton, styles.actionButtonDanger]} onPress={confirmEmptyReset} pressedScale={0.97}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Очистить расчёт</Text>
        </AnimatedPressable>
      </View>
    </AppCard>
  );
}

export default function MenuInTabs() {
  const tabBarHeight = useBottomTabBarHeight();
  const data = useData();
  const readiness = buildProjectReadiness(data);

  return (
    <AnimatedScreenScroll
      style={styles.screen}
      contentContainerStyle={[styles.page, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <ProjectStatusCard />

      <ReadinessCard readiness={readiness} compact />

      <AppCard style={styles.menuCard} delay={80}>
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.12}>Разделы расчёта</Text>
        <SectionsMenu variant="all" hideEntries searchable />
      </AppCard>
    </AnimatedScreenScroll>
  );
}
