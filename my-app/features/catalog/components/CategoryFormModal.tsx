import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { exploreStyles as styles } from '../styles';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';
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
  const { visible, title = 'Новая категория', name, showMode, mode, onChangeName, onChangeMode, onSave, onClose } = props;

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

            <Text style={styles.label}>Название</Text>
            <TextInput
              placeholder="Например: Серверы"
              value={name}
              onChangeText={onChangeName}
              style={styles.input}
              placeholderTextColor="rgba(17,24,39,0.45)"
            />

            {showMode ? (
              <>
                <Text style={styles.label}>Тип затрат</Text>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={mode} onValueChange={(value) => onChangeMode(value)} style={styles.picker}>
                    <Picker.Item label="Периодические" value="periodic" />
                    <Picker.Item label="Разовые" value="oneTime" />
                  </Picker>
                </View>
              </>
            ) : null}

            <View style={styles.modalButtons}>
              <AnimatedPressable style={styles.primaryBtn} onPress={onSave}>
                <Text style={styles.primaryBtnText}>Добавить</Text>
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
});
