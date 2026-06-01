import { CatalogScreen } from '../../features/catalog/components/CatalogScreen';

export const title = 'ПО';

export default function SoftwareScreen() {
  return <CatalogScreen mode="capital" title="Программное обеспечение" capitalKind="software" />;
}
