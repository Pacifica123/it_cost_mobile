import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useData } from '../data/DataContext';


type Equipment = {
  id: string;
  category: string;
  name: string;
  quantity: number;
  price: number;
};

export const options = {
  title: 'Капитальные затраты', 
};

export default function ExploreScreen() {
  // Данные категорий и записей
//   const [categories, setCategories] = useState<string[]>([
//     'Серверное оборудование',
//     'Сетевое оборудование',
//     'Клиентское оборудование',
//     'Лицензии ПО',
//   ]);
//
//   const [data, setData] = useState<Equipment[]>([
//     { id: '1', category: 'Серверное оборудование', name: 'Сервер HP', quantity: 5, price: 50000 },
//     { id: '2', category: 'Сетевое оборудование', name: 'TEST', quantity: 1, price: 3 },
//     { id: '3', category: 'Клиентское оборудование', name: 'ПК Dell', quantity: 10, price: 30000 },
//     { id: '4', category: 'Лицензии ПО', name: 'MS Windows 11 Pro', quantity: 1, price: 20000 },
//   ]);
  const { capitalData, setCapitalData } = useData();

  const categories = Array.from(new Set(capitalData.map(item => item.category)));


  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Серверное оборудование');

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Добавление или редактирование записи
  const saveItem = () => {
    if (!name || !quantity || !price) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newItem: Equipment = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      category,
      name,
      quantity: Number(quantity),
      price: Number(price),
    };

    if (editingItem) {
      setCapitalData(capitalData.map(item => (item.id === editingItem.id ? newItem : item)));
    } else {
      setCapitalData([...capitalData, newItem]);
    }

    resetForm();  // ← вызов внешней функции
    setModalVisible(false);  // ← теперь выполнится
  };

  // ВЫНЕСИ resetForm НА УРОВЕНЬ КОМПОНЕНТА (после saveItem)
  const resetForm = () => {
    setEditingItem(null);
    setName('');
    setQuantity('');
    setPrice('');
    setCategory(categories[0] || 'Серверное оборудование');
  };


  const editItem = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity.toString());
    setPrice(item.price.toString());
    setCategory(item.category);
    setModalVisible(true);
  };

  const deleteItem = (id: string) => {
    Alert.alert('Удаление', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () =>
        setCapitalData(capitalData.filter(item => item.id !== id))
      },
    ]);
    setSelectedItem(null);
  };


  // Добавление новой категории
//   const addCategory = () => {
//     const trimmed = newCategoryName.trim();
//     if (!trimmed) return;
//     if (categories.includes(trimmed)) {
//       Alert.alert('Ошибка', 'Такая категория уже существует');
//       return;
//     }
//     setCategories([...categories, trimmed]);
//     setNewCategoryName('');
//     setCategoryModalVisible(false);
//   };
  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || categories.includes(trimmed)) {
      Alert.alert('Ошибка', 'Такая категория уже существует или поле пустое');
      setNewCategoryName('');
      setCategoryModalVisible(false);
      return;
    }

    // Обновляем capitalData с новой категорией (добавляем фиктивную запись или просто обновляем состояние)
    const newItem = {
      id: Date.now().toString(),
      category: trimmed,
      name: 'Новая категория',
      quantity: 0,
      price: 0
    };
    setCapitalData([...capitalData, newItem]);

    setNewCategoryName('');
    setCategoryModalVisible(false);
  };

  // Рендер таблицы для категории
  const renderCategory = (categoryName: string) => {
//     const categoryData = data.filter(item => item.category === categoryName);
    const categoryData = capitalData.filter(item => item.category === categoryName);


    return (
      <View key={categoryName} style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.cell}>Наименование</Text>
          <Text style={styles.cell}>Количество</Text>
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
            <Text style={styles.cell}>{item.quantity}</Text>
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
              placeholder="Количество"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
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


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginBottom: 15 },
  addButtonText: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  categoryContainer: { marginBottom: 30 },
  categoryTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderColor: '#000' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc', paddingHorizontal: 5 },
  cell: { flex: 1, textAlign: 'center' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, flexWrap: 'wrap' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: '#fff', margin: 20, borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
