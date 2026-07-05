import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  alpha,
} from '@mui/material';
import type {} from '@mui/x-charts';

interface ModelStatusBreakdownProps {
  totalModels: number;
  statusDistribution: Record<string, number>;
}

export default function ModelStatusBreakdown({
  totalModels,
  statusDistribution,
}: ModelStatusBreakdownProps) {
  const statusItems = [
    { key: 'ready', label: 'Ready', color: '#22c55e', icon: '✅' },
    { key: 'pending', label: 'Pending Review', color: '#f59e0b', icon: '⏳' },
    { key: 'draft', label: 'Draft', color: '#9ca3af', icon: '📝' },
    { key: 'deprecated', label: 'Deprecated', color: '#ef4444', icon: '⚠️' },
    { key: 'archived', label: 'Archived', color: '#6b7280', icon: '📦' },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Model Status Breakdown
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {statusItems.map((item) => {
            const count = statusDistribution[item.key] || 0;
            const pct = totalModels > 0 ? (count / totalModels) * 100 : 0;

            return (
              <Box
                key={item.key}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <Typography sx={{ fontSize: '0.85rem', minWidth: 18 }}>
                  {item.icon}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.35,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, fontSize: '0.82rem' }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: '0.82rem' }}
                    >
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: (theme) => alpha(item.color, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              </Box>
            );
          })}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, textAlign: 'center', display: 'block' }}
          >
            {totalModels} total model{totalModels !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
