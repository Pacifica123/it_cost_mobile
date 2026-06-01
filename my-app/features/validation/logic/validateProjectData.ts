import type { DataState } from '../../../store/data/types';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationIssue = {
  id: string;
  severity: ValidationSeverity;
  area: 'Проект' | 'CAPEX' | 'OPEX' | 'Категории' | 'Электроэнергия';
  title: string;
  description: string;
};

export type ValidationReport = {
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
  canCalculate: boolean;
  score: number;
  summary: string;
};

const hasText = (value: string) => value.trim().length > 0;

export function validateProjectData(state: DataState): ValidationReport {
  const issues: ValidationIssue[] = [];
  const categoryIds = new Set(state.categories.map((category) => category.id));


  if (!state.projectMeta?.name?.trim()) {
    issues.push({
      id: 'project-name-empty',
      severity: 'warning',
      area: 'Проект',
      title: 'Название проекта не заполнено',
      description: 'Название помогает отличать расчёты при экспорте и импорте.',
    });
  }

  if (state.projectMeta && (!Number.isFinite(state.projectMeta.budget) || state.projectMeta.budget < 0)) {
    issues.push({
      id: 'project-budget-invalid',
      severity: 'error',
      area: 'Проект',
      title: 'Некорректный бюджет проекта',
      description: 'Бюджет не должен быть отрицательным.',
    });
  }

  if (state.projectMeta && state.projectMeta.budget > 0) {
    const capexTotal = state.capitalData.reduce((sum, item) => sum + item.quantity * item.price, 0);
    if (capexTotal > state.projectMeta.budget) {
      issues.push({
        id: 'project-budget-exceeded',
        severity: 'warning',
        area: 'Проект',
        title: 'CAPEX превышает бюджет проекта',
        description: `Капитальные затраты выше указанного бюджета на ${Math.round(capexTotal - state.projectMeta.budget)} ₽.`,
      });
    }
  }

  if (!state.categories.length) {
    issues.push({
      id: 'categories-empty',
      severity: 'error',
      area: 'Категории',
      title: 'Нет категорий затрат',
      description: 'Без категорий нельзя корректно сгруппировать CAPEX и OPEX в отчёте.',
    });
  }

  state.categories.forEach((category, index) => {
    if (!hasText(category.name)) {
      issues.push({
        id: `category-name-${index}`,
        severity: 'error',
        area: 'Категории',
        title: 'Пустое название категории',
        description: 'Заполните название категории или удалите её.',
      });
    }

    if (category.scope === 'operating' && category.mode !== 'oneTime' && category.mode !== 'periodic') {
      issues.push({
        id: `category-mode-${category.id}`,
        severity: 'warning',
        area: 'Категории',
        title: `Не указан режим OPEX для категории «${category.name || category.id}»`,
        description: 'Укажите, является ли категория разовой или периодической, иначе годовой отчёт может быть неточным.',
      });
    }
  });

  if (!state.capitalData.length) {
    issues.push({
      id: 'capex-empty',
      severity: 'warning',
      area: 'CAPEX',
      title: 'CAPEX пустой',
      description: 'Добавьте хотя бы одну позицию оборудования или ПО, чтобы расчёт не был формальным.',
    });
  }

  state.capitalData.forEach((item) => {
    if (!hasText(item.name)) {
      issues.push({
        id: `capex-name-${item.id}`,
        severity: 'error',
        area: 'CAPEX',
        title: 'Позиция CAPEX без названия',
        description: 'Название нужно для отчёта, GA и объяснения выбранной конфигурации.',
      });
    }
    if (!categoryIds.has(item.categoryId)) {
      issues.push({
        id: `capex-category-${item.id}`,
        severity: 'error',
        area: 'CAPEX',
        title: `CAPEX «${item.name || item.id}» ссылается на удалённую категорию`,
        description: 'Выберите существующую категорию или создайте новую.',
      });
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      issues.push({
        id: `capex-quantity-${item.id}`,
        severity: 'error',
        area: 'CAPEX',
        title: `Некорректное количество у «${item.name || item.id}»`,
        description: 'Количество должно быть больше нуля.',
      });
    }
    if (!Number.isFinite(item.price) || item.price < 0) {
      issues.push({
        id: `capex-price-${item.id}`,
        severity: 'error',
        area: 'CAPEX',
        title: `Некорректная цена у «${item.name || item.id}»`,
        description: 'Цена не должна быть отрицательной.',
      });
    }
    if (item.kind !== 'hardware' && item.kind !== 'software') {
      issues.push({
        id: `capex-kind-${item.id}`,
        severity: 'warning',
        area: 'CAPEX',
        title: `Не определён тип ТО/ПО у «${item.name || item.id}»`,
        description: 'Для отчёта лучше явно разделить позицию на техническое оборудование или программное обеспечение.',
      });
    }
  });

  state.operatingData.forEach((item) => {
    if (!hasText(item.name)) {
      issues.push({
        id: `opex-name-${item.id}`,
        severity: 'error',
        area: 'OPEX',
        title: 'Позиция OPEX без названия',
        description: 'Название нужно для расшифровки эксплуатационных затрат.',
      });
    }
    if (!categoryIds.has(item.categoryId)) {
      issues.push({
        id: `opex-category-${item.id}`,
        severity: 'error',
        area: 'OPEX',
        title: `OPEX «${item.name || item.id}» ссылается на удалённую категорию`,
        description: 'Выберите существующую OPEX-категорию или создайте новую.',
      });
    }
    if (!Number.isFinite(item.price) || item.price < 0) {
      issues.push({
        id: `opex-price-${item.id}`,
        severity: 'error',
        area: 'OPEX',
        title: `Некорректная сумма OPEX у «${item.name || item.id}»`,
        description: 'Сумма эксплуатационных затрат не должна быть отрицательной.',
      });
    }
  });

  if (!Number.isFinite(state.electricityTotal) || state.electricityTotal < 0) {
    issues.push({
      id: 'electricity-negative',
      severity: 'error',
      area: 'Электроэнергия',
      title: 'Некорректная стоимость электроэнергии',
      description: 'Ежемесячная стоимость электроэнергии не должна быть отрицательной.',
    });
  } else if (state.electricityTotal === 0) {
    issues.push({
      id: 'electricity-zero',
      severity: 'info',
      area: 'Электроэнергия',
      title: 'Электроэнергия не рассчитана',
      description: 'Это не блокирует расчёт, но для TCO лучше учесть энергопотребление оборудования.',
    });
  }

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const infos = issues.filter((issue) => issue.severity === 'info');
  const penalty = errors.length * 22 + warnings.length * 8 + infos.length * 3;
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const canCalculate = errors.length === 0;

  const summary = canCalculate
    ? warnings.length
      ? 'Критических ошибок нет, но перед итоговой выгрузкой лучше закрыть предупреждения.'
      : 'Данные выглядят корректно для расчётов и отчёта.'
    : 'Есть критические ошибки. Исправьте их перед расчётом GA/AHP/NPV и формированием итогового отчёта.';

  return {
    issues,
    errors,
    warnings,
    infos,
    canCalculate,
    score,
    summary,
  };
}
