/**
 * The teaching strip under a nav's ledger, while soft-deleted records
 * exist: how many are riding the list (or hidden), the flip, and an X.
 * Dismissing is remembered on this device — the same choice stays in
 * Settings, so the X costs nothing but the reminder.
 *
 * Systems had this first. Apps has the same `showDeleted` + `/undelete`
 * pair and wanted the same strip, and the only differences were the noun
 * and which store it read — so the strip takes both.
 */
import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import type { DeletedPref } from './deletedPref';

const FLIP_SX = {
  border: 'none',
  background: 'none',
  p: '1px 4px',
  borderRadius: '3px',
  fontSize: '0.66rem',
  fontWeight: 600,
  color: '#1565c0',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  '&:hover': { bgcolor: 'rgba(21,101,192,0.08)' },
} as const;

const DeletedBanner: React.FC<{
  count: number;
  /** singular — 'system', 'app'; the plural is this plus an s */
  noun: string;
  pref: DeletedPref;
}> = ({ count, noun, pref }) => {
  const visibility = pref.useVisibility();
  const dismissed = pref.useBannerDismissed();
  if (count === 0 || dismissed) return null;
  const shown = visibility === 'show';
  const word = count === 1 ? noun : `${noun}s`;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.4,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(0,0,0,0.015)',
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.66rem',
          color: 'text.secondary',
          flex: 1,
          minWidth: 0,
        }}
        noWrap
      >
        {shown
          ? `${count} deleted ${word} shown`
          : `${count} deleted ${word} hidden`}
      </Typography>
      <Box
        component="button"
        type="button"
        onClick={() => pref.setVisibility(shown ? 'hide' : 'show')}
        sx={FLIP_SX}
      >
        {shown ? 'hide deleted' : 'show deleted'}
      </Box>
      <Tooltip title="Dismiss. The choice stays in Settings › Preferences">
        <Box
          component="button"
          type="button"
          aria-label={`Dismiss deleted-${noun}s banner`}
          onClick={pref.dismissBanner}
          sx={{
            border: 'none',
            background: 'none',
            p: '2px',
            borderRadius: '3px',
            display: 'inline-flex',
            color: 'text.disabled',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' },
          }}
        >
          <CloseRounded sx={{ fontSize: 12, display: 'block' }} />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default DeletedBanner;
