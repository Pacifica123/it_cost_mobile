import { Picker } from '@react-native-picker/picker';
import { KeyboardAvoidingView, Modal, Platform, Switch, Text, TextInput, View } from 'react-native';

import { styles } from '../styles';
import { AnimatedSurface } from '../../../shared/ui';
import { AppButton } from './AppButton';

export function ArticleFormModal(props: {
  visible: boolean;
  editingArticleId: string | null;
  articleName: string;
  expenseType: 'capital' | 'operating';
  hasQuantity: boolean;
  setArticleName: (value: string) => void;
  setExpenseType: (value: 'capital' | 'operating') => void;
  setHasQuantity: (value: boolean) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const {
    visible,
    editingArticleId,
    articleName,
    expenseType,
    hasQuantity,
    setArticleName,
    setExpenseType,
    setHasQuantity,
    onSave,
    onClose,
  } = props;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <AnimatedSurface style={styles.modal}>
            <Text style={styles.modalTitle}>{editingArticleId ? 'Редактировать' : 'Добавить'} статью</Text>

            <Text style={styles.label}>Название</Text>
            <TextInput
              placeholder="Например: Сеть / Серверное"
              placeholderTextColor="#9CA3AF"
              value={articleName}
              onChangeText={setArticleName}
              style={styles.input}
            />

            <Text style={styles.label}>Тип затрат</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={expenseType} onValueChange={(value) => setExpenseType(value as 'capital' | 'operating')}>
                <Picker.Item label="Капитальные" value="capital" />
                <Picker.Item label="Операционные" value="operating" />
              </Picker>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Требуется количество</Text>
              <Switch value={hasQuantity} onValueChange={setHasQuantity} />
            </View>

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
