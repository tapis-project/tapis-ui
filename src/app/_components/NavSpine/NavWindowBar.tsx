/**
 * The nav's window ledger — the purple strip (same family as the pre-login
 * banner) that says how much of the truth the list below actually holds,
 * and owns the controls that grow it.
 *
 * One line: "50 of 312 systems" plus the expand presses, and — once the
 * fetch is old enough to matter — how old it is, with a refresh press.
 *
 * It used to carry a second, amber line saying that search and sort ran
 * over the loaded rows rather than the world. That fact is now the search
 * box's own (NavSearchScope), where it is asked rather than announced, so
 * the strip no longer says it too. Two surfaces telling you the same thing
 * is how one of them stops being read.
 *
 * It renders inside the list's pinned header (below the search bar, above
 * the group headers), so it stays on screen while the rows scroll.
 */
import React, { useEffect, useReducer } from 'react';
import {
  Box,
  ButtonBase,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import { RefreshRounded } from '@mui/icons-material';
import { nounFor } from './spineModel';
import type { WindowMeta } from './spineModel';

const PURPLE_TEXT = '#5f4bb5';
const PURPLE_BG = 'rgba(157, 133, 239, 0.09)';
const AMBER_TEXT = '#9a5b00';
const AMBER_BG = 'rgba(255, 167, 38, 0.14)';

/** past this many objects, "all" stops being a favor */
const ALL_CAP = 1000;

/** younger than this, the fetch is simply "now" and stays unannounced */
const FRESH_MS = 90_000;

export const ageLabel = (ms: number): string => {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m old`;
  return `${Math.round(m / 60)}h old`;
};

/** what the fetched-at stamp and the refresh press both need saying */
const FRESHNESS_TIP =
  'The list is fetched once and then holds still — a row updates when you ' +
  'open its job. Refresh refetches the whole window.';

const BarButton: React.FC<{
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}> = ({ label, onClick, disabled, ariaLabel }) => (
  <ButtonBase
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    sx={{
      px: 0.5,
      borderRadius: '3px',
      border: `1px solid ${PURPLE_TEXT}55`,
      color: PURPLE_TEXT,
      fontSize: '0.6rem',
      fontWeight: 700,
      lineHeight: 1.5,
      '&:hover': { bgcolor: 'rgba(157,133,239,0.18)' },
      '&.Mui-disabled': { opacity: 0.5 },
    }}
  >
    {label}
  </ButtonBase>
);

/** the slice of `useNavWindow`'s return the ledger renders */
export type SpineForBar = {
  meta: WindowMeta;
  canExpand: boolean;
  expanding: boolean;
  expand: () => void;
  expandAll: () => void;
  windowSize: number;
  /** epoch ms of the last window fetch — 0 while nothing has landed */
  fetchedAt?: number;
  refresh?: () => void;
  refreshing?: boolean;
  /** the first fetch is still in flight — the strip says so instead of "0" */
  isLoading?: boolean;
};

const NavWindowBar: React.FC<{ noun: string; spine: SpineForBar }> = ({
  noun,
  spine,
}) => {
  const {
    meta,
    canExpand,
    expanding,
    expand,
    expandAll,
    windowSize,
    fetchedAt,
    refresh,
    refreshing,
    isLoading,
  } = spine;
  // the age stamp has to move on its own — nothing else re-renders a nav
  // that is just sitting there getting stale
  const [, tick] = useReducer((c: number) => c + 1, 0);
  useEffect(() => {
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
  const age = fetchedAt ? Date.now() - fetchedAt : 0;

  // "1 jobs · all loaded" read like a bug — one gets the singular and no
  // "all", none gets a plain sentence instead of a triumphant empty total
  const count = isLoading
    ? `loading ${noun}…`
    : meta.complete && meta.total != null
    ? meta.total === 0
      ? `no ${noun} yet`
      : meta.total === 1
      ? `1 ${nounFor(noun, 1)} · loaded`
      : `${meta.total} ${noun} · all loaded`
    : meta.total != null
    ? `${meta.loaded} of ${meta.total} ${noun}`
    : `${meta.loaded} ${nounFor(noun, meta.loaded)} loaded`;
  return (
    <Box
      sx={{ borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
      data-navwindowbar=""
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: '2px',
          bgcolor: PURPLE_BG,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.62rem',
            fontWeight: 600,
            color: PURPLE_TEXT,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {count}
          {age >= FRESH_MS && (
            <Tooltip title={FRESHNESS_TIP} arrow>
              <Typography
                component="span"
                sx={{ fontSize: 'inherit', fontWeight: 500, opacity: 0.75 }}
              >
                {' '}
                · {ageLabel(age)}
              </Typography>
            </Tooltip>
          )}
        </Typography>
        {(expanding || refreshing || isLoading) && (
          <CircularProgress size={9} sx={{ color: PURPLE_TEXT }} />
        )}
        {refresh && !isLoading && (
          <Tooltip title={FRESHNESS_TIP} arrow>
            <span>
              <BarButton
                ariaLabel={`Refresh ${noun} list`}
                label={
                  <RefreshRounded sx={{ fontSize: 11, display: 'block' }} />
                }
                onClick={refresh}
                disabled={!!refreshing}
              />
            </span>
          </Tooltip>
        )}
        {canExpand && (
          <BarButton
            label={`+${windowSize}`}
            onClick={expand}
            disabled={expanding}
          />
        )}
        {canExpand && meta.total != null && meta.total <= ALL_CAP && (
          <BarButton label="all" onClick={expandAll} disabled={expanding} />
        )}
      </Box>
    </Box>
  );
};

export default NavWindowBar;
