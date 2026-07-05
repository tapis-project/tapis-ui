import * as React from 'react';
import { Box, Typography } from '@mui/material';

interface MetaItemProps {
  icon: React.ReactElement;
  label: string;
  value: React.ReactNode;
}

/**
 * Reusable metadata row used by ModelDetailsPage and DatasetDetailsPage.
 * Renders an icon, label, and value in a horizontal flex layout.
 */
export default function MetaItem({ icon, label, value }: MetaItemProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: 'text.secondary', mt: 0.25, fontSize: '1.1rem' }}>
        {icon}
      </Box>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" component="span">
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
