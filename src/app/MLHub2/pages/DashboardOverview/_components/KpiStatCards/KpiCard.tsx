import * as React from 'react';
import { useNavigate } from '../../../../_context/NavContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  alpha,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  trend: string;
  trendUp: boolean;
  subtitle: string;
  navigateTo: string | null;
  loading: boolean;
}

export default function KpiCard({
  title,
  value,
  icon,
  color,
  trend,
  trendUp,
  subtitle,
  navigateTo,
  loading,
}: KpiCardProps) {
  const { navigate } = useNavigate();

  return (
    <Card
      elevation={0}
      onClick={() => navigateTo && navigate(navigateTo)}
      sx={{
        height: '100%',
        background: (theme) => alpha(theme.palette[color].main, 0.06),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette[color].main, 0.15),
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        cursor: navigateTo ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) =>
            `0 8px 24px ${alpha(theme.palette[color].main, 0.12)}`,
          ...(navigateTo && {
            borderColor: (theme) => alpha(theme.palette[color].main, 0.35),
            background: (theme) => alpha(theme.palette[color].main, 0.09),
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
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.15),
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
          {/* <Chip
            size="small"
            icon={trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={trend}
            color={trendUp ? 'success' : 'error'}
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
          /> */}
        </Stack>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 3,
              flexGrow: 1,
            }}
          >
            <CircularProgress size={36} color={color} />
          </Box>
        ) : (
          <>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {subtitle}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
