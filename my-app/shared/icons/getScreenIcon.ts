import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function getScreenIcon(title: string): IoniconName {
  const t = String(title ?? '').toLowerCase();

  if (t.includes('меню')) return 'grid-outline';
  if (t.includes('быстр')) return 'rocket-outline';
  if (t.includes('шаблон')) return 'copy-outline';
  if (t.includes('истори') || t.includes('журнал')) return 'time-outline';
  if (t.includes('импорт') || t.includes('экспорт')) return 'swap-horizontal-outline';
  if (t.includes('провер')) return 'shield-checkmark-outline';
  if (t.includes('сравнен') || t.includes('метод')) return 'analytics-outline';
  if (t.includes('проект')) return 'folder-open-outline';
  if (t.includes('экспорт') || t.includes('отч')) return 'download-outline';
  if (t === 'по' || t.includes('программ')) return 'code-slash-outline';
  if (t === 'то' || t.includes('техничес')) return 'hardware-chip-outline';
  if (t.includes('генет')) return 'git-network-outline';
  if (t.includes('обосн')) return 'ribbon-outline';
  if (t.includes('капит')) return 'cash-outline';
  if (t.includes('операц')) return 'wallet-outline';
  if (t.includes('инфра') || t.includes('ит')) return 'server-outline';
  if (t.includes('элект') || t.includes('энерг')) return 'flash-outline';
  if (t.includes('npv')) return 'stats-chart-outline';
  if (t.includes('ahp')) return 'git-compare-outline';
  if (t.includes('настрой')) return 'settings-outline';

  return 'grid-outline';
}
