import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, Button, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { exploreStyles as styles } from '../styles/catalog.styles';

import { useData } from '../data/DataContext';


type Equipment = {
  id: string;
  category: string;
  name: string;
  price: number;
};

export const options = {
  title: 'Операционные затраты', 
};

export default function OperatingScreen() {
  // Данные категорий и записей
//   const [categories, setCategories] = useState<string[]>([
//     'Лицензии по подписке',
//     'Аренда серверов',
//     'Миграция',
//     'Тестирование',
//     'Резервирование',
//     'Оплата труда',
//     'Администрирование серверов',
//   ]);
//
//   const [data, setData] = useState<Equipment[]>([
//     { id: '1', category: 'Лицензии по подписке', name: 'Microsoft 365', price: 1300 },
//     { id: '2', category: 'Аренда серверов', name: 'TEST',  price: 0 },
//     { id: '3', category: 'Миграция', name: 'TEST',  price: 0},
//     { id: '4', category: 'Тестирование', name: 'TEST',  price: 0 },
//     { id: '5', category: 'Резервирование', name: 'TEST',  price: 0 },
//     { id: '6', category: 'Оплата труда', name: 'TEST',  price: 0},
//     { id: '7', category: 'Администрирование серверов', name: 'TEST',  price: 0 },
//   ]);
  const { operatingData, setOperatingData } = useData();
  const categories = Array.from(new Set(operatingData.map(item => item.category)));

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0]);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Добавление или редактирование записи
  const saveItem = () => {
    if (!name || !price) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newItem: Equipment = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      category,
      name,
      price: Number(price),
    };

    if (editingItem) {
      setOperatingData(operatingData.map(item => (item.id === editingItem.id ? newItem : item)));
    } else {
      setOperatingData([...operatingData, newItem]);
    }

    resetForm();
    setModalVisible(false);
  };

  const editItem = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setModalVisible(true);
  };

  const deleteItem = (id: string) => {
    Alert.alert('Удаление', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () =>
        setOperatingData(operatingData.filter(item => item.id !== id))
      },
    ]);
    setSelectedItem(null);
  };

  const resetForm = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory(categories[0] || 'Лицензии по подписке');
  };

  // Добавление новой категории
  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      Alert.alert('Ошибка', 'Такая категория уже существует');
      return;
    }
    setCategories([...categories, trimmed]);
    setNewCategoryName('');
    setCategoryModalVisible(false);
  };

  // Рендер таблицы для категории
  const renderCategory = (categoryName: string) => {
//     const categoryData = data.filter(item => item.category === categoryName);
    const categoryData = operatingData.filter(item => item.category === categoryName);

    return (
      <View key={categoryName} style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.cell}>Наименование</Text>
          <Text style={styles.cell}>Цена</Text>
        </View>

        {categoryData.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.row,
              selectedItem?.id === item.id && { backgroundColor: '#e0f7fa' },
            ]}
            onPress={() => setSelectedItem(item)}
          >
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.price}</Text>
          </TouchableOpacity>
        ))}

        {selectedItem && selectedItem.category === categoryName && (
          <View style={styles.actionButtons}>
            <Button title="Редактировать" onPress={() => editItem(selectedItem)} />
            <Button title="Удалить" color="red" onPress={() => deleteItem(selectedItem.id)} />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Добавить запись</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#2196F3', marginBottom: 20 }]}
        onPress={() => setCategoryModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Добавить категорию</Text>
      </TouchableOpacity>

      {categories.map(cat => renderCategory(cat))}

      {/* Модальное окно записи */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingItem ? 'Редактировать' : 'Добавить'} запись</Text>

            <Text>Категория:</Text>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={{ marginVertical: 10 }}
            >
              {categories.map(cat => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>

            <TextInput
              placeholder="Наименование"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Цена"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button title="Сохранить" onPress={saveItem} />
              <Button title="Отмена" color="red" onPress={() => { setModalVisible(false); resetForm(); }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно для добавления категории */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Добавить новую категорию</Text>
            <TextInput
              placeholder="Название категории"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button title="Добавить" onPress={addCategory} />
              <Button title="Отмена" color="red" onPress={() => { setCategoryModalVisible(false); setNewCategoryName(''); }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


