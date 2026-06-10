import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useThemePalette } from '../../../shared/theme';
import { useElectricityStyles } from '../styles';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';

export function EditPowerModal(props: {
  visible: boolean;
  editPower: string;
  onChangePower: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const styles = useElectricityStyles();
  const palette = useThemePalette();
  const { visible, editPower, onChangePower, onClose, onSave } = props;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <View style={styles.modalCenterWrap} pointerEvents="box-none">
          <AnimatedSurface style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalTitle}>Максимальная мощность (Вт)</Text>

              <TextInput
                value={editPower}
                onChangeText={onChangePower}
                keyboardType="numeric"
                style={styles.input}
                placeholder="Напр. 450"
                placeholderTextColor={palette.textMuted}
                autoFocus
              />

              <View style={styles.modalActions}>
                <AnimatedPressable onPress={onClose} style={styles.modalBtnSecondary}>
                  <Text style={styles.modalBtnSecondaryText}>Отмена</Text>
                </AnimatedPressable>
                <AnimatedPressable onPress={onSave} style={styles.modalBtnPrimary}>
                  <Text style={styles.modalBtnPrimaryText}>Сохранить</Text>
                </AnimatedPressable>
              </View>
            </ScrollView>
          </AnimatedSurface>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
