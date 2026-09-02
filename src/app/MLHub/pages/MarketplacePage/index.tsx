import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DatasetIcon from '@mui/icons-material/Dataset';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from '../../_context/NavContext';

const marketplaces = [
  {
    title: 'Models Marketplace',
    description:
      'Discover curated AI and machine-learning models from connected platforms.',
    icon: <SmartToyIcon />,
    color: '#7c3aed',
    path: '/marketplaces/models',
  },
  {
    title: 'Datasets Marketplace',
    description:
      'Explore global datasets contributed to MLHub from connected data platforms.',
    icon: <DatasetIcon />,
    color: '#d97706',
    path: '/marketplaces/datasets',
  },
];

export default function MarketplacePage() {
  const { navigate } = useNavigate();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <StorefrontIcon sx={{ fontSize: 28, color: 'info.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Marketplaces
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Browse MLHub&apos;s curated catalogs of models and datasets.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {marketplaces.map((marketplace) => (
          <Grid key={marketplace.path} size={{ xs: 12, sm: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                transition:
                  'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) =>
                    `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderColor: alpha(marketplace.color, 0.45),
                },
              }}
            >
              <CardContent
                sx={{
                  height: '100%',
                  p: 2.5,
                  '&:last-child': { pb: 2.5 },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: alpha(marketplace.color, 0.12),
                    borderRadius: 2,
                    color: marketplace.color,
                    display: 'flex',
                    height: 44,
                    justifyContent: 'center',
                    mb: 2,
                    width: 44,
                  }}
                >
                  {marketplace.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                  {marketplace.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.55, mb: 2 }}
                >
                  {marketplace.description}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(marketplace.path)}
                  sx={{
                    alignSelf: 'flex-start',
                    color: marketplace.color,
                    fontWeight: 700,
                    px: 0,
                    textTransform: 'none',
                  }}
                >
                  Explore marketplace
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
