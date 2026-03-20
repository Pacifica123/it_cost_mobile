import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const ROLE_OPTIONS = [
  { key: 'client', label: 'Клиент' },
  { key: 'server', label: 'Сервер' },
  { key: 'network', label: 'Сеть' },
  { key: 'other', label: 'Другое' },
] as const;

const mkUid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const title = 'AHP-анализ';

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric';
  placeholder?: string;
  hint?: string;
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
        autoCorrect={false}
        autoCapitalize="none"
      />
      {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
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
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statDot, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        compact && styles.buttonCompact,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          (variant === 'secondary' || variant === 'ghost') && styles.buttonTextDark,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  const [showJson, setShowJson] = useState(false);

  const selectedConfig = useMemo(
    () => (selectedIdx !== null ? configs[selectedIdx] : null),
    [configs, selectedIdx]
  );

  const totalDevices = useMemo(
    () => configs.reduce((acc, cfg) => acc + cfg.devices.length, 0),
    [configs]
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
      Alert.alert('Нет конфигурации', 'Сначала выбери или создай конфигурацию.');
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
      }) as ReturnType<typeof runAHPipeline> & { warning?: string };

      const lines: string[] = [];
      lines.push(`Всего конфигураций: ${report.total_input}`);
      lines.push(`Прошло фильтр: ${report.passed_count}`);

      if (report.warning) {
        lines.push(`Предупреждение: ${report.warning}`);
      }

      if (report.criteria?.names?.length) {
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

      if (report.final?.ranking?.length) {
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
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>AHP</Text>
          </View>

          <Text style={styles.title}>AHP-анализ конфигураций</Text>
          <Text style={styles.subtitle}>
            Создавай варианты, добавляй устройства и сравнивай конфигурации в одном
            экране.
          </Text>

          <View style={styles.statsRow}>
            <StatCard label="Конфигураций" value={configs.length} accent="#2563eb" />
            <StatCard label="Устройств" value={totalDevices} accent="#0f766e" />
            <StatCard
              label="Выбрано"
              value={selectedConfig ? selectedConfig.id : '—'}
              accent="#7c3aed"
            />
          </View>
        </View>

        <View style={styles.panel}>
          <SectionTitle
            title="Конфигурации"
            subtitle="Сначала создай варианты, затем выбери нужный для редактирования."
          />

          <View style={styles.buttonRow}>
            <View style={styles.buttonCell}>
              <ActionButton label="+ Добавить конфигурацию" onPress={addConfig} />
            </View>
            <View style={styles.buttonCell}>
              <ActionButton
                label="Удалить выбранную"
                onPress={deleteSelectedConfig}
                variant="danger"
                disabled={selectedIdx === null}
              />
            </View>
          </View>

          {configs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Пока нет конфигураций</Text>
              <Text style={styles.emptyText}>
                Нажми «Добавить конфигурацию», чтобы начать сравнение.
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.configTabs}
              >
                {configs.map((config, i) => {
                  const isSelected = selectedIdx === i;

                  return (
                    <Pressable
                      key={config.uid}
                      onPress={() => setSelectedIdx(i)}
                      style={[styles.configTab, isSelected && styles.configTabActive]}
                    >
                      <Text
                        style={[
                          styles.configTabTitle,
                          isSelected && styles.configTabTitleActive,
                        ]}
                      >
                        {config.id || `cfg_${i + 1}`}
                      </Text>
                      <Text
                        style={[
                          styles.configTabMeta,
                          isSelected && styles.configTabMetaActive,
                        ]}
                      >
                        {config.devices.length} устр. • {config.meta.people || '0'} чел.
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {selectedConfig && selectedIdx !== null && (
                <View style={styles.selectedCard}>
                  <View style={styles.selectedCardHeader}>
                    <View style={styles.selectedCardInfo}>
                      <Text style={styles.selectedCardTitle}>Редактирование конфигурации</Text>
                      <Text style={styles.selectedCardSubtitle}>
                        Активная: {selectedConfig.id}
                      </Text>
                    </View>

                    <View style={styles.selectedPill}>
                      <Text style={styles.selectedPillText}>Выбрана</Text>
                    </View>
                  </View>

                  <Field
                    label="ID конфигурации"
                    value={selectedConfig.id}
                    onChangeText={(text) => updateConfigField(selectedIdx, 'id', text)}
                    placeholder="Например: office_1"
                    hint="Короткое понятное имя для рейтинга."
                  />

                  <InlineField
                    label="Количество людей"
                    value={selectedConfig.meta.people}
                    onChangeText={(v) => updateConfigField(selectedIdx, 'people', v)}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.panel}>
          <SectionTitle
            title="Устройства"
            subtitle={
              selectedConfig
                ? 'Добавляй устройства для выбранной конфигурации.'
                : 'Сначала выбери конфигурацию.'
            }
            right={
              selectedConfig ? (
                <View style={styles.sectionCounter}>
                  <Text style={styles.sectionCounterText}>
                    {selectedConfig.devices.length} шт.
                  </Text>
                </View>
              ) : undefined
            }
          />

          <ActionButton
            label="+ Добавить устройство"
            onPress={addDevice}
            disabled={!selectedConfig}
          />

          {!selectedConfig ? (
            <View style={[styles.emptyBox, styles.mt12]}>
              <Text style={styles.emptyTitle}>Нет активной конфигурации</Text>
              <Text style={styles.emptyText}>
                Выбери конфигурацию выше, чтобы добавлять и редактировать устройства.
              </Text>
            </View>
          ) : selectedConfig.devices.length === 0 ? (
            <View style={[styles.emptyBox, styles.mt12]}>
              <Text style={styles.emptyTitle}>Устройств пока нет</Text>
              <Text style={styles.emptyText}>
                Добавь хотя бы одно устройство для расчёта AHP.
              </Text>
            </View>
          ) : (
            selectedConfig.devices.map((device, deviceIndex) => (
              <View key={device.uid} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceHeaderLeft}>
                    <Text style={styles.deviceTitle}>Устройство #{deviceIndex + 1}</Text>
                    <Text style={styles.deviceSubtitle}>
                      {device.vendor?.trim()
                        ? `Производитель: ${device.vendor}`
                        : 'Производитель пока не указан'}
                    </Text>
                  </View>

                  <ActionButton
                    label="Удалить"
                    onPress={() => deleteDevice(selectedIdx, deviceIndex)}
                    variant="ghost"
                    compact
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Роль</Text>
                  <View style={styles.segmentRow}>
                    {ROLE_OPTIONS.map((option) => {
                      const active = device.role === option.key;

                      return (
                        <Pressable
                          key={option.key}
                          onPress={() =>
                            updateDeviceField(selectedIdx, deviceIndex, 'role', option.key)
                          }
                          style={[
                            styles.segmentButton,
                            active && styles.segmentButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              active && styles.segmentTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Field
                  label="Производитель"
                  value={device.vendor}
                  onChangeText={(v) =>
                    updateDeviceField(selectedIdx, deviceIndex, 'vendor', v)
                  }
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

        <View style={styles.panel}>
          <SectionTitle
            title="Параметры анализа"
            subtitle="Ограничения и критерии, по которым будет идти оценка."
          />

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
            hint="Вводи через запятую."
          />

          <ActionButton label="Рассчитать AHP" onPress={runAHP} />
        </View>

        {summary !== '' && (
          <View style={styles.panel}>
            <SectionTitle title="Результат" subtitle="Краткий итог расчёта." />
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{summary}</Text>
            </View>
          </View>
        )}

        {details && (
          <View style={styles.panel}>
            <SectionTitle
              title="Детали"
              subtitle="Полный JSON-отчёт можно развернуть по кнопке."
              right={
                <Pressable
                  onPress={() => setShowJson((prev) => !prev)}
                  style={styles.toggleChip}
                >
                  <Text style={styles.toggleChipText}>
                    {showJson ? 'Скрыть JSON' : 'Показать JSON'}
                  </Text>
                </Pressable>
              }
            />

            {showJson && (
              <View style={styles.jsonBox}>
                <Text style={styles.jsonText}>{details}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },

  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#eff6ff',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#cbd5e1',
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: -5,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 5,
    minHeight: 88,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },

  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748b',
  },
  sectionCounter: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  sectionCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338ca',
  },

  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 10,
  },
  buttonCell: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonCompact: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonSecondary: {
    backgroundColor: '#e2e8f0',
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
  },
  buttonGhost: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextDark: {
    color: '#0f172a',
  },

  emptyBox: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },

  configTabs: {
    paddingVertical: 4,
    paddingRight: 6,
  },
  configTab: {
    minWidth: 132,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 10,
  },
  configTabActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  configTabTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  configTabTitleActive: {
    color: '#1d4ed8',
  },
  configTabMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  configTabMetaActive: {
    color: '#1e40af',
  },

  selectedCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    overflow: 'hidden',
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedCardInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    marginBottom: 8,
  },
  selectedCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
    flexShrink: 1,
  },
  selectedCardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    flexShrink: 1,
  },
  selectedPill: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selectedPillText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '800',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceHeaderLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  deviceSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },

  field: {
    marginBottom: 12,
  },
  inlineField: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 16,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    color: '#0f172a',
    fontSize: 15,
  },

  doubleRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },

  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  segmentTextActive: {
    color: '#ffffff',
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

  toggleChip: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  toggleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338ca',
  },

  jsonBox: {
    borderRadius: 16,
    backgroundColor: '#0f172a',
    padding: 14,
    marginTop: 4,
  },
  jsonText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 12,
    lineHeight: 18,
    color: '#e2e8f0',
  },

  mt12: {
    marginTop: 12,
  },
});