/**
 * PageAbout — a landing page's numbers and its orientation text, as one block.
 *
 * Fifth shape. The first four all argued about where the prose should sit —
 * strip, accordion, popover, standing text — when the complaint was the prose
 * itself: four sentences run together in a single 76ch paragraph, with the
 * stat tiles stranded in a separate row above it.
 *
 * So the tiles and the About are one block: the words, then the numbers. The
 * words are the part you want once, so the ? in the page header turns them off
 * — everywhere, not one landing at a time — and remembers. Shown, they arrive
 * as a lead sentence plus discrete points, one per line: a short list is
 * readable at a glance in a way that a paragraph of semicolons never is.
 */
import React, { useSyncExternalStore } from 'react';
import { Box, Collapse, Skeleton, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { Tile, WELL } from './overviewKit';
import { getInfoDetail, subscribeInfoDetail } from './infoDetail';

export type AboutStat = {
  n: number | string;
  label: string;
  color?: string;
  /** what the number is counting, when the label cannot say it in two words */
  hint?: string;
  /** false drops the tile — for counts only worth showing when non-zero */
  when?: boolean;
};

const PageAbout: React.FC<{
  /** the noun alone: "Apps" renders as "About Apps" */
  title: string;
  stats?: AboutStat[];
  /** page controls that belong on the tile row, e.g. a create button */
  actions?: React.ReactNode;
  /** one sentence — what this thing is */
  lead: React.ReactNode;
  /** what you do about it: one line each, never run together */
  points?: React.ReactNode[];
  /** first fetch in flight: the words and tiles render, the numbers wait —
   *  a zero that means "not counted yet" must not look like a count */
  loading?: boolean;
}> = ({ title, stats, actions, lead, points, loading }) => {
  // The page's ? decides this now, for every page at once. Per-page toggles
  // meant the words could only be dismissed one landing at a time, and the
  // control sat above the numbers taking a line of its own.
  const open = useSyncExternalStore(subscribeInfoDetail, getInfoDetail);

  const tiles = (stats ?? []).filter((stat) => stat.when !== false);

  return (
    <Box sx={{ mb: 1 }}>
      <Collapse in={open} unmountOnExit>
        <Box
          sx={{
            ...WELL,
            maxWidth: '78ch',
            display: 'flex',
            gap: 0.75,
            alignItems: 'flex-start',
          }}
        >
          <InfoOutlined
            sx={{ fontSize: 14, color: '#1565c0', mt: '3px', flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
              {lead}
            </Typography>
            {!!points?.length && (
              <Box
                component="ul"
                sx={{
                  m: 0,
                  mt: 0.75,
                  pl: 0,
                  listStyle: 'none',
                  display: 'grid',
                  gap: 0.4,
                }}
              >
                {points.map((point, index) => (
                  <Box
                    component="li"
                    // the points are authored prose, fixed per page — index is
                    // the only identity they have and it never reorders
                    key={`about-point-${index}`}
                    sx={{
                      display: 'flex',
                      gap: 0.75,
                      fontSize: '0.72rem',
                      lineHeight: 1.55,
                      color: 'text.secondary',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ color: '#1565c0', flexShrink: 0 }}
                    >
                      ·
                    </Box>
                    <Box component="span">{point}</Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          // a gap only when there is something above to be separated from:
          // with the words off, this was eight pixels of nothing holding the
          // numbers lower than every other page's first row
          mt: open ? 1 : 0,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {tiles.map((stat) => (
          <Tile
            key={stat.label}
            n={loading ? <Skeleton width={26} sx={{ mx: 'auto' }} /> : stat.n}
            label={stat.label}
            color={stat.color}
            hint={stat.hint}
          />
        ))}
        <Box sx={{ flex: 1 }} />
        {actions}
      </Box>
    </Box>
  );
};

export default PageAbout;
