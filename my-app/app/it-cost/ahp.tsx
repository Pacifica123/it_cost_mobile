import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { ActionButton, Field, InlineField, SectionTitle, StatCard } from '../../features/ahp/components';
import { useAhpEditorState } from '../../features/ahp/hooks/useAhpEditorState';
import { useAhpStyles } from '../../features/ahp/styles';
import { AnimatedPressable, AnimatedScreenScroll } from '../../shared/ui';
import { useThemePalette } from '../../shared/theme';

const ROLE_OPTIONS = [
  { key: 'client', label: 'Клиент' },
  { key: 'server', label: 'Сервер' },
  { key: 'network', label: 'Сеть' },
  { key: 'other', label: 'Другое' },
] as const;

export const title = 'AHP-анализ';

export default function AHPScreen() {
  const styles = useAhpStyles();
  const palette = useThemePalette();

  const {
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
  } = useAhpEditorState();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AnimatedScreenScroll
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
            <StatCard label="Конфигураций" value={configs.length} accent={palette.primary} />
            <StatCard label="Устройств" value={totalDevices} accent={palette.success} />
            <StatCard
              label="Выбрано"
              value={selectedConfig ? selectedConfig.id : '—'}
              accent={palette.warning}
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
                    <AnimatedPressable
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
                    </AnimatedPressable>
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
                    onPress={() => deleteDevice(selectedIdx!, deviceIndex)}
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
                        <AnimatedPressable
                          key={option.key}
                          onPress={() =>
                            updateDeviceField(selectedIdx!, deviceIndex, 'role', option.key)
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
                        </AnimatedPressable>
                      );
                    })}
                  </View>
                </View>

                <Field
                  label="Производитель"
                  value={device.vendor}
                  onChangeText={(v) =>
                    updateDeviceField(selectedIdx!, deviceIndex, 'vendor', v)
                  }
                  placeholder="Dell, HP, Lenovo..."
                />

                <View style={styles.doubleRow}>
                  <InlineField
                    label="CPU"
                    value={device.cpu_score}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx!, deviceIndex, 'cpu_score', v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <InlineField
                    label="RAM"
                    value={device.ram_score}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx!, deviceIndex, 'ram_score', v)
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
                      updateDeviceField(selectedIdx!, deviceIndex, 'energy', v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <InlineField
                    label="Стоимость"
                    value={device.cost}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx!, deviceIndex, 'cost', v)
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
                      updateDeviceField(selectedIdx!, deviceIndex, 'rel_low', v)
                    }
                    keyboardType="numeric"
                    placeholder="0.5"
                  />
                  <InlineField
                    label="Надёжность max"
                    value={device.rel_high}
                    onChangeText={(v) =>
                      updateDeviceField(selectedIdx!, deviceIndex, 'rel_high', v)
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
                <AnimatedPressable
                  onPress={() => setShowJson((prev) => !prev)}
                  style={styles.toggleChip}
                >
                  <Text style={styles.toggleChipText}>
                    {showJson ? 'Скрыть JSON' : 'Показать JSON'}
                  </Text>
                </AnimatedPressable>
              }
            />

            {showJson && (
              <View style={styles.jsonBox}>
                <Text style={styles.jsonText}>{details}</Text>
              </View>
            )}
          </View>
        )}
      </AnimatedScreenScroll>
    </KeyboardAvoidingView>
  );
}
