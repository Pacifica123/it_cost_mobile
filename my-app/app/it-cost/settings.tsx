import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { projectStyles as styles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import type { AppCurrency, AppRoundingMode, AppThemeMode } from '../../store/data/types';
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
  { value: 'dark', label: 'Тёмная', description: 'Подготовка тёмной темы для основных экранов.' },
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
          Управляйте темой, валютой, округлением и подтверждением удаления. Суммы вводятся в рублях, а USD/EUR отображаются через загруженный курс.
        </Text>
      </View>

      <OptionGroup
        title="Тема интерфейса"
        value={appSettings.themeMode}
        options={themeOptions}
        onChange={(themeMode) => setAppSettings({ themeMode })}
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
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Удаление записей</Text>
        <AnimatedPressable
          onPress={() => setAppSettings({ confirmDelete: !appSettings.confirmDelete })}
          pressedScale={0.98}
          style={[local.toggleRow, appSettings.confirmDelete && local.optionButtonActive]}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={local.optionTitle} maxFontSizeMultiplier={1.1}>Подтверждать удаление</Text>
            <Text style={local.optionText} maxFontSizeMultiplier={1.1}>
              Если выключить, одиночное удаление в каталогах будет выполняться без окна подтверждения.
            </Text>
          </View>
          <Ionicons
            name={appSettings.confirmDelete ? 'toggle' : 'toggle-outline'}
            size={34}
            color={appSettings.confirmDelete ? colors.primary : colors.textMuted}
          />
        </AnimatedPressable>
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
