import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCatalogStyles } from '../styles';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';
import { useThemePalette, colors, type ThemePalette } from '../../../shared/theme';
import { formatNumber } from '../../../shared/utils/number';
import type { CategoryOption } from '../types';
import type { CatalogFormErrors } from '../hooks/useCatalogCrud';

export function ItemFormModal(props: {
  visible: boolean;
  title: string;
  categories: CategoryOption[];
  categoryId: string;
  name: string;
  quantityRaw: string;
  priceRaw: string;
  showQuantity: boolean;
  errors?: CatalogFormErrors;
  onChangeCategory: (value: string) => void;
  onChangeName: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onChangePrice: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const localStyles = useLocalStyles();

  const styles = useCatalogStyles();

  const {
    visible,
    title,
    categories,
    categoryId,
    name,
    quantityRaw,
    priceRaw,
    showQuantity,
    errors = {},
    onChangeCategory,
    onChangeName,
    onChangeQuantity,
    onChangePrice,
    onSave,
    onClose,
  } = props;
  const palette = useThemePalette();

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
          <AnimatedSurface style={[styles.modalCard, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>{title}</Text>
              <AnimatedPressable onPress={onClose} style={[styles.iconClose, { backgroundColor: palette.surfaceMuted }]}>
                <Ionicons name="close" size={20} color={palette.textMuted} />
              </AnimatedPressable>
            </View>

            <Text style={[styles.label, { color: palette.textSoft }]}>Категория</Text>
            <View style={[styles.pickerWrap, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }, errors.categoryId && styles.inputError]}>
              <Picker selectedValue={categoryId} onValueChange={onChangeCategory} style={[styles.picker, { color: palette.text, backgroundColor: palette.surfaceMuted }]}>
                {categories.map((category) => (
                  <Picker.Item key={category.id} label={category.name} value={category.id} />
                ))}
              </Picker>
            </View>
            {errors.categoryId ? <Text style={[styles.errorText, { color: palette.danger }]}>{errors.categoryId}</Text> : null}

            <Text style={[styles.label, { color: palette.textSoft }]}>Наименование</Text>
            <TextInput
              placeholder="Например: сервер"
              value={name}
              onChangeText={onChangeName}
              style={[styles.input, { color: palette.text, backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }, errors.name && styles.inputError]}
              placeholderTextColor={palette.textMuted}
            />
            {errors.name ? <Text style={[styles.errorText, { color: palette.danger }]}>{errors.name}</Text> : null}

            {showQuantity ? (
              <View style={localStyles.row2}>
                <View style={localStyles.col}>
                  <Text style={[styles.label, { color: palette.textSoft }]}>Количество</Text>
                  <TextInput
                    placeholder="Например: 2"
                    value={quantityRaw ? formatNumber(quantityRaw) : ''}
                    onChangeText={onChangeQuantity}
                    keyboardType="numeric"
                    style={[styles.input, { color: palette.text, backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }, errors.quantityRaw && styles.inputError]}
                    placeholderTextColor={palette.textMuted}
                  />
                  {errors.quantityRaw ? <Text style={[styles.errorText, { color: palette.danger }]}>{errors.quantityRaw}</Text> : null}
                </View>

                <View style={localStyles.col}>
                  <Text style={[styles.label, { color: palette.textSoft }]}>Цена (₽)</Text>
                  <TextInput
                    placeholder="Например: 1300"
                    value={priceRaw ? formatNumber(priceRaw) : ''}
                    onChangeText={onChangePrice}
                    keyboardType="numeric"
                    style={[styles.input, { color: palette.text, backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }, errors.priceRaw && styles.inputError]}
                    placeholderTextColor={palette.textMuted}
                  />
                  {errors.priceRaw ? <Text style={[styles.errorText, { color: palette.danger }]}>{errors.priceRaw}</Text> : null}
                </View>
              </View>
            ) : (
              <>
                <Text style={[styles.label, { color: palette.textSoft }]}>Цена</Text>
                <TextInput
                  placeholder="Например: 1500"
                  value={priceRaw ? formatNumber(priceRaw) : ''}
                  onChangeText={onChangePrice}
                  keyboardType="numeric"
                  style={[styles.input, { color: palette.text, backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }, errors.priceRaw && styles.inputError]}
                  placeholderTextColor={palette.textMuted}
                />
                {errors.priceRaw ? <Text style={[styles.errorText, { color: palette.danger }]}>{errors.priceRaw}</Text> : null}
              </>
            )}

            <View style={styles.modalButtons}>
              <AnimatedPressable style={[styles.primaryBtn, { backgroundColor: palette.primary }]} onPress={onSave}>
                <Text style={[styles.primaryBtnText, { color: palette.textOnDark }]}>Сохранить</Text>
              </AnimatedPressable>

              <AnimatedPressable style={[styles.secondaryBtn, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]} onPress={onClose}>
                <Text style={[styles.secondaryBtnText, { color: palette.text }]}>Отмена</Text>
              </AnimatedPressable>
            </View>
          </AnimatedSurface>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
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

const localStyles = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : localStyles), [palette]);
}
