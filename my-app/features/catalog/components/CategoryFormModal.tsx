import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCatalogStyles } from '../styles';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';
import { useThemePalette, colors, type ThemePalette } from '../../../shared/theme';
import type { CategoryMode } from '../../../store/data/types';

export function CategoryFormModal(props: {
  visible: boolean;
  title?: string;
  name: string;
  showMode: boolean;
  mode: CategoryMode;
  onChangeName: (value: string) => void;
  onChangeMode: (value: CategoryMode) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const localStyles = useLocalStyles();

  const styles = useCatalogStyles();

  const { visible, title = 'Новая категория', name, showMode, mode, onChangeName, onChangeMode, onSave, onClose } = props;
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

            <Text style={[styles.label, { color: palette.textSoft }]}>Название</Text>
            <TextInput
              placeholder="Например: Серверы"
              value={name}
              onChangeText={onChangeName}
              style={[styles.input, { color: palette.text, backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}
              placeholderTextColor={palette.textMuted}
            />

            {showMode ? (
              <>
                <Text style={[styles.label, { color: palette.textSoft }]}>Тип затрат</Text>
                <View style={[styles.pickerWrap, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
                  <Picker selectedValue={mode} onValueChange={(value) => onChangeMode(value)} style={[styles.picker, { color: palette.text, backgroundColor: palette.surfaceMuted }]}>
                    <Picker.Item label="Периодические" value="periodic" />
                    <Picker.Item label="Разовые" value="oneTime" />
                  </Picker>
                </View>
              </>
            ) : null}

            <View style={styles.modalButtons}>
              <AnimatedPressable style={[styles.primaryBtn, { backgroundColor: palette.primary }]} onPress={onSave}>
                <Text style={[styles.primaryBtnText, { color: palette.textOnDark }]}>Добавить</Text>
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
});

const localStyles = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : localStyles), [palette]);
}
