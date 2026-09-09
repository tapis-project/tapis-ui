import React from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { InfoOutlined } from '@mui/icons-material';

/**
 * The launcher's one-line note: what a section says before, or instead of,
 * its fields. What the app did or did not declare, what the chosen system
 * cannot do, what is still a template.
 *
 * In place of a full MUI Alert, which is a pastel block with a 24px icon and
 * its own padding: Execution used to open with one before the first field,
 * and three of them put the form below the fold. The same sentence at the
 * size of the text around it says as much in a third of the height. Every
 * such box in the launcher is this one, so they read as one kind of thing.
 */
const Note: React.FC<
  React.PropsWithChildren<{ tone?: 'info' | 'warning' }>
> = ({ tone = 'info', children }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 0.75,
      alignItems: 'flex-start',
      px: 1,
      py: 0.6,
      mb: 1,
      borderRadius: 1,
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette[tone].main, 0.35),
      bgcolor: (theme) => alpha(theme.palette[tone].main, 0.05),
      fontSize: '0.75rem',
      lineHeight: 1.45,
    }}
  >
    <InfoOutlined
      sx={{ fontSize: 15, mt: '1px', color: `${tone}.main`, flexShrink: 0 }}
    />
    <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
  </Box>
);

export default Note;
