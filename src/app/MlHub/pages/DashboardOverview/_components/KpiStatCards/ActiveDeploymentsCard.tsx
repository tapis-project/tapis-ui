import * as React from 'react';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import KpiCard from './KpiCard';
import { mockDeployments } from '../../../../data/mockData';

export default function ActiveDeploymentsCard() {
  const metrics = React.useMemo(() => {
    const active = mockDeployments.filter((d) => d.status === 'Running').length;
    const total = mockDeployments.length;
    return { active, total };
  }, []);

  return (
    <KpiCard
      title="Active Deployments"
      value={metrics.active}
      icon={<RocketLaunchIcon />}
      color="success"
      trend="+3"
      trendUp
      subtitle={`${metrics.total} total`}
      navigateTo="/deployments"
      loading={false}
    />
  );
}
