import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useData } from '../../data/DataContext';
import { styles } from '../../styles/electricity.styles';

export const title = 'Электропотребление';

type ElectricityItem = {
  id: string;
  name: string;
  quantity: number;
  powerW: number;
  isDeleted?: boolean;
};

const STORAGE_KEY = 'electricity_equipment_v1';

const toNum = (s: string) => {
  const n = Number(String(s ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const onlyDigits = (s: string) => String(s ?? '').replace(/\D+/g, '');
const onlyDecimal = (s: string) => String(s ?? '').replace(/[^\d.,]+/g, '');

export default function ElectricityScreen() {
  const { capitalData } = useData();
  const tabBarHeight = useBottomTabBarHeight();

  const [items, setItems] = useState<ElectricityItem[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');

  const [equipmentOpen, setEquipmentOpen] = useState(true);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPower, setEditPower] = useState('');

  const resetParams = () => {
    setHoursPerDay('');
    setWorkDaysPerMonth('');
    setPricePerKwh('');
  };

  const baseFromCapital: ElectricityItem[] = useMemo(() => {
    const isSoftware = (nameRaw: unknown) => {
      const name = String(nameRaw ?? '').toLowerCase().trim();

      if (name.includes('лицензионное по')) return true;
      if (name.includes('лиценз') && name.includes('по')) return true;

      const softWords = [
        'software',
        'license',
        'licence',
        'лицензия',
        'лицензи',
        'подписка',
        'subscription',
        'saas',
        'cloud',
        'ос',
        'операционная система',
        'windows',
        'linux',
        'vmware',
        'microsoft 365',
        'office',
      ];

      return softWords.some((w) => name.includes(w));
    };

    return (capitalData ?? [])
      .filter((c: any) => !isSoftware(c.name))
      .map((c: any) => ({
        id: String(c.id),
        name: String(c.name),
        quantity: Number(c.quantity) || 0,
        powerW: 0,
      }));
  }, [capitalData]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const saved: Record<string, { powerW?: number; isDeleted?: boolean }> = raw
          ? JSON.parse(raw)
          : {};

        const merged = baseFromCapital.map((it) => ({
          ...it,
          powerW: Number(saved[it.id]?.powerW ?? it.powerW),
          isDeleted: Boolean(saved[it.id]?.isDeleted ?? false),
        }));

        setItems(merged);
      } catch {
        setItems(baseFromCapital);
      }
    })();
  }, [baseFromCapital]);

  const persist = async (next: ElectricityItem[]) => {
    const toSave: Record<string, { powerW: number; isDeleted: boolean }> = {};
    next.forEach((it) => {
      toSave[it.id] = { powerW: it.powerW, isDeleted: Boolean(it.isDeleted) };
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditId(null);
    setEditPower('');
  };

  const openEdit = (id: string) => {
    const found = items.find((x) => x.id === id);
    setEditId(id);
    setEditPower(found ? String(found.powerW ?? 0) : '0');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    const pw = Math.max(0, toNum(editPower));

    const next = items.map((x) => (x.id === editId ? { ...x, powerW: pw } : x));
    setItems(next);
    await persist(next);

    closeEdit();
  };

  const removeItem = async (id: string) => {
    const next = items.map((x) => (x.id === id ? { ...x, isDeleted: true } : x));
    setItems(next);
    await persist(next);
  };

  const restoreItem = async (id: string) => {
    const next = items.map((x) => (x.id === id ? { ...x, isDeleted: false } : x));
    setItems(next);
    await persist(next);
  };

  const equipmentSummary = useMemo(() => {
    const activeItems = items.filter((x) => !x.isDeleted);
    const hiddenItems = items.filter((x) => x.isDeleted);
    const totalUnits = activeItems.reduce((sum, x) => sum + x.quantity, 0);
    const totalPowerW = activeItems.reduce((sum, x) => sum + x.powerW * x.quantity, 0);

    return {
      activeCount: activeItems.length,
      hiddenCount: hiddenItems.length,
      totalUnits,
      totalPowerW,
    };
  }, [items]);

  const result = useMemo(() => {
    const h = toNum(hoursPerDay);
    const d = toNum(workDaysPerMonth);
    const p = toNum(pricePerKwh);

    const activeItems = items.filter((x) => !x.isDeleted);
    const activeCount = activeItems.length;
    const totalUnits = activeItems.reduce((sum, x) => sum + x.quantity, 0);
    const installedPowerW = activeItems.reduce((sum, x) => sum + x.powerW * x.quantity, 0);

    const totalKwh = (installedPowerW * h * d) / 1000;
    const totalRub = totalKwh * p;
    const dayKwh = (installedPowerW * h) / 1000;
    const dayRub = dayKwh * p;

    return {
      activeCount,
      totalUnits,
      installedPowerW,
      totalKwh,
      totalRub,
      dayKwh,
      dayRub,
    };
  }, [items, hoursPerDay, workDaysPerMonth, pricePerKwh]);

  const renderItem = ({ item }: { item: ElectricityItem }) => {
    return (
      <Pressable
        onPress={() => {
          if (!item.isDeleted) openEdit(item.id);
        }}
        onLongPress={() => {
          if (!item.isDeleted) removeItem(item.id);
        }}
        style={({ pressed }) => [
          styles.card,
          item.isDeleted && styles.cardDeleted,
          pressed && !item.isDeleted && styles.cardPressed,
        ]}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.name, item.isDeleted && styles.deletedText]} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.row2}>
            <View style={styles.fieldInline}>
              <Text style={styles.inlineLabel}>Кол-во</Text>
              <Text style={styles.inlineValue}>{item.quantity}</Text>
            </View>

            <View style={styles.fieldInline}>
              <Text style={styles.inlineLabel}>Макс, Вт</Text>
              <Text style={styles.inlineValue}>{item.powerW}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBottom}>
          {!item.isDeleted ? (
            <Text style={styles.hint}>Нажми — изменить мощность • Долгое нажатие — исключить</Text>
          ) : (
            <Pressable onPress={() => restoreItem(item.id)} hitSlop={10}>
              <Text style={styles.restore}>Вернуть в расчёт</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const Header = () => (
    <Pressable
      onPress={() => setEquipmentOpen((prev) => !prev)}
      style={({ pressed }) => [styles.collapseHeader, pressed && styles.collapseHeaderPressed]}
    >
      <View style={styles.collapseHeaderMain}>
        <Text style={styles.sectionTitle1}>Оборудование</Text>
        <Text style={styles.collapseSummary}>
          {equipmentSummary.activeCount} поз. • {equipmentSummary.totalUnits} ед. • {equipmentSummary.totalPowerW.toFixed(0)} Вт
          {equipmentSummary.hiddenCount ? ` • скрыто ${equipmentSummary.hiddenCount}` : ''}
        </Text>
      </View>

      <View style={styles.collapseToggle}>
        <Text style={styles.collapseToggleText}>{equipmentOpen ? 'Скрыть' : 'Открыть'}</Text>
        <Text style={styles.collapseChevron}>{equipmentOpen ? '▴' : '▾'}</Text>
      </View>
    </Pressable>
  );

  const Footer = () => (
    <View style={styles.form}>
      <Pressable
        onPress={() => setParamsOpen((prev) => !prev)}
        style={({ pressed }) => [styles.collapseHeader, pressed && styles.collapseHeaderPressed]}
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
      </Pressable>

      {paramsOpen ? (
        <>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderText}>
              <Text style={styles.formSubtitle}>Укажи режим работы оборудования и тариф</Text>
            </View>

            <Pressable onPress={resetParams} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </Pressable>
          </View>

          <View style={styles.paramCard}>
            <View style={styles.paramCardHeader}>
              <Text style={styles.paramTitle}>Часов в рабочем дне</Text>
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>ч</Text>
              </View>
            </View>

            <Text style={styles.paramDescription}>
              Сколько часов оборудование в среднем работает за один день.
            </Text>

            <View style={styles.inputShell}>
              <TextInput
                value={hoursPerDay}
                onChangeText={(t) => setHoursPerDay(onlyDigits(t))}
                keyboardType="numeric"
                style={styles.inputStrong}
                placeholder="Напр. 8"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputUnitText}>ч/день</Text>
            </View>

            <View style={styles.quickRow}>
              {[8, 10, 12, 24].map((value) => (
                <Pressable
                  key={`hours-${value}`}
                  onPress={() => setHoursPerDay(String(value))}
                  style={[styles.quickChip, hoursPerDay === String(value) && styles.quickChipActive]}
                >
                  <Text
                    style={[styles.quickChipText, hoursPerDay === String(value) && styles.quickChipTextActive]}
                  >
                    {value} ч
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.paramCard}>
            <View style={styles.paramCardHeader}>
              <Text style={styles.paramTitle}>Рабочих дней в месяце</Text>
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>дн</Text>
              </View>
            </View>

            <Text style={styles.paramDescription}>
              Укажи, сколько рабочих дней учитывается в месячном расчёте.
            </Text>

            <View style={styles.inputShell}>
              <TextInput
                value={workDaysPerMonth}
                onChangeText={(t) => setWorkDaysPerMonth(onlyDigits(t))}
                keyboardType="numeric"
                style={styles.inputStrong}
                placeholder="Напр. 22"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputUnitText}>дней</Text>
            </View>

            <View style={styles.quickRow}>
              {[20, 22, 24, 30].map((value) => (
                <Pressable
                  key={`days-${value}`}
                  onPress={() => setWorkDaysPerMonth(String(value))}
                  style={[styles.quickChip, workDaysPerMonth === String(value) && styles.quickChipActive]}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      workDaysPerMonth === String(value) && styles.quickChipTextActive,
                    ]}
                  >
                    {value} дн
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.paramCard}>
            <View style={styles.paramCardHeader}>
              <Text style={styles.paramTitle}>Стоимость 1 кВт⋅ч</Text>
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>₽</Text>
              </View>
            </View>

            <Text style={styles.paramDescription}>
              Тариф за электроэнергию. Можно вводить через точку или запятую.
            </Text>

            <View style={styles.inputShell}>
              <TextInput
                value={pricePerKwh}
                onChangeText={(t) => setPricePerKwh(onlyDecimal(t))}
                keyboardType="decimal-pad"
                style={styles.inputStrong}
                placeholder="Напр. 7.2"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputUnitText}>₽/кВт⋅ч</Text>
            </View>

            <View style={styles.quickRow}>
              {['5', '7.2', '8.5', '10'].map((value) => (
                <Pressable
                  key={`tariff-${value}`}
                  onPress={() => setPricePerKwh(value)}
                  style={[styles.quickChip, pricePerKwh === value && styles.quickChipActive]}
                >
                  <Text style={[styles.quickChipText, pricePerKwh === value && styles.quickChipTextActive]}>
                    {value} ₽
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      ) : null}

      <Pressable
        onPress={() => setResultsOpen((prev) => !prev)}
        style={({ pressed }) => [styles.resultCollapseHeader, pressed && styles.collapseHeaderPressed]}
      >
        <View style={styles.collapseHeaderMain}>
          <View style={styles.resultCollapseTitleRow}>
            <Text style={styles.resultTitle}>Результаты расчёта</Text>
            <View style={styles.resultBadge}>
              <Text style={styles.resultBadgeText}>в месяц</Text>
            </View>
          </View>

          <Text style={styles.collapseSummary}>
            {result.totalKwh.toFixed(2)} кВт⋅ч • {result.totalRub.toFixed(2)} руб. • {result.activeCount} поз.
          </Text>
        </View>

        <View style={styles.collapseToggle}>
          <Text style={styles.collapseToggleText}>{resultsOpen ? 'Скрыть' : 'Открыть'}</Text>
          <Text style={styles.collapseChevron}>{resultsOpen ? '▴' : '▾'}</Text>
        </View>
      </Pressable>

      {resultsOpen ? (
        <View style={styles.resultBox}>
          <View style={styles.resultGrid}>
            <View style={[styles.resultMetricCard, styles.resultMetricCardPrimary]}>
              <Text style={styles.resultMetricLabel}>Потребление</Text>
              <Text style={styles.resultMetricValue}>{result.totalKwh.toFixed(2)}</Text>
              <Text style={styles.resultMetricUnit}>кВт⋅ч</Text>
            </View>

            <View style={styles.resultMetricCard}>
              <Text style={styles.resultMetricLabel}>Стоимость</Text>
              <Text style={styles.resultMetricValue}>{result.totalRub.toFixed(2)}</Text>
              <Text style={styles.resultMetricUnit}>руб.</Text>
            </View>
          </View>

          <View style={styles.resultStatsRow}>
            <View style={styles.resultStatChip}>
              <Text style={styles.resultStatLabel}>Позиций</Text>
              <Text style={styles.resultStatValue}>{result.activeCount}</Text>
            </View>

            <View style={styles.resultStatChip}>
              <Text style={styles.resultStatLabel}>Единиц</Text>
              <Text style={styles.resultStatValue}>{result.totalUnits}</Text>
            </View>

            <View style={styles.resultStatChip}>
              <Text style={styles.resultStatLabel}>Мощность</Text>
              <Text style={styles.resultStatValue}>{result.installedPowerW.toFixed(0)} Вт</Text>
            </View>
          </View>

          <View style={styles.resultSubcard}>
            <Text style={styles.resultSubcardTitle}>Среднее за рабочий день</Text>
            <Text style={styles.resultSubcardText}>
              {result.dayKwh.toFixed(2)} кВт⋅ч • {result.dayRub.toFixed(2)} руб.
            </Text>
          </View>

          <Text style={styles.resultHint}>
            Расчёт: мощность × количество × часы работы × рабочие дни.
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={equipmentOpen ? items : []}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        ListEmptyComponent={equipmentOpen ? <Text style={styles.emptyText}>Нет оборудования для расчёта.</Text> : null}
        contentContainerStyle={[styles.listScreenContent, { paddingBottom: tabBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={closeEdit}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeEdit} />

          <View style={styles.modalCenterWrap} pointerEvents="box-none">
            <View style={styles.modalCard}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text style={styles.modalTitle}>Максимальная мощность (Вт)</Text>

                <TextInput
                  value={editPower}
                  onChangeText={(t) => setEditPower(onlyDigits(t))}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="Напр. 450"
                  placeholderTextColor="#9ca3af"
                  autoFocus
                />

                <View style={styles.modalActions}>
                  <Pressable onPress={closeEdit} style={styles.modalBtnSecondary}>
                    <Text style={styles.modalBtnSecondaryText}>Отмена</Text>
                  </Pressable>

                  <Pressable onPress={saveEdit} style={styles.modalBtnPrimary}>
                    <Text style={styles.modalBtnPrimaryText}>Сохранить</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
