import * as React from 'react';
import { Card, CardContent, Box, Typography, alpha } from '@mui/material';

interface PieChartCardProps {
  title: string;
  data: Array<{ value: number; label: string; color: string; icon?: string }>;
}

export default function PieChartCard({ title, data }: PieChartCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          boxShadow: (theme) =>
            `0 6px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
        transition: 'box-shadow 0.2s ease-in-out',
        overflow: 'visible',
      }}
    >
      <CardContent
        sx={{ p: 2.25, '&:last-child': { pb: 2.25 }, position: 'relative' }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, mb: 1.75, color: 'text.primary' }}
        >
          {title}
        </Typography>

        {/* Simple CSS-based donut visualization */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Donut ring */}
          <Box
            sx={{
              position: 'relative',
              width: 120,
              height: 120,
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 36 36" width={120} height={120}>
              {data
                .reduce<
                  Array<{
                    start: number;
                    end: number;
                    color: string;
                    index: number;
                  }>
                >((acc, item, idx) => {
                  const offset = acc.length > 0 ? acc[acc.length - 1].end : 0;
                  const pct = total > 0 ? (item.value / total) * 100 : 0;
                  acc.push({
                    start: offset,
                    end: offset + pct,
                    color: item.color,
                    index: idx,
                  });
                  return acc;
                }, [])
                .map((segment) => (
                  <circle
                    key={segment.index}
                    cx={18}
                    cy={18}
                    r={14}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={4}
                    strokeDasharray={`${segment.end - segment.start} ${
                      100 - segment.end + segment.start
                    }`}
                    strokeDashoffset={`${-segment.start}`}
                    strokeLinecap="round"
                  />
                ))}
            </svg>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                {total}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.55rem' }}
              >
                Total
              </Typography>
            </Box>
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.65,
              minWidth: 130,
            }}
          >
            {data.map((item) => {
              const pct =
                total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
              return (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: '0.78rem',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flex: 1, whiteSpace: 'nowrap' }}
                  >
                    {item.icon} {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  >
                    {pct}%
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
