import type { CapitalEquipment, OperatingEquipment } from '../../store/data/types';

export type ReportSummary = {
  capitalTotal: number;
  oneTimeOperatingTotal: number;
  periodicTotalMonthly: number;
  periodicTotalAnnual: number;
  electricityTotalMonthly: number;
  electricityTotalAnnual: number;
  totalOneTimeExpenses: number;
  grandTotalAnnual: number;
};

export type ReportInsight = {
  id: string;
  tone: 'ok' | 'warning' | 'info';
  title: string;
  description: string;
};

export type BuiltReport = ReportSummary & {
  oneTimeOperating: OperatingEquipment[];
  periodicOperating: OperatingEquipment[];
  groupedCapital: Record<string, CapitalEquipment[]>;
  groupedOneTimeOperating: Record<string, OperatingEquipment[]>;
  groupedPeriodicOperating: Record<string, OperatingEquipment[]>;
  hardwareTotal: number;
  softwareTotal: number;
  capitalItemsCount: number;
  operatingItemsCount: number;
  insights: ReportInsight[];
  summaryText: string;
  assumptions: {
    periodicMultiplier: number;
    electricityMultiplier: number;
  };
};
