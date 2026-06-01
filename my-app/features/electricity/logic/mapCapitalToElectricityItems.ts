import type { ElectricityBaseSource, ElectricityItem } from '../types';

const looksLikeSoftware = (nameRaw: unknown) => {
  const name = String(nameRaw ?? '').toLowerCase().trim();
  const softWords = [
    'software',
    'license',
    'licence',
    'лицензия',
    'лицензи',
    'подписка',
    'subscription',
    'saas',
    'cloud',
    'операционная система',
    'windows',
    'linux',
    'vmware',
    'microsoft 365',
    'office',
  ];
  return softWords.some((word) => name.includes(word));
};

export function mapCapitalToElectricityItems(items: ElectricityBaseSource[]): ElectricityItem[] {
  return items
    .filter((item) => item.kind ? item.kind !== 'software' : !looksLikeSoftware(item.name))
    .map((item) => ({
      id: String(item.id),
      name: String(item.name),
      quantity: Number(item.quantity) || 0,
      powerW: 0,
    }));
}
