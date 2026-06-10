import { useMemo, useState } from 'react';
import { Alert, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useProjectStyles } from '../../features/project/styles';
import { validateProjectData } from '../../features/validation/logic/validateProjectData';
import { parseProjectCsv } from '../../features/project/logic/importCsv';
import { useData } from '../../store/data/DataContext';
import type { CapitalEquipment, OperatingEquipment } from '../../store/data/types';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, type ThemePalette, useThemePalette } from '../../shared/theme';

export const title = 'Импорт и экспорт проекта';

function ActionButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  const local = useLocalStyles();

  const styles = useProjectStyles();

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

const mergeCapitalDuplicates = (items: CapitalEquipment[]) => {
  const map = new Map<string, CapitalEquipment>();
  items.forEach((item) => {
    const key = `${item.name.trim().toLowerCase()}::${item.categoryId}::${item.kind ?? 'unknown'}::${item.price}`;
    const existing = map.get(key);
    if (existing) existing.quantity += item.quantity;
    else map.set(key, { ...item });
  });
  return Array.from(map.values());
};

const mergeOperatingDuplicates = (items: OperatingEquipment[]) => {
  const map = new Map<string, OperatingEquipment>();
  items.forEach((item) => {
    const key = `${item.name.trim().toLowerCase()}::${item.categoryId}`;
    const existing = map.get(key);
    if (existing) existing.price += item.price;
    else map.set(key, { ...item });
  });
  return Array.from(map.values());
};

export default function ProjectIoScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  const data = useData();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const [csvText, setCsvText] = useState('');
  const [csvMessage, setCsvMessage] = useState('');
  const exportJson = useMemo(() => data.getProjectExportJson(), [data]);
  const validation = useMemo(() => validateProjectData(data), [data]);
  const csvPreview = useMemo(() => csvText.trim() ? parseProjectCsv(csvText, data.categories, { defaultSection: data.appSettings.csvDefaultSection }) : null, [csvText, data.appSettings.csvDefaultSection, data.categories]);

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


  const importCsv = () => {
    const result = csvPreview ?? parseProjectCsv(csvText, data.categories, { defaultSection: data.appSettings.csvDefaultSection });
    setCsvMessage([
      `Прочитано строк: ${result.rowsRead}.`,
      `CAPEX: ${result.capitalData.length}. OPEX: ${result.operatingData.length}.`,
      ...result.warnings,
    ].join('\n'));

    if (result.capitalData.length === 0 && result.operatingData.length === 0) {
      Alert.alert('CSV не импортирован', result.warnings.join('\n') || 'Не найдено подходящих строк для импорта.');
      return;
    }

    Alert.alert('Импортировать CSV?', `Будет добавлено CAPEX: ${result.capitalData.length}, OPEX: ${result.operatingData.length}.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Импортировать',
        onPress: () => {
          if (data.appSettings.autoBackupBeforeDangerousActions) {
            data.createProjectBackup({ name: 'Автобэкап перед CSV', description: 'Создано автоматически перед импортом CSV.' });
          }
          data.setCapitalData((current) => {
            const next = [...result.capitalData, ...current];
            return data.appSettings.csvAutoMergeDuplicates ? mergeCapitalDuplicates(next) : next;
          });
          data.setOperatingData((current) => {
            const next = [...result.operatingData, ...current];
            return data.appSettings.csvAutoMergeDuplicates ? mergeOperatingDuplicates(next) : next;
          });
          setCsvText('');
          setCsvMessage('');
          Alert.alert('CSV импортирован', `Добавлено CAPEX: ${result.capitalData.length}, OPEX: ${result.operatingData.length}.`);
        },
      },
    ]);
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


      <AppCard delay={120} style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Импорт CSV</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>
          Вставьте таблицу с колонками name/название, price/цена, quantity/количество, type/раздел, category/категория. Разделы CAPEX/OPEX определяются по колонке type; если раздел не указан, применяется значение из настроек CSV.
        </Text>
        <TextInput
          value={csvText}
          onChangeText={setCsvText}
          placeholder={'name;price;quantity;type;category\nОфисный ПК;42000;5;CAPEX;Клиентское оборудование\nАдминистрирование;18000;1;OPEX;Администрирование серверов'}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          style={[local.codeBox, local.importBox]}
          maxFontSizeMultiplier={1.05}
        />
        {csvPreview ? (
          <View style={local.previewBox}>
            <Text style={local.previewTitle} maxFontSizeMultiplier={1.1}>Предпросмотр импорта</Text>
            <Text style={local.message} maxFontSizeMultiplier={1.12}>
              Строк: {csvPreview.rowsRead}. Будет добавлено CAPEX: {csvPreview.capitalData.length}, OPEX: {csvPreview.operatingData.length}.
            </Text>
            {[...csvPreview.capitalData.slice(0, 3), ...csvPreview.operatingData.slice(0, 3)].slice(0, 5).map((item) => (
              <Text key={item.id} style={local.previewRow} numberOfLines={1} maxFontSizeMultiplier={1.05}>• {item.name}</Text>
            ))}
            {csvPreview.warnings.length > 0 ? (
              <Text style={[local.message, { color: colors.warning }]} maxFontSizeMultiplier={1.12}>{csvPreview.warnings.join('\n')}</Text>
            ) : null}
          </View>
        ) : null}
        {csvMessage ? <Text style={local.message} maxFontSizeMultiplier={1.12}>{csvMessage}</Text> : null}
        <View style={styles.actionRow}>
          <ActionButton label="Импортировать CSV" onPress={importCsv} />
          <ActionButton label="Очистить CSV" secondary onPress={() => { setCsvText(''); setCsvMessage(''); }} />
        </View>
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

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  codeBox: {
    minHeight: 160,
    maxHeight: 260,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceMuted,
    color: theme.text,
    padding: spacing.md,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  importBox: {
    minHeight: 190,
    backgroundColor: theme.surface,
  },
  previewBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    padding: spacing.md,
    gap: 6,
  },
  previewTitle: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  previewRow: {
    color: theme.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  message: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
