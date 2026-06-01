import type { CapitalEquipment } from '../../store/data/types';

export type ElectricityItem = {
  id: string;
  name: string;
  quantity: number;
  powerW: number;
  isDeleted?: boolean;
};

export type ElectricityBaseSource = Pick<CapitalEquipment, 'id' | 'name' | 'quantity' | 'kind'>;
