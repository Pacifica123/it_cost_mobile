import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { Pressable } from 'react-native';
import { allTabScreens } from '../../generated/tabs';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
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
      }}
    >
      {allTabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            href: screen.isTab ? screen.route : null,
          }}
        />
      ))}
    </Tabs>
  );
}