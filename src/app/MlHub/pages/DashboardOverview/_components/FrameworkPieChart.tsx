import * as React from 'react';
import { Box, Card, CardContent, Typography, alpha } from '@mui/material';
import { PieChart } from '@mui/x-charts';

interface FrameworkPieChartProps {
  data: Array<{ id: number; value: number; label: string; color: string }>;
  onClick: () => void;
}

/** Fixed dimensions for the pie chart drawing area */
const CHART_WIDTH = 300;
const CHART_HEIGHT = 280;

export default function FrameworkPieChart({
  data,
  onClick,
}: FrameworkPieChartProps) {
  // Defensive: ensure we have valid data before rendering
  const validData = data.filter((d) => d.value > 0);
  const isEmpty = validData.length === 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) =>
            `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Models by Inference Backend
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1 }}
        >
          Click for detailed breakdown →
        </Typography>

        {isEmpty ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No inference backend data available
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <PieChart
              series={[
                {
                  data: validData,
                  innerRadius: 50,
                  outerRadius: 90,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  cx: CHART_WIDTH / 2,
                  cy: CHART_HEIGHT / 2 - 10,
                },
              ]}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              slotProps={{
                legend: {
                  direction: 'horizontal',
                  position: { vertical: 'bottom', horizontal: 'center' },
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
