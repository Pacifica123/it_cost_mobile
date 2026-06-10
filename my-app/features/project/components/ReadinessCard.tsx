import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors, useThemePalette } from '../../../shared/theme';
import { AppCard } from '../../../shared/ui';
import type { ProjectReadiness, ReadinessStatus } from '../logic/readiness';
import { useProjectStyles } from '../styles';

const statusMeta: Record<ReadinessStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  ok: { icon: 'checkmark-circle', color: colors.success, label: 'готово' },
  warning: { icon: 'alert-circle', color: colors.warning, label: 'проверить' },
  missing: { icon: 'close-circle', color: colors.danger, label: 'нет данных' },
};

export function ReadinessCard({ readiness, compact = false }: { readiness: ProjectReadiness; compact?: boolean }) {
  const styles = useProjectStyles();

  const palette = useThemePalette();
  return (
    <AppCard delay={80} style={styles.readinessCard}>
      <View style={styles.readinessHeader}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.cardEyebrow, { color: palette.textMuted }]} maxFontSizeMultiplier={1.1}>Проверка готовности</Text>
          <Text style={[styles.readinessTitle, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{readiness.percent}%</Text>
        </View>
        <View style={[styles.readinessBadge, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}> 
          <Text style={[styles.readinessBadgeText, { color: palette.text }]} maxFontSizeMultiplier={1.1}>
            {readiness.blockers.length ? 'нужно заполнить' : readiness.warnings.length ? 'черновик' : 'готово'}
          </Text>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}> 
        <View style={[styles.progressFill, { width: `${Math.max(4, readiness.percent)}%`, backgroundColor: palette.primary }]} />
      </View>

      <Text style={[styles.cardText, { color: palette.textSoft }]} maxFontSizeMultiplier={1.12}>{readiness.summary}</Text>

      <View style={styles.checkList}>
        {readiness.checks.slice(0, compact ? 5 : readiness.checks.length).map((check) => {
          const meta = statusMeta[check.status];
          return (
            <View key={check.id} style={[styles.checkItem, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}> 
              <Ionicons name={meta.icon} size={19} color={meta.color} style={styles.checkIcon} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.checkTitleRow}>
                  <Text style={[styles.checkTitle, { color: palette.text }]} maxFontSizeMultiplier={1.1}>{check.title}</Text>
                  <Text style={[styles.checkStatus, { color: meta.color }]} maxFontSizeMultiplier={1.1}>{meta.label}</Text>
                </View>
                {!compact ? <Text style={[styles.checkDescription, { color: palette.textSoft }]} maxFontSizeMultiplier={1.1}>{check.description}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}
