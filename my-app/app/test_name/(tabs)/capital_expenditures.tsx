import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useData } from '../../data/DataContext';
import { exploreStyles as styles } from '../../styles/catalog.styles';

type Equipment = {
  id: string;
  category: string;
  name: string;
  quantity: number;
  price: number;
};

export const title = 'Капитальные затраты';

const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');
const formatNumber = (value: string | number) => {
  const n = typeof value === 'number' ? value : Number(value || 0);
  return new Intl.NumberFormat('ru-RU').format(n);
};
// неразрывный пробел, чтобы ₽ не переносился на новую строку
const formatRub = (value: string | number) => `${formatNumber(value)} ₽`;

export default function CapitalExpendituresScreen() {
  const { capitalData, setCapitalData } = useData();

  const categories = useMemo(
    () => Array.from(new Set(capitalData.map((item) => item.category))),
    [capitalData]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const [name, setName] = useState('');
  const [quantityRaw, setQuantityRaw] = useState('');
  const [priceRaw, setPriceRaw] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Серверное оборудование');

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const resetForm = () => {
    setEditingItem(null);
    setName('');
    setQuantityRaw('');
    setPriceRaw('');
    setCategory(categories[0] || 'Серверное оборудование');
  };

  const saveItem = () => {
    if (!name.trim() || !quantityRaw.trim() || !priceRaw.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newItem: Equipment = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      category,
      name: name.trim(),
      quantity: Number(quantityRaw || 0),
      price: Number(priceRaw || 0),
    };

    if (editingItem) {
      setCapitalData(capitalData.map((item) => (item.id === editingItem.id ? newItem : item)));
    } else {
      setCapitalData([...capitalData, newItem]);
    }

    resetForm();
    setModalVisible(false);
  };

  const editItem = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setQuantityRaw(String(item.quantity ?? ''));
    setPriceRaw(String(item.price ?? ''));
    setCategory(item.category);
    setModalVisible(true);
  };

  const deleteItem = (id: string) => {
    Alert.alert('Удаление', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => setCapitalData(capitalData.filter((item) => item.id !== id)),
      },
    ]);
    setSelectedItem(null);
  };

  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || categories.includes(trimmed)) {
      Alert.alert('Ошибка', 'Такая категория уже существует или поле пустое');
      setNewCategoryName('');
      setCategoryModalVisible(false);
      return;
    }

    // чтобы категория появилась в списке — добавим «пустышку»
    const newItem: Equipment = {
      id: Date.now().toString(),
      category: trimmed,
      name: 'Новая категория',
      quantity: 0,
      price: 0,
    };

    setCapitalData((prev) => [...prev, newItem]);
    setCategory(trimmed);
    setNewCategoryName('');
    setCategoryModalVisible(false);
  };

  const renderLeftActions = (item: Equipment) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeBtn, styles.swipeEdit]}
        onPress={() => editItem(item)}
        activeOpacity={0.9}
      >
        <Ionicons name="create-outline" size={20} color="#111827" />
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = (item: Equipment) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeBtn, styles.swipeDelete]}
        onPress={() => deleteItem(item.id)}
        activeOpacity={0.9}
      >
        <Ionicons name="trash-outline" size={20} color="#7F1D1D" />
      </TouchableOpacity>
    </View>
  );

  const renderCategory = (categoryName: string) => {
    const categoryData = capitalData.filter((item) => item.category === categoryName);
    const total = categoryData.reduce((sum, x) => sum + (Number(x.quantity) || 0) * (Number(x.price) || 0), 0);

    return (
      <View key={categoryName} style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle} numberOfLines={2}>
            {categoryName}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatNumber(categoryData.length)}</Text>
          </View>
        </View>

        <Text style={localStyles.totalText}>Итого: {formatRub(total)}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.cellHeader, localStyles.nameCell]}>Наименование</Text>
            <Text style={[styles.cell, styles.cellHeader, localStyles.qtyCell, styles.cellCenter]}>Кол-во</Text>
            <Text style={[styles.cell, styles.cellHeader, localStyles.priceCell, styles.cellCenter]}>Цена</Text>
          </View>

          {categoryData.map((item, idx) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <Swipeable
                key={item.id}
                renderLeftActions={() => renderLeftActions(item)}
                renderRightActions={() => renderRightActions(item)}
                overshootLeft={false}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={[
                    styles.row,
                    idx % 2 === 1 && styles.rowAlt,
                    isSelected && styles.rowSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedItem((prev) => (prev?.id === item.id ? null : item))}
                >
                  <Text style={[styles.cell, localStyles.nameCell]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cell, localStyles.qtyCell, styles.cellCenter]} numberOfLines={1}>
                    {formatNumber(item.quantity)}
                  </Text>
                  <Text
                    style={[styles.cell, localStyles.priceCell, styles.cellCenter]}
                    numberOfLines={1}
                  >
                    {formatRub(item.price)}
                  </Text>
                </TouchableOpacity>
              </Swipeable>
            );
          })}
        </View>

        {selectedItem && selectedItem.category === categoryName && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionEdit]}
              onPress={() => editItem(selectedItem)}
              activeOpacity={0.9}
            >
              <Ionicons name="create-outline" size={18} color="#111827" />
              <Text style={styles.actionText}>Редактировать</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionDelete]}
              onPress={() => deleteItem(selectedItem.id)}
              activeOpacity={0.9}
            >
              <Ionicons name="trash-outline" size={18} color="#7F1D1D" />
              <Text style={[styles.actionText, { color: '#7F1D1D' }]}>Удалить</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Капитальные затраты</Text>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.chipBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={18} color="#111827" />
            <Text style={styles.chipText}>Запись</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chipBtn}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="folder-open-outline" size={18} color="#111827" />
            <Text style={styles.chipText}>Категория</Text>
          </TouchableOpacity>
        </View>
      </View>

      {categories.map((cat) => renderCategory(cat))}

      {/* Модальное окно записи */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setModalVisible(false);
              resetForm();
            }}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Редактировать запись' : 'Добавить запись'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.iconClose}
                activeOpacity={0.9}
              >
                <Ionicons name="close" size={20} color="rgba(17,24,39,0.65)" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Категория</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={category}
                onValueChange={(v) => setCategory(v)}
                style={styles.picker}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Наименование</Text>
            <TextInput
              placeholder="Например: сервер"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="rgba(17,24,39,0.45)"
            />

            <View style={localStyles.row2}>
              <View style={localStyles.col}>
                <Text style={styles.label}>Количество</Text>
                <TextInput
                  placeholder="Например: 2"
                  value={quantityRaw ? formatNumber(quantityRaw) : ''}
                  onChangeText={(t) => setQuantityRaw(onlyDigits(t))}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="rgba(17,24,39,0.45)"
                />
              </View>

              <View style={localStyles.col}>
                <Text style={styles.label}>Цена (₽)</Text>
                <TextInput
                  placeholder="Например: 1300"
                  value={priceRaw ? formatNumber(priceRaw) : ''}
                  onChangeText={(t) => setPriceRaw(onlyDigits(t))}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="rgba(17,24,39,0.45)"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.primaryBtn} onPress={saveItem} activeOpacity={0.9}>
                <Text style={styles.primaryBtnText}>Сохранить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryBtnText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Модальное окно для добавления категории */}
      <Modal
        visible={categoryModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setCategoryModalVisible(false);
              setNewCategoryName('');
            }}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новая категория</Text>
              <TouchableOpacity
                onPress={() => {
                  setCategoryModalVisible(false);
                  setNewCategoryName('');
                }}
                style={styles.iconClose}
                activeOpacity={0.9}
              >
                <Ionicons name="close" size={20} color="rgba(17,24,39,0.65)" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Название</Text>
            <TextInput
              placeholder="Например: Серверы"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={styles.input}
              placeholderTextColor="rgba(17,24,39,0.45)"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.primaryBtn} onPress={addCategory} activeOpacity={0.9}>
                <Text style={styles.primaryBtnText}>Добавить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  setCategoryModalVisible(false);
                  setNewCategoryName('');
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryBtnText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  // фиксируем пропорции колонок так, чтобы на мобильном «₽» не улетал на новую строку
  nameCell: { flex: 3, minWidth: 140 },
  qtyCell: { flex: 1, minWidth: 56 },
  priceCell: { flex: 1, minWidth: 92 },
  row2: {
    flexDirection: 'row',
    gap: 10,
  },
  col: { flex: 1 },
  totalText: {
    marginTop: -2,
    marginBottom: 10,
    paddingHorizontal: 4,
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(17,24,39,0.65)',
  },
});
