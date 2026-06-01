import { ArticleFormModal } from '../../features/infrastructure/components/ArticleFormModal';
import { ConfirmModal } from '../../features/infrastructure/components/ConfirmModal';
import { InfrastructureArticleDetails } from '../../features/infrastructure/components/InfrastructureArticleDetails';
import { InfrastructureArticleList } from '../../features/infrastructure/components/InfrastructureArticleList';
import { ItemFormModal } from '../../features/infrastructure/components/ItemFormModal';
import { useInfrastructureState } from '../../features/infrastructure/hooks/useInfrastructureState';

export const title = 'ИТ-инфраструктура';

export default function ItInfrastructureScreen() {
  const state = useInfrastructureState();

  return (
    <>
      {state.selectedArticle ? (
        <InfrastructureArticleDetails
          article={state.selectedArticle}
          itemCount={state.selectedTotals.count}
          total={state.selectedTotals.sum}
          onBack={() => state.setSelectedArticleId(null)}
          onAddItem={state.openCreateItem}
          onEditArticle={state.openEditArticle}
          onDeleteArticle={state.askDeleteArticle}
          onEditItem={state.openEditItem}
          onDeleteItem={state.askDeleteItem}
        />
      ) : (
        <InfrastructureArticleList
          articles={state.articles}
          onAddArticle={state.openCreateArticle}
          onSelectArticle={state.setSelectedArticleId}
          onEditArticle={state.openEditArticle}
          onDeleteArticle={state.askDeleteArticle}
        />
      )}

      <ArticleFormModal
        visible={state.articleModalVisible}
        editingArticleId={state.editingArticleId}
        articleName={state.articleForm.articleName}
        expenseType={state.articleForm.expenseType}
        hasQuantity={state.articleForm.hasQuantity}
        setArticleName={(articleName) => state.setArticleForm((current) => ({ ...current, articleName }))}
        setExpenseType={(expenseType) => state.setArticleForm((current) => ({ ...current, expenseType }))}
        setHasQuantity={(hasQuantity) => state.setArticleForm((current) => ({ ...current, hasQuantity }))}
        onSave={state.saveArticle}
        onClose={state.closeArticleModal}
      />

      <ItemFormModal
        visible={state.itemModalVisible}
        editingItemId={state.editingItemId}
        hasQuantity={Boolean(state.selectedArticle?.hasQuantity)}
        form={state.itemForm}
        onChange={(patch) => state.setItemForm((current) => ({ ...current, ...patch }))}
        onSave={state.saveItem}
        onClose={state.closeItemModal}
      />

      <ConfirmModal
        visible={!!state.confirm}
        title={state.confirm?.title ?? ''}
        message={state.confirm?.message ?? ''}
        confirmText={state.confirm?.confirmText}
        danger={state.confirm?.danger ?? true}
        onCancel={() => state.setConfirm(null)}
        onConfirm={() => state.confirm?.onConfirm()}
      />
    </>
  );
}
