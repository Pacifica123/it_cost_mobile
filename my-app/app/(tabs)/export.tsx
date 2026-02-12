import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from 'react-native';

import { useData } from '../data/DataContext';


type CapitalEquipment = {
    id: string;
    category: string;
    name: string;
    quantity: number;
    price: number;
};

type OperatingEquipment = {
    id: string;
    category: string;
    name: string;
    price: number;
};

// Данные капитальных затрат
// const capitalData: CapitalEquipment[] = [
//     { id: '1', category: 'Серверное оборудование', name: 'Сервер HP', quantity: 5, price: 50000 },
//     { id: '2', category: 'Сетевое оборудование', name: 'TEST', quantity: 1, price: 3 },
//     { id: '3', category: 'Клиентское оборудование', name: 'ПК Dell', quantity: 10, price: 30000 },
//     { id: '4', category: 'Лицензии ПО', name: 'MS Windows 11 Pro', quantity: 1, price: 20000 },
// ];

// Данные операционных затрат
// const operatingData: OperatingEquipment[] = [
//     { id: '1', category: 'Лицензии по подписке', name: 'Microsoft 365', price: 1300 },
//     { id: '2', category: 'Аренда серверов', name: 'TEST', price: 0 },
//     { id: '3', category: 'Миграция', name: 'TEST', price: 0 },
//     { id: '4', category: 'Тестирование', name: 'TEST', price: 0 },
//     { id: '5', category: 'Резервирование', name: 'TEST', price: 0 },
//     { id: '6', category: 'Оплата труда', name: 'TEST', price: 0 },
//     { id: '7', category: 'Администрирование серверов', name: 'TEST', price: 0 },
// ];

export const options = {
    title: 'Общая сводка',
};

export default function SummaryScreen() {
    const [showDetails, setShowDetails] = useState(false);
    const { capitalData, operatingData } = useData();

    // Определяем разовые и периодические категории операционных затрат
    const oneTimeCategories = ['Миграция', 'Тестирование'];
    const periodicCategories = [
        'Лицензии по подписке',
        'Аренда серверов',
        'Резервирование',
        'Оплата труда',
        'Администрирование серверов'
    ];

    // Фильтрация операционных данных
    const oneTimeOperating = operatingData.filter(item =>
    oneTimeCategories.includes(item.category)
    );
    const periodicOperating = operatingData.filter(item =>
    periodicCategories.includes(item.category)
    );

    // Расчеты
    const capitalTotal = capitalData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const oneTimeOperatingTotal = oneTimeOperating.reduce((sum, item) => sum + item.price, 0);
    const periodicTotal = periodicOperating.reduce((sum, item) => sum + item.price, 0);
    const electricityTotal = 0;
    const totalOneTimeExpenses = capitalTotal + oneTimeOperatingTotal;
    const grandTotal = totalOneTimeExpenses + periodicTotal + electricityTotal;

    // Форматирование чисел
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
    };

    // Группировка капитальных затрат по категориям
    const groupCapitalByCategory = () => {
        const grouped: { [key: string]: CapitalEquipment[] } = {};
        capitalData.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        return grouped;
    };

    // Группировка операционных затрат по подтипам
    const groupOperatingByType = (items: OperatingEquipment[], type: string) => {
        const grouped: { [key: string]: OperatingEquipment[] } = {};
        items.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        return grouped;
    };

    return (
        <ScrollView style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
            <Text style={styles.headerText}>Общая стоимость</Text>
        </View>

        {/* Общий итог */}
        <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Общий итог</Text>

            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Итого все разовые затраты</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalOneTimeExpenses)}</Text>
            </View>

            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Итого все периодические затраты</Text>
                <Text style={styles.summaryValue}>{formatCurrency(periodicTotal)}</Text>
            </View>

            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Затраты на электроэнергию</Text>
                <Text style={styles.summaryValue}>{formatCurrency(electricityTotal)}</Text>
            </View>

            <View style={[styles.summaryItem, styles.grandTotal]}>
                <Text style={styles.summaryLabel}>ОБЩИЙ ИТОГ</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
        </View>

        {/* Детали */}
        <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => setShowDetails(!showDetails)}
        >
            <Text style={styles.detailsToggleText}>
                {showDetails ? 'Скрыть детали' : 'Показать детали'} ▼
            </Text>
        </TouchableOpacity>

        {showDetails && (
            <View style={styles.detailsSection}>
                {/* Таблица капитальных затрат */}
                <View style={styles.tableContainer}>
                    <Text style={styles.detailsTitle}>Капитальные затраты</Text>

                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Категория</Text>
                        <Text style={styles.tableHeaderText}>Наименование</Text>
                        <Text style={styles.tableHeaderText}>Кол-во</Text>
                        <Text style={styles.tableHeaderText}>Затраты</Text>
                    </View>

                    {Object.entries(groupCapitalByCategory()).map(([category, items]) => (
                        <View key={category} style={styles.categoryGroup}>
                            <Text style={styles.categorySubtitle}>{category}</Text>
                            {items.map(item => (
                                <View key={item.id} style={styles.tableRow}>
                                <Text style={styles.tableCellSmall}>{category}</Text>
                                <Text style={styles.tableCell}>{item.name}</Text>
                                <Text style={styles.tableCellSmall}>{item.quantity}</Text>
                                <Text style={styles.tableCell}>
                                {formatCurrency(item.quantity * item.price)}
                                </Text>
                                </View>
                            ))}
                        </View>
                    ))}

                    {/* Подытоживающая строка для капитальных затрат */}
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalText}>ИТОГО КАПИТАЛЬНЫХ:</Text>
                        <Text style={styles.subtotalValue}>{formatCurrency(capitalTotal)}</Text>
                    </View>
                </View>

                {/* Таблица операционных затрат */}
                <View style={styles.tableContainer}>
                    <Text style={styles.detailsTitle}>Операционные затраты</Text>

                    {/* Разовые операционные затраты */}
                    <Text style={styles.subsectionTitle}>Разовые</Text>
                    {oneTimeOperating.length > 0 ? (
                        <>
                        {Object.entries(groupOperatingByType(oneTimeOperating, 'one-time')).map(([category, items]) => (
                            <View key={category} style={styles.categoryGroup}>
                            <Text style={styles.categorySubtitle}>{category}</Text>
                            {items.map(item => (
                                <View key={item.id} style={styles.tableRow}>
                                    <Text style={styles.tableCellSmall}>{category}</Text>
                                    <Text style={styles.tableCell}>{item.name}</Text>
                                    <Text style={styles.tableCellSmall}>1</Text>
                                    <Text style={styles.tableCell}>{formatCurrency(item.price)}</Text>
                                </View>
                            ))}
                            </View>
                        ))}
                        <View style={styles.subtotalRow}>
                            <Text style={styles.subtotalText}>ИТОГО РАЗОВЫХ:</Text>
                            <Text style={styles.subtotalValue}>{formatCurrency(oneTimeOperatingTotal)}</Text>
                        </View>
                        </>
                    ) : (
                        <Text style={styles.emptyText}>Нет данных</Text>
                    )}

                    {/* Периодические операционные затраты */}
                    <Text style={[styles.subsectionTitle, { marginTop: 20 }]}>Периодические</Text>
                    {periodicOperating.length > 0 ? (
                        <>
                        {Object.entries(groupOperatingByType(periodicOperating, 'periodic')).map(([category, items]) => (
                            <View key={category} style={styles.categoryGroup}>
                            <Text style={styles.categorySubtitle}>{category}</Text>
                            {items.map(item => (
                                <View key={item.id} style={styles.tableRow}>
                                <Text style={styles.tableCellSmall}>{category}</Text>
                                <Text style={styles.tableCell}>{item.name}</Text>
                                <Text style={styles.tableCellSmall}>1</Text>
                                <Text style={styles.tableCell}>{formatCurrency(item.price)}</Text>
                                </View>
                            ))}
                            </View>
                        ))}
                        <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalText}>ИТОГО ПЕРИОДИЧЕСКИХ:</Text>
                        <Text style={styles.subtotalValue}>{formatCurrency(periodicTotal)}</Text>
                        </View>
                        </>
                    ) : (
                        <Text style={styles.emptyText}>Нет данных</Text>
                    )}
                </View>
            </View>
        )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#A5D6A7',
        padding: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    summarySection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
        marginBottom: 8,
        borderRadius: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#333',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32',
    },
    grandTotal: {
        backgroundColor: '#E8F5E8',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    grandTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B5E20',
    },
    detailsToggle: {
        backgroundColor: '#E3F2FD',
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    detailsToggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
    },
    detailsSection: {
        padding: 20,
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1976D2',
    },
    subsectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
    },
    tableContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginBottom: 10,
    },
    tableHeaderText: {
        fontWeight: 'bold',
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
    },
    categoryGroup: {
        marginBottom: 12,
    },
    categorySubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 4,
    },
    tableCell: {
        flex: 2.5,
        fontSize: 14,
    },
    tableCellSmall: {
        flex: 1,
        fontSize: 14,
        textAlign: 'center',
    },
    subtotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#E3F2FD',
        borderRadius: 6,
        marginTop: 8,
    },
    subtotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    subtotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1565C0',
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666',
        paddingVertical: 20,
    },
});
