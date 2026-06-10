import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useProjectStyles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import type {
  AppCurrency,
  AppReportMode,
  AppRoundingMode,
  AppStartScreen,
  AppThemeMode,
  AppUiDensity,
  CsvDefaultSection,
} from '../../store/data/types';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing, useThemePalette, type ThemePalette } from '../../shared/theme';
import { getUiDensityValueFor } from '../../shared/utils/appPreferences';
import { formatCurrencyPreview, formatExchangeRate, getCurrencyRate } from '../../shared/utils/currency';

export const title = 'Настройки';

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

const themeOptions: Option<AppThemeMode>[] = [
  { value: 'system', label: 'Системная', description: 'Использовать настройку устройства.' },
  { value: 'light', label: 'Светлая', description: 'Классический светлый интерфейс.' },
  { value: 'dark', label: 'Тёмная', description: 'Тёмная палитра для поддерживаемых экранов.' },
];

const densityOptions: Option<AppUiDensity>[] = [
  { value: 'compact', label: 'Компактный', description: 'Меньше отступов и плотнее карточки.' },
  { value: 'comfortable', label: 'Обычный', description: 'Баланс между плотностью и читаемостью.' },
  { value: 'large', label: 'Крупный', description: 'Больше воздуха и крупнее элементы.' },
];

const startScreenOptions: Option<AppStartScreen>[] = [
  { value: 'home', label: 'Главная', description: 'Приветственный экран с быстрым доступом.' },
  { value: 'itMenu', label: 'Меню ИТ', description: 'Сразу открывать список модулей.' },
  { value: 'dashboard', label: 'Сводка проекта', description: 'Начинать с состояния проекта.' },
  { value: 'quickStart', label: 'Быстрый расчёт', description: 'Открывать пошаговый сценарий.' },
];

const currencyOptions: Option<AppCurrency>[] = [
  { value: 'RUB', label: '₽ Рубли', description: 'Базовая валюта ввода данных.' },
  { value: 'USD', label: '$ Доллары', description: 'Отображение сумм по загруженному курсу.' },
  { value: 'EUR', label: '€ Евро', description: 'Отображение сумм по загруженному курсу.' },
];

const roundingOptions: Option<AppRoundingMode>[] = [
  { value: 'none', label: 'Без округления' },
  { value: 'rubles', label: 'До целых' },
  { value: 'thousands', label: 'До тысяч' },
];

const reportModeOptions: Option<AppReportMode>[] = [
  { value: 'short', label: 'Краткий', description: 'Только паспорт, итоги и вывод.' },
  { value: 'full', label: 'Полный', description: 'Все показатели, проверки и таблицы.' },
  { value: 'finance', label: 'Финансовый', description: 'Акцент на CAPEX/OPEX, TCO и графиках.' },
  { value: 'technical', label: 'Технический', description: 'Акцент на составе инфраструктуры и рисках.' },
];

const csvDefaultSectionOptions: Option<CsvDefaultSection>[] = [
  { value: 'CAPEX', label: 'CAPEX', description: 'Неизвестные строки считать капитальными затратами.' },
  { value: 'OPEX', label: 'OPEX', description: 'Неизвестные строки считать операционными затратами.' },
  { value: 'HARDWARE', label: 'ТО', description: 'Класть в техническое оборудование.' },
  { value: 'SOFTWARE', label: 'ПО', description: 'Класть в программное обеспечение.' },
];

function OptionGroup<T extends string>({
  title,
  value,
  options,
  onChange,
  density,
}: {
  title: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  density: AppUiDensity;
}) {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  const palette = useThemePalette();
  const rowMinHeight = getUiDensityValueFor(density, 48, 58, 70);
  const rowPaddingVertical = getUiDensityValueFor(density, 8, 12, 16);
  const rowPaddingHorizontal = getUiDensityValueFor(density, 10, 12, 16);
  const titleSize = getUiDensityValueFor(density, 13, 14, 16);
  const titleLineHeight = getUiDensityValueFor(density, 17, 18, 21);
  const descriptionSize = getUiDensityValueFor(density, 11, 12, 13);
  const descriptionLineHeight = getUiDensityValueFor(density, 15, 17, 19);

  return (
    <AppCard style={local.cardGap}>
      <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>{title}</Text>
      <View style={local.optionList}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <AnimatedPressable
              key={option.value}
              onPress={() => onChange(option.value)}
              pressedScale={0.98}
              style={[
                local.optionButton,
                {
                  minHeight: rowMinHeight,
                  paddingHorizontal: rowPaddingHorizontal,
                  paddingVertical: rowPaddingVertical,
                },
                { backgroundColor: active ? palette.primarySoft : (palette.isDark ? '#1E293B' : palette.surfaceMuted), borderColor: active ? (palette.isDark ? 'rgba(96,165,250,0.38)' : 'rgba(59,130,246,0.35)') : palette.borderSoft },
              ]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[
                    local.optionTitle,
                    { fontSize: titleSize, lineHeight: titleLineHeight },
                    { color: active ? palette.primary : palette.text },
                  ]} maxFontSizeMultiplier={1.1}>
                  {option.label}
                </Text>
                {option.description ? (
                  <Text
                    style={[local.optionText, { fontSize: descriptionSize, lineHeight: descriptionLineHeight, color: palette.textMuted }]}
                    maxFontSizeMultiplier={1.1}
                  >
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {active ? <Ionicons name="checkmark-circle" size={20} color={palette.primary} /> : null}
            </AnimatedPressable>
          );
        })}
      </View>
    </AppCard>
  );
}

function AnimatedToggle({ value, density }: { value: boolean; density: AppUiDensity }) {
  const local = useLocalStyles();

  const palette = useThemePalette();
  const progress = useSharedValue(value ? 1 : 0);
  const trackWidth = getUiDensityValueFor(density, 46, 54, 62);
  const trackHeight = getUiDensityValueFor(density, 26, 32, 36);
  const thumbSize = getUiDensityValueFor(density, 20, 26, 30);
  const trackPadding = Math.round((trackHeight - thumbSize) / 2);
  const translateMax = trackWidth - thumbSize - trackPadding * 2;

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 220 });
  }, [progress, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [palette.surfaceMuted, palette.primarySoft]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [palette.borderSoft, palette.isDark ? 'rgba(96,165,250,0.38)' : 'rgba(59,130,246,0.35)']
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [palette.textMuted, palette.primary]
    ),
    transform: [{ translateX: progress.value * translateMax }],
  }));

  return (
    <Animated.View
      style={[
        local.switchTrack,
        { width: trackWidth, height: trackHeight, borderRadius: trackHeight / 2, padding: trackPadding },
        trackStyle,
      ]}
    >
      <Animated.View style={[local.switchThumb, { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 }, thumbStyle]} />
    </Animated.View>
  );
}

function ToggleSetting({
  label,
  description,
  value,
  onChange,
  density,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  density: AppUiDensity;
}) {
  const local = useLocalStyles();

  const palette = useThemePalette();
  const rowMinHeight = getUiDensityValueFor(density, 54, 66, 78);
  const rowPaddingVertical = getUiDensityValueFor(density, 8, 12, 16);
  const rowPaddingHorizontal = getUiDensityValueFor(density, 10, 12, 16);
  const titleSize = getUiDensityValueFor(density, 13, 14, 16);
  const titleLineHeight = getUiDensityValueFor(density, 17, 18, 21);
  const descriptionSize = getUiDensityValueFor(density, 11, 12, 13);
  const descriptionLineHeight = getUiDensityValueFor(density, 15, 17, 19);

  return (
    <AnimatedPressable
      onPress={() => onChange(!value)}
      pressedScale={0.98}
      style={[
        local.toggleRow,
        {
          minHeight: rowMinHeight,
          paddingHorizontal: rowPaddingHorizontal,
          paddingVertical: rowPaddingVertical,
        },
        { backgroundColor: value ? palette.primarySoft : (palette.isDark ? '#1E293B' : palette.surfaceMuted), borderColor: value ? (palette.isDark ? 'rgba(96,165,250,0.38)' : 'rgba(59,130,246,0.35)') : palette.borderSoft },
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[local.optionTitle, { fontSize: titleSize, lineHeight: titleLineHeight, color: palette.text }]} maxFontSizeMultiplier={1.1}>{label}</Text>
        <Text style={[local.optionText, { fontSize: descriptionSize, lineHeight: descriptionLineHeight, color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>{description}</Text>
      </View>
      <AnimatedToggle value={value} density={density} />
    </AnimatedPressable>
  );
}

function StepperSetting({
  label,
  description,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
  density,
}: {
  label: string;
  description: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  density: AppUiDensity;
}) {
  const local = useLocalStyles();

  const palette = useThemePalette();
  const normalized = Number.isFinite(value) ? value : min;
  const rowMinHeight = getUiDensityValueFor(density, 58, 70, 84);
  const rowPaddingVertical = getUiDensityValueFor(density, 8, 12, 16);
  const rowPaddingHorizontal = getUiDensityValueFor(density, 10, 12, 16);
  const titleSize = getUiDensityValueFor(density, 13, 14, 16);
  const titleLineHeight = getUiDensityValueFor(density, 17, 18, 21);
  const descriptionSize = getUiDensityValueFor(density, 11, 12, 13);
  const descriptionLineHeight = getUiDensityValueFor(density, 15, 17, 19);
  const stepperButtonSize = getUiDensityValueFor(density, 28, 32, 38);
  const valueWidth = getUiDensityValueFor(density, 54, 62, 72);
  const change = (direction: -1 | 1) => {
    const next = Math.min(max, Math.max(min, normalized + step * direction));
    onChange(Number(next.toFixed(2)));
  };

  return (
    <View style={[local.stepperRow, { minHeight: rowMinHeight, paddingHorizontal: rowPaddingHorizontal, paddingVertical: rowPaddingVertical, backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[local.optionTitle, { fontSize: titleSize, lineHeight: titleLineHeight, color: palette.text }]} maxFontSizeMultiplier={1.1}>{label}</Text>
        <Text style={[local.optionText, { fontSize: descriptionSize, lineHeight: descriptionLineHeight, color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>{description}</Text>
      </View>
      <View style={local.stepperControls}>
        <AnimatedPressable onPress={() => change(-1)} style={[local.stepperButton, { width: stepperButtonSize, height: stepperButtonSize, backgroundColor: palette.primarySoft, borderColor: palette.isDark ? 'rgba(96,165,250,0.32)' : 'rgba(59,130,246,0.2)' }]} pressedScale={0.95}>
          <Text style={[local.stepperButtonText, { color: palette.primary }]}>−</Text>
        </AnimatedPressable>
        <Text style={[local.stepperValue, { minWidth: valueWidth, color: palette.text }]} maxFontSizeMultiplier={1.05}>{normalized}{suffix}</Text>
        <AnimatedPressable onPress={() => change(1)} style={[local.stepperButton, { width: stepperButtonSize, height: stepperButtonSize, backgroundColor: palette.primarySoft, borderColor: palette.isDark ? 'rgba(96,165,250,0.32)' : 'rgba(59,130,246,0.2)' }]} pressedScale={0.95}>
          <Text style={[local.stepperButtonText, { color: palette.primary }]}>+</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const formatDateTime = (value: string | null) => {
  if (!value) return 'ещё не загружался';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'дата неизвестна';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SettingsScreen() {
  const local = useLocalStyles();

  const styles = useProjectStyles();

  const { appSettings, exchangeRates, setAppSettings, refreshExchangeRates, isRefreshingRates } = useData();
  const palette = useThemePalette();
  const density = appSettings.uiDensity;
  const screenGap = getUiDensityValueFor(density, spacing.sm, spacing.md, spacing.lg);
  const screenPadding = getUiDensityValueFor(density, spacing.md, spacing.lg, spacing.xl);

  const selectedCurrencyNeedsRate = appSettings.currency !== 'RUB' && !getCurrencyRate(appSettings.currency, exchangeRates);

  const handleRefreshRates = async () => {
    const result = await refreshExchangeRates();
    Alert.alert(result.ok ? 'Курсы обновлены' : 'Курс не обновлён', result.message);
  };

  const handleCurrencyChange = (currency: AppCurrency) => {
    setAppSettings({ currency });
    if (currency !== 'RUB' && !getCurrencyRate(currency, exchangeRates) && !isRefreshingRates) {
      void refreshExchangeRates();
    }
  };

  return (
    <AnimatedScreenScroll style={[styles.screen, { backgroundColor: palette.bg }]} contentContainerStyle={[styles.content, { padding: screenPadding, gap: screenGap }]}>
      <View style={[styles.hero, { backgroundColor: palette.hero }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Поведение приложения</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Настройки</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Управляйте интерфейсом, расчётами, отчётом, курсами валют, импортом CSV и безопасными действиями.
        </Text>
      </View>

      <OptionGroup
        title="Тема интерфейса"
        value={appSettings.themeMode}
        options={themeOptions}
        onChange={(themeMode) => setAppSettings({ themeMode })}
        density={density}
      />

      <OptionGroup
        title="Размер интерфейса"
        value={appSettings.uiDensity}
        options={densityOptions}
        onChange={(uiDensity) => setAppSettings({ uiDensity })}
        density={density}
      />

      <OptionGroup
        title="Стартовый экран"
        value={appSettings.startScreen}
        options={startScreenOptions}
        onChange={(startScreen) => setAppSettings({ startScreen })}
        density={density}
      />

      <OptionGroup
        title="Валюта отображения"
        value={appSettings.currency}
        options={currencyOptions}
        onChange={handleCurrencyChange}
        density={density}
      />

      <AppCard style={local.cardGap}>
        <View style={local.cardHeaderRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Курсы валют</Text>
            <Text style={[local.optionText, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>
              Источник: {exchangeRates.source || 'ЦБ РФ'} · обновлено: {formatDateTime(exchangeRates.updatedAt)}
            </Text>
          </View>
          <AnimatedPressable
            onPress={handleRefreshRates}
            disabled={isRefreshingRates}
            pressedScale={0.97}
            style={[local.smallAction, { backgroundColor: palette.primarySoft, borderColor: palette.borderSoft }, isRefreshingRates && local.disabledAction]}
          >
            {isRefreshingRates ? (
              <ActivityIndicator size="small" color={palette.primary} />
            ) : (
              <Ionicons name="refresh" size={18} color={palette.primary} />
            )}
            <Text style={[local.smallActionText, { color: palette.primary }]} maxFontSizeMultiplier={1.05}>
              {isRefreshingRates ? 'Обновляем' : 'Обновить'}
            </Text>
          </AnimatedPressable>
        </View>

        <View style={local.rateGrid}>
          <View style={[local.rateBox, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
            <Text style={[local.rateTitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.08}>USD</Text>
            <Text style={[local.rateValue, { color: palette.text }]} maxFontSizeMultiplier={1.08}>{formatExchangeRate('USD', exchangeRates)}</Text>
          </View>
          <View style={[local.rateBox, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
            <Text style={[local.rateTitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.08}>EUR</Text>
            <Text style={[local.rateValue, { color: palette.text }]} maxFontSizeMultiplier={1.08}>{formatExchangeRate('EUR', exchangeRates)}</Text>
          </View>
        </View>

        {selectedCurrencyNeedsRate ? (
          <View style={[local.warningBox, { backgroundColor: palette.warningSoft, borderColor: palette.isDark ? 'rgba(245,158,11,0.34)' : '#fde68a' }]}>
            <Ionicons name="warning-outline" size={18} color={palette.warning} />
            <Text style={[local.warningText, { color: palette.warning }]} maxFontSizeMultiplier={1.1}>
              Для выбранной валюты курс ещё не загружен. Нажмите “Обновить”, иначе суммы будут показаны без пересчёта.
            </Text>
          </View>
        ) : null}

        {exchangeRates.error ? (
          <View style={[local.warningBox, { backgroundColor: palette.warningSoft, borderColor: palette.isDark ? 'rgba(245,158,11,0.34)' : '#fde68a' }]}>
            <Ionicons name="cloud-offline-outline" size={18} color={palette.warning} />
            <Text style={[local.warningText, { color: palette.warning }]} maxFontSizeMultiplier={1.1}>{exchangeRates.error}</Text>
          </View>
        ) : null}

        <ToggleSetting
          label="Обновлять курс при запуске"
          description="Если курс устарел, приложение попробует обновить его автоматически."
          value={appSettings.refreshRatesOnStart}
          onChange={(refreshRatesOnStart) => setAppSettings({ refreshRatesOnStart })}
          density={density}
        />
      </AppCard>

      <OptionGroup
        title="Округление сумм"
        value={appSettings.roundingMode}
        options={roundingOptions}
        onChange={(roundingMode) => setAppSettings({ roundingMode })}
        density={density}
      />

      <AppCard style={local.cardGap}>
        <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Предпросмотр сумм</Text>
        <Text style={[local.previewValue, { color: palette.text }]} maxFontSizeMultiplier={1.14}>
          {formatCurrencyPreview(
            { currency: appSettings.currency, roundingMode: appSettings.roundingMode },
            exchangeRates
          )}
        </Text>
        <Text style={[local.optionText, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>
          Пример показывает, как 125 000 ₽ будут отображаться в меню, отчётах, графиках и расчётных разделах.
        </Text>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Параметры расчётов</Text>
        <StepperSetting
          label="Горизонт расчёта"
          description="Используется в TCO/графиках и сравнении горизонта владения."
          value={appSettings.calculationHorizonYears}
          suffix=" г."
          min={1}
          max={10}
          step={1}
          onChange={(calculationHorizonYears) => setAppSettings({ calculationHorizonYears })}
          density={density}
        />
        <StepperSetting
          label="Ставка дисконтирования"
          description="Используется для дисконтированной стоимости владения."
          value={appSettings.discountRatePercent}
          suffix="%"
          min={0}
          max={50}
          step={1}
          onChange={(discountRatePercent) => setAppSettings({ discountRatePercent })}
          density={density}
        />
        <StepperSetting
          label="Срок службы ТО"
          description="Базовый срок службы клиентского оборудования."
          value={appSettings.hardwareLifetimeMonths}
          suffix=" мес."
          min={6}
          max={120}
          step={6}
          onChange={(hardwareLifetimeMonths) => setAppSettings({ hardwareLifetimeMonths })}
          density={density}
        />
        <StepperSetting
          label="Срок службы серверов/сети"
          description="Используется для серверов, маршрутизаторов и коммутаторов."
          value={appSettings.serverLifetimeMonths}
          suffix=" мес."
          min={6}
          max={120}
          step={6}
          onChange={(serverLifetimeMonths) => setAppSettings({ serverLifetimeMonths })}
          density={density}
        />
        <StepperSetting
          label="Срок службы ПО"
          description="Используется для лицензий и подписок в амортизации."
          value={appSettings.softwareLifetimeMonths}
          suffix=" мес."
          min={1}
          max={60}
          step={1}
          onChange={(softwareLifetimeMonths) => setAppSettings({ softwareLifetimeMonths })}
          density={density}
        />
      </AppCard>

      <OptionGroup
        title="Тип отчёта"
        value={appSettings.reportMode}
        options={reportModeOptions}
        onChange={(reportMode) => setAppSettings({ reportMode })}
        density={density}
      />

      <AppCard style={local.cardGap}>
        <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Состав отчёта</Text>
        <ToggleSetting
          label="Показывать графики"
          description="Добавляет в HTML/Markdown блоки финансовых графиков и структуры затрат."
          value={appSettings.reportIncludeCharts}
          onChange={(reportIncludeCharts) => setAppSettings({ reportIncludeCharts })}
          density={density}
        />
        <ToggleSetting
          label="Показывать риски"
          description="Добавляет предупреждения и рекомендации по качеству данных."
          value={appSettings.reportIncludeRisks}
          onChange={(reportIncludeRisks) => setAppSettings({ reportIncludeRisks })}
          density={density}
        />
        <ToggleSetting
          label="Показывать историю"
          description="Добавляет последние действия проекта в итоговую выгрузку."
          value={appSettings.reportIncludeHistory}
          onChange={(reportIncludeHistory) => setAppSettings({ reportIncludeHistory })}
          density={density}
        />
        <ToggleSetting
          label="Показывать пустые разделы"
          description="Не скрывать таблицы без позиций."
          value={appSettings.reportIncludeEmptySections}
          onChange={(reportIncludeEmptySections) => setAppSettings({ reportIncludeEmptySections })}
          density={density}
        />
        <StepperSetting
          label="Минимальная готовность"
          description="Порог предупреждения перед итоговой выгрузкой."
          value={appSettings.minimumReadinessForReport}
          suffix="%"
          min={0}
          max={100}
          step={5}
          onChange={(minimumReadinessForReport) => setAppSettings({ minimumReadinessForReport })}
          density={density}
        />
        <StepperSetting
          label="Минимальное качество"
          description="Порог предупреждения по качеству данных."
          value={appSettings.minimumDataQualityForReport}
          suffix="%"
          min={0}
          max={100}
          step={5}
          onChange={(minimumDataQualityForReport) => setAppSettings({ minimumDataQualityForReport })}
          density={density}
        />
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Безопасность действий</Text>
        <ToggleSetting
          label="Подтверждать удаление"
          description="Одиночное удаление в каталогах будет выполняться через окно подтверждения."
          value={appSettings.confirmDelete}
          onChange={(confirmDelete) => setAppSettings({ confirmDelete })}
          density={density}
        />
        <ToggleSetting
          label="Автобэкап перед опасными действиями"
          description="Создаёт резервную копию перед очисткой, шаблоном и восстановлением."
          value={appSettings.autoBackupBeforeDangerousActions}
          onChange={(autoBackupBeforeDangerousActions) => setAppSettings({ autoBackupBeforeDangerousActions })}
          density={density}
        />
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Импорт CSV</Text>
        <ToggleSetting
          label="Требовать предпросмотр"
          description="CSV сначала показывается в предпросмотре, затем подтверждается."
          value={appSettings.csvRequirePreview}
          onChange={(csvRequirePreview) => setAppSettings({ csvRequirePreview })}
          density={density}
        />
        <ToggleSetting
          label="Автоматически объединять дубли"
          description="После CSV-импорта одинаковые позиции будут объединены."
          value={appSettings.csvAutoMergeDuplicates}
          onChange={(csvAutoMergeDuplicates) => setAppSettings({ csvAutoMergeDuplicates })}
          density={density}
        />
      </AppCard>

      <OptionGroup
        title="Раздел CSV по умолчанию"
        value={appSettings.csvDefaultSection}
        options={csvDefaultSectionOptions}
        onChange={(csvDefaultSection) => setAppSettings({ csvDefaultSection })}
        density={density}
      />

      <AppCard style={local.cardGap}>
        <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Обновления приложения</Text>
        <ToggleSetting
          label="Проверять обновления при запуске"
          description="На стартовом экране можно автоматически проверять GitHub при открытии приложения."
          value={appSettings.checkUpdatesOnStart}
          onChange={(checkUpdatesOnStart) => setAppSettings({ checkUpdatesOnStart })}
          density={density}
        />
      </AppCard>
    </AnimatedScreenScroll>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionButton: {
    minHeight: 58,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionButtonActive: {
    borderColor: 'rgba(59,130,246,0.35)',
    backgroundColor: theme.primarySoft,
  },
  optionTitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  optionTitleActive: {
    color: theme.primary,
  },
  previewValue: {
    color: theme.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  optionText: {
    color: theme.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  stepperRow: {
    minHeight: 70,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
  },
  stepperButtonText: {
    color: theme.primary,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '900',
  },
  stepperValue: {
    minWidth: 62,
    textAlign: 'center',
    color: theme.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  smallAction: {
    minHeight: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  smallActionText: {
    color: theme.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  disabledAction: {
    opacity: 0.7,
  },
  rateGrid: {
    gap: spacing.sm,
  },
  rateBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    padding: spacing.md,
  },
  rateTitle: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rateValue: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 3,
  },
  warningBox: {
    borderRadius: radius.md,
    backgroundColor: theme.warningSoft,
    borderWidth: 1,
    borderColor: theme.warning,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    color: theme.warning,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },

  switchTrack: {
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  switchThumb: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleRow: {
    minHeight: 66,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

const local = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : local), [palette]);
}
