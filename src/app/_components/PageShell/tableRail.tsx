/**
 * The density preference and the small shared pieces of a landing table's
 * strip. The strip itself — facts, transient hint, ⓘ, controls, worn on
 * the table's top or bottom edge per preference — is TableShell
 * (tableShell.tsx); what lives here is what the shell and the cells both
 * reach for:
 *
 *   density store  — cross-table, per-device: the overviewKit's cells
 *                    read it, so one press roomies every landing table.
 *   DensityButton  — the files bar's quiet 20px press, for the shell.
 *   RAIL_TEXT_SX / RAIL_BTN_SX — the strip's word and press styling.
 */
import React, { useSyncExternalStore } from 'react';
import { Box, Tooltip } from '@mui/material';
import { UnfoldLessRounded, UnfoldMoreRounded } from '@mui/icons-material';

// ── the density preference ─────────────────────────────────────────────────

export type TableDensity = 'compact' | 'comfortable';

const KEY = 'tables.density';

const readDensity = (): TableDensity => {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === 'comfortable' ? 'comfortable' : 'compact';
  } catch {
    return 'compact';
  }
};

let density: TableDensity = readDensity();

const listeners = new Set<() => void>();

export const subscribeTableDensity = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getTableDensity = (): TableDensity => density;

export const setTableDensity = (next: TableDensity) => {
  density = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // it still holds for this visit
  }
  listeners.forEach((listener) => listener());
};

export const useTableDensity = (): TableDensity =>
  useSyncExternalStore(subscribeTableDensity, getTableDensity);

// ── the strip's shared styling ─────────────────────────────────────────────

export const RAIL_TEXT_SX = {
  fontSize: '0.64rem',
  color: 'text.secondary',
  minWidth: 0,
} as const;

export const RAIL_BTN_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 20,
  width: 20,
  p: 0,
  border: 'none',
  borderRadius: '4px',
  bgcolor: 'transparent',
  color: 'text.disabled',
  cursor: 'pointer',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' },
  '& svg': { fontSize: 14, display: 'block' },
} as const;

/** the files bar's density press, for every landing table at once */
export const DensityButton: React.FC = () => {
  const current = useTableDensity();
  const compact = current === 'compact';
  return (
    <Tooltip
      title={compact ? 'Roomier rows' : 'Fit more rows on screen'}
      // one preference, every landing table — worth saying once
      describeChild
    >
      <Box
        component="button"
        type="button"
        aria-label="Toggle row density"
        onClick={() => setTableDensity(compact ? 'comfortable' : 'compact')}
        sx={RAIL_BTN_SX}
      >
        {compact ? <UnfoldMoreRounded /> : <UnfoldLessRounded />}
      </Box>
    </Tooltip>
  );
};
