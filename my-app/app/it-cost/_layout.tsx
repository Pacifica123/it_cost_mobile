import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { hiddenBlocks } from '../generated/tabs';
import { colors, radius } from '../../shared/theme';
import { AnimatedPressable } from '../../shared/ui';

const getRouteName = (route: string) => {
  const parts = route.split('/');
  return parts[parts.length - 1] || route;
};

const stackScreens = hiddenBlocks.map((screen) => ({
  name: getRouteName(screen.route),
  title: screen.title,
}));

const routeTitleByName: Record<string, string> = Object.fromEntries(
  stackScreens.map((screen) => [screen.name, screen.title])
);

const getStackTitle = (routeName: string) => {
  if (routeName === '(tabs)') {
    return '';
  }

  return routeTitleByName[routeName] ?? routeName;
};

function HeaderIconButton({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={styles.headerIconButton}
      hitSlop={8}
      pressedScale={0.94}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={24} color={colors.text} />
    </AnimatedPressable>
  );
}

function HeaderTitle({ title }: { title: string }) {
  return (
    <Text style={styles.headerTitle} numberOfLines={2} maxFontSizeMultiplier={1.08}>
      {title}
    </Text>
  );
}

export default function ItCostLayout() {
  return (
    <Stack
      screenOptions={({ route }) => {
        const title = getStackTitle(route.name);

        return {
          title,
          headerShown: true,
          animation: 'slide_from_right',
          gestureEnabled: true,
          fullScreenGestureEnabled: false,
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
          headerTitleAlign: 'left',
          headerTitle: () => <HeaderTitle title={title} />,
          headerLeft: () => (
            <HeaderIconButton
              icon="chevron-back"
              label="Назад"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/it-cost/menu'))}
            />
          ),
          headerRight: () => (
            <HeaderIconButton
              icon="home-outline"
              label="На главный экран"
              onPress={() => router.replace('/')}
            />
          ),
        };
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {stackScreens.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} options={{ title: screen.title }} />
      ))}
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    flexShrink: 1,
  },
});
