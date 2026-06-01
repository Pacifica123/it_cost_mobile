import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { exploreStyles as styles } from '../styles';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';
import { formatNumber } from '../../../shared/utils/number';
import type { CategoryOption } from '../types';

export function ItemFormModal(props: {
  visible: boolean;
  title: string;
  categories: CategoryOption[];
  categoryId: string;
  name: string;
  quantityRaw: string;
  priceRaw: string;
  showQuantity: boolean;
  onChangeCategory: (value: string) => void;
  onChangeName: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onChangePrice: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const {
    visible,
    title,
    categories,
    categoryId,
    name,
    quantityRaw,
    priceRaw,
    showQuantity,
    onChangeCategory,
    onChangeName,
    onChangeQuantity,
    onChangePrice,
    onSave,
    onClose,
  } = props;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <ScrollView
          contentContainerStyle={localStyles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AnimatedSurface style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <AnimatedPressable onPress={onClose} style={styles.iconClose}>
                <Ionicons name="close" size={20} color="rgba(17,24,39,0.65)" />
              </AnimatedPressable>
            </View>

            <Text style={styles.label}>Категория</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={categoryId} onValueChange={onChangeCategory} style={styles.picker}>
                {categories.map((category) => (
                  <Picker.Item key={category.id} label={category.name} value={category.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Наименование</Text>
            <TextInput
              placeholder="Например: сервер"
              value={name}
              onChangeText={onChangeName}
              style={styles.input}
              placeholderTextColor="rgba(17,24,39,0.45)"
            />

            {showQuantity ? (
              <View style={localStyles.row2}>
                <View style={localStyles.col}>
                  <Text style={styles.label}>Количество</Text>
                  <TextInput
                    placeholder="Например: 2"
                    value={quantityRaw ? formatNumber(quantityRaw) : ''}
                    onChangeText={onChangeQuantity}
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
                    onChangeText={onChangePrice}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor="rgba(17,24,39,0.45)"
                  />
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Цена</Text>
                <TextInput
                  placeholder="Например: 1500"
                  value={priceRaw ? formatNumber(priceRaw) : ''}
                  onChangeText={onChangePrice}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="rgba(17,24,39,0.45)"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <AnimatedPressable style={styles.primaryBtn} onPress={onSave}>
                <Text style={styles.primaryBtnText}>Сохранить</Text>
              </AnimatedPressable>

              <AnimatedPressable style={styles.secondaryBtn} onPress={onClose}>
                <Text style={styles.secondaryBtnText}>Отмена</Text>
              </AnimatedPressable>
            </View>
          </AnimatedSurface>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
});
