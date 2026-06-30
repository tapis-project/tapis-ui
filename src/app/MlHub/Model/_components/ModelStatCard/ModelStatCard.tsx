import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks/';
import { StatCard } from '../../../_components';
import { Lock } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type ModelsStatCardProps = {
  author: string;
};

const ModelStatCard: React.FC<ModelsStatCardProps> = ({ author }) => {
  const { data, isLoading, error } = Hooks.Models.useListByAuthor({ author });
  const history = useHistory();

  const models = data?.result || [];

  return (
    <StatCard
      icon={<Lock fontSize="large" />}
      label="My Models"
      count={models.length}
      color="info.main"
      onClick={() => {
        history.push('/mlhub/my/models');
      }}
    />
  );
};

export default ModelStatCard;
