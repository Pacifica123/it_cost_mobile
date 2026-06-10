import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { buildImplementationPlan } from '../../features/planning/logic/implementationPlan';
import { useProjectStyles } from '../../features/project/styles';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, useThemePalette, type ThemePalette } from '../../shared/theme';
import { useData } from '../../store/data/DataContext';

export const title = 'План внедрения';

const STORAGE_KEY = 'itcost_implementation_checklist_v1';

export default function ImplementationPlanScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();
  const palette = useThemePalette();
  const data = useData();
  const steps = useMemo(() => buildImplementationPlan(data), [data]);
  const [doneIds, setDoneIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setDoneIds(parsed.filter((item) => typeof item === 'string'));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(doneIds));
  }, [doneIds]);

  const toggleStep = (id: string) => {
    setDoneIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const percent = steps.length > 0 ? Math.round((doneIds.filter((id) => steps.some((step) => step.id === id)).length / steps.length) * 100) : 0;

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Внедрение</Text>
        </View>
        <Text style={styles.heroTitle}>План внедрения</Text>
        <Text style={styles.heroText}>Чек-лист этапов запуска инфраструктуры. Отметки сохраняются локально на устройстве.</Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Прогресс: {percent}%</Text>
        <View style={[local.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
          <View style={[local.progressFill, { width: `${percent}%`, backgroundColor: palette.primary }]} />
        </View>
        <Text style={styles.cardText}>Отмечено {doneIds.length} из {steps.length} этапов.</Text>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Этапы</Text>
        {steps.map((step, index) => {
          const done = doneIds.includes(step.id);
          return (
            <AnimatedPressable
              key={step.id}
              onPress={() => toggleStep(step.id)}
              pressedScale={0.98}
              style={[
                local.step,
                {
                  backgroundColor: done ? palette.successSoft : palette.surfaceMuted,
                  borderColor: done ? (palette.isDark ? 'rgba(34,197,94,0.42)' : 'rgba(22,163,74,0.35)') : palette.borderSoft,
                },
              ]}
            >
              <View style={[local.check, { backgroundColor: done ? palette.success : palette.surface, borderColor: done ? palette.success : palette.border }]}>
                <Text style={[local.checkText, { color: done ? palette.textOnDark : palette.text }]}>{done ? '✓' : index + 1}</Text>
              </View>
              <View style={local.stepText}>
                <Text style={[local.stepTitle, { color: palette.text }]}>{step.title}</Text>
                <Text style={[local.stepSection, { color: palette.primary }]}>{step.section}</Text>
                <Text style={[local.stepDescription, { color: palette.textSoft }]}>{step.description}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </AppCard>
    </AnimatedScreenScroll>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  cardGap: { gap: spacing.md },
  progressTrack: { height: 10, borderRadius: radius.pill, backgroundColor: theme.surfaceMuted, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: theme.primary },
  step: { flexDirection: 'row', gap: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: theme.borderSoft, backgroundColor: theme.surfaceMuted, padding: 12 },
  check: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  checkText: { color: theme.text, fontWeight: '900' },
  stepText: { flex: 1, minWidth: 0 },
  stepTitle: { color: theme.text, fontSize: 15, lineHeight: 20, fontWeight: '900' },
  stepSection: { color: theme.primary, fontSize: 11, lineHeight: 15, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  stepDescription: { color: theme.textSoft, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 4 },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
