import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { projectStyles as styles } from '../../features/project/styles';
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
import { colors, radius, spacing } from '../../shared/theme';
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
}: {
  title: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <AppCard style={local.cardGap}>
      <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>{title}</Text>
      <View style={local.optionList}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <AnimatedPressable
              key={option.value}
              onPress={() => onChange(option.value)}
              pressedScale={0.98}
              style={[local.optionButton, active && local.optionButtonActive]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[local.optionTitle, active && local.optionTitleActive]} maxFontSizeMultiplier={1.1}>
                  {option.label}
                </Text>
                {option.description ? (
                  <Text style={local.optionText} maxFontSizeMultiplier={1.1}>{option.description}</Text>
                ) : null}
              </View>
              {active ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </AnimatedPressable>
          );
        })}
      </View>
    </AppCard>
  );
}

function ToggleSetting({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <AnimatedPressable
      onPress={() => onChange(!value)}
      pressedScale={0.98}
      style={[local.toggleRow, value && local.optionButtonActive]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={local.optionTitle} maxFontSizeMultiplier={1.1}>{label}</Text>
        <Text style={local.optionText} maxFontSizeMultiplier={1.1}>{description}</Text>
      </View>
      <Ionicons
        name={value ? 'toggle' : 'toggle-outline'}
        size={34}
        color={value ? colors.primary : colors.textMuted}
      />
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
}: {
  label: string;
  description: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const normalized = Number.isFinite(value) ? value : min;
  const change = (direction: -1 | 1) => {
    const next = Math.min(max, Math.max(min, normalized + step * direction));
    onChange(Number(next.toFixed(2)));
  };

  return (
    <View style={local.stepperRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={local.optionTitle} maxFontSizeMultiplier={1.1}>{label}</Text>
        <Text style={local.optionText} maxFontSizeMultiplier={1.1}>{description}</Text>
      </View>
      <View style={local.stepperControls}>
        <AnimatedPressable onPress={() => change(-1)} style={local.stepperButton} pressedScale={0.95}>
          <Text style={local.stepperButtonText}>−</Text>
        </AnimatedPressable>
        <Text style={local.stepperValue} maxFontSizeMultiplier={1.05}>{normalized}{suffix}</Text>
        <AnimatedPressable onPress={() => change(1)} style={local.stepperButton} pressedScale={0.95}>
          <Text style={local.stepperButtonText}>+</Text>
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
  const { appSettings, exchangeRates, setAppSettings, refreshExchangeRates, isRefreshingRates } = useData();

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
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
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
      />

      <OptionGroup
        title="Размер интерфейса"
        value={appSettings.uiDensity}
        options={densityOptions}
        onChange={(uiDensity) => setAppSettings({ uiDensity })}
      />

      <OptionGroup
        title="Стартовый экран"
        value={appSettings.startScreen}
        options={startScreenOptions}
        onChange={(startScreen) => setAppSettings({ startScreen })}
      />

      <OptionGroup
        title="Валюта отображения"
        value={appSettings.currency}
        options={currencyOptions}
        onChange={handleCurrencyChange}
      />

      <AppCard style={local.cardGap}>
        <View style={local.cardHeaderRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Курсы валют</Text>
            <Text style={local.optionText} maxFontSizeMultiplier={1.1}>
              Источник: {exchangeRates.source || 'ЦБ РФ'} · обновлено: {formatDateTime(exchangeRates.updatedAt)}
            </Text>
          </View>
          <AnimatedPressable
            onPress={handleRefreshRates}
            disabled={isRefreshingRates}
            pressedScale={0.97}
            style={[local.smallAction, isRefreshingRates && local.disabledAction]}
          >
            {isRefreshingRates ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="refresh" size={18} color={colors.primary} />
            )}
            <Text style={local.smallActionText} maxFontSizeMultiplier={1.05}>
              {isRefreshingRates ? 'Обновляем' : 'Обновить'}
            </Text>
          </AnimatedPressable>
        </View>

        <View style={local.rateGrid}>
          <View style={local.rateBox}>
            <Text style={local.rateTitle} maxFontSizeMultiplier={1.08}>USD</Text>
            <Text style={local.rateValue} maxFontSizeMultiplier={1.08}>{formatExchangeRate('USD', exchangeRates)}</Text>
          </View>
          <View style={local.rateBox}>
            <Text style={local.rateTitle} maxFontSizeMultiplier={1.08}>EUR</Text>
            <Text style={local.rateValue} maxFontSizeMultiplier={1.08}>{formatExchangeRate('EUR', exchangeRates)}</Text>
          </View>
        </View>

        {selectedCurrencyNeedsRate ? (
          <View style={local.warningBox}>
            <Ionicons name="warning-outline" size={18} color="#b45309" />
            <Text style={local.warningText} maxFontSizeMultiplier={1.1}>
              Для выбранной валюты курс ещё не загружен. Нажмите “Обновить”, иначе суммы будут показаны без пересчёта.
            </Text>
          </View>
        ) : null}

        {exchangeRates.error ? (
          <View style={local.warningBox}>
            <Ionicons name="cloud-offline-outline" size={18} color="#b45309" />
            <Text style={local.warningText} maxFontSizeMultiplier={1.1}>{exchangeRates.error}</Text>
          </View>
        ) : null}

        <ToggleSetting
          label="Обновлять курс при запуске"
          description="Если курс устарел, приложение попробует обновить его автоматически."
          value={appSettings.refreshRatesOnStart}
          onChange={(refreshRatesOnStart) => setAppSettings({ refreshRatesOnStart })}
        />
      </AppCard>

      <OptionGroup
        title="Округление сумм"
        value={appSettings.roundingMode}
        options={roundingOptions}
        onChange={(roundingMode) => setAppSettings({ roundingMode })}
      />

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Предпросмотр сумм</Text>
        <Text style={local.previewValue} maxFontSizeMultiplier={1.14}>
          {formatCurrencyPreview(
            { currency: appSettings.currency, roundingMode: appSettings.roundingMode },
            exchangeRates
          )}
        </Text>
        <Text style={local.optionText} maxFontSizeMultiplier={1.1}>
          Пример показывает, как 125 000 ₽ будут отображаться в меню, отчётах, графиках и расчётных разделах.
        </Text>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Параметры расчётов</Text>
        <StepperSetting
          label="Горизонт расчёта"
          description="Используется в TCO/графиках и сравнении горизонта владения."
          value={appSettings.calculationHorizonYears}
          suffix=" г."
          min={1}
          max={10}
          step={1}
          onChange={(calculationHorizonYears) => setAppSettings({ calculationHorizonYears })}
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
        />
      </AppCard>

      <OptionGroup
        title="Тип отчёта"
        value={appSettings.reportMode}
        options={reportModeOptions}
        onChange={(reportMode) => setAppSettings({ reportMode })}
      />

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Состав отчёта</Text>
        <ToggleSetting
          label="Показывать графики"
          description="Добавляет в HTML/Markdown блоки финансовых графиков и структуры затрат."
          value={appSettings.reportIncludeCharts}
          onChange={(reportIncludeCharts) => setAppSettings({ reportIncludeCharts })}
        />
        <ToggleSetting
          label="Показывать риски"
          description="Добавляет предупреждения и рекомендации по качеству данных."
          value={appSettings.reportIncludeRisks}
          onChange={(reportIncludeRisks) => setAppSettings({ reportIncludeRisks })}
        />
        <ToggleSetting
          label="Показывать историю"
          description="Добавляет последние действия проекта в итоговую выгрузку."
          value={appSettings.reportIncludeHistory}
          onChange={(reportIncludeHistory) => setAppSettings({ reportIncludeHistory })}
        />
        <ToggleSetting
          label="Показывать пустые разделы"
          description="Не скрывать таблицы без позиций."
          value={appSettings.reportIncludeEmptySections}
          onChange={(reportIncludeEmptySections) => setAppSettings({ reportIncludeEmptySections })}
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
        />
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Безопасность действий</Text>
        <ToggleSetting
          label="Подтверждать удаление"
          description="Одиночное удаление в каталогах будет выполняться через окно подтверждения."
          value={appSettings.confirmDelete}
          onChange={(confirmDelete) => setAppSettings({ confirmDelete })}
        />
        <ToggleSetting
          label="Автобэкап перед опасными действиями"
          description="Создаёт резервную копию перед очисткой, шаблоном и восстановлением."
          value={appSettings.autoBackupBeforeDangerousActions}
          onChange={(autoBackupBeforeDangerousActions) => setAppSettings({ autoBackupBeforeDangerousActions })}
        />
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Импорт CSV</Text>
        <ToggleSetting
          label="Требовать предпросмотр"
          description="CSV сначала показывается в предпросмотре, затем подтверждается."
          value={appSettings.csvRequirePreview}
          onChange={(csvRequirePreview) => setAppSettings({ csvRequirePreview })}
        />
        <ToggleSetting
          label="Автоматически объединять дубли"
          description="После CSV-импорта одинаковые позиции будут объединены."
          value={appSettings.csvAutoMergeDuplicates}
          onChange={(csvAutoMergeDuplicates) => setAppSettings({ csvAutoMergeDuplicates })}
        />
      </AppCard>

      <OptionGroup
        title="Раздел CSV по умолчанию"
        value={appSettings.csvDefaultSection}
        options={csvDefaultSectionOptions}
        onChange={(csvDefaultSection) => setAppSettings({ csvDefaultSection })}
      />

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Обновления приложения</Text>
        <ToggleSetting
          label="Проверять обновления при запуске"
          description="На стартовом экране можно автоматически проверять GitHub при открытии приложения."
          value={appSettings.checkUpdatesOnStart}
          onChange={(checkUpdatesOnStart) => setAppSettings({ checkUpdatesOnStart })}
        />
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
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
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionButtonActive: {
    borderColor: 'rgba(59,130,246,0.35)',
    backgroundColor: colors.primarySoft,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  optionTitleActive: {
    color: colors.primary,
  },
  previewValue: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  optionText: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  stepperRow: {
    minHeight: 70,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
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
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
  },
  stepperButtonText: {
    color: colors.primary,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '900',
  },
  stepperValue: {
    minWidth: 62,
    textAlign: 'center',
    color: colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  smallAction: {
    minHeight: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  smallActionText: {
    color: colors.primary,
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
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  rateTitle: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rateValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 3,
  },
  warningBox: {
    borderRadius: radius.md,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    color: '#92400e',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  toggleRow: {
    minHeight: 66,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
