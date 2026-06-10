import { Modal, Pressable, Text, View, type GestureResponderEvent } from 'react-native';

import { useInfrastructureStyles } from '../styles';
import { AppButton } from './AppButton';
import { AnimatedSurface } from '../../../shared/ui';

const stopModalPress = (event: GestureResponderEvent) => {
  event.stopPropagation();
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  danger = true,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const styles = useInfrastructureStyles();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.confirmOverlay} onPress={onCancel}>
        <Pressable onPress={stopModalPress}>
          <AnimatedSurface style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{title}</Text>
            <Text style={styles.confirmText}>{message}</Text>

            <View style={styles.confirmBtns}>
              <AppButton title={cancelText} variant="ghost" onPress={onCancel} />
              <AppButton title={confirmText} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} />
            </View>
          </AnimatedSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
