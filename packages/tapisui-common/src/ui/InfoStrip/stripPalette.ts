/**
 * One base colour in, the whole strip palette out.
 *
 * The strip grammar (a hairline band, a dot, quiet text, outlined pills
 * that fill on hover) was hand-tuned twice — info blue for the docs
 * drawer, portal purple for the pre-login banner — as four rgba values
 * each. This derives them instead, so a page can say `tone="orange"` or
 * `color="#2f7fd1"` or even `color="rebeccapurple"` and get the same
 * relationships: bg at a few percent, border a little more, text darker.
 *
 * color-mix() does the arithmetic in CSS, which is what lets a named
 * colour or an rgb() string work as well as a hex — nothing here parses.
 */
export type StripTone = 'blue' | 'purple' | 'orange' | 'green' | 'grey';
export type StripIntensity = 'quiet' | 'normal' | 'loud';

export const STRIP_TONES: Record<StripTone, string> = {
  blue: '#1565c0', // the docs drawer
  purple: '#9d85ef', // the portal / pre-login banner
  orange: '#F69723', // pods admin
  green: '#2e7d32',
  grey: '#616161',
};

/** percentages of the base colour mixed over transparent (bg, border,
 *  button border) and over black (text) */
const MIX: Record<StripIntensity, [number, number, number, number]> = {
  quiet: [4, 18, 35, 55],
  normal: [7, 28, 50, 65],
  loud: [14, 45, 70, 72],
};

export type StripPalette = {
  base: string;
  bg: string;
  border: string;
  buttonBorder: string;
  text: string;
};

export const resolveStripBase = (tone?: StripTone, color?: string): string =>
  color || STRIP_TONES[tone ?? 'blue'];

export const stripPalette = (
  base: string,
  intensity: StripIntensity = 'normal'
): StripPalette => {
  const [bg, border, button, text] = MIX[intensity];
  return {
    base,
    bg: `color-mix(in srgb, ${base} ${bg}%, transparent)`,
    border: `color-mix(in srgb, ${base} ${border}%, transparent)`,
    buttonBorder: `color-mix(in srgb, ${base} ${button}%, transparent)`,
    text: `color-mix(in srgb, ${base} ${text}%, black)`,
  };
};
