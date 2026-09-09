/**
 * The head line's word on the whole form: what is left, in the fewest
 * characters that still say where.
 *
 * A chip per severity, never a sentence: red "3 to fix · Execution", amber
 * "1 to check". The count says there is work, the section after the dot says
 * where to put your hands, and hovering lists every item, so the detail costs
 * nothing until it is wanted. A press goes straight to the first section that
 * owes something rather than to a list of them.
 *
 * It owns a fixed-width slot, right-aligned: the one thing in the head line
 * that changes length must not walk anything beside it.
 */
import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

export type IssueStatusGroup = {
  count: number;
  /** where the first of them lives, said after the count */
  where?: string;
  /** every item, one line each, for the hover */
  lines: string[];
  onGo?: () => void;
};

const TONES = {
  blocker: {
    color: '#b3261e',
    bg: '#fce8e6',
    border: '#f2b8b5',
    noun: 'to fix',
  },
  warning: {
    color: '#8a6d00',
    bg: '#fdf6dd',
    border: '#ecd98f',
    noun: 'to check',
  },
} as const;

// a hover is a glance, not a report: past this many, say how many more
const HOVER_LINES = 8;

const IssueChip: React.FC<{
  kind: keyof typeof TONES;
  group: IssueStatusGroup;
}> = ({ kind, group }) => {
  const tone = TONES[kind];
  const shown = group.lines.slice(0, HOVER_LINES);
  const more = group.lines.length - shown.length;
  return (
    <Tooltip
      arrow
      title={
        <Box sx={{ py: 0.25 }}>
          {shown.map((line, index) => (
            // color: inherit, because the app paints Typography dark and the
            // tooltip is dark: without it the list was dark on dark
            <Typography
              key={`${kind}-line-${index}`}
              sx={{ fontSize: '0.72rem', lineHeight: 1.45, color: 'inherit' }}
            >
              {line}
            </Typography>
          ))}
          {more > 0 && (
            <Typography
              sx={{ fontSize: '0.7rem', opacity: 0.8, color: 'inherit' }}
            >
              and {more} more
            </Typography>
          )}
        </Box>
      }
    >
      <Chip
        size="small"
        clickable={!!group.onGo}
        onClick={group.onGo}
        label={
          <>
            {/* the count is its own element, so "3 to fix" is findable as
                exactly that, whatever follows it */}
            <span>
              {group.count} {tone.noun}
            </span>
            {group.where && (
              <Box component="span" sx={{ fontWeight: 500, opacity: 0.85 }}>
                {' '}
                · {group.where}
              </Box>
            )}
          </>
        }
        sx={{
          height: 22,
          borderRadius: '4px',
          maxWidth: '100%',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: tone.color,
          bgcolor: tone.bg,
          border: '1px solid',
          borderColor: tone.border,
          '&:hover': { bgcolor: tone.bg, borderColor: tone.color },
          '& .MuiChip-label': {
            px: 0.9,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }}
      />
    </Tooltip>
  );
};

const IssueStatus: React.FC<{
  /** false until the first full check has come back */
  checked: boolean;
  blockers?: IssueStatusGroup;
  warnings?: IssueStatusGroup;
  /** said, in green, when nothing blocks */
  readyLabel: string;
  /** a receipt that outranks the counts, e.g. "submitted" */
  done?: React.ReactNode;
  width?: number;
}> = ({ checked, blockers, warnings, readyLabel, done, width = 240 }) => (
  <Box
    sx={{
      width,
      minWidth: 0,
      flexShrink: 1,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 0.5,
    }}
  >
    {done ??
      (!checked ? (
        // never 'ready' before the first check lands: green on open,
        // corrected a moment later, is exactly backwards
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}
        >
          checking…
        </Typography>
      ) : (
        <>
          {blockers?.count ? (
            <IssueChip kind="blocker" group={blockers} />
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: 'success.main',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
              }}
            >
              <CheckCircleOutline sx={{ fontSize: 14 }} />
              {readyLabel}
            </Typography>
          )}
          {/* amber never replaces red or green: it does not block, so it
              rides beside whichever of them is true */}
          {!!warnings?.count && <IssueChip kind="warning" group={warnings} />}
        </>
      ))}
  </Box>
);

export default IssueStatus;
