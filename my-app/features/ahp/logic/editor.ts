import type { AHPReport, Configuration } from '../types';
import type { AhpEditorConfiguration, AhpEditorDevice } from '../editorTypes';

export const createEditorUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const parseNumberInput = (value: string) => {
  const parsed = Number.parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const parseIntegerInput = (value: string) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const createEditorConfiguration = (index: number): AhpEditorConfiguration => ({
  uid: createEditorUid(),
  id: `cfg_${index + 1}`,
  meta: { people: '1' },
  devices: [],
});

export const createEditorDevice = (): AhpEditorDevice => ({
  uid: createEditorUid(),
  role: 'client',
  vendor: '',
  cpu_score: '0',
  ram_score: '0',
  energy: '0',
  cost: '0',
  rel_low: '0.5',
  rel_high: '0.9',
});

export const toPipelineConfigurations = (configs: AhpEditorConfiguration[]): Configuration[] =>
  configs.map((config) => ({
    id: config.id,
    meta: {
      people: parseIntegerInput(config.meta.people),
    },
    devices: config.devices.map((device) => ({
      role: device.role,
      vendor: device.vendor,
      cpu_score: parseNumberInput(device.cpu_score),
      ram_score: parseNumberInput(device.ram_score),
      energy: parseNumberInput(device.energy),
      cost: parseNumberInput(device.cost),
      reliability: {
        low: parseNumberInput(device.rel_low),
        high: parseNumberInput(device.rel_high),
      },
    })),
  }));

export const toSoftCriteria = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const formatReportSummary = (report: AHPReport & { warning?: string }) => {
  const lines: string[] = [];
  lines.push(`Всего конфигураций: ${report.total_input}`);
  lines.push(`Прошло фильтр: ${report.passed_count}`);

  if (report.warning) {
    lines.push(`Предупреждение: ${report.warning}`);
  }

  if (report.criteria?.names?.length) {
    lines.push('');
    lines.push('Критерии и веса:');

    report.criteria.names.forEach((name, index) => {
      const weight = report.criteria.weights?.[index] ?? 0;
      lines.push(`• ${name}: ${Number(weight).toFixed(4)}`);
    });

    if (report.criteria.CR != null) {
      lines.push(`CR: ${Number(report.criteria.CR).toFixed(4)}`);
    }
  }

  if (report.final?.ranking?.length) {
    lines.push('');
    lines.push('Финальный рейтинг:');

    report.final.ranking.forEach(([id, score], index) => {
      lines.push(`${index + 1}. ${id}: ${Number(score).toFixed(4)}`);
    });
  }

  return lines.join('\n');
};
