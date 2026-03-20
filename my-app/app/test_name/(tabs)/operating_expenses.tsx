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
import { exploreStyles as styles } from '../../styles/catalog.styles';

import { useData } from '../../data/DataContext';

type Equipment = {
  id: string;
  category: string;
  name: string;
  price: number;
};

export const title = 'Операционные затраты';

export default function OperatingScreen() {
  const { operatingData, setOperatingData } = useData();

  const formatRub = (value: number | string) => {
    const n = typeof value === 'number' ? value : Number(value || 0);
    const formatted = new Intl.NumberFormat('ru-RU').format(n);
    return `${formatted} ₽`;
  };

  const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');

  const categories = useMemo(
    () => Array.from(new Set(operatingData.map((item) => item.category))),
    [operatingData]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const [name, setName] = useState('');
  const [priceRaw, setPriceRaw] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Лицензии по подписке');

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const resetForm = () => {
    setEditingItem(null);
    setName('');
    setPriceRaw('');
    setCategory(categories[0] || 'Лицензии по подписке');
  };

  const saveItem = () => {
    if (!name.trim() || !priceRaw.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newItem: Equipment = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      category,
      name: name.trim(),
      price: Number(priceRaw),
    };

    if (editingItem) {
      setOperatingData(operatingData.map((item) => (item.id === editingItem.id ? newItem : item)));
    } else {
      setOperatingData([...operatingData, newItem]);
    }

    resetForm();
    setModalVisible(false);
  };

  const editItem = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setPriceRaw(String(item.price));
    setCategory(item.category);
    setModalVisible(true);
  };

  const deleteItem = (id: string) => {
    Alert.alert('Удаление', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => setOperatingData(operatingData.filter((item) => item.id !== id)),
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

    const newItem: Equipment = {
      id: Date.now().toString(),
      category: trimmed,
      name: 'Новая категория',
      price: 0,
    };

    setOperatingData((prev) => [...prev, newItem]);
    setCategory(trimmed);

    setNewCategoryName('');
    setCategoryModalVisible(false);
  };

  const renderCategory = (categoryName: string) => {
    const categoryData = operatingData.filter((item) => item.category === categoryName);

    return (
      <View key={categoryName} style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle} numberOfLines={2}>
            {categoryName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryData.length}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.cellHeader, styles.nameCell]}>Наименование</Text>
            <Text style={[styles.cell, styles.cellHeader, styles.priceCell, styles.cellRight]}>Цена, ₽</Text>
          </View>

          {categoryData.map((item, idx) => {
            const isSelected = selectedItem?.id === item.id;

            const LeftActions = () => (
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

            const RightActions = () => (
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

            return (
              <Swipeable
                key={item.id}
                renderLeftActions={LeftActions}
                renderRightActions={RightActions}
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
                  <Text style={[styles.cell, styles.nameCell]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cell, styles.priceCell, styles.cellRight]}>
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
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Операционные затраты</Text>

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
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setModalVisible(false);
              resetForm();
            }}
          />

          <ScrollView
            contentContainerStyle={localStyles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                  dropdownIconColor={Platform.OS === 'android' ? 'rgba(17,24,39,0.75)' : undefined}
                  mode={Platform.OS === 'android' ? 'dropdown' : undefined}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Наименование</Text>
              <TextInput
                placeholder="Например: аренда сервера"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="rgba(17,24,39,0.45)"
              />

              <Text style={styles.label}>Цена</Text>
              <TextInput
                placeholder="Например: 1500"
                value={priceRaw ? new Intl.NumberFormat('ru-RU').format(Number(priceRaw)) : ''}
                onChangeText={(t) => setPriceRaw(onlyDigits(t))}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="rgba(17,24,39,0.45)"
              />

              <Text style={styles.hint}>
                Будет сохранено как: {formatRub(priceRaw || 0)}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.primaryBtn]} onPress={saveItem} activeOpacity={0.9}>
                  <Text style={styles.primaryBtnText}>Сохранить</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryBtn]}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={categoryModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setCategoryModalVisible(false);
              setNewCategoryName('');
            }}
          />

          <ScrollView
            contentContainerStyle={localStyles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Новая категория</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCategoryModalVisible(false);
                    setNewCategoryName('');
                  }}
                  style={styles.iconClose}
                >
                  <Ionicons name="close" size={20} color="rgba(17,24,39,0.65)" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Название</Text>
              <TextInput
                placeholder="Например: Подписки"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={styles.input}
                placeholderTextColor="rgba(17,24,39,0.45)"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.primaryBtn]} onPress={addCategory} activeOpacity={0.9}>
                  <Text style={styles.primaryBtnText}>Добавить</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryBtn]}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});
