import { CatalogScreen } from '../../features/catalog/components/CatalogScreen';

export const title = 'Операционные затраты';

export default function OperatingExpensesScreen() {
  return <CatalogScreen mode="operating" title={title} />;
}
