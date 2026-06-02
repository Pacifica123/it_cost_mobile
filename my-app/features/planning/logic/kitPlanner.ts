import type { CapitalEquipment, OperatingEquipment } from '../../../store/data/types';

export type KitProfile = 'minimal' | 'balanced' | 'performance';

export type KitBuilderInput = {
  seats: number;
  budget: number;
  profile: KitProfile;
  needServer: boolean;
  useCloud: boolean;
  needPrinting: boolean;
  needWifi: boolean;
  needBackup: boolean;
};

export type KitPlanItem = {
  name: string;
  categoryId: string;
  quantity: number;
  price: number;
  kind?: 'hardware' | 'software';
};

export type KitPlan = {
  profile: KitProfile;
  title: string;
  description: string;
  capitalItems: KitPlanItem[];
  operatingItems: Array<Omit<KitPlanItem, 'quantity' | 'kind'>>;
  capexTotal: number;
  monthlyOpex: number;
  annualOpex: number;
  totalFirstYear: number;
  fitsBudget: boolean;
  budgetDelta: number;
  risks: string[];
};

const profileLabels: Record<KitProfile, string> = {
  minimal: 'Минимальный',
  balanced: 'Сбалансированный',
  performance: 'Производительный',
};

const profileDescriptions: Record<KitProfile, string> = {
  minimal: 'Минимальные стартовые затраты: базовые ПК, обязательное ПО и простая сеть.',
  balanced: 'Баланс стоимости, надёжности и удобства сопровождения.',
  performance: 'Более дорогие рабочие места, усиленная сеть и запас по производительности.',
};

const round = (value: number) => Math.max(0, Math.round(value));

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const normalizedSeats = (seats: number) => Math.max(1, Math.round(Number.isFinite(seats) ? seats : 1));
const normalizedBudget = (budget: number) => Math.max(0, Math.round(Number.isFinite(budget) ? budget : 0));

export const getProfileLabel = (profile: KitProfile) => profileLabels[profile] ?? profileLabels.balanced;

function workstationPrice(profile: KitProfile) {
  if (profile === 'minimal') return 36000;
  if (profile === 'performance') return 72000;
  return 48000;
}

function officeLicensePrice(profile: KitProfile) {
  if (profile === 'minimal') return 9500;
  if (profile === 'performance') return 19000;
  return 14500;
}

export function buildKitPlan(input: KitBuilderInput): KitPlan {
  const seats = normalizedSeats(input.seats);
  const budget = normalizedBudget(input.budget);
  const capitalItems: KitPlanItem[] = [];
  const operatingItems: Array<Omit<KitPlanItem, 'quantity' | 'kind'>> = [];

  capitalItems.push({
    name: input.profile === 'performance' ? 'Производительный рабочий ПК' : input.profile === 'minimal' ? 'Базовый офисный ПК' : 'Офисный ПК',
    categoryId: 'capital-client',
    quantity: seats,
    price: workstationPrice(input.profile),
    kind: 'hardware',
  });

  capitalItems.push({
    name: 'ОС для рабочих мест',
    categoryId: 'capital-software',
    quantity: seats,
    price: 18000,
    kind: 'software',
  });

  capitalItems.push({
    name: input.profile === 'minimal' ? 'Базовый офисный пакет' : 'Офисный пакет',
    categoryId: 'capital-software',
    quantity: seats,
    price: officeLicensePrice(input.profile),
    kind: 'software',
  });

  capitalItems.push({
    name: 'Антивирусная защита рабочих мест',
    categoryId: 'capital-software',
    quantity: seats,
    price: input.profile === 'minimal' ? 2600 : 3500,
    kind: 'software',
  });

  if (input.needServer && !input.useCloud) {
    capitalItems.push({
      name: input.profile === 'performance' ? 'Сервер повышенной производительности' : 'Локальный сервер',
      categoryId: 'capital-server',
      quantity: 1,
      price: input.profile === 'performance' ? 340000 : input.profile === 'minimal' ? 165000 : 230000,
      kind: 'hardware',
    });
  }

  if (input.needWifi || input.needServer || seats > 3) {
    capitalItems.push({
      name: input.profile === 'performance' ? 'Управляемый коммутатор 24 порта' : 'Коммутатор',
      categoryId: 'capital-network',
      quantity: 1,
      price: input.profile === 'performance' ? 42000 : 24000,
      kind: 'hardware',
    });
    capitalItems.push({
      name: 'Маршрутизатор',
      categoryId: 'capital-network',
      quantity: 1,
      price: input.profile === 'minimal' ? 12000 : 18000,
      kind: 'hardware',
    });
  }

  if (input.needWifi) {
    capitalItems.push({
      name: 'Точка Wi‑Fi',
      categoryId: 'capital-network',
      quantity: Math.max(1, Math.ceil(seats / 10)),
      price: input.profile === 'performance' ? 18000 : 12000,
      kind: 'hardware',
    });
  }

  if (input.needPrinting) {
    capitalItems.push({
      name: 'МФУ для офиса',
      categoryId: 'capital-client',
      quantity: Math.max(1, Math.ceil(seats / 12)),
      price: input.profile === 'performance' ? 52000 : 34000,
      kind: 'hardware',
    });
  }

  if (input.needBackup) {
    if (input.needServer && !input.useCloud) {
      capitalItems.push({
        name: 'ИБП и внешний накопитель для резервирования',
        categoryId: 'capital-server',
        quantity: 1,
        price: input.profile === 'performance' ? 76000 : 48000,
        kind: 'hardware',
      });
    }
    operatingItems.push({
      name: 'Резервное копирование',
      categoryId: 'operating-backup',
      price: input.profile === 'minimal' ? 3500 : 5500,
    });
  }

  operatingItems.push({
    name: 'Администрирование инфраструктуры',
    categoryId: 'operating-admin',
    price: input.profile === 'minimal' ? 12000 : input.profile === 'performance' ? 28000 : 18000,
  });

  if (input.useCloud) {
    operatingItems.push({
      name: 'Аренда облачного сервера',
      categoryId: 'operating-rent',
      price: input.profile === 'performance' ? 26000 : 15000,
    });
    operatingItems.push({
      name: 'Облачные лицензии и подписки',
      categoryId: 'operating-subscriptions',
      price: seats * (input.profile === 'minimal' ? 900 : 1400),
    });
  }

  const capexTotal = round(capitalItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const monthlyOpex = round(operatingItems.reduce((sum, item) => sum + item.price, 0));
  const annualOpex = round(monthlyOpex * 12);
  const totalFirstYear = round(capexTotal + annualOpex);
  const budgetDelta = round(budget - capexTotal);
  const risks: string[] = [];

  if (budget > 0 && capexTotal > budget) risks.push(`CAPEX превышает бюджет на ${capexTotal - budget} ₽.`);
  if (input.useCloud && monthlyOpex > 0) risks.push('Облачный вариант снижает стартовые затраты, но увеличивает ежемесячные расходы.');
  if (!input.needBackup) risks.push('Резервное копирование не включено в комплект.');
  if (!input.needServer && !input.useCloud) risks.push('Не выбран серверный или облачный вариант размещения сервисов.');

  return {
    profile: input.profile,
    title: `${profileLabels[input.profile]} комплект`,
    description: profileDescriptions[input.profile],
    capitalItems,
    operatingItems,
    capexTotal,
    monthlyOpex,
    annualOpex,
    totalFirstYear,
    fitsBudget: budget <= 0 || capexTotal <= budget,
    budgetDelta,
    risks,
  };
}

export function planToCapitalData(plan: KitPlan): CapitalEquipment[] {
  return plan.capitalItems.map((item) => ({
    id: uid('kit-capex'),
    categoryId: item.categoryId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    kind: item.kind,
  }));
}

export function planToOperatingData(plan: KitPlan): OperatingEquipment[] {
  return plan.operatingItems.map((item) => ({
    id: uid('kit-opex'),
    categoryId: item.categoryId,
    name: item.name,
    price: item.price,
  }));
}

export function buildProfilePlans(input: Omit<KitBuilderInput, 'profile'>) {
  const profiles: KitProfile[] = ['minimal', 'balanced', 'performance'];
  return profiles.map((profile) => buildKitPlan({ ...input, profile }));
}

export function pickBestAffordablePlan(plans: KitPlan[]) {
  const affordable = plans.filter((plan) => plan.fitsBudget);
  if (affordable.length > 0) {
    return [...affordable].sort((a, b) => {
      const rank: Record<KitProfile, number> = { minimal: 1, balanced: 2, performance: 3 };
      return rank[b.profile] - rank[a.profile] || b.budgetDelta - a.budgetDelta;
    })[0];
  }

  return [...plans].sort((a, b) => a.capexTotal - b.capexTotal)[0];
}

export function buildLocalCloudComparison(seats: number, budget: number) {
  const local = buildKitPlan({
    seats,
    budget,
    profile: 'balanced',
    needServer: true,
    useCloud: false,
    needPrinting: true,
    needWifi: true,
    needBackup: true,
  });
  const cloud = buildKitPlan({
    seats,
    budget,
    profile: 'balanced',
    needServer: false,
    useCloud: true,
    needPrinting: true,
    needWifi: true,
    needBackup: true,
  });
  const localThreeYear = local.capexTotal + local.monthlyOpex * 36;
  const cloudThreeYear = cloud.capexTotal + cloud.monthlyOpex * 36;
  return {
    local,
    cloud,
    localThreeYear,
    cloudThreeYear,
    recommended: localThreeYear <= cloudThreeYear ? 'local' as const : 'cloud' as const,
    delta: Math.abs(localThreeYear - cloudThreeYear),
  };
}
