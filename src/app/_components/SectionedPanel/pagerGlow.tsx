/**
 * The wheel's feedback, shared by a panel's two kinds of pager: the plain
 * ↑↓ pair, and a walk's Back and Continue. The shell counts the flicks;
 * whichever pager is on screen shows the charge, behind an imperative
 * handle, so a stream of wheel ticks re-renders the pager and nothing else.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface PagerFlashHandle {
  /**
   * @param strength 0..1 charge toward the page
   * @param remaining flicks still needed; drives the countdown
   */
  flash: (dir: 'up' | 'down', strength: number, remaining?: number) => void;
}

export type PagerGlow = {
  dir: 'up' | 'down';
  strength: number;
  remaining?: number;
} | null;

const GLOW_FADE_MS = 300;
// Walk away mid-charge and the panel forgets — a flick from a minute ago is
// not part of the intent you are expressing now. The countdown holds for
// exactly as long, which is why the shell reads this from here.
export const WHEEL_STREAK_RESET_MS = 1400;

export const usePagerGlow = (
  ref: React.ForwardedRef<PagerFlashHandle>
): PagerGlow => {
  const [glow, setGlow] = useState<PagerGlow>(null);
  const timer = useRef<number | undefined>(undefined);
  React.useImperativeHandle(
    ref,
    () => ({
      flash: (dir, strength, remaining) => {
        // quantized so a stream of wheel events with the same effective
        // strength returns the same state object and React skips the render
        const q = Math.round(strength * 20) / 20;
        setGlow((prev) =>
          prev &&
          prev.dir === dir &&
          prev.strength === q &&
          prev.remaining === remaining
            ? prev
            : { dir, strength: q, remaining }
        );
        window.clearTimeout(timer.current);
        // The countdown has to outlive a pause between flicks, or "2 more"
        // vanishes exactly while the user is deciding whether to do it.
        timer.current = window.setTimeout(
          () => setGlow(null),
          remaining ? WHEEL_STREAK_RESET_MS : GLOW_FADE_MS
        );
      },
    }),
    []
  );
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return glow;
};

/** "2 more scrolls", while a streak is part-way charged */
export const countdownOf = (glow: PagerGlow) =>
  glow?.remaining && glow.remaining > 0
    ? `${glow.remaining} more scroll${glow.remaining > 1 ? 's' : ''}`
    : undefined;

/** 0..1 across the streak, for anything that brightens with it */
export const chargeOf = (glow: PagerGlow) =>
  glow ? Math.min(1, Math.max(0, (glow.strength - 0.35) / 0.6)) : 0;

/**
 * Charging reads as a thing that is happening: a rounded box that brightens
 * and glows with the charge, so the countdown is noticed without the arrows
 * having to shout.
 */
export const PagerCountdown: React.FC<{
  text: string;
  charge: number;
  accent: string;
  ml?: number;
}> = ({ text, charge, accent, ml = 0 }) => (
  <Box
    sx={{
      ml,
      px: 0.6,
      py: 0,
      lineHeight: 1.5,
      borderRadius: '5px',
      border: '1px solid',
      borderColor: alpha(accent, 0.35 + 0.5 * charge),
      bgcolor: alpha(accent, 0.08 + 0.12 * charge),
      boxShadow: `0 0 ${4 + 8 * charge}px ${alpha(
        accent,
        0.25 + 0.45 * charge
      )}`,
      transition:
        'box-shadow 160ms, background-color 160ms, border-color 160ms',
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: accent,
        fontWeight: 600,
        fontSize: 10,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </Typography>
  </Box>
);
