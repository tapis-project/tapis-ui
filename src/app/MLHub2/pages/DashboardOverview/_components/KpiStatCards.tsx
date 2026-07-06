import * as React from 'react';
import { useNavigate } from '../../../_context/NavContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  Chip,
  alpha,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PublicIcon from '@mui/icons-material/Public';
import DatasetIcon from '@mui/icons-material/Dataset';

interface KpiStat {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  trend: string;
  trendUp: boolean;
  subtitle: string;
  navigateTo: string | null;
}

interface KpiStatCardsProps {
  totalModels: number;
  totalDatasets: number;
  activeDeployments: number;
  totalArtifacts: number;
  statusDistribution: Record<string, number>;
  totalDeployments: number;
}

export default function KpiStatCards({
  totalModels,
  totalDatasets,
  activeDeployments,
  totalArtifacts,
  statusDistribution,
  totalDeployments,
}: KpiStatCardsProps) {
  const { navigate } = useNavigate();
  const stats: KpiStat[] = [
    {
      title: 'Total Models',
      value: totalModels,
      icon: <SmartToyIcon />,
      color: 'primary',
      trend: '+12%',
      trendUp: true,
      subtitle: `${statusDistribution['pending'] || 0} pending`,
      navigateTo: '/models',
    },
    {
      title: 'Datasets',
      value: totalDatasets,
      icon: <DatasetIcon />,
      color: 'secondary',
      trend: '+5',
      trendUp: true,
      subtitle: 'Registered datasets',
      navigateTo: '/datasets',
    },
    {
      title: 'Active Deployments',
      value: activeDeployments,
      icon: <RocketLaunchIcon />,
      color: 'success',
      trend: '+3',
      trendUp: true,
      subtitle: `${totalDeployments} total`,
      navigateTo: '/deployments',
    },
    {
      title: 'Artifacts',
      value: totalArtifacts,
      icon: <Inventory2Icon />,
      color: 'warning',
      trend: '+24',
      trendUp: true,
      subtitle: 'Across all models',
      navigateTo: '/artifacts',
    },
    {
      title: 'Models Marketplace',
      value: '2,847',
      icon: <PublicIcon />,
      color: 'info',
      trend: '+156',
      trendUp: true,
      subtitle: 'Available to browse',
      navigateTo: '/marketplace',
    },
    {
      title: 'Datasets Marketplace',
      value: '1,423',
      icon: <DatasetIcon />,
      color: 'secondary',
      trend: '+89',
      trendUp: true,
      subtitle: 'Curated collections',
      navigateTo: '/dataset-marketplace',
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {stats.map((stat) => (
        <Grid size={{ xs: 12, sm: 6, lg: 2 }} key={stat.title}>
          <Card
            elevation={0}
            onClick={() => stat.navigateTo && navigate(stat.navigateTo)}
            sx={{
              height: '100%',
              background: (theme) =>
                alpha(theme.palette[stat.color].main, 0.06),
              border: '1px solid',
              borderColor: (theme) =>
                alpha(theme.palette[stat.color].main, 0.15),
              borderRadius: 3,
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              cursor: stat.navigateTo ? 'pointer' : 'default',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) =>
                  `0 8px 24px ${alpha(theme.palette[stat.color].main, 0.12)}`,
                ...(stat.navigateTo && {
                  borderColor: (theme) =>
                    alpha(theme.palette[stat.color].main, 0.35),
                  background: (theme) =>
                    alpha(theme.palette[stat.color].main, 0.09),
                }),
              },
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) =>
                      alpha(theme.palette[stat.color].main, 0.15),
                    color: `${stat.color}.main`,
                  }}
                >
                  {stat.icon}
                </Box>
                <Chip
                  size="small"
                  icon={
                    stat.trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />
                  }
                  label={stat.trend}
                  color={stat.trendUp ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
                />
              </Stack>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {stat.title}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {stat.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
