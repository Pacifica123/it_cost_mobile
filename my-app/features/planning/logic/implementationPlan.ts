import type { DataState } from '../../../store/data/types';

export type ImplementationStep = {
  id: string;
  title: string;
  description: string;
  section: string;
};

const hasText = (state: DataState, pattern: RegExp) => {
  const text = [
    ...state.capitalData.map((item) => item.name),
    ...state.operatingData.map((item) => item.name),
    ...state.categories.map((item) => item.name),
  ].join(' ').toLowerCase();
  return pattern.test(text);
};

export function buildImplementationPlan(state: DataState): ImplementationStep[] {
  const steps: ImplementationStep[] = [
    {
      id: 'requirements',
      title: 'Уточнить требования',
      description: `Зафиксировать бюджет, количество рабочих мест и ограничения проекта. Сейчас целевых мест: ${state.projectMeta.targetClientSeats || 0}.`,
      section: 'Подготовка',
    },
    {
      id: 'procurement',
      title: 'Закупить оборудование и ПО',
      description: `Подготовить закупку по CAPEX-позициям: ${state.capitalData.length}.`,
      section: 'Закупка',
    },
  ];

  if (state.capitalData.some((item) => item.kind === 'hardware')) {
    steps.push({
      id: 'hardware',
      title: 'Развернуть техническое оборудование',
      description: 'Подготовить рабочие места, сетевое оборудование, серверную часть и периферию.',
      section: 'Внедрение',
    });
  }

  if (state.capitalData.some((item) => item.kind === 'software')) {
    steps.push({
      id: 'software',
      title: 'Установить и активировать ПО',
      description: 'Проверить лицензии, установить ОС, офисные пакеты и защитное ПО.',
      section: 'Внедрение',
    });
  }

  if (hasText(state, /сервер|сеть|коммутатор|маршрутиз|wi-?fi|вай/i)) {
    steps.push({
      id: 'network',
      title: 'Настроить сеть и доступы',
      description: 'Проверить маршрутизацию, доступ к сервисам, права пользователей и безопасность.',
      section: 'Настройка',
    });
  }

  if (hasText(state, /backup|резерв|копирован/i)) {
    steps.push({
      id: 'backup',
      title: 'Настроить резервное копирование',
      description: 'Проверить расписание резервного копирования и тестовое восстановление.',
      section: 'Надёжность',
    });
  }

  steps.push(
    {
      id: 'testing',
      title: 'Провести тестирование',
      description: 'Проверить запуск рабочих мест, доступ к сервисам, печать, сеть и сценарии отказа.',
      section: 'Контроль',
    },
    {
      id: 'handover',
      title: 'Передать в эксплуатацию',
      description: 'Зафиксировать итоговую конфигурацию, регламенты сопровождения и ответственных.',
      section: 'Завершение',
    }
  );

  return steps;
}
