import { formatMoney } from '../../../shared/utils/currency';

export type ExpenseItem = {
  id: string;
  name: string;
  quantity?: number;
  price: number;
};

export type Article = {
  id: string;
  name: string;
  expenseType: 'capital' | 'operating';
  hasQuantity: boolean;
  items: ExpenseItem[];
};

export { formatMoney };

export const lineTotal = (article: Article, item: ExpenseItem) => {
  const price = Number(item.price) || 0;
  if (!article.hasQuantity) return price;
  const qty = Number(item.quantity) || 0;
  return price * (qty || 0);
};
