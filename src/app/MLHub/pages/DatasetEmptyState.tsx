import { Button, Card, Typography } from '@mui/material';
import DatasetIcon from '@mui/icons-material/Dataset';
import StorefrontIcon from '@mui/icons-material/Storefront';

export type DatasetEmptyScope = 'owned' | 'shared' | 'global';

const emptyStateCopy: Record<
  DatasetEmptyScope,
  { title: string; description: string }
> = {
  owned: {
    title: 'No owned datasets found',
    description: 'Datasets you register will appear here.',
  },
  shared: {
    title: 'No shared datasets found',
    description: 'Datasets shared with you will appear here.',
  },
  global: {
    title: 'No global datasets found',
    description: 'Global datasets will appear here when they become available.',
  },
};

export default function DatasetEmptyState({
  scope,
  onExploreMarketplace,
}: {
  scope: DatasetEmptyScope;
  onExploreMarketplace?: () => void;
}) {
  const { title, description } = emptyStateCopy[scope];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px dashed',
        borderColor: 'divider',
        py: 10,
        textAlign: 'center',
      }}
    >
      <DatasetIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled">
        {description}
      </Typography>
      {onExploreMarketplace && (
        <Button
          variant="outlined"
          startIcon={<StorefrontIcon />}
          onClick={onExploreMarketplace}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Explore the Datasets Marketplace
        </Button>
      )}
    </Card>
  );
}
