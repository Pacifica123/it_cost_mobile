import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, View } from 'react-native';

import { styles } from '../styles';
import { AnimatedSurface } from '../../../shared/ui';
import type { ItemFormState } from '../types';
import { AppButton } from './AppButton';

export function ItemFormModal({
  visible,
  editingItemId,
  hasQuantity,
  form,
  onChange,
  onSave,
  onClose,
}: {
  visible: boolean;
  editingItemId: string | null;
  hasQuantity: boolean;
  form: ItemFormState;
  onChange: (patch: Partial<ItemFormState>) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrap}
        >
          <AnimatedSurface style={styles.modal}>
            <Text style={styles.modalTitle}>{editingItemId ? 'Редактировать' : 'Добавить'} запись</Text>

            <Text style={styles.label}>Наименование</Text>
            <TextInput
              placeholder="Например: Сервер / Роутер"
              placeholderTextColor="#9CA3AF"
              value={form.itemName}
              onChangeText={(value) => onChange({ itemName: value })}
              style={styles.input}
            />

            {hasQuantity && (
              <>
                <Text style={styles.label}>Количество</Text>
                <TextInput
                  placeholder="Например: 2"
                  placeholderTextColor="#9CA3AF"
                  value={form.quantity}
                  onChangeText={(value) => onChange({ quantity: value })}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </>
            )}

            <Text style={styles.label}>{hasQuantity ? 'Цена за единицу' : 'Стоимость'}</Text>
            <TextInput
              placeholder="Например: 500"
              placeholderTextColor="#9CA3AF"
              value={form.price}
              onChangeText={(value) => onChange({ price: value })}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <AppButton title="Сохранить" onPress={onSave} />
              <AppButton title="Отмена" variant="ghost" onPress={onClose} />
            </View>
          </AnimatedSurface>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
