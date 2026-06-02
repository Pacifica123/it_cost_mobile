import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionsMenu } from '../components/SectionsMenu';
import { AppCard } from '../shared/ui/AppCard';
import { AnimatedPressable } from '../shared/ui/AnimatedPressable';
import { styles } from '../features/home/styles';
import { colors } from '../shared/theme';
import { getScreenIcon } from '../shared/icons/getScreenIcon';

const ROOT_SERVICE_LINKS = [
  { route: '/it-cost/settings' as Href, title: 'Настройки', subtitle: 'Тема, валюта, удаление' },
  { route: '/it-cost/diagnostics' as Href, title: 'Диагностика', subtitle: 'Хранилище и состояние' },
  { route: '/it-cost/app_update' as Href, title: 'Обновления', subtitle: 'Проверить GitHub' },
];

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
