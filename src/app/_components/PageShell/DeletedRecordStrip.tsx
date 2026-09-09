/**
 * The strip a deleted record's own page wears, under its head line: what
 * the state means, and the way back.
 *
 * It exists because a deleted record still HAS a page — the detail GET
 * cannot see it, so both the systems and apps pages read it out of the
 * deleted listing instead — and a page rendered from a different source,
 * with most of its doors shut, has to say so. Otherwise it reads as an
 * ordinary record that has quietly stopped working.
 *
 * Shared for the same reason the nav banner is: systems and apps differ
 * only in the noun and what restore calls.
 */
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { RestoreFromTrash } from '@mui/icons-material';

const DeletedRecordStrip: React.FC<{
  /** singular, lower case — 'system', 'app' */
  noun: string;
  /** what the record cannot do while deleted, in its own words */
  consequence: string;
  onRestore: () => void;
  busy?: boolean;
}> = ({ noun, consequence, onRestore, busy }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      border: '1px dashed',
      borderColor: 'divider',
      bgcolor: 'rgba(0,0,0,0.02)',
      borderRadius: 1,
      px: 1.25,
      py: 0.75,
      mt: 0.75,
    }}
  >
    <RestoreFromTrash sx={{ fontSize: 16, color: 'text.disabled' }} />
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontSize: '0.76rem', fontWeight: 700 }}>
        This {noun} is deleted
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
        Shown from the deleted listing, read-only: {consequence}. Restoring
        brings it back exactly as it was.
      </Typography>
    </Box>
    <Button
      size="small"
      variant="outlined"
      disabled={busy}
      startIcon={<RestoreFromTrash sx={{ fontSize: 14 }} />}
      onClick={onRestore}
      sx={{ textTransform: 'none', fontSize: '0.72rem', flexShrink: 0 }}
    >
      {busy ? 'Restoring…' : 'Restore'}
    </Button>
  </Box>
);

export default DeletedRecordStrip;
