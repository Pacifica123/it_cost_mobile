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
type MenuMode = 'all' | 'calculation' | 'grouped';
type RouteItem = {
  id: string;
  title: string;
  route: string;
};

type MenuGroup = {
  id: string;
  title: string;
  routes: string[];
};

const NON_CALCULATION_ROUTES = new Set([
  '/it-cost/dashboard',
  '/it-cost/financial_charts',
  '/it-cost/project',
  '/it-cost/templates',
  '/it-cost/quick_start',
  '/it-cost/project_io',
  '/it-cost/backups',
  '/it-cost/history',
  '/it-cost/settings',
  '/it-cost/diagnostics',
  '/it-cost/validation',
]);

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'calc',
    title: 'Расчёты',
    routes: [
      '/it-cost/it_infrastructure',
      '/it-cost/capital_expenditures',
      '/it-cost/technical_equipment',
      '/it-cost/software',
      '/it-cost/operating_expenses',
      '/it-cost/electricity',
    ],
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    routes: [
      '/it-cost/financial_charts',
      '/it-cost/NPV',
      '/it-cost/ahp',
      '/it-cost/criteria_importance',
      '/it-cost/genetic_optimization',
      '/it-cost/method_comparison',
    ],
  },
  {
    id: 'service',
    title: 'Сервис',
    routes: [
      '/it-cost/project',
      '/it-cost/quick_start',
      '/it-cost/validation',
      '/it-cost/templates',
      '/it-cost/project_io',
      '/it-cost/backups',
      '/it-cost/history',
      '/it-cost/settings',
      '/it-cost/diagnostics',
    ],
  },
];

function getGroupForRoute(route: string) {
  return MENU_GROUPS.find((group) => group.routes.includes(route));
}

function orderInGroup(item: RouteItem) {
  const group = getGroupForRoute(item.route);
  if (!group) return Number.MAX_SAFE_INTEGER;
  return group.routes.indexOf(item.route);
}

function MenuItem({ item, index }: { item: RouteItem; index?: number }) {
  const router = useRouter();
  const icon = getScreenIcon(item.title);

  return (
    <AnimatedSurface key={item.id} delay={(index ?? 0) * 18}>
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
            {item.title}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </AnimatedPressable>
    </AnimatedSurface>
  );
}

export function SectionsMenu({
  variant = 'entries',
  hideEntries = false,
  searchable = false,
  mode = 'all',
}: {
  variant?: MenuVariant;
  hideEntries?: boolean;
  searchable?: boolean;
  mode?: MenuMode;
}) {
  const [query, setQuery] = useState('');
  const safeEntryBlocks: RouteItem[] = entryBlocks ?? [];
  const safeHiddenBlocks: RouteItem[] = hiddenBlocks ?? [];
  const baseData = variant === 'all' ? safeHiddenBlocks : safeEntryBlocks;

  const data = useMemo(() => {
    const entryIds = new Set(safeEntryBlocks.map((item) => item.id));
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByEntry = variant === 'all' && hideEntries
      ? baseData.filter((item) => !entryIds.has(item.id) && !item.route.endsWith('/menu'))
      : baseData;
    const filteredByMenuMode = mode === 'calculation'
      ? filteredByEntry.filter((item) => !NON_CALCULATION_ROUTES.has(item.route))
      : filteredByEntry;

    const filteredByQuery = normalizedQuery
      ? filteredByMenuMode.filter((item) => `${item.title} ${item.route}`.toLowerCase().includes(normalizedQuery))
      : filteredByMenuMode;

    return filteredByQuery.sort((a, b) => {
      const groupA = getGroupForRoute(a.route)?.id ?? 'z';
      const groupB = getGroupForRoute(b.route)?.id ?? 'z';
      return groupA.localeCompare(groupB) || orderInGroup(a) - orderInGroup(b) || a.title.localeCompare(b.title, 'ru');
    });
  }, [baseData, hideEntries, mode, query, safeEntryBlocks, variant]);

  const groupedData = useMemo(() => {
    if (mode !== 'grouped') return [];
    return MENU_GROUPS
      .map((group) => ({
        ...group,
        items: data
          .filter((item) => group.routes.includes(item.route))
          .sort((a, b) => orderInGroup(a) - orderInGroup(b)),
      }))
      .filter((group) => group.items.length > 0);
  }, [data, mode]);

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

      {mode === 'grouped'
        ? groupedData.map((group) => (
            <View key={group.id} style={styles.menuGroup}>
              <Text style={styles.menuGroupTitle} maxFontSizeMultiplier={1.1}>{group.title}</Text>
              <View style={styles.menuGroupList}>
                {group.items.map((item, index) => <MenuItem key={item.id} item={item} index={index} />)}
              </View>
            </View>
          ))
        : data.map((item, index) => <MenuItem key={item.id} item={item} index={index} />)}
    </View>
  );
}
