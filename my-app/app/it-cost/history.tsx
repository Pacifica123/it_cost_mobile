import { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useProjectStyles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import type { ProjectEventType } from '../../store/data/types';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';

export const title = 'История изменений';

const typeLabel: Record<ProjectEventType, string> = {
  project: 'Проект',
  data: 'Данные',
  catalog: 'Каталог',
  template: 'Шаблон',
  import: 'Импорт',
  export: 'Экспорт',
  reset: 'Сброс',
  report: 'Отчёт',
  backup: 'Копия',
  history: 'История',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'без даты';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function HistoryScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  const data = useData();

  const clearHistory = () => {
    Alert.alert('Очистить историю?', 'Журнал действий будет начат заново.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: data.clearProjectEvents },
    ]);
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Журнал проекта</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>История изменений</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Здесь отображаются основные действия: изменение данных, применение шаблонов, очистка проекта и обновление паспорта.
        </Text>
      </View>

      <AppCard style={local.actionsCard}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Всего записей: {data.projectEvents.length}</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Отмена доступна для последних изменений данных, паспорта, настроек, шаблонов и очистки.</Text>
        <View style={local.actionsRow}>
          <AnimatedPressable style={[styles.actionButton, !data.canUndo && local.disabled]} disabled={!data.canUndo} pressedScale={0.97} onPress={data.undoLastAction}>
            <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Отменить</Text>
          </AnimatedPressable>
          <AnimatedPressable style={[styles.actionButton, !data.canRedo && local.disabled]} disabled={!data.canRedo} pressedScale={0.97} onPress={data.redoLastAction}>
            <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Повторить</Text>
          </AnimatedPressable>
          <AnimatedPressable style={[styles.actionButton, styles.dangerButton]} pressedScale={0.97} onPress={clearHistory}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]} maxFontSizeMultiplier={1.1}>Очистить историю</Text>
          </AnimatedPressable>
        </View>
      </AppCard>

      {data.projectEvents.length ? (
        data.projectEvents.map((event, index) => (
          <AppCard key={event.id} delay={index * 18} style={local.eventCard}>
            <View style={local.eventHeader}>
              <Text style={local.eventType} maxFontSizeMultiplier={1.1}>{typeLabel[event.type] ?? 'Событие'}</Text>
              <Text style={local.eventDate} maxFontSizeMultiplier={1.1}>{formatDate(event.createdAt)}</Text>
            </View>
            <Text style={local.eventTitle} maxFontSizeMultiplier={1.12}>{event.title}</Text>
            {event.description ? <Text style={local.eventDescription} maxFontSizeMultiplier={1.12}>{event.description}</Text> : null}
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>История пока пустая.</Text>
        </AppCard>
      )}
    </AnimatedScreenScroll>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  actionsCard: {
    gap: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.45,
  },
  eventCard: {
    gap: 6,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
  },
  eventType: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    color: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  eventDate: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  eventTitle: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  eventDescription: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
