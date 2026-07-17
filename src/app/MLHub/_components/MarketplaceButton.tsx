import { StorefrontRounded } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { useNavigate } from '../_context/NavContext';

function capitalizeFirstLetter(string: string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

type Marketplace = 'model' | 'dataset';

const colorMap: Record<
  Marketplace,
  { color: string; backgroundColor: string }
> = {
  dataset: {
    color: 'text.primary',
    backgroundColor: 'secondary',
  },
  model: {
    color: 'text.primary',
    backgroundColor: 'primary',
  },
};

export const MarketplaceButton: React.FC<{
  marketplace: Marketplace;
}> = ({ marketplace }) => {
  const { navigate } = useNavigate();
  return (
    <>
      <Button
        variant="outlined"
        size="large"
        startIcon={<StorefrontRounded />}
        onClick={() => {
          switch (marketplace) {
            case 'model':
              navigate('/marketplaces/models');
              return;
            case 'dataset':
              navigate('/marketplaces/datasets');
              return;
          }
        }}
        fullWidth
      >
        <Typography variant="button" sx={colorMap[marketplace]}>
          Visit <b>{capitalizeFirstLetter(marketplace)}</b> <b>Marketplace</b>
        </Typography>
      </Button>
    </>
  );
};
