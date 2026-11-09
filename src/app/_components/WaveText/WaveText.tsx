/**
 * WaveText — the letters bob one after the next, the way RuneScape's `wave:`
 * chat effect does.
 *
 * A travelling wave is one keyframe plus a per-letter delay: the browser
 * animates transforms on the compositor, so there is no timer, no state and
 * no re-render while it runs. The keyframes rule is declared once on the
 * wrapper — @keyframes are document-level by name, so every letter can point
 * at it.
 *
 * By default it runs a fixed number of cycles and then rests: motion earns
 * attention once, and a headline that never stops moving is one people learn
 * to look past. Change the `replay` value to make it travel again. `loop` is
 * for text that is itself the reminder, a warning that stays true until it
 * is dealt with: the wave keeps coming, with a short stillness (`rest`)
 * between one wave landing and the next setting off, whatever the length of
 * the text.
 *
 * Two things it has to get right, because splitting words into letters is
 * hostile by default:
 *   - screen readers get the whole string from aria-label, and the letters
 *     are aria-hidden, or the text is announced one letter at a time;
 *   - prefers-reduced-motion gets the same words, still.
 */
import React from 'react';
import { Box } from '@mui/material';

const WAVE = 'waveTextBob';
// The looping wave: each letter bobs for about as long as one ordinary wave,
// the wave takes (letters × stagger) to cross the text, and then everything
// holds still for `rest` before the next one sets off.
const WAVE_LOOP = 'waveTextBobLoop';
const BOB_MS = 1040;

const WaveText: React.FC<{
  text: string;
  /** how many times the wave travels before it rests */
  cycles?: number;
  /** how far a letter rises, in px */
  amplitude?: number;
  /** gap between one letter's rise and the next, in ms */
  stagger?: number;
  /** change this to send the wave through again */
  replay?: unknown;
  /** keep waving, with a rest between waves, for as long as it is shown */
  loop?: boolean;
  /** in a loop, how long the text holds still between waves, in ms */
  rest?: number;
}> = ({
  text,
  cycles = 3,
  amplitude = 3,
  stagger = 45,
  replay,
  loop = false,
  rest = 350,
}) => {
  const letters = Array.from(text);
  // one full crossing plus the rest: the next wave leaves the first letter
  // exactly `rest` after the last letter lands
  const cycle = Math.round(
    BOB_MS + Math.max(0, letters.length - 1) * stagger + rest
  );
  const bob = +((BOB_MS / cycle) * 100).toFixed(2);
  // named for its shape: keyframes are global, and two loops of different
  // heights or lengths must not share one
  const loopName = `${WAVE_LOOP}${amplitude}_${cycle}`;

  return (
    <Box
      component="span"
      key={String(replay)}
      aria-label={text}
      sx={{
        [`@keyframes ${WAVE}`]: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: `translateY(-${amplitude}px)` },
        },
        ...(loop && {
          [`@keyframes ${loopName}`]: {
            '0%': { transform: 'translateY(0)' },
            [`${bob / 2}%`]: { transform: `translateY(-${amplitude}px)` },
            [`${bob}%, 100%`]: { transform: 'translateY(0)' },
          },
        }),
      }}
    >
      {letters.map((character, index) => (
        <Box
          component="span"
          aria-hidden
          key={`${index}-${character}`}
          sx={{
            display: 'inline-block',
            // a space with no glyph still has to hold its width
            whiteSpace: 'pre',
            animation: loop
              ? `${loopName} ${cycle}ms ease-in-out ${
                  index * stagger
                }ms infinite`
              : `${WAVE} 1.1s ease-in-out ${index * stagger}ms ${cycles}`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {character}
        </Box>
      ))}
    </Box>
  );
};

export default WaveText;
