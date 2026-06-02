import { Alert, StyleSheet, Text, View } from 'react-native';

import { projectStyles as styles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';

export const title = 'Резервные копии';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'без даты';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function ActionButton({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <AnimatedPressable
      style={[local.button, danger && local.dangerButton]}
      pressedScale={0.97}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={[local.buttonText, danger && local.dangerButtonText]} maxFontSizeMultiplier={1.1}>{label}</Text>
    </AnimatedPressable>
  );
}

export default function BackupsScreen() {
  const data = useData();

  const createBackup = () => {
    data.createProjectBackup({
      description: `CAPEX: ${data.capitalData.length}, OPEX: ${data.operatingData.length}`,
    });
    Alert.alert('Копия создана', 'Текущее состояние проекта сохранено в локальных резервных копиях.');
  };

  const restoreBackup = (backupId: string, backupName: string) => {
    Alert.alert('Восстановить копию?', `Текущий проект будет заменён копией «${backupName}».`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Восстановить', onPress: () => data.restoreProjectBackup(backupId) },
    ]);
  };

  const deleteBackup = (backupId: string, backupName: string) => {
    Alert.alert('Удалить копию?', `Резервная копия «${backupName}» будет удалена.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => data.deleteProjectBackup(backupId) },
    ]);
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Защита данных</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Резервные копии</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Создавайте локальные точки восстановления перед очисткой, импортом, применением шаблонов или крупными изменениями.
        </Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Всего копий: {data.projectBackups.length}</Text>
        <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>
          Хранится до 12 последних резервных копий. Они попадают в экспорт проекта вместе с основными данными.
        </Text>
        <ActionButton label="Создать копию текущего проекта" onPress={createBackup} />
      </AppCard>

      {data.projectBackups.length ? (
        data.projectBackups.map((backup, index) => (
          <AppCard key={backup.id} delay={index * 18} style={local.backupCard}>
            <View style={local.rowBetween}>
              <Text style={local.backupTitle} maxFontSizeMultiplier={1.12}>{backup.name}</Text>
              <Text style={local.dateText} maxFontSizeMultiplier={1.1}>{formatDate(backup.createdAt)}</Text>
            </View>
            <Text style={local.description} maxFontSizeMultiplier={1.12}>{backup.description}</Text>
            <View style={local.metaRow}>
              <Text style={local.metaPill} maxFontSizeMultiplier={1.1}>CAPEX: {backup.capitalItemsCount}</Text>
              <Text style={local.metaPill} maxFontSizeMultiplier={1.1}>OPEX: {backup.operatingItemsCount}</Text>
            </View>
            <View style={local.actionsRow}>
              <ActionButton label="Восстановить" onPress={() => restoreBackup(backup.id, backup.name)} />
              <ActionButton label="Удалить" danger onPress={() => deleteBackup(backup.id, backup.name)} />
            </View>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Резервных копий пока нет.</Text>
        </AppCard>
      )}
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  backupCard: {
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  backupTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  description: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    color: colors.textSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.18)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  dangerButtonText: {
    color: colors.danger,
  },
});
