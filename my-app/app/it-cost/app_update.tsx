import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { checkGithubUpdate, describeUpdateStatus, type GithubUpdateInfo } from '../../features/update/logic/githubUpdate';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';

export const title = 'Обновление приложения';

type UpdateExtra = {
  githubOwner?: string;
  githubRepo?: string;
  githubBranch?: string;
};

function getUpdateExtra(): Required<UpdateExtra> {
  const extra = (Constants.expoConfig?.extra?.updates ?? {}) as UpdateExtra;
  return {
    githubOwner: extra.githubOwner || 'Pacifica123',
    githubRepo: extra.githubRepo || 'it_cost_mobile',
    githubBranch: extra.githubBranch || 'main',
  };
}

function openUrl(url?: string) {
  if (!url) {
    Alert.alert('Ссылка недоступна', 'Для этого действия нет доступной ссылки.');
    return;
  }
  void Linking.openURL(url).catch(() => {
    Alert.alert('Не удалось открыть ссылку', url);
  });
}

function StatusPill({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'error' | 'neutral' }) {
  return (
    <View style={[local.statusPill, local[`status_${tone}`]]}>
      <Text style={local.statusPillText} maxFontSizeMultiplier={1.1}>{label}</Text>
    </View>
  );
}

export default function AppUpdateScreen() {
  const defaults = useMemo(getUpdateExtra, []);
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  const [owner, setOwner] = useState(defaults.githubOwner);
  const [repo, setRepo] = useState(defaults.githubRepo);
  const [branch, setBranch] = useState(defaults.githubBranch);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<GithubUpdateInfo | null>(null);

  const runCheck = async () => {
    setChecking(true);
    try {
      const next = await checkGithubUpdate({ owner, repo, branch, currentVersion });
      setResult(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось проверить обновление.';
      Alert.alert('Ошибка проверки', message);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void runCheck();
    // First automatic check only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusTone = !result ? 'neutral' : !result.ok ? 'error' : result.hasUpdate ? 'warn' : 'ok';
  const statusLabel = !result ? 'не проверено' : result.hasUpdate ? 'есть обновление' : result.ok ? 'актуально' : 'ошибка';
  const repoUrl = `https://github.com/${owner.trim()}/${repo.trim()}`;

  return (
    <AnimatedScreenScroll style={local.screen} contentContainerStyle={local.content}>
      <View style={local.hero}>
        <Text style={local.heroTitle} maxFontSizeMultiplier={1.08}>Обновление приложения</Text>
        <Text style={local.heroText} maxFontSizeMultiplier={1.12}>
          Проверяет последнюю версию на GitHub. Автоматическая установка APK невозможна без участия пользователя, поэтому приложение открывает релиз или файл загрузки.
        </Text>
      </View>

      <AppCard style={local.cardGap}>
        <View style={local.headerRow}>
          <View style={local.headerTextWrap}>
            <Text style={local.eyebrow} maxFontSizeMultiplier={1.1}>Текущая версия</Text>
            <Text style={local.versionText} maxFontSizeMultiplier={1.1}>{currentVersion}</Text>
          </View>
          <StatusPill label={statusLabel} tone={statusTone} />
        </View>

        <View style={local.formRow}>
          <View style={local.fieldBox}>
            <Text style={local.fieldLabel} maxFontSizeMultiplier={1.1}>GitHub owner</Text>
            <TextInput value={owner} onChangeText={setOwner} style={local.input} autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={local.fieldBox}>
            <Text style={local.fieldLabel} maxFontSizeMultiplier={1.1}>Repository</Text>
            <TextInput value={repo} onChangeText={setRepo} style={local.input} autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={local.fieldBox}>
            <Text style={local.fieldLabel} maxFontSizeMultiplier={1.1}>Branch для app.json</Text>
            <TextInput value={branch} onChangeText={setBranch} style={local.input} autoCapitalize="none" autoCorrect={false} />
          </View>
        </View>

        <View style={local.actionRow}>
          <AnimatedPressable style={local.primaryButton} pressedScale={0.97} onPress={runCheck} disabled={checking}>
            <Text style={local.primaryButtonText} maxFontSizeMultiplier={1.1}>{checking ? 'Проверка...' : 'Проверить обновление'}</Text>
          </AnimatedPressable>
          <AnimatedPressable style={local.secondaryButton} pressedScale={0.97} onPress={() => openUrl(repoUrl)}>
            <Text style={local.secondaryButtonText} maxFontSizeMultiplier={1.1}>Открыть GitHub</Text>
          </AnimatedPressable>
        </View>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={local.cardTitle} maxFontSizeMultiplier={1.12}>Результат проверки</Text>
        {result ? (
          <>
            <Text style={local.resultTitle} maxFontSizeMultiplier={1.12}>{describeUpdateStatus(result)}</Text>
            <Text style={local.resultText} maxFontSizeMultiplier={1.12}>
              Источник: {result.source === 'release' ? 'GitHub Releases' : result.source === 'app-json' ? 'app.json' : 'не найден'}
            </Text>
            <Text style={local.resultText} maxFontSizeMultiplier={1.12}>
              Последняя версия: {result.latestVersion || 'не определена'}
            </Text>
            <Text style={local.resultText} maxFontSizeMultiplier={1.12}>
              Проверено: {new Date(result.checkedAt).toLocaleString('ru-RU')}
            </Text>
            {result.message ? <Text style={local.resultHint} maxFontSizeMultiplier={1.12}>{result.message}</Text> : null}

            <View style={local.actionRow}>
              <AnimatedPressable style={local.secondaryButton} pressedScale={0.97} onPress={() => openUrl(result.url || repoUrl)}>
                <Text style={local.secondaryButtonText} maxFontSizeMultiplier={1.1}>Открыть источник</Text>
              </AnimatedPressable>
              <AnimatedPressable style={[local.primaryButton, !result.downloadUrl && local.disabledButton]} disabled={!result.downloadUrl} pressedScale={0.97} onPress={() => openUrl(result.downloadUrl)}>
                <Text style={local.primaryButtonText} maxFontSizeMultiplier={1.1}>Скачать файл</Text>
              </AnimatedPressable>
            </View>
          </>
        ) : (
          <Text style={local.resultText} maxFontSizeMultiplier={1.12}>Проверка ещё не выполнялась.</Text>
        )}
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={local.cardTitle} maxFontSizeMultiplier={1.12}>Как подготовить обновление</Text>
        <Text style={local.resultText} maxFontSizeMultiplier={1.12}>
          1. Увеличьте version в app.json и package.json.\n2. Соберите APK/AAB.\n3. Создайте GitHub Release с тегом вида v1.0.1.\n4. Прикрепите файл сборки к релизу.
        </Text>
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 36,
    gap: spacing.md,
  },
  hero: {
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  heroTitle: {
    color: colors.textOnDark,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroText: {
    color: colors.textOnDarkSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    marginTop: 8,
  },
  cardGap: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  versionText: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginTop: 2,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  status_ok: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(22,163,74,0.22)',
  },
  status_warn: {
    backgroundColor: colors.warningSoft,
    borderColor: 'rgba(217,119,6,0.22)',
  },
  status_error: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(220,38,38,0.22)',
  },
  status_neutral: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSoft,
  },
  statusPillText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  formRow: {
    gap: spacing.sm,
  },
  fieldBox: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  input: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryButton: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButton: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.48,
  },
  primaryButtonText: {
    color: colors.textOnDark,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  resultTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  resultText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  resultHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});
