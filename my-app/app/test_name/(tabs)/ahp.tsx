// AHPScreen.tsx
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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

const mkUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

export const title = 'AHP-анализ';

export default function AHPScreen() {
    const [configs, setConfigs] = useState<Configuration[]>([]);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const [budget, setBudget] = useState('6000');
    const [energy, setEnergy] = useState('700');
    const [tolerance, setTolerance] = useState('0.25');
    const [soft, setSoft] = useState(DEFAULT_SOFT_CRITERIA.join(','));

    const [summary, setSummary] = useState('');
    const [details, setDetails] = useState<string | null>(null);

    // ---- Configs CRUD ----
    const addConfig = () => {
        const c: Configuration = {
            uid: mkUid(),
            id: `cfg_${configs.length + 1}`,
            meta: { people: '1' },
            devices: []
        };
        setConfigs(prev => {
            const next = [...prev, c];
            setSelectedIdx(next.length - 1);
            return next;
        });
    };

    const deleteSelectedConfig = () => {
        if (selectedIdx === null) return;
        setConfigs(prev => {
            const next = prev.filter((_, i) => i !== selectedIdx);
            // adjust selection
            if (next.length === 0) {
                setSelectedIdx(null);
            } else {
                setSelectedIdx(Math.max(0, selectedIdx - 1));
            }
            return next;
        });
    };

    const updateConfigField = (index: number, field: keyof Configuration | 'people', value: string) => {
        setConfigs(prev => {
            const next = prev.map((c, i) => {
                if (i !== index) return c;
                if (field === 'people') {
                    return { ...c, meta: { ...c.meta, people: value } };
                }
                if (field === 'id') {
                    return { ...c, id: value };
                }
                return c;
            });
            return next;
        });
    };

    // ---- Devices CRUD + edit ----
    const addDevice = () => {
        if (selectedIdx === null) {
            Alert.alert('Select config', 'Сначала выберите конфигурацию');
            return;
        }
        const d: Device = {
            uid: mkUid(),
            role: 'client',
            vendor: '',
            cpu_score: '0',
            ram_score: '0',
            energy: '0',
            cost: '0',
            rel_low: '0.5',
            rel_high: '0.9'
        };
        setConfigs(prev => {
            const next = [...prev];
            next[selectedIdx].devices = [...next[selectedIdx].devices, d];
            return next;
        });
    };

    const deleteDevice = (cfgIndex: number, devIndex: number) => {
        setConfigs(prev => {
            const next = prev.map((c, i) => {
                if (i !== cfgIndex) return c;
                const newDevices = c.devices.filter((_, j) => j !== devIndex);
                return { ...c, devices: newDevices };
            });
            return next;
        });
    };

    const updateDeviceField = (
        cfgIndex: number,
        devIndex: number,
        field: keyof Device,
        value: string
    ) => {
        setConfigs(prev => {
            const next = prev.map((c, i) => {
                if (i !== cfgIndex) return c;
                const devs = c.devices.map((d, j) => {
                    if (j !== devIndex) return d;
                    return { ...d, [field]: value };
                });
                return { ...c, devices: devs };
            });
            return next;
        });
    };

    // ---- Run AHP (prepare numeric conversion) ----
    const runAHP = () => {
        // convert devices numeric strings to numbers
        const preparedConfigs = configs.map(c => {
            const devices = c.devices.map(d => ({
                role: d.role,
                vendor: d.vendor,
                cpu_score: parseFloatOrZero(d.cpu_score),
                                                ram_score: parseFloatOrZero(d.ram_score),
                                                energy: parseFloatOrZero(d.energy),
                                                cost: parseFloatOrZero(d.cost),
                                                reliability: { low: parseFloatOrZero(d.rel_low), high: parseFloatOrZero(d.rel_high) }
            }));
            return {
                id: c.id,
                meta: { people: parseIntSafe(c.meta.people) },
                                            devices
            };
        });

        const softCriteria = soft.split(',').map(s => s.trim()).filter(Boolean);
        try {
            const report = runAHPipeline({
                configurations: preparedConfigs,
                softCriteria,
                experts: [M1, M2],
                constraints: {
                    max_budget: parseFloatOrZero(budget),
                                         max_energy: parseFloatOrZero(energy),
                                         people_match_tolerance: parseFloatOrZero(tolerance)
                }
            });

            // build concise summary
            const lines: string[] = [];
            lines.push(`Всего конфигураций: ${report.total_input}`);
            lines.push(`Прошло фильтр: ${report.passed_count}`);
            if (report.warning) lines.push(`WARNING: ${report.warning}`);
            if (report.criteria && report.criteria.names) {
                lines.push('Критерии (веса):');
                report.criteria.names.forEach((n: string, i: number) => {
                    const w = report.criteria.weights?.[i] ?? 0;
                    lines.push(`  ${n}: ${Number(w).toFixed(4)}`);
                });
                if (report.criteria.CR != null) {
                    lines.push(`CR: ${Number(report.criteria.CR).toFixed(4)}`);
                }
            }
            if (report.final && report.final.ranking) {
                lines.push('Рейтинг (top -> ...):');
                report.final.ranking.forEach(([id, sc]: [string, number]) => {
                    lines.push(`  ${id}: ${Number(sc).toFixed(4)}`);
                });
            }

            setSummary(lines.join('\n'));
            setDetails(JSON.stringify(report, null, 2));
        } catch (e: any) {
            setSummary(`Ошибка: ${String(e)}`);
            setDetails(null);
        }
    };

    // helpers
    const parseFloatOrZero = (v: string) => {
        const n = parseFloat(String(v).replace(',', '.'));
        return Number.isFinite(n) ? n : 0;
    };
    const parseIntSafe = (v: string) => {
        const n = parseInt(String(v), 10);
        return Number.isFinite(n) ? n : 0;
    };

    // ---- Render ----
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>AHP-анализ конфигураций</Text>

        <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={addConfig}>
        <Text style={styles.buttonText}>Добавить конфигурацию</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={[styles.button, selectedIdx === null && styles.buttonDisabled]}
        onPress={deleteSelectedConfig}
        disabled={selectedIdx === null}
        >
        <Text style={styles.buttonText}>Удалить выбранную</Text>
        </TouchableOpacity>
        </View>

        {/* Configs list */}
        {configs.map((c, i) => (
            <TouchableOpacity
            key={c.uid}
            style={[styles.card, selectedIdx === i && styles.cardSelected]}
            onPress={() => setSelectedIdx(i)}
            >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextInput
            style={styles.configId}
            value={c.id}
            onChangeText={(text) => updateConfigField(i, 'id', text)}
            />
            <Text>Devices: {c.devices.length}</Text>
            </View>
            <View style={styles.configMeta}>
            <Text>People:</Text>
            <TextInput
            style={styles.smallInput}
            value={c.meta.people}
            keyboardType="numeric"
            onChangeText={(v) => updateConfigField(i, 'people', v)}
            />
            </View>
            </TouchableOpacity>
        ))}

        {/* Selected config devices + controls */}
        {selectedIdx !== null && configs[selectedIdx] && (
            <>
            <Text style={styles.subtitle}>Устройства (выбранная конфигурация)</Text>
            <TouchableOpacity style={styles.button} onPress={addDevice}>
            <Text style={styles.buttonText}>Добавить устройство</Text>
            </TouchableOpacity>

            {configs[selectedIdx].devices.length === 0 && (
                <Text style={{ marginTop: 6 }}>Устройств нет</Text>
            )}

            {configs[selectedIdx].devices.map((d, di) => (
                <View key={d.uid} style={styles.deviceCard}>
                <View style={styles.devRow}>
                <Text style={{ flex: 1 }}>Role:</Text>
                <TextInput
                style={styles.devInput}
                value={d.role}
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'role', v)}
                />
                </View>
                <View style={styles.devRow}>
                <Text style={{ flex: 1 }}>Vendor:</Text>
                <TextInput
                style={styles.devInput}
                value={d.vendor}
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'vendor', v)}
                />
                </View>

                <View style={styles.devRow}>
                <Text style={{ flex: 1 }}>CPU:</Text>
                <TextInput
                style={styles.devInput}
                value={d.cpu_score}
                keyboardType="numeric"
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'cpu_score', v)}
                />
                <Text style={{ width: 8 }} />
                <Text style={{ flex: 1 }}>RAM:</Text>
                <TextInput
                style={styles.devInput}
                value={d.ram_score}
                keyboardType="numeric"
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'ram_score', v)}
                />
                </View>

                <View style={styles.devRow}>
                <Text style={{ flex: 1 }}>Energy:</Text>
                <TextInput
                style={styles.devInput}
                value={d.energy}
                keyboardType="numeric"
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'energy', v)}
                />
                <Text style={{ width: 8 }} />
                <Text style={{ flex: 1 }}>Cost:</Text>
                <TextInput
                style={styles.devInput}
                value={d.cost}
                keyboardType="numeric"
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'cost', v)}
                />
                </View>

                <View style={styles.devRow}>
                <Text style={{ flex: 1 }}>Rel low:</Text>
                <TextInput
                style={styles.devInput}
                value={d.rel_low}
                keyboardType="numeric"
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'rel_low', v)}
                />
                <Text style={{ width: 8 }} />
                <Text style={{ flex: 1 }}>Rel high:</Text>
                <TextInput
                style={styles.devInput}
                value={d.rel_high}
                keyboardType="numeric"
                onChangeText={(v) => updateDeviceField(selectedIdx, di, 'rel_high', v)}
                />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: '#dc2626' }]}
                onPress={() => deleteDevice(selectedIdx, di)}
                >
                <Text style={styles.buttonText}>Удалить устройство</Text>
                </TouchableOpacity>
                </View>
                </View>
            ))}
            </>
        )}

        {/* Constraints / params */}
        <Text style={styles.subtitle}>Параметры анализа</Text>
        <Text>Max budget</Text>
        <TextInput style={styles.input} value={budget} onChangeText={setBudget} keyboardType="numeric" />
        <Text>Max energy</Text>
        <TextInput style={styles.input} value={energy} onChangeText={setEnergy} keyboardType="numeric" />
        <Text>People tolerance</Text>
        <TextInput style={styles.input} value={tolerance} onChangeText={setTolerance} keyboardType="numeric" />
        <Text>Soft criteria (comma separated)</Text>
        <TextInput style={styles.input} value={soft} onChangeText={setSoft} />

        <TouchableOpacity style={styles.runButton} onPress={runAHP}>
        <Text style={styles.buttonText}>Рассчитать AHP</Text>
        </TouchableOpacity>

        {summary !== '' && (
            <>
            <Text style={styles.subtitle}>Результат</Text>
            <Text style={styles.mono}>{summary}</Text>
            </>
        )}

        {details && (
            <>
            <Text style={styles.subtitle}>Детали (JSON)</Text>
            <Text style={styles.mono}>{details}</Text>
            </>
        )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2', padding: 12 },
    title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
    row: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' } as any,
    button: { backgroundColor: '#16a34a', padding: 10, borderRadius: 6, marginVertical: 6, flex: 1, marginRight: 8 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
    card: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginVertical: 6 },
    cardSelected: { borderWidth: 2, borderColor: '#16a34a' },
    configId: { fontWeight: '700', fontSize: 14, padding: 4, borderBottomWidth: 1, borderColor: '#eee', flex: 1 },
    configMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    smallInput: { backgroundColor: '#fff', padding: 6, borderRadius: 4, minWidth: 60, marginLeft: 8, borderWidth: 1, borderColor: '#ddd' },
    subtitle: { marginTop: 12, fontWeight: '700' },
    input: { backgroundColor: '#fff', padding: 8, borderRadius: 6, marginVertical: 6, borderWidth: 1, borderColor: '#ddd' },
    deviceCard: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginVertical: 6 },
    devRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    devInput: { backgroundColor: '#fff', padding: 6, borderRadius: 4, borderWidth: 1, borderColor: '#ddd', minWidth: 80, flex: 1 },
    smallButton: { padding: 8, borderRadius: 6, marginLeft: 8 },
    runButton: { backgroundColor: '#1e40af', padding: 12, borderRadius: 6, marginTop: 10 },
    mono: { fontFamily: 'monospace', fontSize: 12, backgroundColor: '#fff', padding: 8, borderRadius: 6, marginVertical: 6 }
});


