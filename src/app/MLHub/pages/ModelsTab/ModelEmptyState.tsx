import { Button, Card, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function ModelEmptyState({
  onExploreMarketplace,
}: {
  onExploreMarketplace: () => void;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        py: 10,
        px: 3,
        textAlign: 'center',
      }}
    >
      <SmartToyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No models found
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Models you add to your collection will appear here.
      </Typography>
      <Button
        variant="outlined"
        startIcon={<StorefrontIcon />}
        onClick={onExploreMarketplace}
        sx={{ mt: 2, textTransform: 'none' }}
      >
        Explore the Models Marketplace
      </Button>
    </Card>
  );
}
