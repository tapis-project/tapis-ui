/**
 * What a nav's search box actually reached, said at the moment it
 * matters: while there is a query in the box.
 *
 * The box filters the rows the nav is HOLDING. That is the right
 * behaviour — it is instant, and the same query filters the page's table
 * with it — but nothing on screen says so, and an empty result reads as
 * "there is no such system" when it means "not in the fifty I fetched".
 * People re-learn this every time, which is the definition of a missing
 * sentence.
 *
 * Two things get said. The window, with the press that widens it, so the
 * reminder is also the fix. And then whatever this particular service
 * keeps out of reach, because that part is not fixable by loading more:
 * a hidden job is filtered out of /jobs/list AND /jobs/search, so no
 * query anywhere can return one.
 */
import React from 'react';
import { Box, ButtonBase } from '@mui/material';
import type { SpineForBar } from './NavWindowBar';

const PRESS_SX = {
  px: 0.5,
  borderRadius: '3px',
  fontSize: '0.62rem',
  fontWeight: 700,
  lineHeight: 1.5,
  color: '#5f4bb5',
  border: '1px solid #5f4bb555',
  '&:hover': { bgcolor: 'rgba(157,133,239,0.18)' },
  '&.Mui-disabled': { opacity: 0.5 },
} as const;

const NavSearchScope: React.FC<{
  /** plural, lower case — 'systems', 'jobs' */
  noun: string;
  spine?: SpineForBar;
  /**
   * What this service will not return to any search, ever. Only pass it
   * when that is true: "load more" is the answer everywhere else, and a
   * warning that does not apply is one people learn to skip.
   */
  unreachable?: React.ReactNode;
  /** in the window only because a preference puts it there */
  byPreference?: React.ReactNode;
}> = ({ noun, spine, unreachable, byPreference }) => {
  const meta = spine?.meta;
  const loaded = meta?.loaded ?? 0;
  const truncated = !!meta?.truncated;

  return (
    <>
      {truncated ? (
        <>
          Searching the {loaded} loaded {noun}, not the whole service.{' '}
          {spine?.canExpand && (
            <ButtonBase
              disabled={spine.expanding}
              onClick={spine.expandAll}
              sx={PRESS_SX}
            >
              {spine.expanding ? 'loading…' : 'load all'}
            </ButtonBase>
          )}
        </>
      ) : (
        <>
          Searching all {loaded} {noun}.
        </>
      )}
      {byPreference && <Box component="span"> {byPreference}</Box>}
      {unreachable && (
        <Box component="span" sx={{ display: 'block', color: '#9a5b00' }}>
          {unreachable}
        </Box>
      )}
    </>
  );
};

export default NavSearchScope;
