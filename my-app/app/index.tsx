import { Alert, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionsMenu } from '../components/SectionsMenu';
import { AppCard } from '../shared/ui/AppCard';
import { AnimatedPressable } from '../shared/ui/AnimatedPressable';
import { styles } from '../features/home/styles';
import { colors } from '../shared/theme';
import { getScreenIcon } from '../shared/icons/getScreenIcon';
import { useData } from '../store/data/DataContext';
import { checkGithubUpdate } from '../features/update/logic/githubUpdate';

const ROOT_SERVICE_LINKS = [
  { route: '/it-cost/settings' as Href, title: 'Настройки', subtitle: 'Тема, валюта, удаление' },
  { route: '/it-cost/diagnostics' as Href, title: 'Диагностика', subtitle: 'Хранилище и состояние' },
  { route: '/it-cost/app_update' as Href, title: 'Обновления', subtitle: 'Проверить GitHub' },
];

const START_SCREEN_ROUTE: Record<string, Href> = {
  itMenu: '/it-cost/menu' as Href,
  dashboard: '/it-cost/dashboard' as Href,
  quickStart: '/it-cost/quick_start' as Href,
};

async function runSilentUpdateCheck() {
  const extra = (Constants.expoConfig?.extra?.updates ?? {}) as { githubOwner?: string; githubRepo?: string; githubBranch?: string };
  const result = await checkGithubUpdate({
    owner: extra.githubOwner || 'Pacifica123',
    repo: extra.githubRepo || 'it_cost_mobile',
    branch: extra.githubBranch || 'main',
    currentVersion: Constants.expoConfig?.version || '1.0.0',
  });
  if (result.ok && result.hasUpdate) {
    Alert.alert('Доступно обновление', `Найдена версия ${result.latestVersion}. Откройте раздел “Обновления”, чтобы скачать или посмотреть релиз.`);
  }
}

function RootServiceToolsCard() {
  return (
    <AppCard style={styles.serviceCard} delay={70}>
      <View style={styles.serviceHeaderRow}>
        <View>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.12}>Быстрый доступ</Text>
          <Text style={styles.serviceHint} maxFontSizeMultiplier={1.1}>Настройки, диагностика и проверка обновлений.</Text>
        </View>
      </View>

      <View style={styles.serviceShortcutGrid}>
        {ROOT_SERVICE_LINKS.map((item) => (
          <AnimatedPressable
            key={item.route}
            style={styles.serviceShortcut}
            onPress={() => router.push(item.route)}
            pressedScale={0.97}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.serviceIconWrap}>
              <Ionicons name={getScreenIcon(item.title)} size={18} color={colors.text} />
            </View>
            <View style={styles.serviceTextWrap}>
              <Text style={styles.serviceTitle} numberOfLines={1} maxFontSizeMultiplier={1.08}>{item.title}</Text>
              <Text style={styles.serviceSubtitle} numberOfLines={2} maxFontSizeMultiplier={1.08}>{item.subtitle}</Text>
            </View>
          </AnimatedPressable>
        ))}
      </View>
    </AppCard>
  );
}

export default function WelcomeScreen() {
  const { appSettings, isHydrated } = useData();
  const didApplyStartScreen = useRef(false);
  const didCheckUpdates = useRef(false);

  useEffect(() => {
    if (!isHydrated || didApplyStartScreen.current) return;
    didApplyStartScreen.current = true;
    const route = START_SCREEN_ROUTE[appSettings.startScreen];
    if (route) {
      router.replace(route);
    }
  }, [appSettings.startScreen, isHydrated]);

  useEffect(() => {
    if (!isHydrated || didCheckUpdates.current || !appSettings.checkUpdatesOnStart) return;
    didCheckUpdates.current = true;
    void runSilentUpdateCheck().catch(() => undefined);
  }, [appSettings.checkUpdatesOnStart, isHydrated]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.decorBlob1} pointerEvents="none" />
      <View style={styles.decorBlob2} pointerEvents="none" />

      <View style={styles.page}>
        <AppCard style={styles.headerCard}>
          <Text style={styles.title}>Добро пожаловать 👋</Text>
          <Text style={styles.subtitle}>Выбери раздел, с которым хочешь работать</Text>
        </AppCard>

        <AppCard style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Разделы</Text>
          <SectionsMenu variant="entries" />
        </AppCard>

        <RootServiceToolsCard />
      </View>
    </SafeAreaView>
  );
}
