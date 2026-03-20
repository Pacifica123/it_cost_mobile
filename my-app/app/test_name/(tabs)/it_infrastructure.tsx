import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { styles } from '../../styles/it_infrast';

type ExpenseItem = {
  id: string;
  name: string;
  quantity?: number; // кол-во, если включено
  price: number; // цена за единицу (см. расчёт ниже)
};

type Article = {
  id: string;
  name: string;
  expenseType: 'capital' | 'operating';
  hasQuantity: boolean;
  items: ExpenseItem[];
};

export const title = 'ИТ-инфраструктура';

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value);
  const s = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${s} ₽`;
};

const lineTotal = (article: Article, item: ExpenseItem) => {
  const price = Number(item.price) || 0;
  if (!article.hasQuantity) return price;
  const qty = Number(item.quantity) || 0;
  // если кол-во включено, считаем как цена * количество
  return price * (qty || 0);
};

function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'ghost' && styles.btnGhost,
        variant === 'danger' && styles.btnDanger,
        disabled && { opacity: 0.55 },
        pressed && !disabled && { transform: [{ scale: 0.99 }], opacity: 0.95 },
      ]}
    >
      <Text
        style={[
          styles.btnText,
          variant === 'ghost' && styles.btnTextGhost,
          variant === 'danger' && styles.btnTextDanger,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Chip({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'blue' | 'green' }) {
  return (
    <View
      style={[
        styles.chip,
        tone === 'neutral' && styles.chipNeutral,
        tone === 'blue' && styles.chipBlue,
        tone === 'green' && styles.chipGreen,
      ]}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function ConfirmModal({
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
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.confirmOverlay} onPress={onCancel}>
        <Pressable style={styles.confirmCard} onPress={() => {}}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmText}>{message}</Text>

          <View style={styles.confirmBtns}>
            <AppButton title={cancelText} variant="ghost" onPress={onCancel} />
            <AppButton title={confirmText} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ItInfrastructureScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // модалки
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);

  // подтверждения
  const [confirm, setConfirm] = useState<
    | null
    | {
        title: string;
        message: string;
        confirmText?: string;
        danger?: boolean;
        onConfirm: () => void;
      }
  >(null);

  // редактирование
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // поля статьи
  const [articleName, setArticleName] = useState('');
  const [expenseType, setExpenseType] = useState<'capital' | 'operating'>('capital');
  const [hasQuantity, setHasQuantity] = useState(true);

  // поля записи
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return articles.find(a => a.id === selectedArticleId) || null;
  }, [articles, selectedArticleId]);

  const selectedTotals = useMemo(() => {
    if (!selectedArticle) return { sum: 0, count: 0 };

    const sum = selectedArticle.items.reduce((acc, it) => acc + lineTotal(selectedArticle, it), 0);

    return { sum, count: selectedArticle.items.length };
  }, [selectedArticle]);

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArticleName('');
    setExpenseType('capital');
    setHasQuantity(true);
  };

  const openCreateArticle = () => {
    resetArticleForm();
    setArticleModalVisible(true);
  };

  const openEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setArticleName(article.name);
    setExpenseType(article.expenseType);
    setHasQuantity(article.hasQuantity);
    setArticleModalVisible(true);
  };

  const saveArticle = () => {
    const name = articleName.trim();
    if (!name) {
      setConfirm({
        title: 'Ошибка',
        message: 'Введите название статьи.',
        confirmText: 'Ок',
        danger: false,
        onConfirm: () => setConfirm(null),
      });
      return;
    }

    setArticles(prev => {
      if (editingArticleId) {
        return prev.map(a =>
          a.id === editingArticleId
            ? {
                ...a,
                name,
                expenseType,
                hasQuantity,
                items: hasQuantity ? a.items : a.items.map(i => ({ ...i, quantity: undefined })),
              }
            : a
        );
      }

      const newArticle: Article = {
        id: uid(),
        name,
        expenseType,
        hasQuantity,
        items: [],
      };
      return [newArticle, ...prev];
    });

    setArticleModalVisible(false);
    resetArticleForm();
  };

  const askDeleteArticle = (articleId: string) => {
    setConfirm({
      title: 'Удаление',
      message: 'Удалить статью и все записи внутри?',
      onConfirm: () => {
        setArticles(prev => prev.filter(a => a.id !== articleId));
        setSelectedArticleId(cur => (cur === articleId ? null : cur));
        setConfirm(null);
      },
    });
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemName('');
    setQuantity('');
    setPrice('');
  };

  const openCreateItem = () => {
    resetItemForm();
    setItemModalVisible(true);
  };

  const openEditItem = (item: ExpenseItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setPrice(String(item.price ?? ''));
    setQuantity(item.quantity != null ? String(item.quantity) : '');
    setItemModalVisible(true);
  };

  const saveItem = () => {
    if (!selectedArticle) return;

    const name = itemName.trim();
    const p = Number(price);
    const q = Number(quantity);

    if (!name) {
      setConfirm({
        title: 'Ошибка',
        message: 'Введите наименование.',
        confirmText: 'Ок',
        danger: false,
        onConfirm: () => setConfirm(null),
      });
      return;
    }

    if (!Number.isFinite(p) || p <= 0) {
      setConfirm({
        title: 'Ошибка',
        message: 'Введите корректную цену.',
        confirmText: 'Ок',
        danger: false,
        onConfirm: () => setConfirm(null),
      });
      return;
    }

    if (selectedArticle.hasQuantity && (!Number.isFinite(q) || q <= 0)) {
      setConfirm({
        title: 'Ошибка',
        message: 'Введите корректное количество.',
        confirmText: 'Ок',
        danger: false,
        onConfirm: () => setConfirm(null),
      });
      return;
    }

    const newItem: ExpenseItem = {
      id: editingItemId ?? uid(),
      name,
      price: p,
      ...(selectedArticle.hasQuantity ? { quantity: q } : {}),
    };

    setArticles(prev =>
      prev.map(a => {
        if (a.id !== selectedArticle.id) return a;

        if (editingItemId) {
          return {
            ...a,
            items: a.items.map(it => (it.id === editingItemId ? newItem : it)),
          };
        }

        return {
          ...a,
          items: [newItem, ...a.items],
        };
      })
    );

    setItemModalVisible(false);
    resetItemForm();
  };

  const askDeleteItem = (itemId: string) => {
    if (!selectedArticle) return;

    setConfirm({
      title: 'Удаление',
      message: 'Удалить запись?',
      onConfirm: () => {
        setArticles(prev =>
          prev.map(a => (a.id === selectedArticle.id ? { ...a, items: a.items.filter(it => it.id !== itemId) } : a))
        );
        setConfirm(null);
      },
    });
  };

  // =========================
  // UI: ДЕТАЛИ СТАТЬИ
  // =========================
  if (selectedArticle) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Верх статьи — карточка */}
          <View style={[styles.card, styles.headerCard]}>
            <View style={styles.detailHeader}>
              <Pressable
                onPress={() => setSelectedArticleId(null)}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.iconBtnText}>←</Text>
              </Pressable>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.h1} numberOfLines={1} ellipsizeMode="tail">
                  {selectedArticle.name}
                </Text>

                <View style={styles.chipsRow}>
                  <Chip
                    text={selectedArticle.expenseType === 'capital' ? 'Капитальные' : 'Операционные'}
                    tone={selectedArticle.expenseType === 'capital' ? 'blue' : 'green'}
                  />
                  <Chip text={selectedArticle.hasQuantity ? 'С количеством' : 'Без количества'} />
                </View>

                <Text style={styles.muted}>
                  {selectedTotals.count} записей • {formatMoney(selectedTotals.sum)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionsRow}>
              <AppButton title="Добавить запись" onPress={openCreateItem} />
              <AppButton title="Редактировать" variant="ghost" onPress={() => openEditArticle(selectedArticle)} />
            </View>

            <Pressable
              onPress={() => askDeleteArticle(selectedArticle.id)}
              style={({ pressed }) => [styles.deleteLink, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.deleteLinkText}>Удалить статью</Text>
            </Pressable>
          </View>

          {selectedArticle.items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Пока нет записей</Text>
              <Text style={styles.emptyText}>Нажми “Добавить запись”, чтобы заполнить статью.</Text>
            </View>
          ) : (
            selectedArticle.items.map(item => {
              const total = lineTotal(selectedArticle, item);
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    {selectedArticle.hasQuantity && (
                      <View style={styles.metaBox}>
                        <Text style={styles.metaLabel}>Количество</Text>
                        <Text style={styles.metaValue}>{item.quantity}</Text>
                      </View>
                    )}

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>Стоимость</Text>
                      <Text style={styles.metaValue}>{formatMoney(total)}</Text>
                      {selectedArticle.hasQuantity && (
                        <Text style={styles.metaSub}>за ед.: {formatMoney(item.price)}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardBtns}>
                    <AppButton title="Редактировать" variant="ghost" onPress={() => openEditItem(item)} />
                    <AppButton title="Удалить" variant="danger" onPress={() => askDeleteItem(item.id)} />
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Модалка записи */}
        <Modal visible={itemModalVisible} animationType="slide" transparent onRequestClose={() => setItemModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>{editingItemId ? 'Редактировать' : 'Добавить'} запись</Text>

                <Text style={styles.label}>Наименование</Text>
                <TextInput
                  placeholder="Например: Сервер / Роутер"
                  placeholderTextColor="#9CA3AF"
                  value={itemName}
                  onChangeText={setItemName}
                  style={styles.input}
                />

                {selectedArticle.hasQuantity && (
                  <>
                    <Text style={styles.label}>Количество</Text>
                    <TextInput
                      placeholder="Например: 2"
                      placeholderTextColor="#9CA3AF"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </>
                )}

                <Text style={styles.label}>{selectedArticle.hasQuantity ? 'Цена за единицу' : 'Стоимость'}</Text>
                <TextInput
                  placeholder="Например: 500"
                  placeholderTextColor="#9CA3AF"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <View style={styles.modalButtons}>
                  <AppButton title="Сохранить" onPress={saveItem} />
                  <AppButton
                    title="Отмена"
                    variant="ghost"
                    onPress={() => {
                      setItemModalVisible(false);
                      resetItemForm();
                    }}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Модалка статьи */}
        <Modal
          visible={articleModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setArticleModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
              <View style={styles.modal}>
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
                  <Picker selectedValue={expenseType} onValueChange={v => setExpenseType(v as 'capital' | 'operating')}>
                    <Picker.Item label="Капитальные" value="capital" />
                    <Picker.Item label="Операционные" value="operating" />
                  </Picker>
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Требуется количество</Text>
                  <Switch value={hasQuantity} onValueChange={setHasQuantity} />
                </View>

                <View style={styles.modalButtons}>
                  <AppButton title="Сохранить" onPress={saveArticle} />
                  <AppButton
                    title="Отмена"
                    variant="ghost"
                    onPress={() => {
                      setArticleModalVisible(false);
                      resetArticleForm();
                    }}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Подтверждение */}
        <ConfirmModal
          visible={!!confirm}
          title={confirm?.title ?? ''}
          message={confirm?.message ?? ''}
          confirmText={confirm?.confirmText}
          danger={confirm?.danger ?? true}
          onCancel={() => setConfirm(null)}
          onConfirm={() => confirm?.onConfirm()}
        />
      </SafeAreaView>
    );
  }

  // =========================
  // UI: СПИСОК СТАТЕЙ
  // =========================
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.listHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.h1} numberOfLines={1}>
              Статьи
            </Text>
            <Text style={styles.muted}>Статей: {articles.length}</Text>
          </View>
        </View>

        <AppButton title="Добавить статью" onPress={openCreateArticle} />

        <View style={{ height: 12 }} />

        {articles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Статей пока нет</Text>
            <Text style={styles.emptyText}>Нажми “Добавить статью”, чтобы создать первую.</Text>
          </View>
        ) : (
          articles.map(article => {
            // полезно и тут показывать сумму статьи, чтобы сразу видеть итог
            const sum = article.items.reduce((acc, it) => acc + lineTotal(article, it), 0);
            return (
              <Pressable
                key={article.id}
                onPress={() => setSelectedArticleId(article.id)}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {article.name}
                  </Text>
                  <Chip
                    text={article.expenseType === 'capital' ? 'Капитальные' : 'Операционные'}
                    tone={article.expenseType === 'capital' ? 'blue' : 'green'}
                  />
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Количество</Text>
                    <Text style={styles.metaValue}>{article.hasQuantity ? 'Нужно' : 'Не нужно'}</Text>
                  </View>
                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Записей</Text>
                    <Text style={styles.metaValue}>{article.items.length}</Text>
                    <Text style={styles.metaSub}>Итого: {formatMoney(sum)}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBtns}>
                  <AppButton title="Редактировать" variant="ghost" onPress={() => openEditArticle(article)} />
                  <AppButton title="Удалить" variant="danger" onPress={() => askDeleteArticle(article.id)} />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Модалка статьи */}
      <Modal visible={articleModalVisible} animationType="slide" transparent onRequestClose={() => setArticleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
            <View style={styles.modal}>
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
                <Picker selectedValue={expenseType} onValueChange={v => setExpenseType(v as 'capital' | 'operating')}>
                  <Picker.Item label="Капитальные" value="capital" />
                  <Picker.Item label="Операционные" value="operating" />
                </Picker>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Требуется количество</Text>
                <Switch value={hasQuantity} onValueChange={setHasQuantity} />
              </View>

              <View style={styles.modalButtons}>
                <AppButton title="Сохранить" onPress={saveArticle} />
                <AppButton
                  title="Отмена"
                  variant="ghost"
                  onPress={() => {
                    setArticleModalVisible(false);
                    resetArticleForm();
                  }}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Подтверждение */}
      <ConfirmModal
        visible={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmText={confirm?.confirmText}
        danger={confirm?.danger ?? true}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
      />
    </SafeAreaView>
  );
}
