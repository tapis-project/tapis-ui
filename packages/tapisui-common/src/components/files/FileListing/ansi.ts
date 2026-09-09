/**
 * Terminal escape codes in a file, made readable.
 *
 * Anything that writes a log through a modern logger — Rust's tracing, cargo,
 * pytest, most Go tooling — colours it with SGR escapes. Printed literally,
 * a single line of tracing output reads:
 *
 *   [2m2026-08-27T16:29:10Z[0m [32m INFO[0m [1mHTTP request[0m
 *
 * which is most of a line of noise wrapped around three words. So the viewer
 * either takes the codes out or acts on them, and this is what does both.
 *
 * Stripping is the default because it is nearly free: one pass of a regex
 * over the text, and the result is still a single text node. Rendering costs
 * an element per run of colour, which is worth it when you want the colours
 * and not worth paying for when you do not.
 */

/**
 * Everything worth removing, not just the colour codes.
 *
 * A log that has been through a progress bar also carries cursor moves and
 * erase-line codes; leaving those in trades one kind of gibberish for
 * another. OSC sequences (window titles, hyperlinks) go too — they end at a
 * BEL or a string terminator.
 */
const CSI = /\x1b\[[0-9;:?]*[ -/]*[@-~]/g;
const OSC = /\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g;
const LONE = /\x1b[@-Z\\-_]/g;

export const stripAnsi = (input: string): string =>
  input.replace(OSC, '').replace(CSI, '').replace(LONE, '');

export const hasAnsi = (input: string): boolean =>
  /\x1b\[[0-9;:?]*m/.test(input);

export type AnsiStyle = {
  color?: string;
  background?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type AnsiSegment = { text: string; style: AnsiStyle };

/**
 * A palette for paper, not for a black terminal.
 *
 * The usual ANSI colours assume a dark background — bright yellow on this
 * pane's near-white is invisible, and bright white is worse. These are the
 * same eight hues pulled down to something with contrast against #fcfcfb.
 */
const NORMAL = [
  '#2e3436', // black
  '#c0392b', // red
  '#2e7d32', // green
  '#8a6d00', // yellow
  '#1565c0', // blue
  '#8e44ad', // magenta
  '#00838f', // cyan
  '#7f8c8d', // white
];

const BRIGHT = [
  '#555f61',
  '#e74c3c',
  '#43a047',
  '#b58900',
  '#1e88e5',
  '#a569bd',
  '#00acc1',
  '#95a5a6',
];

/** xterm's 256: 16 named, a 6×6×6 cube, then 24 greys. */
export const xterm256 = (index: number): string => {
  if (index < 8) return NORMAL[index];
  if (index < 16) return BRIGHT[index - 8];
  if (index < 232) {
    const level = (value: number) => (value === 0 ? 0 : 55 + value * 40);
    const offset = index - 16;
    const [r, g, b] = [
      level(Math.floor(offset / 36)),
      level(Math.floor(offset / 6) % 6),
      level(offset % 6),
    ];
    return `rgb(${r}, ${g}, ${b})`;
  }
  const grey = 8 + (index - 232) * 10;
  return `rgb(${grey}, ${grey}, ${grey})`;
};

/** Applies one SGR run — `1;38;5;208` — to a style, in place of the old one. */
export const applySgr = (style: AnsiStyle, params: number[]): AnsiStyle => {
  let next: AnsiStyle = { ...style };
  for (let i = 0; i < params.length; i += 1) {
    const code = params[i];
    if (code === 0) next = {};
    else if (code === 1) next.bold = true;
    else if (code === 2) next.dim = true;
    else if (code === 3) next.italic = true;
    else if (code === 4) next.underline = true;
    else if (code === 22) {
      next.bold = false;
      next.dim = false;
    } else if (code === 23) next.italic = false;
    else if (code === 24) next.underline = false;
    else if (code >= 30 && code <= 37) next.color = NORMAL[code - 30];
    else if (code >= 90 && code <= 97) next.color = BRIGHT[code - 90];
    else if (code >= 40 && code <= 47) next.background = NORMAL[code - 40];
    else if (code >= 100 && code <= 107) next.background = BRIGHT[code - 100];
    else if (code === 39) delete next.color;
    else if (code === 49) delete next.background;
    else if (code === 38 || code === 48) {
      // extended colour: 5;n for the 256 table, 2;r;g;b for truecolour
      const target = code === 38 ? 'color' : 'background';
      if (params[i + 1] === 5) {
        next[target] = xterm256(params[i + 2] ?? 0);
        i += 2;
      } else if (params[i + 1] === 2) {
        const [r, g, b] = [
          params[i + 2] ?? 0,
          params[i + 3] ?? 0,
          params[i + 4] ?? 0,
        ];
        next[target] = `rgb(${r}, ${g}, ${b})`;
        i += 4;
      }
    }
  }
  return next;
};

const SGR = /\x1b\[([0-9;:]*)m/g;

/**
 * The text as runs of styling.
 *
 * Non-colour escapes are dropped rather than honoured: a viewer is not a
 * terminal, and a cursor-up in the middle of a static pane has nothing to
 * mean. Adjacent runs that share a style are merged, so a log that resets
 * after every word does not become an element per word.
 */
export const parseAnsi = (input: string): AnsiSegment[] => {
  const segments: AnsiSegment[] = [];
  let style: AnsiStyle = {};
  let at = 0;

  const push = (text: string) => {
    if (!text) return;
    const clean = stripAnsi(text);
    if (!clean) return;
    const last = segments[segments.length - 1];
    if (last && sameStyle(last.style, style)) last.text += clean;
    else segments.push({ text: clean, style });
  };

  SGR.lastIndex = 0;
  let match = SGR.exec(input);
  while (match) {
    push(input.slice(at, match.index));
    style = applySgr(
      style,
      match[1]
        .split(/[;:]/)
        .map((part) => (part === '' ? 0 : Number(part)))
        .filter((value) => Number.isFinite(value))
    );
    at = match.index + match[0].length;
    match = SGR.exec(input);
  }
  push(input.slice(at));
  return segments;
};

const sameStyle = (a: AnsiStyle, b: AnsiStyle): boolean =>
  a.color === b.color &&
  a.background === b.background &&
  Boolean(a.bold) === Boolean(b.bold) &&
  Boolean(a.dim) === Boolean(b.dim) &&
  Boolean(a.italic) === Boolean(b.italic) &&
  Boolean(a.underline) === Boolean(b.underline);

/** The same runs, cut at every newline, for the numbered gutter. */
export const splitAnsiLines = (
  segments: Array<AnsiSegment>
): Array<Array<AnsiSegment>> => {
  const lines: Array<Array<AnsiSegment>> = [[]];
  segments.forEach(({ text, style }) => {
    const parts = text.split('\n');
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, style });
    });
  });
  return lines;
};
