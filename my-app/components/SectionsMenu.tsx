import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { index as styles } from '../app/styles/index';

import { entryBlocks, hiddenBlocks } from '../app/generated/tabs';

type MenuVariant = 'entries' | 'all';

function pickIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('капит')) return 'cash-outline';
  if (t.includes('операц')) return 'wallet-outline';
  if (t.includes('инфра') || t.includes('ит')) return 'server-outline';
  if (t.includes('элект') || t.includes('энерг')) return 'flash-outline';
  if (t.includes('npv')) return 'stats-chart-outline';
  if (t.includes('ahp')) return 'git-compare-outline';
  if (t.includes('настрой')) return 'settings-outline';
  return 'grid-outline';
}

export function SectionsMenu({
  variant = 'entries',
  hideEntries = false,
}: {
  variant?: MenuVariant;
  hideEntries?: boolean;
}) {
  const router = useRouter();

  const safeEntryBlocks = entryBlocks ?? [];
  const safeHiddenBlocks = hiddenBlocks ?? [];

  const baseData = variant === 'all' ? safeHiddenBlocks : safeEntryBlocks;

  const data = useMemo(() => {
    const entryIds = new Set(safeEntryBlocks.map((x) => x.id));

    return variant === 'all' && hideEntries
      ? baseData.filter(
          (x) => !entryIds.has(x.id) && !String(x.route).endsWith('/menu')
        )
      : baseData;
  }, [baseData, hideEntries, safeEntryBlocks, variant]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.menuList}
      renderItem={({ item }) => {
        const icon = pickIcon(item.title);

        return (
          <Pressable
            onPress={() => router.push(item.route as any)}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={icon as any} size={18} color="#111827" />
              </View>

              <Text style={styles.menuItemText} numberOfLines={2}>
                {item.title}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="rgba(17,24,39,0.5)" />
          </Pressable>
        );
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}