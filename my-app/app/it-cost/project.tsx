import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { CostStructureCard } from '../../features/project/components/CostStructureCard';
import { ReadinessCard } from '../../features/project/components/ReadinessCard';
import { buildProjectReadiness } from '../../features/project/logic/readiness';
import { projectStyles as styles } from '../../features/project/styles';
import { buildReport } from '../../features/report/logic/buildReport';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';

export const title = 'Проект расчёта';

function ActionButton({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const secondary = variant === 'secondary';
  const danger = variant === 'danger';

  return (
    <AnimatedPressable
      onPress={onPress}
      pressedScale={0.97}
      style={[
        styles.actionButton,
        secondary && styles.secondaryButton,
        danger && styles.dangerButton,
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          (secondary || danger) && styles.secondaryButtonText,
        ]}
        maxFontSizeMultiplier={1.1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
}) {
  return (
    <View style={local.field}>
      <Text style={local.fieldLabel} maxFontSizeMultiplier={1.1}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={colors.textMuted}
        style={[local.input, multiline && local.inputMultiline]}
        maxFontSizeMultiplier={1.08}
      />
    </View>
  );
}

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ProjectScreen() {
  const data = useData();
  const report = buildReport(data);
  const readiness = buildProjectReadiness(data);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: data.projectMeta.name,
    organization: data.projectMeta.organization,
    budget: String(data.projectMeta.budget || ''),
    targetClientSeats: String(data.projectMeta.targetClientSeats || ''),
    note: data.projectMeta.note,
  });

  useEffect(() => {
    if (editing) return;
    setDraft({
      name: data.projectMeta.name,
      organization: data.projectMeta.organization,
      budget: String(data.projectMeta.budget || ''),
      targetClientSeats: String(data.projectMeta.targetClientSeats || ''),
      note: data.projectMeta.note,
    });
  }, [data.projectMeta, editing]);

  const savedLabel = data.lastSavedAt
    ? data.lastSavedAt.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : data.isHydrated
      ? 'ожидание автосохранения'
      : 'загрузка данных';

  const confirmDemoReset = () => {
    Alert.alert(
      'Загрузить демо-проект?',
      'Текущий расчёт будет заменён демонстрационным набором данных.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Загрузить', onPress: data.resetDemoData },
      ]
    );
  };

  const confirmEmptyReset = () => {
    Alert.alert(
      'Очистить проект?',
      'Позиции ТО, ПО, OPEX и электропотребление будут очищены. Базовые категории останутся.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Очистить', style: 'destructive', onPress: data.resetEmptyProject },
      ]
    );
  };

  const saveMeta = () => {
    const name = draft.name.trim();
    if (!name) {
      Alert.alert('Название не заполнено', 'Введите название проекта.');
      return;
    }

    data.setProjectMeta({
      name,
      organization: draft.organization.trim(),
      budget: Math.max(0, toNumber(draft.budget)),
      targetClientSeats: Math.max(0, Math.round(toNumber(draft.targetClientSeats))),
      note: draft.note.trim(),
    });
    setEditing(false);
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Локальный проект</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>
          {data.projectMeta.name || 'Расчёт ИТ-инфраструктуры'}
        </Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          {data.projectMeta.organization ? `${data.projectMeta.organization}. ` : ''}
          Здесь собраны паспорт, готовность расчёта, быстрые действия и структура затрат.
        </Text>
      </View>

      <AppCard delay={40} style={local.cardGap}>
        <View style={local.cardHeader}>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Паспорт проекта</Text>
          <AnimatedPressable style={local.smallButton} pressedScale={0.96} onPress={() => setEditing((value) => !value)}>
            <Text style={local.smallButtonText} maxFontSizeMultiplier={1.1}>{editing ? 'Скрыть' : 'Редактировать'}</Text>
          </AnimatedPressable>
        </View>

        {editing ? (
          <View style={local.form}>
            <Field label="Название" value={draft.name} onChangeText={(name) => setDraft((prev) => ({ ...prev, name }))} />
            <Field label="Организация" value={draft.organization} onChangeText={(organization) => setDraft((prev) => ({ ...prev, organization }))} />
            <View style={local.twoCols}>
              <Field label="Бюджет, ₽" value={draft.budget} keyboardType="numeric" onChangeText={(budget) => setDraft((prev) => ({ ...prev, budget }))} />
              <Field label="Клиентские места" value={draft.targetClientSeats} keyboardType="numeric" onChangeText={(targetClientSeats) => setDraft((prev) => ({ ...prev, targetClientSeats }))} />
            </View>
            <Field label="Комментарий" value={draft.note} multiline onChangeText={(note) => setDraft((prev) => ({ ...prev, note }))} />
            <View style={styles.actionRow}>
              <ActionButton label="Сохранить паспорт" onPress={saveMeta} />
              <ActionButton label="Отмена" variant="secondary" onPress={() => setEditing(false)} />
            </View>
          </View>
        ) : null}

        <View style={styles.metaGrid}>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue} maxFontSizeMultiplier={1.1}>{data.capitalData.length}</Text>
            <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>CAPEX позиций</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue} maxFontSizeMultiplier={1.1}>{data.operatingData.length}</Text>
            <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>OPEX позиций</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(data.projectMeta.budget)}</Text>
            <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>бюджет</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue} maxFontSizeMultiplier={1.1}>{data.projectMeta.targetClientSeats}</Text>
            <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>клиентских мест</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(report.grandTotalAnnual)}</Text>
            <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>итог за год</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue} maxFontSizeMultiplier={1.1}>{savedLabel}</Text>
            <Text style={styles.metaLabel} maxFontSizeMultiplier={1.1}>последнее сохранение</Text>
          </View>
        </View>

        {data.projectMeta.note ? <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{data.projectMeta.note}</Text> : null}

        <View style={styles.actionRow}>
          <ActionButton label="Шаблоны" variant="secondary" onPress={() => router.push('/it-cost/templates' as Href)} />
          <ActionButton label="История" variant="secondary" onPress={() => router.push('/it-cost/history' as Href)} />
          <ActionButton label="Быстрый расчёт" onPress={() => router.push('/it-cost/quick_start' as Href)} />
          <ActionButton label="Открыть отчёт" variant="secondary" onPress={() => router.push('/it-cost/export' as Href)} />
          <ActionButton label="Импорт/экспорт" variant="secondary" onPress={() => router.push('/it-cost/project_io' as Href)} />
          <ActionButton label="Проверка данных" variant="secondary" onPress={() => router.push('/it-cost/validation' as Href)} />
          <ActionButton label="Сравнение методов" variant="secondary" onPress={() => router.push('/it-cost/method_comparison' as Href)} />
          <ActionButton label="Загрузить демо" variant="secondary" onPress={confirmDemoReset} />
          <ActionButton label="Очистить" variant="danger" onPress={confirmEmptyReset} />
        </View>
      </AppCard>

      <ReadinessCard readiness={readiness} />

      <CostStructureCard
        hardwareTotal={report.hardwareTotal}
        softwareTotal={report.softwareTotal}
        opexAnnual={report.periodicTotalAnnual + report.oneTimeOperatingTotal}
        electricityAnnual={report.electricityTotalAnnual}
      />
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  smallButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  form: {
    gap: spacing.sm,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  inputMultiline: {
    minHeight: 92,
    paddingTop: spacing.md,
  },
  twoCols: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
