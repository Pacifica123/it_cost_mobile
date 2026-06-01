import { CatalogScreen } from '../../features/catalog/components/CatalogScreen';

export const title = 'Капитальные затраты';

export default function CapitalExpendituresScreen() {
  return <CatalogScreen mode="capital" title={title} />;
}
