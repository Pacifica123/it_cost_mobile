import { SafeAreaView, Text, View } from 'react-native';

import { type Article, formatMoney, lineTotal } from '../logic/calcInfrastructureTotals';
import { useInfrastructureStyles } from '../styles';
import { AppButton } from './AppButton';
import { Chip } from './Chip';
import { AnimatedScreenScroll, AnimatedSurface } from '../../../shared/ui';

export function InfrastructureArticleList({
  articles,
  onAddArticle,
  onSelectArticle,
  onEditArticle,
  onDeleteArticle,
}: {
  articles: Article[];
  onAddArticle: () => void;
  onSelectArticle: (articleId: string) => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (articleId: string) => void;
}) {
  const styles = useInfrastructureStyles();

  return (
    <SafeAreaView style={styles.safe}>
      <AnimatedScreenScroll contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.listHeader}>
          <View style={styles.grow}>
            <Text style={styles.h1} numberOfLines={1}>
              Статьи
            </Text>
            <Text style={styles.muted}>Статей: {articles.length}</Text>
          </View>
        </View>

        <AppButton title="Добавить статью" onPress={onAddArticle} />

        <View style={styles.spacerSm} />

        {articles.length === 0 ? (
          <AnimatedSurface style={styles.empty}>
            <Text style={styles.emptyTitle}>Статей пока нет</Text>
            <Text style={styles.emptyText}>Нажми “Добавить статью”, чтобы создать первую.</Text>
          </AnimatedSurface>
        ) : (
          articles.map((article) => {
            const sum = article.items.reduce((acc, item) => acc + lineTotal(article, item), 0);

            return (
              <AnimatedSurface key={article.id} style={styles.card}>
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
                  <AppButton title="Открыть" onPress={() => onSelectArticle(article.id)} />
                  <AppButton title="Редактировать" variant="ghost" onPress={() => onEditArticle(article)} />
                  <AppButton title="Удалить" variant="danger" onPress={() => onDeleteArticle(article.id)} />
                </View>
              </AnimatedSurface>
            );
          })
        )}
      </AnimatedScreenScroll>
    </SafeAreaView>
  );
}
