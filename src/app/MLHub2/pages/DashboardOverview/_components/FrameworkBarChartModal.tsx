import * as React from 'react';
import { BarChart } from '@mui/x-charts';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type {} from '@mui/x-charts';
import { frameworkColorMap } from '../../../_components/constants';
import type { Model } from '../../../types';

interface FrameworkBarChartModalProps {
  open: boolean;
  onClose: () => void;
  data: Array<{ id: number; value: number; label: string; color: string }>;
}

interface ExtendedDataItem extends Array<number | string> {
  0: string; // framework name (for xAxis)
}

export default function FrameworkBarChartModal({
  open,
  onClose,
  data,
}: FrameworkBarChartModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          m: 0,
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Detailed Framework Breakdown
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ width: '100%', height: 400 }}>
          <BarChart
            xAxis={[
              {
                scaleType: 'band' as const,
                data: data.map((d) => d.label),
                categoryGapRatio: 0.4,
                barGapRatio: 0.2,
              },
            ]}
            series={[
              {
                data: data.map((d) => d.value),
                label: 'Models',
                color: '#6366f1',
              },
            ]}
            width={700}
            height={400}
            slotProps={{
              legend: {},
            }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          Each model can use multiple frameworks — this chart shows total
          framework assignments across all models.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
