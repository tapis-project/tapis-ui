import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks/';
import { StatCard } from '../../../_components';
import { Public } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type DiscoverModelsResponseMetadata = {
  count?: number;
  cursor?: string;
};

const GlobalModelStatCard: React.FC = () => {
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

  const history = useHistory();

  const respMetadata = (data?.metadata as DiscoverModelsResponseMetadata) ?? {};

  console.log({ data });

  return (
    <StatCard
      icon={<Public fontSize="large" />}
      label="Global Models"
      count={respMetadata.count ?? 'No count'}
      color="info.main"
      isLoading={isLoading}
      onClick={() => {
        history.push('/mlhub/global/models');
      }}
    />
  );
};

export default GlobalModelStatCard;
