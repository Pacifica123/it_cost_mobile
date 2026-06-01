import { SafeAreaView, Text, View } from 'react-native';

import { type Article, formatMoney, lineTotal } from '../logic/calcInfrastructureTotals';
import { styles } from '../styles';
import { AppButton } from './AppButton';
import { Chip } from './Chip';
import { AnimatedPressable, AnimatedScreenScroll, AnimatedSurface } from '../../../shared/ui';

export function InfrastructureArticleDetails({
  article,
  itemCount,
  total,
  onBack,
  onAddItem,
  onEditArticle,
  onDeleteArticle,
  onEditItem,
  onDeleteItem,
}: {
  article: Article;
  itemCount: number;
  total: number;
  onBack: () => void;
  onAddItem: () => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (articleId: string) => void;
  onEditItem: (item: Article['items'][number]) => void;
  onDeleteItem: (itemId: string) => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <AnimatedScreenScroll contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, styles.headerCard]}>
          <View style={styles.detailHeader}>
            <AnimatedPressable onPress={onBack} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>←</Text>
            </AnimatedPressable>

            <View style={styles.headerContent}>
              <Text style={styles.h1} numberOfLines={1} ellipsizeMode="tail">
                {article.name}
              </Text>

              <View style={styles.chipsRow}>
                <Chip
                  text={article.expenseType === 'capital' ? 'Капитальные' : 'Операционные'}
                  tone={article.expenseType === 'capital' ? 'blue' : 'green'}
                />
                <Chip text={article.hasQuantity ? 'С количеством' : 'Без количества'} />
              </View>

              <Text style={styles.muted}>
                {itemCount} записей • {formatMoney(total)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionsRow}>
            <AppButton title="Добавить запись" onPress={onAddItem} />
            <AppButton title="Редактировать" variant="ghost" onPress={() => onEditArticle(article)} />
          </View>

          <AnimatedPressable onPress={() => onDeleteArticle(article.id)} style={styles.deleteLink}>
            <Text style={styles.deleteLinkText}>Удалить статью</Text>
          </AnimatedPressable>
        </View>

        {article.items.length === 0 ? (
          <AnimatedSurface style={styles.empty}>
            <Text style={styles.emptyTitle}>Пока нет записей</Text>
            <Text style={styles.emptyText}>Нажми “Добавить запись”, чтобы заполнить статью.</Text>
          </AnimatedSurface>
        ) : (
          article.items.map((item) => {
            const itemTotal = lineTotal(article, item);
            return (
              <AnimatedSurface key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  {article.hasQuantity && (
                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>Количество</Text>
                      <Text style={styles.metaValue}>{item.quantity}</Text>
                    </View>
                  )}

                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Стоимость</Text>
                    <Text style={styles.metaValue}>{formatMoney(itemTotal)}</Text>
                    {article.hasQuantity && (
                      <Text style={styles.metaSub}>за ед.: {formatMoney(item.price)}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBtns}>
                  <AppButton title="Редактировать" variant="ghost" onPress={() => onEditItem(item)} />
                  <AppButton title="Удалить" variant="danger" onPress={() => onDeleteItem(item.id)} />
                </View>
              </AnimatedSurface>
            );
          })
        )}
      </AnimatedScreenScroll>
    </SafeAreaView>
  );
}
