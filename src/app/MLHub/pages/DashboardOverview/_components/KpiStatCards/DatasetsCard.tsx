import * as React from 'react';
import DatasetIcon from '@mui/icons-material/Dataset';
import KpiCard from './KpiCard';
import { mockDatasets } from '../../../../data/mockData';

export default function DatasetsCard() {
  const totalDatasets = React.useMemo(() => mockDatasets.length, []);

  return (
    <KpiCard
      title="Datasets"
      value={totalDatasets}
      icon={<DatasetIcon />}
      color="secondary"
      trend="+5"
      trendUp
      subtitle="Registered datasets"
      navigateTo="/datasets"
      loading={false}
    />
  );
}
