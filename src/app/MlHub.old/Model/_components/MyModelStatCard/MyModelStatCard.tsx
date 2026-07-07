import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks/';
import { StatCard } from '../../../_components';
import { AccountCircle } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type MyModelStatCardProps = {
  author: string;
};

const MyModelStatCard: React.FC<MyModelStatCardProps> = ({ author }) => {
  const { data, isLoading, error } = Hooks.Models.useListByAuthor({ author });
  const history = useHistory();

  const models = data?.result || [];

  return (
    <StatCard
      icon={<AccountCircle fontSize="large" />}
      label="My Models"
      caption="Models you own, public and private"
      count={models.length}
      color="info.main"
      onClick={() => {
        history.push('/mlhub/me/models');
      }}
    />
  );
};

export default MyModelStatCard;
