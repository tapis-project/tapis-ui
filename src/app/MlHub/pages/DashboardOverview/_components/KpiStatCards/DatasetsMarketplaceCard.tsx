import * as React from 'react';
import DatasetIcon from '@mui/icons-material/Dataset';
import KpiCard from './KpiCard';
import { mockMarketplaceDatasets } from '../../../../data/mockData';

export default function DatasetsMarketplaceCard() {
  const count = React.useMemo(() => mockMarketplaceDatasets.length, []);

  return (
    <KpiCard
      title="Datasets Marketplace"
      value={count}
      icon={<DatasetIcon />}
      color="secondary"
      trend="+89"
      trendUp
      subtitle="Curated collections"
      navigateTo="/dataset-marketplace"
      loading={false}
    />
  );
}
