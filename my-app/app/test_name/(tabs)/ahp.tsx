import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { runAHPipeline, DEFAULT_SOFT_CRITERIA, M1, M2 } from '../logic/ahpPipeline';

type Device = {
  uid: string;
  role: string;
  vendor: string;
  cpu_score: string;
  ram_score: string;
  energy: string;
  cost: string;
  rel_low: string;
  rel_high: string;
};

type Configuration = {
  uid: string;
  id: string;
  meta: { people: string };
  devices: Device[];
};

const mkUid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const title = 'AHP-анализ';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric';
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

function InlineField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric';
  placeholder?: string;
}) {
  return (
    <View style={styles.inlineField}>
      <Text style={styles.inlineLabel}>{label}</Text>
      <TextInput
        style={styles.inlineInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

export default function AHPScreen() {
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const [budget, setBudget] = useState('6000');
  const [energy, setEnergy] = useState('700');
  const [tolerance, setTolerance] = useState('0.25');
  const [soft, setSoft] = useState(DEFAULT_SOFT_CRITERIA.join(', '));

  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState<string | null>(null);

  const selectedConfig = useMemo(
    () => (selectedIdx !== null ? configs[selectedIdx] : null),
    [configs, selectedIdx]
  );

  const parseFloatOrZero = (v: string) => {
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const parseIntSafe = (v: string) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : 0;
  };

  const addConfig = () => {
    const config: Configuration = {
      uid: mkUid(),
      id: `cfg_${configs.length + 1}`,
      meta: { people: '1' },
      devices: [],
    };

    setConfigs((prev) => {
      const next = [...prev, config];
      setSelectedIdx(next.length - 1);
      return next;
    });
  };

  const deleteSelectedConfig = () => {
    if (selectedIdx === null) return;

    setConfigs((prev) => {
      const next = prev.filter((_, i) => i !== selectedIdx);

      if (next.length === 0) {
        setSelectedIdx(null);
      } else {
        setSelectedIdx(Math.max(0, selectedIdx - 1));
      }

      return next;
    });
  };

  const updateConfigField = (
    index: number,
    field: keyof Configuration | 'people',
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
      Alert.alert('Нет конфигурации', 'Сначала выберите конфигурацию');
      return;
    }

    const device: Device = {
      uid: mkUid(),
      role: 'client',
      vendor: '',
      cpu_score: '0',
      ram_score: '0',
      energy: '0',
      cost: '0',
      rel_low: '0.5',
      rel_high: '0.9',
    };

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
    setConfigs((prev) =>
      prev.map((config, i) => {
        if (i !== cfgIndex) return config;

        return {
          ...config,
          devices: config.devices.filter((_, j) => j !== devIndex),
        };
      })
    );
  };

  const updateDeviceField = (
    cfgIndex: number,
    devIndex: number,
    field: keyof Device,
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
    const preparedConfigs = configs.map((config) => ({
      id: config.id,
      meta: {
        people: parseIntSafe(config.meta.people),
      },
      devices: config.devices.map((device) => ({
        role: device.role,
        vendor: device.vendor,
        cpu_score: parseFloatOrZero(device.cpu_score),
        ram_score: parseFloatOrZero(device.ram_score),
        energy: parseFloatOrZero(device.energy),
        cost: parseFloatOrZero(device.cost),
        reliability: {
          low: parseFloatOrZero(device.rel_low),
          high: parseFloatOrZero(device.rel_high),
        },
      })),
    }));

    const softCriteria = soft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const report = runAHPipeline({
        configurations: preparedConfigs,
        softCriteria,
        experts: [M1, M2],
        constraints: {
          max_budget: parseFloatOrZero(budget),
          max_energy: parseFloatOrZero(energy),
          people_match_tolerance: parseFloatOrZero(tolerance),
        },
      });

      const lines: string[] = [];
      lines.push(`Всего конфигураций: ${report.total_input}`);
      lines.push(`Прошло фильтр: ${report.passed_count}`);

      if (report.warning) {
        lines.push(`Предупреждение: ${report.warning}`);
      }

      if (report.criteria?.names) {
        lines.push('');
        lines.push('Критерии и веса:');

        report.criteria.names.forEach((name: string, i: number) => {
          const weight = report.criteria.weights?.[i] ?? 0;
          lines.push(`• ${name}: ${Number(weight).toFixed(4)}`);
        });

        if (report.criteria.CR != null) {
          lines.push(`CR: ${Number(report.criteria.CR).toFixed(4)}`);
        }
      }

      if (report.final?.ranking) {
        lines.push('');
        lines.push('Финальный рейтинг:');

        report.final.ranking.forEach(([id, score]: [string, number], idx: number) => {
          lines.push(`${idx + 1}. ${id}: ${Number(score).toFixed(4)}`);
        });
      }

      setSummary(lines.join('\n'));
      setDetails(JSON.stringify(report, null, 2));
    } catch (e: any) {
      setSummary(`Ошибка: ${String(e)}`);
      setDetails(null);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.title}>AHP-анализ конфигураций</Text>
        <Text style={styles.subtitle}>
          Добавляй конфигурации, настраивай устройства и запускай расчёт.
        </Text>
      </View>

      <View style={styles.panel}>
        <SectionTitle>Конфигурации</SectionTitle>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={addConfig}>
            <Text style={styles.buttonText}>+ Добавить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.dangerButton,
              selectedIdx === null && styles.buttonDisabled,
            ]}
            onPress={deleteSelectedConfig}
            disabled={selectedIdx === null}
          >
            <Text style={styles.buttonText}>Удалить</Text>
          </TouchableOpacity>
        </View>

        {configs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Пока нет ни одной конфигурации</Text>
          </View>
        ) : (
          configs.map((config, i) => {
            const isSelected = selectedIdx === i;

            return (
              <TouchableOpacity
                key={config.uid}
                style={[styles.configCard, isSelected && styles.configCardSelected]}
                onPress={() => setSelectedIdx(i)}
                activeOpacity={0.9}
              >
                <View style={styles.configHeader}>
                  <Text style={styles.configBadge}>
                    {isSelected ? 'Выбрана' : 'Конфигурация'}
                  </Text>
                  <Text style={styles.configMetaText}>
                    Устройств: {config.devices.length}
                  </Text>
                </View>

                <Field
                  label="ID конфигурации"
                  value={config.id}
                  onChangeText={(text) => updateConfigField(i, 'id', text)}
                  placeholder="Например, office_1"
                />

                <InlineField
                  label="Количество людей"
                  value={config.meta.people}
                  onChangeText={(v) => updateConfigField(i, 'people', v)}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {selectedConfig && selectedIdx !== null && (
        <View style={styles.panel}>
          <SectionTitle>Устройства выбранной конфигурации</SectionTitle>

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={addDevice}>
            <Text style={styles.buttonText}>+ Добавить устройство</Text>
          </TouchableOpacity>

          {selectedConfig.devices.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>В этой конфигурации пока нет устройств</Text>
            </View>
          ) : (
            selectedConfig.devices.map((device, deviceIndex) => (
              <View key={device.uid} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceTitle}>Устройство #{deviceIndex + 1}</Text>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.dangerButton]}
                    onPress={() => deleteDevice(selectedIdx, deviceIndex)}
                  >
                    <Text style={styles.smallButtonText}>Удалить</Text>
                  </TouchableOpacity>
                </View>

                <Field
                  label="Роль"
                  value={device.role}
                  onChangeText={(v) => updateDeviceField(selectedIdx, deviceIndex, 'role', v)}
                  placeholder="client / server"
                />

                <Field
                  label="Производитель"
                  value={device.vendor}
                  onChangeText={(v) => updateDeviceField(selectedIdx, deviceIndex, 'vendor', v)}
                  placeholder="Dell, HP, Lenovo..."
                />

                <View style={styles.doubleRow}>
                  <InlineField
                    label="CPU"
                    value={device.cpu_score}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx, deviceIndex, 'cpu_score', v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <InlineField
                    label="RAM"
                    value={device.ram_score}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx, deviceIndex, 'ram_score', v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={styles.doubleRow}>
                  <InlineField
                    label="Энергия"
                    value={device.energy}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx, deviceIndex, 'energy', v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <InlineField
                    label="Стоимость"
                    value={device.cost}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx, deviceIndex, 'cost', v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={styles.doubleRow}>
                  <InlineField
                    label="Надёжность min"
                    value={device.rel_low}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx, deviceIndex, 'rel_low', v)
                    }
                    keyboardType="numeric"
                    placeholder="0.5"
                  />
                  <InlineField
                    label="Надёжность max"
                    value={device.rel_high}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx, deviceIndex, 'rel_high', v)
                    }
                    keyboardType="numeric"
                    placeholder="0.9"
                  />
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <View style={styles.panel}>
        <SectionTitle>Параметры анализа</SectionTitle>

        <Field
          label="Максимальный бюджет"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          placeholder="6000"
        />

        <Field
          label="Максимальное энергопотребление"
          value={energy}
          onChangeText={setEnergy}
          keyboardType="numeric"
          placeholder="700"
        />

        <Field
          label="Допуск по количеству людей"
          value={tolerance}
          onChangeText={setTolerance}
          keyboardType="numeric"
          placeholder="0.25"
        />

        <Field
          label="Мягкие критерии"
          value={soft}
          onChangeText={setSoft}
          placeholder="Например: cost, energy, reliability"
        />

        <TouchableOpacity style={[styles.button, styles.runButton]} onPress={runAHP}>
          <Text style={styles.buttonText}>Рассчитать AHP</Text>
        </TouchableOpacity>
      </View>

      {summary !== '' && (
        <View style={styles.panel}>
          <SectionTitle>Результат</SectionTitle>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{summary}</Text>
          </View>
        </View>
      )}

      {details && (
        <View style={styles.panel}>
          <SectionTitle>Детали JSON</SectionTitle>
          <View style={styles.jsonBox}>
            <Text style={styles.jsonText}>{details}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  hero: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },

  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  button: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    flex: 1,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    flex: 1,
  },
  runButton: {
    backgroundColor: '#0f766e',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  emptyBox: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },

  configCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  configCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  configBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  configMetaText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },

  deviceCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },

  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    color: '#0f172a',
    fontSize: 15,
  },

  doubleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineField: {
    flex: 1,
    marginBottom: 12,
  },
  inlineLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inlineInput: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    color: '#0f172a',
    fontSize: 15,
  },

  resultBox: {
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#0f172a',
  },

  jsonBox: {
    borderRadius: 16,
    backgroundColor: '#0f172a',
    padding: 14,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#e2e8f0',
  },
});