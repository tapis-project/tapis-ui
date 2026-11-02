import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';

type LoadError = Error & { status?: number };

const headlineFor = (kind: string, status: number | undefined): string => {
  if (status === 404) return `${kind} not found`;
  if (status === 401 || status === 403) {
    return `No access to this ${kind.toLowerCase()}`;
  }
  return `${kind} did not load`;
};

/** Stands in for a detail page whose record could not be read. */
const PodsLoadError: React.FC<{
  kind: string;
  id: string;
  error: unknown;
  /** where the record's list lives */
  listRoute: string;
  listLabel: string;
}> = ({ kind, id, error, listRoute, listLabel }) => {
  const { status, message } = (error ?? {}) as LoadError;
  return (
    <Box role="alert" sx={{ p: 2, maxWidth: 640 }}>
      <Typography variant="h6">{headlineFor(kind, status)}</Typography>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontFamily: 'monospace', overflowWrap: 'anywhere' }}
      >
        {id}
      </Typography>
      <ErrorDetail message={message || String(error)} />
      <Button
        size="small"
        variant="outlined"
        component={Link}
        to={listRoute}
        sx={{ mt: 1 }}
      >
        {listLabel}
      </Button>
    </Box>
  );
};

export default PodsLoadError;
