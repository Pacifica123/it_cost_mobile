import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { allTabScreens } from '../../generated/tabs';

function getTabIcon(title: string) {
  const t = title.toLowerCase();

  if (t.includes('меню')) return 'grid-outline';
  if (t.includes('экспорт')) return 'download-outline';
  if (t.includes('инфра') || t.includes('ит')) return 'server-outline';
  if (t.includes('капит')) return 'cash-outline';
  if (t.includes('операц')) return 'wallet-outline';
  if (t.includes('элект') || t.includes('энерг')) return 'flash-outline';
  if (t.includes('ahp')) return 'git-compare-outline';
  if (t.includes('npv')) return 'stats-chart-outline';

  return 'ellipse-outline';
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const bottomInset =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 10)
      : insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarHideOnKeyboard: true,

        headerRight: () => (
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 6,
              opacity: pressed ? 0.6 : 1,
            })}
            hitSlop={10}
          >
            <Ionicons name="home-outline" size={22} color="#111827" />
          </Pressable>
        ),

        headerRightContainerStyle: {
          paddingRight: 6,
        },

        tabBarStyle: {
          height: 60 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        tabBarIconStyle: {
          marginBottom: 2,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 0,
        },

        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      {allTabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            href: screen.isTab ? screen.route : null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={getTabIcon(screen.title)}
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