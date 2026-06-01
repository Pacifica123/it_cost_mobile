import type { ExpenseCategory } from '../../../store/data/types';
import { resolveCategoryName } from '../../../store/data/selectors';

export function groupByCategory<T extends { categoryId: string }>(items: T[], categories: ExpenseCategory[]) {
  const grouped: Record<string, T[]> = {};
  for (const item of items) {
    const key = resolveCategoryName(categories, item.categoryId);
    (grouped[key] ||= []).push(item);
  }
  return grouped;
}
