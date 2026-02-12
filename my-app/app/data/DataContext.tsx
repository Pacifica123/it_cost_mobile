import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface DataContextType {
    capitalData: CapitalEquipment[];
    setCapitalData: React.Dispatch<React.SetStateAction<CapitalEquipment[]>>;
    operatingData: OperatingEquipment[];
    setOperatingData: React.Dispatch<React.SetStateAction<OperatingEquipment[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [capitalData, setCapitalData] = useState<CapitalEquipment[]>([
        { id: '1', category: 'Серверное оборудование', name: 'Сервер HP', quantity: 5, price: 50000 },
        { id: '2', category: 'Сетевое оборудование', name: 'TEST', quantity: 1, price: 3 },
        { id: '3', category: 'Клиентское оборудование', name: 'ПК Dell', quantity: 10, price: 30000 },
        { id: '4', category: 'Лицензии ПО', name: 'MS Windows 11 Pro', quantity: 1, price: 20000 },
    ]);

    const [operatingData, setOperatingData] = useState<OperatingEquipment[]>([
        { id: '1', category: 'Лицензии по подписке', name: 'Microsoft 365', price: 1300 },
        { id: '2', category: 'Аренда серверов', name: 'TEST', price: 0 },
        { id: '3', category: 'Миграция', name: 'TEST', price: 0 },
        { id: '4', category: 'Тестирование', name: 'TEST', price: 0 },
        { id: '5', category: 'Резервирование', name: 'TEST', price: 0 },
        { id: '6', category: 'Оплата труда', name: 'TEST', price: 0 },
        { id: '7', category: 'Администрирование серверов', name: 'TEST', price: 0 },
    ]);

    return (
        <DataContext.Provider value={{ capitalData, setCapitalData, operatingData, setOperatingData }}>
        {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};
