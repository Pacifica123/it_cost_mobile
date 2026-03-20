import { SectionsMenu } from '../../../components/SectionsMenu';
export const entry = true;
export const title = 'Меню ИТ';
export const tab = true;

export default function MenuInTabs() {
  return <SectionsMenu variant="all" hideEntries />;
}