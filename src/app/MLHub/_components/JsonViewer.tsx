import { JSONDisplay } from '@tapis/tapisui-common';
import { Box, Typography } from '@mui/material';

export interface JsonViewerProps {
  value: unknown;
}

/**
 * Generic MLHub resource JSON view backed by the application's established
 * JSONDisplay/react18-json-view implementation.
 */
export function JsonViewer({ value }: JsonViewerProps) {
  if (value === undefined) {
    return (
      <Typography color="text.secondary" variant="body2">
        No JSON data is available.
      </Typography>
    );
  }

  return (
    <Box sx={{ '& .json-view': { borderRadius: '2px' }, minWidth: 0 }}>
      <JSONDisplay json={value} />
    </Box>
  );
}
