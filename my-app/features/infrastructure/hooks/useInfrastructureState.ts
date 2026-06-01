import { useMemo, useState } from 'react';

import { type Article, type ExpenseItem, lineTotal } from '../logic/calcInfrastructureTotals';
import type { ArticleFormState, ConfirmState, ItemFormState } from '../types';
import { validateArticleName, validateItemForm } from '../logic/validation';

const createUid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialArticleForm: ArticleFormState = {
  articleName: '',
  expenseType: 'capital',
  hasQuantity: true,
};

const initialItemForm: ItemFormState = {
  itemName: '',
  quantity: '',
  price: '',
};

export function useInfrastructureState() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [articleForm, setArticleForm] = useState<ArticleFormState>(initialArticleForm);
  const [itemForm, setItemForm] = useState<ItemFormState>(initialItemForm);

  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) {
      return null;
    }

    return articles.find((article) => article.id === selectedArticleId) ?? null;
  }, [articles, selectedArticleId]);

  const selectedTotals = useMemo(() => {
    if (!selectedArticle) {
      return { sum: 0, count: 0 };
    }

    const sum = selectedArticle.items.reduce((acc, item) => acc + lineTotal(selectedArticle, item), 0);
    return { sum, count: selectedArticle.items.length };
  }, [selectedArticle]);

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArticleForm(initialArticleForm);
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemForm(initialItemForm);
  };

  const showNotice = (message: string) => {
    setConfirm({
      title: 'Ошибка',
      message,
      confirmText: 'Ок',
      danger: false,
      onConfirm: () => setConfirm(null),
    });
  };

  const openCreateArticle = () => {
    resetArticleForm();
    setArticleModalVisible(true);
  };

  const openEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setArticleForm({
      articleName: article.name,
      expenseType: article.expenseType,
      hasQuantity: article.hasQuantity,
    });
    setArticleModalVisible(true);
  };

  const closeArticleModal = () => {
    setArticleModalVisible(false);
    resetArticleForm();
  };

  const saveArticle = () => {
    const message = validateArticleName(articleForm.articleName);
    if (message) {
      showNotice(message);
      return;
    }

    const name = articleForm.articleName.trim();

    setArticles((prev) => {
      if (editingArticleId) {
        return prev.map((article) =>
          article.id === editingArticleId
            ? {
                ...article,
                name,
                expenseType: articleForm.expenseType,
                hasQuantity: articleForm.hasQuantity,
                items: articleForm.hasQuantity
                  ? article.items
                  : article.items.map((item) => ({ ...item, quantity: undefined })),
              }
            : article
        );
      }

      const nextArticle: Article = {
        id: createUid(),
        name,
        expenseType: articleForm.expenseType,
        hasQuantity: articleForm.hasQuantity,
        items: [],
      };

      return [nextArticle, ...prev];
    });

    closeArticleModal();
  };

  const askDeleteArticle = (articleId: string) => {
    setConfirm({
      title: 'Удаление',
      message: 'Удалить статью и все записи внутри?',
      onConfirm: () => {
        setArticles((prev) => prev.filter((article) => article.id !== articleId));
        setSelectedArticleId((current) => (current === articleId ? null : current));
        setConfirm(null);
      },
    });
  };

  const openCreateItem = () => {
    resetItemForm();
    setItemModalVisible(true);
  };

  const openEditItem = (item: ExpenseItem) => {
    setEditingItemId(item.id);
    setItemForm({
      itemName: item.name,
      price: String(item.price ?? ''),
      quantity: item.quantity != null ? String(item.quantity) : '',
    });
    setItemModalVisible(true);
  };

  const closeItemModal = () => {
    setItemModalVisible(false);
    resetItemForm();
  };

  const saveItem = () => {
    if (!selectedArticle) {
      return;
    }

    const message = validateItemForm(selectedArticle, itemForm);
    if (message) {
      showNotice(message);
      return;
    }

    const nextItem: ExpenseItem = {
      id: editingItemId ?? createUid(),
      name: itemForm.itemName.trim(),
      price: Number(itemForm.price),
      ...(selectedArticle.hasQuantity ? { quantity: Number(itemForm.quantity) } : {}),
    };

    setArticles((prev) =>
      prev.map((article) => {
        if (article.id !== selectedArticle.id) {
          return article;
        }

        if (editingItemId) {
          return {
            ...article,
            items: article.items.map((item) => (item.id === editingItemId ? nextItem : item)),
          };
        }

        return {
          ...article,
          items: [nextItem, ...article.items],
        };
      })
    );

    closeItemModal();
  };

  const askDeleteItem = (itemId: string) => {
    if (!selectedArticle) {
      return;
    }

    setConfirm({
      title: 'Удаление',
      message: 'Удалить запись?',
      onConfirm: () => {
        setArticles((prev) =>
          prev.map((article) =>
            article.id === selectedArticle.id
              ? { ...article, items: article.items.filter((item) => item.id !== itemId) }
              : article
          )
        );
        setConfirm(null);
      },
    });
  };

  return {
    articles,
    selectedArticle,
    selectedArticleId,
    selectedTotals,
    articleModalVisible,
    itemModalVisible,
    confirm,
    editingArticleId,
    editingItemId,
    articleForm,
    itemForm,
    setSelectedArticleId,
    setConfirm,
    setArticleForm,
    setItemForm,
    openCreateArticle,
    openEditArticle,
    closeArticleModal,
    saveArticle,
    askDeleteArticle,
    openCreateItem,
    openEditItem,
    closeItemModal,
    saveItem,
    askDeleteItem,
  };
}
