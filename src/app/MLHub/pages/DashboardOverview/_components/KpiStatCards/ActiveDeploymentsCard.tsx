import * as React from 'react';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import KpiCard from './KpiCard';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';

const ActiveDeploymentsCard = () => {
  const { data, isLoading } = Hooks.Deployments.useList();
  const deployments = data?.result || [];
  const metrics = React.useMemo(() => {
    const active = deployments.filter((d) => d.state === 'Running').length;
    const total = deployments.length;
    return { active, total };
  }, [data]);

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
      loading={isLoading}
    />
  );
};

export default ActiveDeploymentsCard;
