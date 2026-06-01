import type { Article } from './logic/calcInfrastructureTotals';

export type ConfirmState =
  | null
  | {
      title: string;
      message: string;
      confirmText?: string;
      danger?: boolean;
      onConfirm: () => void;
    };

export type ArticleFormState = {
  articleName: string;
  expenseType: Article['expenseType'];
  hasQuantity: boolean;
};

export type ItemFormState = {
  itemName: string;
  quantity: string;
  price: string;
};
