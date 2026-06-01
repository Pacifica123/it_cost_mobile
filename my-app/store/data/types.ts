export type CategoryScope = 'capital' | 'operating';
export type CategoryMode = 'oneTime' | 'periodic';
export type ItemKind = 'hardware' | 'software';

export type ExpenseCategory = {
  id: string;
  name: string;
  scope: CategoryScope;
  mode?: CategoryMode;
};

export type CapitalEquipment = {
  id: string;
  categoryId: string;
  name: string;
  quantity: number;
  price: number;
  kind?: ItemKind;
};

export type OperatingEquipment = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
};

export type ProjectMeta = {
  name: string;
  organization: string;
  budget: number;
  targetClientSeats: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectEventType =
  | 'project'
  | 'data'
  | 'catalog'
  | 'template'
  | 'import'
  | 'export'
  | 'reset'
  | 'report';

export type ProjectEvent = {
  id: string;
  type: ProjectEventType;
  title: string;
  description?: string;
  createdAt: string;
};

export type DataState = {
  projectMeta: ProjectMeta;
  projectEvents: ProjectEvent[];
  capitalData: CapitalEquipment[];
  operatingData: OperatingEquipment[];
  categories: ExpenseCategory[];
  electricityTotal: number;
};
