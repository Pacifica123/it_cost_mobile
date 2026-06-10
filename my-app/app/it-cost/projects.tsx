import { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useProjectStyles } from '../../features/project/styles';
import { buildProjectReadiness } from '../../features/project/logic/readiness';
import { buildReport } from '../../features/report/logic/buildReport';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, useThemePalette, type ThemePalette } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';

export const title = 'Мои проекты';

function ProjectButton({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  const local = useLocalStyles();

  const palette = useThemePalette();

  return (
    <AnimatedPressable
      onPress={onPress}
      pressedScale={0.97}
      style={[local.smallButton, { backgroundColor: danger ? palette.danger : palette.primary }]}
    >
      <Text style={local.smallButtonText} maxFontSizeMultiplier={1.1}>{label}</Text>
    </AnimatedPressable>
  );
}

export default function ProjectsScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();
  const palette = useThemePalette();
  const data = useData();
  const currentReport = buildReport(data);
  const currentReadiness = buildProjectReadiness(data);

  const saveCurrent = () => {
    data.saveCurrentProject();
    Alert.alert('Проект сохранён', 'Текущее состояние добавлено в список проектов или обновило открытую карточку проекта.');
  };

  const openProject = (projectId: string) => {
    Alert.alert('Открыть проект?', 'Текущий несохранённый расчёт будет заменён выбранным проектом.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Открыть',
        onPress: () => {
          data.openSavedProject(projectId);
          router.replace('/it-cost/dashboard' as Href);
        },
      },
    ]);
  };

  const deleteProject = (projectId: string, name: string) => {
    Alert.alert('Удалить проект?', `Проект «${name}» будет удалён из списка сохранённых проектов.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => data.deleteSavedProject(projectId) },
    ]);
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Рабочая область</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Мои проекты</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Сохраняйте несколько расчётов, быстро переключайтесь между вариантами и дублируйте удачные проекты.
        </Text>
      </View>

      <AppCard delay={40} style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Текущий проект</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{data.projectMeta.name}</Text>
        <View style={local.statsRow}>
          <View style={[local.statPill, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
            <Text style={[local.statValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{currentReadiness.percent}%</Text>
            <Text style={[local.statLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>готовность</Text>
          </View>
          <View style={[local.statPill, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
            <Text style={[local.statValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(currentReport.capitalTotal)}</Text>
            <Text style={[local.statLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>CAPEX</Text>
          </View>
          <View style={[local.statPill, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
            <Text style={[local.statValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{data.capitalData.length}/{data.operatingData.length}</Text>
            <Text style={[local.statLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>CAPEX / OPEX</Text>
          </View>
        </View>
        <View style={local.actionsRow}>
          <ProjectButton label="Сохранить проект" onPress={saveCurrent} />
          <ProjectButton label="Паспорт" onPress={() => router.push('/it-cost/project' as Href)} />
        </View>
      </AppCard>

      <AppCard delay={80} style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Сохранённые проекты</Text>
        {data.savedProjects.length === 0 ? (
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>
            Пока нет сохранённых проектов. Нажмите «Сохранить проект», чтобы текущий расчёт появился в списке.
          </Text>
        ) : null}

        {data.savedProjects.map((project, index) => (
          <View
            key={project.id}
            style={[
              local.projectCard,
              {
                backgroundColor: data.activeProjectId === project.id ? palette.primarySoft : palette.surface,
                borderColor: data.activeProjectId === project.id ? (palette.isDark ? 'rgba(96,165,250,0.42)' : 'rgba(37,99,235,0.32)') : palette.borderSoft,
              },
            ]}
          >
            <View style={local.projectHeader}>
              <View style={local.projectTitleBox}>
                <Text style={[local.projectTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>{project.name}</Text>
                <Text style={[local.projectSubtitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>
                  {project.organization || 'Организация не указана'} · обновлён {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
                </Text>
              </View>
              {data.activeProjectId === project.id ? (
                <Text style={[local.activeBadge, { backgroundColor: palette.surface, color: palette.primary }]} maxFontSizeMultiplier={1.1}>открыт</Text>
              ) : null}
            </View>

            <View style={local.statsRow}>
              <View style={[local.statPillSmall, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
                <Text style={[local.statValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(project.budget)}</Text>
                <Text style={[local.statLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>бюджет</Text>
              </View>
              <View style={[local.statPillSmall, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
                <Text style={[local.statValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{project.capitalItemsCount}</Text>
                <Text style={[local.statLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>CAPEX</Text>
              </View>
              <View style={[local.statPillSmall, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
                <Text style={[local.statValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{project.operatingItemsCount}</Text>
                <Text style={[local.statLabel, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>OPEX</Text>
              </View>
            </View>

            <View style={local.actionsRow}>
              <ProjectButton label="Открыть" onPress={() => openProject(project.id)} />
              <ProjectButton label="Дублировать" onPress={() => data.duplicateSavedProject(project.id)} />
              <ProjectButton label="Удалить" danger onPress={() => deleteProject(project.id, project.name)} />
            </View>
          </View>
        ))}
      </AppCard>
    </AnimatedScreenScroll>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexGrow: 1,
    flexBasis: 118,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    padding: spacing.md,
  },
  statPillSmall: {
    flexGrow: 1,
    flexBasis: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    padding: 10,
  },
  statValue: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  projectCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  activeProjectCard: {
    borderColor: 'rgba(37,99,235,0.32)',
    backgroundColor: theme.primarySoft,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  projectTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  projectTitle: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  projectSubtitle: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 3,
  },
  activeBadge: {
    color: theme.primary,
    backgroundColor: theme.surface,
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallButton: {
    flexGrow: 1,
    flexBasis: 120,
    borderRadius: radius.md,
    backgroundColor: theme.primary,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  smallButtonText: {
    color: theme.textOnDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
