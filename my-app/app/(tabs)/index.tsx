import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();


  const blocks = [
    { id: '1', title: 'Капитальные затраты', route: '/(tabs)/capital_expenditures' },
    { id: '2', title: 'Операционные затраты', route: '/operating_expenses' },
    { id: '3', title: 'ИТ-инфрастуктура', route: '/(tabs)/settings' },
    { id: '4', title: 'Электроэнергия', route: '/(tabs)/settings' },
    { id: '5', title: 'NPV-анализ', route: '/(tabs)/NPV' },
    { id: '6', title: 'AHP-анализ конфигураций', route: '/(tabs)/ahp' },
  ];

  // Рендер одного блока
  const renderItem = ({ item }: { item: typeof blocks[0] }) => (
    <TouchableOpacity
      style={styles.block}
      onPress={() => router.push(item.route)}
    >
      <Text style={styles.blockText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={blocks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  list: { paddingBottom: 20 },
  block: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  blockText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
