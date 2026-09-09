/**
 * A friendly "look here": a glow that beats twice and settles, for the card a
 * press brought you to, the badges that own the problems, the button that
 * submits.
 *
 * Two beats, the second softer than the first, then a long settle: the rhythm
 * of something helpful getting your attention (a Portal panel lighting up)
 * rather than an alarm. Every beat eases in and out; nothing snaps.
 *
 * It is also the cheap way to do it. The glow is a still box-shadow on a
 * pseudo-element and the only thing that animates is that layer's opacity,
 * which the compositor handles without repainting anything. So the keyframes
 * carry no colour, one name serves every tone, and two things glowing at once
 * cannot borrow each other's colour.
 *
 * To replay without remounting, alternate `name` between two values (their
 * keyframes are identical; switching the name is what restarts it).
 */
import { alpha } from '@mui/material/styles';

export const GLOW_MS = 1700;

const BEATS = {
  '0%': { opacity: 0 },
  '16%': { opacity: 1 },
  '33%': { opacity: 0.25 },
  '50%': { opacity: 0.8 },
  '100%': { opacity: 0 },
};

export const fadeGlowSx = (color: string, name = 'fadeGlow', spread = 4) => ({
  position: 'relative' as const,
  '&::after': {
    content: '""',
    position: 'absolute' as const,
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none' as const,
    boxShadow: `0 0 0 ${spread / 2}px ${alpha(color, 0.35)}, 0 0 ${
      spread * 3
    }px ${spread / 2}px ${alpha(color, 0.45)}`,
    opacity: 0,
    willChange: 'opacity',
    animation: `${name} ${GLOW_MS}ms ease-in-out 1`,
  },
  [`@keyframes ${name}`]: BEATS,
});

/**
 * The same two beats as a wash behind something small: text that should
 * light up with the card around it (the review board's section links). A
 * background under the text rather than a shadow around it, so an element
 * that clips its overflow still shows it.
 */
export const fadeTintSx = (color: string, name = 'fadeGlow') => ({
  position: 'relative' as const,
  // its own stacking context, so the wash sits behind the text and still in
  // front of whatever is behind the element
  zIndex: 0,
  '&::before': {
    content: '""',
    position: 'absolute' as const,
    inset: 0,
    zIndex: -1,
    borderRadius: '3px',
    pointerEvents: 'none' as const,
    backgroundColor: alpha(color, 0.16),
    opacity: 0,
    willChange: 'opacity',
    animation: `${name} ${GLOW_MS}ms ease-in-out 1`,
  },
  [`@keyframes ${name}`]: BEATS,
});
