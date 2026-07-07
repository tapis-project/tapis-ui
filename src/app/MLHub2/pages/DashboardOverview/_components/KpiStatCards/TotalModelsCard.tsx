import * as React from 'react';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import KpiCard from './KpiCard';
import { mockModels } from '../../../../data/mockData';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';

export default function TotalModelsCard() {
  const { username } = useTapisConfig();
  const { data, isLoading, error } = Hooks.Models.useListByAuthor({
    author: username,
  });

  const models = data?.result || [];

  return (
    <KpiCard
      title="My Models"
      value={models.length}
      icon={<SmartToyIcon />}
      color="primary"
      trend="+12%"
      trendUp
      subtitle={`Models you own`}
      navigateTo="/models"
      loading={isLoading}
    />
  );
}
