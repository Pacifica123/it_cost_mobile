import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, Text, View } from 'react-native';

import { EditPowerModal } from '../../features/electricity/components/EditPowerModal';
import { ElectricityFooter } from '../../features/electricity/components/ElectricityFooter';
import { ElectricityHeader } from '../../features/electricity/components/ElectricityHeader';
import { EquipmentCard } from '../../features/electricity/components/EquipmentCard';
import { useElectricityState } from '../../features/electricity/hooks/useElectricityState';
import { useData } from '../../store/data/DataContext';
import { styles } from '../../features/electricity/styles';

export const title = 'Электропотребление';

export default function ElectricityScreen() {
  const { capitalData, setElectricityTotal } = useData();
  const insets = useSafeAreaInsets();
  const electricity = useElectricityState(capitalData);

  useEffect(() => {
    setElectricityTotal(electricity.result.totalRub);
  }, [electricity.result.totalRub, setElectricityTotal]);

  return (
    <View style={styles.container}>
      <FlatList
        data={electricity.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EquipmentCard
            item={item}
            onEdit={electricity.openEdit}
            onRemove={electricity.removeItem}
            onRestore={electricity.restoreItem}
          />
        )}
        ListHeaderComponent={<ElectricityHeader items={electricity.items} />}
        ListFooterComponent={
          <ElectricityFooter
            paramsOpen={electricity.paramsOpen}
            setParamsOpen={electricity.setParamsOpen}
            hoursPerDay={electricity.hoursPerDay}
            workDaysPerMonth={electricity.workDaysPerMonth}
            pricePerKwh={electricity.pricePerKwh}
            setHoursPerDay={electricity.setHoursPerDay}
            setWorkDaysPerMonth={electricity.setWorkDaysPerMonth}
            setPricePerKwh={electricity.setPricePerKwh}
            resetParams={electricity.resetParams}
            resultsOpen={electricity.resultsOpen}
            setResultsOpen={electricity.setResultsOpen}
            result={electricity.result}
          />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Нет оборудования для расчёта.</Text>}
        contentContainerStyle={[styles.listScreenContent, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <EditPowerModal
        visible={electricity.editOpen}
        editPower={electricity.editPower}
        onChangePower={electricity.setEditPower}
        onClose={electricity.closeEdit}
        onSave={electricity.saveEdit}
      />
    </View>
  );
}
