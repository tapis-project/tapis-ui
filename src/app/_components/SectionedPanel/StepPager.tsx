/**
 * A walk's pager: the ↑↓ pair every sectioned panel has, grown into the
 * walk's Back and Continue.
 *
 * Two rows. First the presses: ▲ is Back, a square beside the blue
 * ▼ Continue, so the pair still reads as the up/down the nav, the wheel and
 * the keys all use. Under them, where you are: the panel's view switches at
 * the left end, the step, and a small blue way to the end. The plain pair and
 * its hint line, drawn as well, were a second pager saying the same thing a
 * row lower.
 *
 * The wheel charges the press it is about to make: a flick toward the next
 * step rings Continue and counts down in the step's place, a flick back
 * lights ▲. Keys and presses flash the same way, so every way onward looks
 * like one thing.
 *
 * SectionedPanel renders it once, outside every scroller, so it is the same
 * element on every step. Nothing in it is sized by a label, and the step and
 * the countdown share one fixed slot: the second press lands where the first
 * one did, and the switches at the left end stay put when one of them
 * narrows the nav.
 */
import React from 'react';
import { Box, Button, ButtonBase, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
} from '@mui/icons-material';
import { LABEL_SX, MICRO_BTN_SX } from 'app/_components/PageShell/cardKit';
import {
  ACTION_BLUE,
  ACTION_BLUE_HOVER,
  ACTION_BTN_SX,
} from 'app/_components/PageShell/actionButton';
import {
  PagerCountdown,
  PagerFlashHandle,
  chargeOf,
  usePagerGlow,
} from './pagerGlow';

export type StepPagerTarget = { label: string; onGo: () => void };

const PRESS_H = 30;
// wide enough for "STEP 8 OF 8" and for the countdown ("2 more"), so trading
// one for the other moves nothing beside it
const WHERE_SLOT = 72;

/**
 * The walk's second press: small, thin, and blue in the lighter way, so it
 * reads as the way to the end without competing with Continue above it.
 * Exported so a host can put its own action there in the same shape.
 */
export const WalkActionButton: React.FC<
  React.PropsWithChildren<{ onClick: () => void; hint?: string }>
> = ({ onClick, hint, children }) => {
  const press = (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: 1,
        minWidth: 0,
        height: 22,
        px: 1,
        borderRadius: '5px',
        fontFamily: 'inherit',
        fontSize: '0.7rem',
        fontWeight: 600,
        color: ACTION_BLUE,
        bgcolor: alpha(ACTION_BLUE, 0.1),
        border: '1px solid',
        borderColor: alpha(ACTION_BLUE, 0.3),
        transition: 'background-color 120ms, border-color 120ms',
        '&:hover': {
          bgcolor: alpha(ACTION_BLUE, 0.18),
          borderColor: alpha(ACTION_BLUE, 0.55),
        },
      }}
    >
      <Box
        component="span"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </Box>
    </ButtonBase>
  );
  return hint ? (
    // describeChild: the hint is a description, not the name; the label is
    // what the press is called, for a screen reader as for everyone else.
    // To the right, out into the page: above, it sat on Continue, and an
    // interactive tooltip stayed open as the pointer moved up onto it.
    <Tooltip title={hint} placement="right" disableInteractive describeChild>
      {press}
    </Tooltip>
  ) : (
    press
  );
};

const StepPager = React.forwardRef<
  PagerFlashHandle,
  {
    stepOf: number;
    total: number;
    back?: StepPagerTarget;
    next?: StepPagerTarget;
    /** straight to the end of the walk: the small blue press in row two */
    skip?: StepPagerTarget;
    /** the host's own press for that place, instead of the skip */
    action?: React.ReactNode;
    /** the panel's view switches, at the left end of the second row */
    tools?: React.ReactNode;
  }
>(({ stepOf, total, back, next, skip, action, tools }, ref) => {
  const glow = usePagerGlow(ref);
  const up = back && glow?.dir === 'up' ? glow.strength : 0;
  const down = next && glow?.dir === 'down' ? glow.strength : 0;
  // short, because it shares the step's slot; the ring on Continue says what
  // it is counting toward
  const countdown =
    glow?.remaining && glow.remaining > 0
      ? `${glow.remaining} more`
      : undefined;
  // widens with the charge; the flick that completes it is the full ring
  const ring = down
    ? `0 0 0 ${1 + 2 * down}px ${alpha(ACTION_BLUE, 0.2 + 0.5 * down)}`
    : 'none';

  return (
    <Box
      role="group"
      aria-label="Step navigation"
      sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}
    >
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip
          title={
            back
              ? `Back to ${back.label} (↑, or wheel up at the top)`
              : 'This is the first step'
          }
          // above: to the right it would sit on Continue. Gone once the
          // pointer leaves, so it cannot hold the nav rows it covers.
          placement="top"
          disableInteractive
        >
          {/* the span is the tooltip's child: a disabled button cannot take
              the hover itself */}
          <Box component="span" sx={{ display: 'flex', flexShrink: 0 }}>
            <Button
              size="small"
              disabled={!back}
              onClick={back?.onGo}
              aria-label={back ? `Back to ${back.label}` : 'Back'}
              sx={{
                ...MICRO_BTN_SX,
                width: PRESS_H + 4,
                minWidth: PRESS_H + 4,
                height: PRESS_H,
                p: 0,
                bgcolor: 'background.paper',
                // a flick back lights the glyph, the way the plain ↑ did
                color: up
                  ? alpha(ACTION_BLUE, 0.45 + 0.55 * up)
                  : 'text.secondary',
                transition: 'color 100ms',
              }}
            >
              <KeyboardArrowUpRounded sx={{ fontSize: 20 }} />
            </Button>
          </Box>
        </Tooltip>
        <Tooltip
          title={
            next
              ? `Continue to ${next.label} (↓, or wheel down at the bottom)`
              : 'This is the last step'
          }
          // out into the page, and gone once the pointer leaves: above, it
          // covered the nav rows you were reaching for
          placement="right"
          disableInteractive
        >
          <Box component="span" sx={{ display: 'flex', flex: 1, minWidth: 0 }}>
            <Button
              size="small"
              variant="contained"
              disabled={!next}
              onClick={next?.onGo}
              aria-label={next ? `Continue to ${next.label}` : 'Continue'}
              startIcon={<KeyboardArrowDownRounded sx={{ fontSize: 18 }} />}
              sx={{
                ...ACTION_BTN_SX,
                width: '100%',
                height: PRESS_H,
                fontSize: '0.78rem',
                fontWeight: 600,
                boxShadow: ring,
                transition: 'box-shadow 120ms, background-color 160ms',
                '&:hover': { bgcolor: ACTION_BLUE_HOVER, boxShadow: ring },
              }}
            >
              Continue
            </Button>
          </Box>
        </Tooltip>
      </Box>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minHeight: 22 }}
      >
        {tools && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              '& .MuiIconButton-root': { p: 0.25 },
            }}
          >
            {tools}
          </Box>
        )}
        <Box
          sx={{
            width: WHERE_SLOT,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {countdown ? (
            <PagerCountdown
              text={countdown}
              charge={chargeOf(glow)}
              accent={ACTION_BLUE}
            />
          ) : (
            <Typography sx={{ ...LABEL_SX, pt: 0 }}>
              step {stepOf} of {total}
            </Typography>
          )}
        </Box>
        {/* the rest of the row: a real press, where the grey link and
            "last step" used to whisper */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          {action ??
            (skip && (
              <WalkActionButton onClick={skip.onGo}>
                {skip.label}
              </WalkActionButton>
            ))}
        </Box>
      </Box>
    </Box>
  );
});
StepPager.displayName = 'StepPager';

export default StepPager;
