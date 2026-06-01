import { Alert, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { ReadinessCard } from '../../features/project/components/ReadinessCard';
import { buildProjectReadiness } from '../../features/project/logic/readiness';
import { projectStyles as styles } from '../../features/project/styles';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';

export const title = 'Быстрый расчёт';

type QuickStep = {
  title: string;
  hint: string;
  route: Href;
  action: string;
};

const steps: QuickStep[] = [
  {
    title: 'Проверьте проект',
    hint: 'Посмотрите готовность расчёта, текущие суммы и автосохранение.',
    route: '/it-cost/project' as Href,
    action: 'Открыть проект',
  },
  {
    title: 'Добавьте ТО',
    hint: 'Серверы, ПК, сеть и другое техническое оборудование нужны для CAPEX и GA.',
    route: '/it-cost/technical_equipment' as Href,
    action: 'Добавить ТО',
  },
  {
    title: 'Добавьте ПО',
    hint: 'Лицензии и программные продукты отделяются от оборудования, чтобы отчёт был понятнее.',
    route: '/it-cost/software' as Href,
    action: 'Добавить ПО',
  },
  {
    title: 'Заполните OPEX',
    hint: 'Подписки, аренда, администрирование и сопровождение формируют стоимость владения.',
    route: '/it-cost/operating_expenses' as Href,
    action: 'Открыть OPEX',
  },
  {
    title: 'Рассчитайте энергию',
    hint: 'Электроэнергия добавляет реалистичность эксплуатационным затратам.',
    route: '/it-cost/electricity' as Href,
    action: 'Рассчитать энергию',
  },
  {
    title: 'Запустите анализ',
    hint: 'GA подберёт допустимые конфигурации, а AHP поможет обосновать выбор.',
    route: '/it-cost/genetic_optimization' as Href,
    action: 'Запустить GA',
  },
  {
    title: 'Сформируйте отчёт',
    hint: 'Итоговый отчёт собирает суммы, проверку готовности и текст для экспорта.',
    route: '/it-cost/export' as Href,
    action: 'Открыть отчёт',
  },
];

function StepCard({ step, index }: { step: QuickStep; index: number }) {
  return (
    <AppCard delay={index * 35} style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.stepTitle} maxFontSizeMultiplier={1.12}>{step.title}</Text>
      </View>
      <Text style={styles.stepHint} maxFontSizeMultiplier={1.12}>{step.hint}</Text>
      <AnimatedPressable
        onPress={() => router.push(step.route)}
        pressedScale={0.97}
        style={styles.stepButton}
      >
        <Text style={styles.stepButtonText} maxFontSizeMultiplier={1.1}>{step.action}</Text>
      </AnimatedPressable>
    </AppCard>
  );
}

export default function QuickStartScreen() {
  const data = useData();
  const readiness = buildProjectReadiness(data);

  const runDemoScenario = () => {
    Alert.alert(
      'Запустить демо-сценарий?',
      'Текущий проект будет заменён демонстрационными данными, после чего откроется итоговый отчёт.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Запустить',
          onPress: () => {
            data.resetDemoData();
            router.replace('/it-cost/export' as Href);
          },
        },
      ]
    );
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Сценарий работы</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Быстрый расчёт</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Пошаговый маршрут работы: от заполнения данных до GA/AHP и итогового отчёта.
        </Text>
      </View>

      <ReadinessCard readiness={readiness} compact />

      <AppCard delay={25} style={styles.stepCard}>
        <Text style={styles.stepTitle} maxFontSizeMultiplier={1.12}>Демо-сценарий одной кнопкой</Text>
        <Text style={styles.stepHint} maxFontSizeMultiplier={1.12}>Заполняет проект демонстрационными данными и сразу открывает итоговый отчёт.</Text>
        <AnimatedPressable onPress={runDemoScenario} pressedScale={0.97} style={styles.actionButton}>
          <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.1}>Запустить демо-сценарий</Text>
        </AnimatedPressable>
      </AppCard>

      {steps.map((step, index) => (
        <StepCard key={step.route.toString()} step={step} index={index} />
      ))}
    </AnimatedScreenScroll>
  );
}
