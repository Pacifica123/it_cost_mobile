import type { Article } from './calcInfrastructureTotals';
import type { ItemFormState } from '../types';

export function validateArticleName(name: string) {
  if (!name.trim()) {
    return 'Введите название статьи.';
  }

  return null;
}

export function validateItemForm(article: Article, form: ItemFormState) {
  if (!form.itemName.trim()) {
    return 'Введите наименование.';
  }

  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) {
    return 'Введите корректную цену.';
  }

  if (article.hasQuantity) {
    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return 'Введите корректное количество.';
    }
  }

  return null;
}
