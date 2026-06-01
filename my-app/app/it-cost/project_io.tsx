import { useMemo, useState } from 'react';
import { Alert, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { projectStyles as styles } from '../../features/project/styles';
import { validateProjectData } from '../../features/validation/logic/validateProjectData';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';

export const title = 'Импорт и экспорт проекта';

function ActionButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      pressedScale={0.97}
      style={[styles.actionButton, secondary && styles.secondaryButton]}
    >
      <Text style={[styles.actionButtonText, secondary && styles.secondaryButtonText]} maxFontSizeMultiplier={1.1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export default function ProjectIoScreen() {
  const data = useData();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const exportJson = useMemo(() => data.getProjectExportJson(), [data]);
  const validation = useMemo(() => validateProjectData(data), [data]);

  const shareExport = async () => {
    try {
      await Share.share({
        title: 'IT Cost Mobile project.json',
        message: exportJson,
      });
    } catch {
      Alert.alert('Не удалось открыть системное меню экспорта', 'JSON можно скопировать вручную из поля предпросмотра.');
    }
  };

  const importProject = () => {
    const result = data.importProjectJson(importText);
    setMessage(result.ok ? [result.message, ...result.warnings].join('\n') : result.message);

    if (result.ok) {
      Alert.alert('Импорт завершён', [result.message, ...result.warnings].join('\n') || 'Проект импортирован.');
      setImportText('');
    } else {
      Alert.alert('Импорт не выполнен', result.message);
    }
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>JSON-проект</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Импорт и экспорт</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Сохраните расчёт в JSON, перенесите его на другое устройство или быстро восстановите демо-проект.
        </Text>
      </View>

      <AppCard delay={40} style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Экспорт текущего проекта</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>
          Экспорт включает категории, CAPEX, OPEX и стоимость электроэнергии. Проверка данных сейчас: {validation.score}/100.
        </Text>
        <View style={styles.actionRow}>
          <ActionButton label="Поделиться JSON" onPress={shareExport} />
          <ActionButton label="Проверить данные" secondary onPress={() => router.push('/it-cost/validation' as Href)} />
        </View>
        <TextInput
          value={exportJson}
          editable={false}
          multiline
          scrollEnabled
          style={local.codeBox}
          maxFontSizeMultiplier={1.05}
        />
      </AppCard>

      <AppCard delay={80} style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Импорт проекта</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>
          Вставьте JSON из экспорта. После успешного импорта текущий расчёт будет заменён и сохранён локально.
        </Text>
        <TextInput
          value={importText}
          onChangeText={setImportText}
          placeholder="Вставьте JSON проекта сюда"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          style={[local.codeBox, local.importBox]}
          maxFontSizeMultiplier={1.05}
        />
        {message ? <Text style={local.message} maxFontSizeMultiplier={1.12}>{message}</Text> : null}
        <View style={styles.actionRow}>
          <ActionButton label="Импортировать" onPress={importProject} />
          <ActionButton label="Очистить поле" secondary onPress={() => setImportText('')} />
        </View>
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  codeBox: {
    minHeight: 160,
    maxHeight: 260,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    padding: spacing.md,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  importBox: {
    minHeight: 190,
    backgroundColor: colors.surface,
  },
  message: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});
