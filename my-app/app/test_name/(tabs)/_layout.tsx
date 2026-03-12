import { Tabs, router } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        headerLeft: () => null,

        headerRight: () => (
          <Pressable
            onPress={() => router.replace('/')}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text style={{ fontWeight: '700' }}>Домой</Text>
          </Pressable>
        ),
      }}
    >

      <Tabs.Screen name="menu" options={{ title: 'Каталог' }} />
      <Tabs.Screen name="export" options={{ title: 'Итого' }} />
      <Tabs.Screen name="test" options={{href: null, title: 'Другое' }} />

      <Tabs.Screen name="capital_expenditures" options={{ href: null, title: 'Капитальные затраты' }} />
      <Tabs.Screen name="it_infrastructure" options={{ href: null, title: 'ИТ-инфраструктура' }} />
      <Tabs.Screen name="operating_expenses" options={{ href: null, title: 'Операционные затраты' }} />
      <Tabs.Screen name="NPV" options={{ href: null, title: 'NPV-анализ' }} />
      <Tabs.Screen name="electricity" options={{ href: null, title: 'Электричество' }} />
    </Tabs>
  );
}