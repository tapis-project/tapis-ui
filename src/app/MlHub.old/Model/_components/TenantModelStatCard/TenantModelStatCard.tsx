import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks/';
import { StatCard } from '../../../_components';
import { Business } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type TenantModelStatCardProps = {
  author: string;
};

const TenantModelStatCard: React.FC<TenantModelStatCardProps> = ({
  author,
}) => {
  const { data, isLoading, error } = Hooks.Models.useListByAuthor({ author });
  const history = useHistory();

  const models = data?.result || [];

  return (
    <StatCard
      icon={<Business />}
      label="Public Models"
      caption="Public models owned by users in your organization"
      count={models.length}
      color="warning.main"
      onClick={() => {
        history.push('/mlhub/models');
      }}
    />
  );
};

export default TenantModelStatCard;
