import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '../../../shared/theme';
import { AppCard } from '../../../shared/ui';
import type { ProjectReadiness, ReadinessStatus } from '../logic/readiness';
import { projectStyles as styles } from '../styles';

const statusMeta: Record<ReadinessStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  ok: { icon: 'checkmark-circle', color: colors.success, label: 'готово' },
  warning: { icon: 'alert-circle', color: colors.warning, label: 'проверить' },
  missing: { icon: 'close-circle', color: colors.danger, label: 'нет данных' },
};

export function ReadinessCard({ readiness, compact = false }: { readiness: ProjectReadiness; compact?: boolean }) {
  return (
    <AppCard delay={80} style={styles.readinessCard}>
      <View style={styles.readinessHeader}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardEyebrow} maxFontSizeMultiplier={1.1}>Проверка готовности</Text>
          <Text style={styles.readinessTitle} maxFontSizeMultiplier={1.1}>{readiness.percent}%</Text>
        </View>
        <View style={styles.readinessBadge}>
          <Text style={styles.readinessBadgeText} maxFontSizeMultiplier={1.1}>
            {readiness.blockers.length ? 'нужно заполнить' : readiness.warnings.length ? 'черновик' : 'готово'}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(4, readiness.percent)}%` }]} />
      </View>

      <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>{readiness.summary}</Text>

      <View style={styles.checkList}>
        {readiness.checks.slice(0, compact ? 5 : readiness.checks.length).map((check) => {
          const meta = statusMeta[check.status];
          return (
            <View key={check.id} style={styles.checkItem}>
              <Ionicons name={meta.icon} size={19} color={meta.color} style={styles.checkIcon} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.checkTitleRow}>
                  <Text style={styles.checkTitle} maxFontSizeMultiplier={1.1}>{check.title}</Text>
                  <Text style={[styles.checkStatus, { color: meta.color }]} maxFontSizeMultiplier={1.1}>{meta.label}</Text>
                </View>
                {!compact ? (
                  <Text style={styles.checkDescription} maxFontSizeMultiplier={1.1}>{check.description}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}
