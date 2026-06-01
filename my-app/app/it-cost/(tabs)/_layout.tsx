import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { type Href, Tabs, router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { allTabScreens, hiddenBlocks } from '../../generated/tabs';
import { getScreenIcon } from '../../../shared/icons/getScreenIcon';
import { colors, radius } from '../../../shared/theme';
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

function HomeButton() {
  return (
    <HeaderIconButton
      icon="home-outline"
      label="На главный экран"
      onPress={() => router.replace('/')}
    />
  );
}

function BackButton() {
  return (
    <HeaderIconButton
      icon="chevron-back"
      label="Назад"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/it-cost/menu'))}
    />
  );
}

export default function TabsLayout() {
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
          headerStyle: { backgroundColor: colors.bg },
          headerTitle: () => <HeaderTitle title={title} />,
          sceneStyle: { backgroundColor: colors.bg },
          tabBarHideOnKeyboard: true,
          headerLeft: isVisibleTab ? undefined : () => <BackButton />,
          headerRight: () => <HomeButton />,
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
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
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
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
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
