import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Equipment = {
    id: string;
    category: string;
    name: string;
    quantity: number;
    price: number;
};

const initialData: Equipment[] = [
    { id: '1', category: 'Серверное оборудование', name: 'Сервер HP', quantity: 5, price: 50000 },
{ id: '2', category: 'Сетевое оборудование', name: 'TEST', quantity: 1, price: 3 },
{ id: '3', category: 'Клиентское оборудование', name: 'ПК Dell', quantity: 10, price: 30000 },
{ id: '4', category: 'Лицензии ПО', name: 'MS Windows 11 Pro', quantity: 1, price: 20000 },
];

export const options = {
    title: 'Капитальные затраты',
};

export default function SimpleSumScreen() {
    const [data] = useState<Equipment[]>(initialData);

    // суммируем quantity всех записей из data
    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <View style={styles.container}>
        <Text style={styles.number}>{totalQuantity}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    number: {
        fontSize: 36,
        fontWeight: 'bold',
    },
});
