import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { type Href, Tabs, router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { allTabScreens, hiddenBlocks } from '../../generated/tabs';
import { getScreenIcon } from '../../../shared/icons/getScreenIcon';
import { colors, radius, useThemePalette } from '../../../shared/theme';
import { AnimatedPressable } from '../../../shared/ui';

const getRouteName = (route: string) => {
  const parts = route.split('/');
  return parts[parts.length - 1] || route;
};

const visibleTabs = allTabScreens.filter((screen) => screen.isTab);
const visibleTabNames = new Set(visibleTabs.map((screen) => screen.name));
const routeTitleByName: Record<string, string> = Object.fromEntries(
  [...allTabScreens, ...hiddenBlocks].map((screen) => [getRouteName(screen.route), screen.title])
);

function HeaderIconButton({
  icon,
  label,
  color = colors.text,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  color?: string;
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
      <Ionicons name={icon} size={24} color={color} />
    </AnimatedPressable>
  );
}

function HeaderTitle({ title, color = colors.text }: { title: string; color?: string }) {
  return (
    <Text style={[styles.headerTitle, { color }]} numberOfLines={2} maxFontSizeMultiplier={1.08}>
      {title}
    </Text>
  );
}

function HomeButton({ color = colors.text }: { color?: string }) {
  return (
    <HeaderIconButton
      icon="home-outline"
      label="На главный экран"
      color={color}
      onPress={() => router.replace('/')}
    />
  );
}

function BackButton({ color = colors.text }: { color?: string }) {
  return (
    <HeaderIconButton
      icon="chevron-back"
      label="Назад"
      color={color}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/it-cost/menu'))}
    />
  );
}

export default function TabsLayout() {
  const palette = useThemePalette();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={({ route }) => {
        const isVisibleTab = visibleTabNames.has(route.name);
        const title = routeTitleByName[route.name] ?? route.name;

        return {
          title,
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: palette.bg },
          headerTitle: () => <HeaderTitle title={title} color={palette.text} />,
          sceneStyle: { backgroundColor: palette.bg },
          tabBarHideOnKeyboard: true,
          headerLeft: isVisibleTab ? undefined : () => <BackButton color={palette.text} />,
          headerRight: () => <HomeButton color={palette.text} />,
          headerLeftContainerStyle: {
            paddingLeft: 8,
          },
          headerRightContainerStyle: {
            paddingRight: 8,
          },
          tabBarStyle: {
            height: 60 + bottomInset,
            paddingTop: 6,
            paddingBottom: bottomInset,
            backgroundColor: palette.surface,
            borderTopWidth: 1,
            borderTopColor: palette.border,
          },
          tabBarItemStyle: isVisibleTab
            ? {
                paddingVertical: 2,
              }
            : {
                display: 'none',
              },
          tabBarButton: isVisibleTab ? undefined : () => null,
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 0,
            fontWeight: '700',
          },
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.textMuted,
          href: isVisibleTab ? undefined : null,
        };
      }}
    >
      {visibleTabs.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarLabel: screen.title,
            href: screen.route as Href,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={getScreenIcon(screen.title)}
                size={size ?? 22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
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
