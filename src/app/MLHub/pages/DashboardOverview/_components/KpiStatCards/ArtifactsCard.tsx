import * as React from 'react';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import KpiCard from './KpiCard';
import { mockArtifacts } from '../../../../data/mockData';

export default function ArtifactsCard() {
  const totalArtifacts = React.useMemo(() => mockArtifacts.length, []);

  return (
    <KpiCard
      title="Artifacts"
      value={totalArtifacts}
      icon={<Inventory2Icon />}
      color="warning"
      trend="+24"
      trendUp
      subtitle="Across all models"
      navigateTo="/artifacts"
      loading={false}
    />
  );
}
