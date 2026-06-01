import { Text, TextInput, View } from 'react-native';

import { styles } from '../styles';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';

export function ParamsPanel(props: {
  paramsOpen: boolean;
  setParamsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  hoursPerDay: string;
  workDaysPerMonth: string;
  pricePerKwh: string;
  setHoursPerDay: (value: string) => void;
  setWorkDaysPerMonth: (value: string) => void;
  setPricePerKwh: (value: string) => void;
  resetParams: () => void;
}) {
  const {
    paramsOpen,
    setParamsOpen,
    hoursPerDay,
    workDaysPerMonth,
    pricePerKwh,
    setHoursPerDay,
    setWorkDaysPerMonth,
    setPricePerKwh,
    resetParams,
  } = props;

  return (
    <>
      <AnimatedPressable
        onPress={() => setParamsOpen((prev) => !prev)}
        style={styles.collapseHeader}
      >
        <View style={styles.collapseHeaderMain}>
          <Text style={styles.sectionTitle1}>Параметры расчёта</Text>
          <Text style={styles.collapseSummary}>
            {hoursPerDay || '—'} ч/день • {workDaysPerMonth || '—'} дн/мес • {pricePerKwh || '—'} ₽/кВт⋅ч
          </Text>
        </View>

        <View style={styles.collapseToggle}>
          <Text style={styles.collapseToggleText}>{paramsOpen ? 'Скрыть' : 'Открыть'}</Text>
          <Text style={styles.collapseChevron}>{paramsOpen ? '▴' : '▾'}</Text>
        </View>
      </AnimatedPressable>

      {paramsOpen ? (
        <AnimatedSurface>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderText}>
              <Text style={styles.formSubtitle}>Укажи режим работы оборудования и тариф</Text>
            </View>

            <AnimatedPressable onPress={resetParams} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </AnimatedPressable>
          </View>

          <View style={styles.paramCard}>
            <View style={styles.paramCardHeader}>
              <Text style={styles.paramTitle}>Часов в рабочем дне</Text>
              <View style={styles.unitBadge}><Text style={styles.unitBadgeText}>ч</Text></View>
            </View>
            <Text style={styles.paramDescription}>Сколько часов оборудование в среднем работает за один день.</Text>
            <View style={styles.inputShell}>
              <TextInput value={hoursPerDay} onChangeText={setHoursPerDay} keyboardType="numeric" style={styles.inputStrong} placeholder="Напр. 8" placeholderTextColor="#9ca3af" />
              <Text style={styles.inputUnitText}>ч/день</Text>
            </View>
            <View style={styles.quickRow}>
              {[8, 10, 12, 24].map((value) => (
                <AnimatedPressable key={`hours-${value}`} onPress={() => setHoursPerDay(String(value))} style={[styles.quickChip, hoursPerDay === String(value) && styles.quickChipActive]}>
                  <Text style={[styles.quickChipText, hoursPerDay === String(value) && styles.quickChipTextActive]}>{value} ч</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>

          <View style={styles.paramCard}>
            <View style={styles.paramCardHeader}>
              <Text style={styles.paramTitle}>Рабочих дней в месяце</Text>
              <View style={styles.unitBadge}><Text style={styles.unitBadgeText}>дн</Text></View>
            </View>
            <Text style={styles.paramDescription}>Укажи, сколько рабочих дней учитывается в месячном расчёте.</Text>
            <View style={styles.inputShell}>
              <TextInput value={workDaysPerMonth} onChangeText={setWorkDaysPerMonth} keyboardType="numeric" style={styles.inputStrong} placeholder="Напр. 22" placeholderTextColor="#9ca3af" />
              <Text style={styles.inputUnitText}>дней</Text>
            </View>
            <View style={styles.quickRow}>
              {[20, 22, 24, 30].map((value) => (
                <AnimatedPressable key={`days-${value}`} onPress={() => setWorkDaysPerMonth(String(value))} style={[styles.quickChip, workDaysPerMonth === String(value) && styles.quickChipActive]}>
                  <Text style={[styles.quickChipText, workDaysPerMonth === String(value) && styles.quickChipTextActive]}>{value} дн</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>

          <View style={styles.paramCard}>
            <View style={styles.paramCardHeader}>
              <Text style={styles.paramTitle}>Стоимость 1 кВт⋅ч</Text>
              <View style={styles.unitBadge}><Text style={styles.unitBadgeText}>₽</Text></View>
            </View>
            <Text style={styles.paramDescription}>Тариф за электроэнергию. Можно вводить через точку или запятую.</Text>
            <View style={styles.inputShell}>
              <TextInput value={pricePerKwh} onChangeText={setPricePerKwh} keyboardType="decimal-pad" style={styles.inputStrong} placeholder="Напр. 7.2" placeholderTextColor="#9ca3af" />
              <Text style={styles.inputUnitText}>₽/кВт⋅ч</Text>
            </View>
            <View style={styles.quickRow}>
              {['5', '7.2', '8.5', '10'].map((value) => (
                <AnimatedPressable key={`tariff-${value}`} onPress={() => setPricePerKwh(value)} style={[styles.quickChip, pricePerKwh === value && styles.quickChipActive]}>
                  <Text style={[styles.quickChipText, pricePerKwh === value && styles.quickChipTextActive]}>{value} ₽</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        </AnimatedSurface>
      ) : null}
    </>
  );
}
