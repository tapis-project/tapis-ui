import * as React from 'react';
import DatasetIcon from '@mui/icons-material/Dataset';
import KpiCard from './KpiCard';
import { mockMarketplaceDatasets } from '../../../../data/mockData';
import { Storefront } from '@mui/icons-material';

export default function DatasetsMarketplaceCard() {
  const count = React.useMemo(() => mockMarketplaceDatasets.length, []);

  return (
    <KpiCard
      title="Datasets Marketplace"
      value={count}
      icon={<Storefront />}
      color="secondary"
      trend="+89"
      trendUp
      subtitle="Curated collections"
      navigateTo="/marketplaces/datasets"
      loading={false}
    />
  );
}
