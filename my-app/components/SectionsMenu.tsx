import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { entryBlocks, hiddenBlocks } from '../app/generated/tabs';
import { styles } from '../features/home/styles';
import { colors } from '../shared/theme';
import { getScreenIcon } from '../shared/icons/getScreenIcon';
import { AnimatedPressable, AnimatedSurface } from '../shared/ui';

type MenuVariant = 'entries' | 'all';
type RouteItem = {
  id: string;
  title: string;
  route: string;
};

export function SectionsMenu({
  variant = 'entries',
  hideEntries = false,
  searchable = false,
}: {
  variant?: MenuVariant;
  hideEntries?: boolean;
  searchable?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const safeEntryBlocks: RouteItem[] = entryBlocks ?? [];
  const safeHiddenBlocks: RouteItem[] = hiddenBlocks ?? [];
  const baseData = variant === 'all' ? safeHiddenBlocks : safeEntryBlocks;

  const data = useMemo(() => {
    const entryIds = new Set(safeEntryBlocks.map((item) => item.id));
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByMode = variant === 'all' && hideEntries
      ? baseData.filter((item) => !entryIds.has(item.id) && !item.route.endsWith('/menu'))
      : baseData;

    if (!normalizedQuery) {
      return filteredByMode;
    }

    return filteredByMode.filter((item) => {
      const haystack = `${item.title} ${item.route}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [baseData, hideEntries, query, safeEntryBlocks, variant]);

  return (
    <View style={styles.menuList}>
      {searchable ? (
        <View style={styles.menuSearchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Найти раздел"
            placeholderTextColor={colors.textMuted}
            style={styles.menuSearchInput}
            autoCorrect={false}
            autoCapitalize="none"
            maxFontSizeMultiplier={1.12}
          />
          {query ? (
            <AnimatedPressable
              onPress={() => setQuery('')}
              pressedScale={0.9}
              style={styles.menuSearchClear}
              accessibilityRole="button"
              accessibilityLabel="Очистить поиск"
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          ) : null}
        </View>
      ) : null}

      {data.length === 0 ? (
        <Text style={styles.menuEmptyText} maxFontSizeMultiplier={1.12}>Разделы не найдены</Text>
      ) : null}

      {data.map((item, index) => {
        const icon = getScreenIcon(item.title);

        return (
          <AnimatedSurface key={item.id} delay={index * 18}>
            <AnimatedPressable
              onPress={() => router.push(item.route as Href)}
              style={styles.menuItem}
              pressedScale={0.975}
              android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name={icon} size={18} color={colors.text} />
                </View>

                <Text style={styles.menuItemText} numberOfLines={2} maxFontSizeMultiplier={1.12}>
                  {index + 1}. {item.title}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </AnimatedPressable>
          </AnimatedSurface>
        );
      })}
    </View>
  );
}
