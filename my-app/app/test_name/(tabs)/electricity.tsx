import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// ⚠️ путь поправь под твой проект
// Важно: здесь логика получения данных "как в export.tsx": берем capitalData из контекста
import { useData } from '../../data/DataContext';
export const title = "Потребление электричество"
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

export default function ElectricityScreen() {
  const { capitalData } = useData();

  const [items, setItems] = useState<ElectricityItem[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPower, setEditPower] = useState('');

  // 1) Из "Капитальных затрат" берём name + quantity
const baseFromCapital: ElectricityItem[] = useMemo(() => {
  const isSoftware = (nameRaw: unknown) => {
    const name = String(nameRaw ?? '').toLowerCase().trim();

    // точные/частые варианты
    if (name.includes('лицензионное по')) return true;
    if (name.includes('лиценз') && name.includes('по')) return true;

    // более общий софт (если надо)
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

  // 2) Merge с сохранёнными powerW/isDeleted
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

  // 3) Сохраняем только powerW/isDeleted (name/quantity всегда берутся из capitalData)
  const persist = async (next: ElectricityItem[]) => {
    const toSave: Record<string, { powerW: number; isDeleted: boolean }> = {};
    next.forEach((it) => {
      toSave[it.id] = { powerW: it.powerW, isDeleted: Boolean(it.isDeleted) };
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
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

    setEditOpen(false);
    setEditId(null);
    setEditPower('');
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

  const result = useMemo(() => {
    const h = toNum(hoursPerDay);
    const d = toNum(workDaysPerMonth);
    const p = toNum(pricePerKwh);

    const totalKwh = items
      .filter((x) => !x.isDeleted)
      .reduce((sum, x) => sum + (x.powerW * x.quantity * h * d) / 1000, 0);

    const totalRub = totalKwh * p;

    return { totalKwh, totalRub };
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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Оборудование</Text>
      <View style={{ height: 295 }}>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
      </View>
      <View style={styles.form}>
              <Text style={styles.sectionTitle1}>Параметры</Text>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Часов в рабочем дне</Text>
            <TextInput
              value={hoursPerDay}
              onChangeText={setHoursPerDay}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Напр. 8"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Рабочих дней в месяце</Text>
            <TextInput
              value={workDaysPerMonth}
              onChangeText={setWorkDaysPerMonth}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Напр. 22"
            />
          </View>
        </View>

        {/* стоимость под ними */}
        <Text style={styles.label}>Стоимость 1 кВт⋅ч (руб.)</Text>
        <TextInput
          value={pricePerKwh}
          onChangeText={setPricePerKwh}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Напр. 7.2"
        />

        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Результаты расчёта</Text>
          <Text style={styles.resultLine}>Потребление: {result.totalKwh.toFixed(2)} кВт⋅ч</Text>
          <Text style={styles.resultLine}>Стоимость: {result.totalRub.toFixed(2)} руб.</Text>
        </View>
      </View>

      {/* Bottom sheet edit */}
      <Modal visible={editOpen} transparent animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={{ width: '100%' }}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Максимальная мощность (Вт)</Text>

              <TextInput
                value={editPower}
                onChangeText={setEditPower}
                keyboardType="numeric"
                style={styles.input}
                placeholder="Напр. 450"
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable onPress={() => setEditOpen(false)} hitSlop={10}>
                  <Text style={styles.modalLink}>Отмена</Text>
                </Pressable>

                <Pressable onPress={saveEdit} hitSlop={10}>
                  <Text style={styles.modalLink}>Сохранить</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },

  title: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  sectionTitle: { marginTop: 2, marginBottom: 4, fontSize: 14, fontWeight: '700', color: '#111827' },
  sectionTitle1: { marginTop: 10, marginBottom: 4, fontSize: 14, fontWeight: '700', color: '#111827' },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  cardPressed: { opacity: 0.75 },
  cardDeleted: { opacity: 0.55 },

  deletedText: { textDecorationLine: 'line-through' },

  cardTop: { gap: 10 },
  name: { fontSize: 16, fontWeight: '600' },

  // 2 колонки
  row2: {
    flexDirection: 'row',
    gap: 10,
  },

  // ✅ поле внутри карточки: лейбл + значение в одну линию
  fieldInline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eef2f7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
  },
  inlineLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  inlineValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginLeft: 10,
  },

  cardBottom: { marginTop: 10 },
  hint: { fontSize: 12, color: '#6b7280' },
  restore: { color: '#2563eb', fontWeight: '800' },

  form: { paddingBottom: 24 },
  label: { marginTop: 10, marginBottom: 6, color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },

  resultBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#fff',
  },
  resultTitle: { fontWeight: '800', marginBottom: 6 },
  resultLine: { marginTop: 2, color: '#111827' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
  },
  modalTitle: { fontWeight: '800', marginBottom: 10, fontSize: 16 },
  modalActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  modalLink: { color: '#2563eb', fontWeight: '800', fontSize: 16 },
});