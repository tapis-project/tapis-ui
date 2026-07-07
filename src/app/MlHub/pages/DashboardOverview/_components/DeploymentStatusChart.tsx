import * as React from 'react';
import { BarChart } from '@mui/x-charts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { DeploymentStatus } from '../../../types';
import type {} from '@mui/x-charts';

/** Canonical order of every deployment status the bar chart must display */
const ALL_DEPLOYMENT_STATUSES: Array<DeploymentStatus> = [
  'Running',
  'Stopped',
  'Failed',
  'Blocked',
  'Unknown',
  'NotDeployed',
];

interface DeploymentStatusChartProps {
  deployments: Array<{ status: string; environment: string }>;
  distribution: Partial<Record<string, number>>;
}

export default function DeploymentStatusChart({
  deployments,
  distribution,
}: DeploymentStatusChartProps) {
  // Build chart data — always include ALL statuses, even when count is 0
  const chartData = ALL_DEPLOYMENT_STATUSES.map((status, id) => ({
    id,
    label: status,
    value: distribution[status] ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">
          No deployment data available yet.
        </Typography>
      </Card>
    );
  }

  const total = deployments.length;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        '& .MuiChartsLegend-root': {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 1.5,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Deployment Status Distribution
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({total} total{total !== 1 ? 's' : ''})
          </Typography>
        </Box>

        <Box sx={{ width: '100%', height: 260, mt: 2 }}>
          <BarChart
            xAxis={[
              {
                scaleType: 'band' as const,
                data: chartData.map((d) => d.label),
                categoryGapRatio: 0.4,
              },
            ]}
            series={[
              {
                data: chartData.map((d) => d.value),
                label: 'Deployments',
                color: '#10b981',
              },
            ]}
            width={1100}
            height={260}
            slotProps={{
              legend: {},
            }}
          />
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {chartData.map((item) => {
            const pct =
              total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
            return (
              <Box
                key={item.label}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {item.label}: <strong>{item.value}</strong> ({pct}%)
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
