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

export type AppThemeMode = 'system' | 'light' | 'dark';
export type AppCurrency = 'RUB' | 'USD' | 'EUR';
export type AppRoundingMode = 'none' | 'rubles' | 'thousands';
export type AppUiDensity = 'compact' | 'comfortable' | 'large';
export type AppStartScreen = 'home' | 'itMenu' | 'dashboard' | 'quickStart';
export type AppReportMode = 'short' | 'full' | 'finance' | 'technical';
export type CsvDefaultSection = 'CAPEX' | 'OPEX' | 'HARDWARE' | 'SOFTWARE';

export type ExchangeRates = {
  baseCurrency: 'RUB';
  rates: {
    USD: number | null;
    EUR: number | null;
  };
  updatedAt: string | null;
  source: string;
  error?: string;
};

export type AppSettings = {
  themeMode: AppThemeMode;
  currency: AppCurrency;
  roundingMode: AppRoundingMode;
  confirmDelete: boolean;
  uiDensity: AppUiDensity;
  startScreen: AppStartScreen;
  calculationHorizonYears: number;
  discountRatePercent: number;
  hardwareLifetimeMonths: number;
  serverLifetimeMonths: number;
  softwareLifetimeMonths: number;
  reportMode: AppReportMode;
  reportIncludeCharts: boolean;
  reportIncludeRisks: boolean;
  reportIncludeHistory: boolean;
  reportIncludeEmptySections: boolean;
  autoBackupBeforeDangerousActions: boolean;
  checkUpdatesOnStart: boolean;
  refreshRatesOnStart: boolean;
  csvRequirePreview: boolean;
  csvAutoMergeDuplicates: boolean;
  csvDefaultSection: CsvDefaultSection;
  minimumReadinessForReport: number;
  minimumDataQualityForReport: number;
};

export type ProjectEventType =
  | 'project'
  | 'data'
  | 'catalog'
  | 'template'
  | 'import'
  | 'export'
  | 'reset'
  | 'report'
  | 'backup'
  | 'history';

export type ProjectEvent = {
  id: string;
  type: ProjectEventType;
  title: string;
  description?: string;
  createdAt: string;
};

export type ProjectSnapshot = {
  projectMeta: ProjectMeta;
  appSettings: AppSettings;
  capitalData: CapitalEquipment[];
  operatingData: OperatingEquipment[];
  categories: ExpenseCategory[];
  electricityTotal: number;
};


export type StoredProjectRecord = {
  id: string;
  name: string;
  organization: string;
  createdAt: string;
  updatedAt: string;
  capitalItemsCount: number;
  operatingItemsCount: number;
  budget: number;
  snapshot: ProjectSnapshot;
};

export type ProjectBackup = {
  id: string;
  name: string;
  createdAt: string;
  description: string;
  capitalItemsCount: number;
  operatingItemsCount: number;
  snapshot: ProjectSnapshot;
};

export type DataState = {
  schemaVersion: number;
  projectMeta: ProjectMeta;
  appSettings: AppSettings;
  exchangeRates: ExchangeRates;
  projectEvents: ProjectEvent[];
  activeProjectId: string | null;
  savedProjects: StoredProjectRecord[];
  projectBackups: ProjectBackup[];
  undoStack: ProjectSnapshot[];
  redoStack: ProjectSnapshot[];
  capitalData: CapitalEquipment[];
  operatingData: OperatingEquipment[];
  categories: ExpenseCategory[];
  electricityTotal: number;
};
