import { Alert } from 'react-native';
import { useMemo, useState } from 'react';

import { runAHPipeline, DEFAULT_SOFT_CRITERIA, M1, M2 } from '../logic/pipeline';
import type { AhpEditorConfiguration, AhpEditorDevice } from '../editorTypes';
import {
  createEditorConfiguration,
  createEditorDevice,
  formatReportSummary,
  parseNumberInput,
  toPipelineConfigurations,
  toSoftCriteria,
} from '../logic/editor';

export function useAhpEditorState() {
  const [configs, setConfigs] = useState<AhpEditorConfiguration[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const [budget, setBudget] = useState('6000');
  const [energy, setEnergy] = useState('700');
  const [tolerance, setTolerance] = useState('0.25');
  const [soft, setSoft] = useState(DEFAULT_SOFT_CRITERIA.join(', '));

  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const selectedConfig = useMemo(
    () => (selectedIdx !== null ? configs[selectedIdx] : null),
    [configs, selectedIdx]
  );

  const totalDevices = useMemo(
    () => configs.reduce((acc, cfg) => acc + cfg.devices.length, 0),
    [configs]
  );

  const addConfig = () => {
    const config = createEditorConfiguration(configs.length);

    setConfigs((prev) => {
      const next = [...prev, config];
      setSelectedIdx(next.length - 1);
      return next;
    });
  };

  const deleteSelectedConfig = () => {
    if (selectedIdx === null) return;

    Alert.alert(
      'Удалить конфигурацию?',
      'Конфигурация и все её устройства будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setConfigs((prev) => {
              const next = prev.filter((_, i) => i !== selectedIdx);

              if (next.length === 0) {
                setSelectedIdx(null);
              } else {
                setSelectedIdx(Math.max(0, selectedIdx - 1));
              }

              return next;
            });
          },
        },
      ]
    );
  };

  const updateConfigField = (
    index: number,
    field: keyof AhpEditorConfiguration | 'people',
    value: string
  ) => {
    setConfigs((prev) =>
      prev.map((config, i) => {
        if (i !== index) return config;

        if (field === 'people') {
          return {
            ...config,
            meta: { ...config.meta, people: value },
          };
        }

        if (field === 'id') {
          return {
            ...config,
            id: value,
          };
        }

        return config;
      })
    );
  };

  const addDevice = () => {
    if (selectedIdx === null) {
      Alert.alert('Нет конфигурации', 'Сначала выбери или создай конфигурацию.');
      return;
    }

    const device = createEditorDevice();

    setConfigs((prev) => {
      const next = [...prev];
      next[selectedIdx] = {
        ...next[selectedIdx],
        devices: [...next[selectedIdx].devices, device],
      };
      return next;
    });
  };

  const deleteDevice = (cfgIndex: number, devIndex: number) => {
    Alert.alert('Удалить устройство?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          setConfigs((prev) =>
            prev.map((config, i) => {
              if (i !== cfgIndex) return config;

              return {
                ...config,
                devices: config.devices.filter((_, j) => j !== devIndex),
              };
            })
          );
        },
      },
    ]);
  };

  const updateDeviceField = (
    cfgIndex: number,
    devIndex: number,
    field: keyof AhpEditorDevice,
    value: string
  ) => {
    setConfigs((prev) =>
      prev.map((config, i) => {
        if (i !== cfgIndex) return config;

        return {
          ...config,
          devices: config.devices.map((device, j) => {
            if (j !== devIndex) return device;
            return { ...device, [field]: value };
          }),
        };
      })
    );
  };

  const runAHP = () => {
    try {
      const report = runAHPipeline({
        configurations: toPipelineConfigurations(configs),
        softCriteria: toSoftCriteria(soft),
        experts: [M1, M2],
        constraints: {
          max_budget: parseNumberInput(budget),
          max_energy: parseNumberInput(energy),
          people_match_tolerance: parseNumberInput(tolerance),
        },
      }) as ReturnType<typeof runAHPipeline> & { warning?: string };

      setSummary(formatReportSummary(report));
      setDetails(JSON.stringify(report, null, 2));
    } catch (error) {
      setSummary(`Ошибка: ${String(error)}`);
      setDetails(null);
    }
  };

  return {
    configs,
    selectedIdx,
    selectedConfig,
    totalDevices,
    budget,
    setBudget,
    energy,
    setEnergy,
    tolerance,
    setTolerance,
    soft,
    setSoft,
    summary,
    details,
    showJson,
    setShowJson,
    setSelectedIdx,
    addConfig,
    deleteSelectedConfig,
    updateConfigField,
    addDevice,
    deleteDevice,
    updateDeviceField,
    runAHP,
  };
}
