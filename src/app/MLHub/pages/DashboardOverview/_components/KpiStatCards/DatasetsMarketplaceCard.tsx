import KpiCard from './KpiCard';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Storefront } from '@mui/icons-material';

type ListDatasetsMetadata = {
  count?: number;
};

export default function DatasetsMarketplaceCard() {
  const { data, isLoading, error } = Hooks.Datasets.useListGlobalDatasets({
    limit: 1,
    includeCount: true,
  });
  const metadata = (data?.metadata ?? {}) as ListDatasetsMetadata;

  return (
    <KpiCard
      title="Datasets Marketplace"
      value={metadata.count ?? 0}
      icon={<Storefront />}
      color="secondary"
      trend="+89"
      trendUp
      subtitle="Curated collections"
      navigateTo="/marketplaces/datasets"
      loading={isLoading}
      error={error}
    />
  );
}
