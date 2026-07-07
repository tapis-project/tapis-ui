import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface SectionProps<T> {
  title: string;
  icon?: React.ReactElement<T>;
  children: React.ReactNode;
}

export default function Section<T>({ title, icon, children }: SectionProps<T>) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {title}
      </Typography>
      <Divider sx={{ mb: 2.5 }} />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
