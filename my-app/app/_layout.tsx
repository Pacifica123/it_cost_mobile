import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DataProvider } from '../store/data/DataContext';
import { useThemePalette } from '../shared/theme';

function RootStack() {
  const palette = useThemePalette();

  return (
    <>
      <StatusBar style={palette.isDark ? 'light' : 'dark'} backgroundColor={palette.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: palette.bg },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="it-cost" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#020617' }}>
      <DataProvider>
        <RootStack />
      </DataProvider>
    </GestureHandlerRootView>
  );
}
