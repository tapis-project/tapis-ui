import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * One line at the top of a section saying what the app already brought, so a
 * long list of pre-filled rows reads as "the app declared these" rather than
 * "why is all this here". A visualisation can replace the row later; for now
 * the count is the whole point.
 */
const DeclaredSummary: React.FC<{ text: string }> = ({ text }) => (
  <Box
    sx={{
      px: 1.25,
      py: 0.75,
      mb: 1.5,
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'action.hover',
    }}
  >
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {text}
    </Typography>
  </Box>
);

export default DeclaredSummary;
