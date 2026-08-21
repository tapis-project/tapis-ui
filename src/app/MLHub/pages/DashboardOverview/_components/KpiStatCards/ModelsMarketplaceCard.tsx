import * as React from 'react';
import PublicIcon from '@mui/icons-material/Public';
import KpiCard from './KpiCard';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Storefront } from '@mui/icons-material';

type DiscoverModelsResponseMetadata = {
  count?: number;
  cursor?: string;
};

export default function ModelsMarketplaceCard() {
  const { data, isLoading, error } = Hooks.Models.useDiscoverModels({
    options: {
      autoRunParams: {
        discoveryCriteria: {
          criteria: [{ author: 'mlhub' }],
        },
        limit: 1,
        includeCount: true,
      },
    },
  });

  const respMetadata = (data?.metadata as DiscoverModelsResponseMetadata) || {
    count: 0,
    cursor: undefined,
  };

  return (
    <KpiCard
      title="Models Marketplace"
      value={respMetadata.count!}
      icon={<Storefront />}
      color="info"
      trend="+156"
      trendUp
      subtitle="Discover curated models"
      navigateTo="/marketplaces/models"
      loading={isLoading}
      error={error}
    />
  );
}
