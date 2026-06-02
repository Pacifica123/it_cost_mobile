import { Alert, Share, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { AppCard, AnimatedPressable } from '../../../shared/ui';
import { styles } from '../styles';

export function ReportMarkdownCard({ markdown, html }: { markdown: string; html?: string }) {
  const shareMarkdown = async () => {
    try {
      await Share.share({ title: 'Текст отчёта', message: markdown });
    } catch {
      Alert.alert('Не удалось открыть меню отправки', 'Текст можно скопировать вручную из поля ниже.');
    }
  };

  const shareHtml = async () => {
    if (!html) return;
    try {
      await Share.share({ title: 'HTML-отчёт', message: html });
    } catch {
      Alert.alert('Не удалось открыть меню отправки', 'HTML можно скопировать вручную из поля ниже.');
    }
  };

  const openHtmlPreview = async () => {
    if (!html) return;
    try {
      await WebBrowser.openBrowserAsync(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    } catch {
      Alert.alert('Предпросмотр не открылся', 'HTML можно скопировать и открыть в браузере вручную.');
    }
  };

  return (
    <AppCard style={styles.card}>
      <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Экспорт отчёта</Text>
      <Text style={styles.insightLead} maxFontSizeMultiplier={1.12}>
        Markdown удобно отправлять как текст, а HTML-версия подготовлена для печати или сохранения в PDF через системное меню браузера.
      </Text>

      <View style={styles.exportActions}>
        <AnimatedPressable style={styles.exportButton} pressedScale={0.97} onPress={shareMarkdown}>
          <Text style={styles.exportButtonText} maxFontSizeMultiplier={1.1}>Поделиться Markdown</Text>
        </AnimatedPressable>
        {html ? (
          <>
            <AnimatedPressable style={styles.exportButton} pressedScale={0.97} onPress={openHtmlPreview}>
              <Text style={styles.exportButtonText} maxFontSizeMultiplier={1.1}>Открыть HTML/PDF</Text>
            </AnimatedPressable>
            <AnimatedPressable style={styles.exportButton} pressedScale={0.97} onPress={shareHtml}>
              <Text style={styles.exportButtonText} maxFontSizeMultiplier={1.1}>Поделиться HTML</Text>
            </AnimatedPressable>
          </>
        ) : null}
      </View>

      <Text style={styles.sectionLabel} maxFontSizeMultiplier={1.12}>Markdown</Text>
      <View style={styles.markdownBox}>
        <Text selectable style={styles.markdownText} maxFontSizeMultiplier={1.08}>
          {markdown}
        </Text>
      </View>

      {html ? (
        <>
          <Text style={styles.sectionLabel} maxFontSizeMultiplier={1.12}>HTML</Text>
          <View style={styles.markdownBox}>
            <Text selectable style={styles.markdownText} maxFontSizeMultiplier={1.04}>
              {html}
            </Text>
          </View>
        </>
      ) : null}
    </AppCard>
  );
}
