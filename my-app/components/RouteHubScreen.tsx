import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { SectionsMenu } from './SectionsMenu';
import { useHomeStyles } from '../features/home/styles';
import { getScreenIcon } from '../shared/icons/getScreenIcon';
import { radius, useThemePalette } from '../shared/theme';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../shared/ui';
import { getUiDensityValueFor, useUiDensity } from '../shared/utils/appPreferences';

type HubShortcut = {
  title: string;
  subtitle: string;
  route: Href;
  accent?: boolean;
};

export function RouteHubScreen({
  label,
  title,
  description,
  routes,
  shortcuts = [],
}: {
  label: string;
  title: string;
  description: string;
  routes: string[];
  shortcuts?: HubShortcut[];
}) {
  const styles = useHomeStyles();

  const palette = useThemePalette();
  const density = useUiDensity();
  const shortcutMinHeight = getUiDensityValueFor(density, 58, 70, 82);
  const iconSize = getUiDensityValueFor(density, 34, 38, 44);
  const titleSize = getUiDensityValueFor(density, 15, 17, 19);
  const textSize = getUiDensityValueFor(density, 11, 12, 13);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const shortcutRoutes = new Set(shortcuts.map((item) => String(item.route)));
  const secondaryRoutes = routes.filter((route) => !shortcutRoutes.has(route));

  return (
    <AnimatedScreenScroll
      style={[styles.screen, { backgroundColor: palette.bg }]}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      <AppCard style={styles.statusCard} delay={20}>
        <View style={[styles.badgePill, { backgroundColor: palette.primarySoft, borderColor: palette.borderSoft }]}> 
          <Text style={[styles.badgePillText, { color: palette.primary }]} maxFontSizeMultiplier={1.1}>{label}</Text>
        </View>
        <Text style={[styles.hubTitle, { color: palette.text }]} maxFontSizeMultiplier={1.08}>{title}</Text>
        <Text style={[styles.hubSubtitle, { color: palette.textSoft }]} maxFontSizeMultiplier={1.12}>{description}</Text>
      </AppCard>

      {shortcuts.length > 0 ? (
        <AppCard style={styles.menuCard} delay={45}>
          <Text style={[styles.sectionTitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.12}>Основные действия</Text>
          <View style={styles.hubGrid}>
            {shortcuts.map((item) => {
              const icon = getScreenIcon(item.title);
              return (
                <AnimatedPressable
                  key={String(item.route)}
                  onPress={() => router.push(item.route)}
                  pressedScale={0.975}
                  style={[
                    styles.hubTile,
                    {
                      minHeight: shortcutMinHeight,
                      backgroundColor: item.accent ? palette.primarySoft : palette.surfaceMuted,
                      borderColor: item.accent ? (palette.isDark ? 'rgba(96,165,250,0.42)' : 'rgba(59,130,246,0.32)') : palette.borderSoft,
                    },
                  ]}
                >
                  <View style={[styles.serviceIconWrap, { width: iconSize, height: iconSize, borderRadius: radius.md, backgroundColor: palette.surface, borderColor: palette.borderSoft }]}> 
                    <Ionicons name={icon} size={Math.round(iconSize * 0.52)} color={item.accent ? palette.primary : palette.text} />
                  </View>
                  <View style={styles.serviceTextWrap}>
                    <Text style={[styles.serviceTitle, { color: item.accent ? palette.primary : palette.text, fontSize: titleSize, lineHeight: titleSize + 4 }]} maxFontSizeMultiplier={1.08}>{item.title}</Text>
                    <Text style={[styles.serviceSubtitle, { color: palette.textMuted, fontSize: textSize, lineHeight: textSize + 4 }]} maxFontSizeMultiplier={1.08}>{item.subtitle}</Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </AppCard>
      ) : null}

      {secondaryRoutes.length > 0 ? (
        <AppCard style={styles.menuCard} delay={70}>
          <View style={styles.compactHeaderRow}>
            <View style={styles.compactHeaderText}>
              <Text style={[styles.sectionTitle, { color: palette.textMuted }]} maxFontSizeMultiplier={1.12}>Дополнительные инструменты</Text>
              <Text style={[styles.statusHint, { color: palette.textSoft }]} maxFontSizeMultiplier={1.08}>
                Редкие и продвинутые функции спрятаны, чтобы не мешать основному сценарию.
              </Text>
            </View>
            <AnimatedPressable
              onPress={() => setShowAdvanced((value) => !value)}
              style={[styles.detailsButton, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}
              pressedScale={0.96}
              accessibilityRole="button"
              accessibilityLabel={showAdvanced ? 'Скрыть дополнительные инструменты' : 'Показать дополнительные инструменты'}
            >
              <Text style={[styles.detailsButtonText, { color: palette.text }]}>
                {showAdvanced ? 'Скрыть' : `Показать ${secondaryRoutes.length}`}
              </Text>
            </AnimatedPressable>
          </View>
          {showAdvanced ? (
            <SectionsMenu variant="all" hideEntries includeRoutes={secondaryRoutes} searchable={secondaryRoutes.length > 6} mode="all" />
          ) : null}
        </AppCard>
      ) : null}
    </AnimatedScreenScroll>
  );
}
