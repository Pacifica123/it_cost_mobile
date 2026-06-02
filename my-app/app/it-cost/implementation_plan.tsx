import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { buildImplementationPlan } from '../../features/planning/logic/implementationPlan';
import { projectStyles as styles } from '../../features/project/styles';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';
import { useData } from '../../store/data/DataContext';

export const title = 'План внедрения';

const STORAGE_KEY = 'itcost_implementation_checklist_v1';

export default function ImplementationPlanScreen() {
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
        <View style={local.progressTrack}>
          <View style={[local.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.cardText}>Отмечено {doneIds.length} из {steps.length} этапов.</Text>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle}>Этапы</Text>
        {steps.map((step, index) => {
          const done = doneIds.includes(step.id);
          return (
            <AnimatedPressable key={step.id} onPress={() => toggleStep(step.id)} pressedScale={0.98} style={[local.step, done && local.stepDone]}>
              <View style={[local.check, done && local.checkDone]}>
                <Text style={[local.checkText, done && local.checkTextDone]}>{done ? '✓' : index + 1}</Text>
              </View>
              <View style={local.stepText}>
                <Text style={local.stepTitle}>{step.title}</Text>
                <Text style={local.stepSection}>{step.section}</Text>
                <Text style={local.stepDescription}>{step.description}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: { gap: spacing.md },
  progressTrack: { height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  step: { flexDirection: 'row', gap: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surfaceMuted, padding: 12 },
  stepDone: { borderColor: 'rgba(22,163,74,0.35)', backgroundColor: colors.successSoft },
  check: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkText: { color: colors.text, fontWeight: '900' },
  checkTextDone: { color: '#fff' },
  stepText: { flex: 1, minWidth: 0 },
  stepTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '900' },
  stepSection: { color: colors.primary, fontSize: 11, lineHeight: 15, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  stepDescription: { color: colors.textSoft, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 4 },
});
