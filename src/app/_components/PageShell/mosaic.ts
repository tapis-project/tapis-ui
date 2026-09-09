/**
 * How the fact boxes are dealt into columns, and when their bottoms are
 * made to line up. Pure, because this is the part with opinions in it —
 * CardMosaic only measures and renders what these decide.
 */

/** the narrowest a fact box is allowed to get before a column is dropped */
export const MOSAIC_MIN = 340;
export const MOSAIC_GAP = 8;

/** how many columns of at least `min` fit in `width`, gaps included */
export const columnsFor = (
  width: number,
  min = MOSAIC_MIN,
  gap = MOSAIC_GAP
): number => {
  if (!width) return 1;
  return Math.max(1, Math.floor((width + gap) / (min + gap)));
};

/** the first-paint deal, before anything has been measured */
export const spreadColumns = (count: number, columns: number): number[][] => {
  const cols: number[][] = Array.from({ length: columns }, () => []);
  for (let i = 0; i < count; i += 1) cols[i % columns].push(i);
  return cols;
};

/**
 * Deal the boxes out, shortest column first, in source order.
 *
 * Greedy rather than optimal on purpose: an optimal packing reorders
 * boxes to fill gaps, which moves Sharing & access above History on one
 * system and below it on the next. Source order is a promise — the page
 * decides what comes first — and shortest-first gets within a box or two
 * of optimal while keeping it.
 */
export const packColumns = (heights: number[], columns: number): number[][] => {
  const cols: number[][] = Array.from({ length: columns }, () => []);
  const totals = new Array(columns).fill(0);
  heights.forEach((height, index) => {
    let shortest = 0;
    for (let c = 1; c < columns; c += 1) {
      if (totals[c] < totals[shortest]) shortest = c;
    }
    cols[shortest].push(index);
    totals[shortest] += height;
  });
  return cols;
};

/** the height each column comes to, before any stretching */
export const columnHeights = (
  cols: number[][],
  heights: number[],
  gap = MOSAIC_GAP
): number[] =>
  cols.map((items) =>
    items.reduce(
      (sum, index, at) => sum + (heights[index] ?? 0) + (at ? gap : 0),
      0
    )
  );

/** a column that is only ever going to hold one box, however it is packed */
const oneEach = (cols: number[][]) =>
  cols.filter((c) => c.length > 0).every((c) => c.length === 1);

/**
 * Whether to stretch the last box in each column so the bottoms line up.
 *
 * Two cases say yes:
 *
 * 1. Every column holds ONE box. Then the mosaic is really a row of
 *    cards, and a row of cards with ragged bottoms is just untidy — this
 *    is the wide-window case, and the old grid's `align-items: start`
 *    was what made it look accidental.
 * 2. The columns already came out close. Absorbing forty pixels into the
 *    last box costs nothing and buys a straight edge.
 *
 * And the case that says no: a genuinely lopsided pack. Stretching a box
 * by three hundred pixels does not tidy anything — it makes one box a
 * mostly-empty rectangle, which is the exact fault the mosaic replaced.
 */
export const SLACK_PX = 96;
export const SLACK_RATIO = 0.18;

export const shouldMatchHeights = (heights: number[]): boolean => {
  const real = heights.filter((h) => h > 0);
  if (real.length < 2) return false;
  const tallest = Math.max(...real);
  const shortest = Math.min(...real);
  const slack = tallest - shortest;
  return slack <= Math.max(SLACK_PX, tallest * SLACK_RATIO);
};

/**
 * Keep the deal we already have, if it still holds up.
 *
 * The boxes on these pages fill in as their queries land — history, then
 * sharing, then the run tiles — and re-packing on every arrival makes
 * boxes hop between columns while you are reading them. So an existing
 * arrangement is kept while it still levels; only one that has gone
 * genuinely lopsided is dealt again.
 *
 * `settled` closes the door on that last case. A re-deal is worth a jump
 * while the card is still filling in and nobody has begun reading it; the
 * same jump a few seconds later moves a box out from under the cursor and
 * — because a box that changes column changes parent — costs it whatever
 * it knew about itself. So once the card has held still, the arrangement
 * is final: only a change in the COLUMN COUNT or in the boxes themselves
 * deals again, and both of those are already re-deals for other reasons.
 */
export const refine = (
  previous: number[][] | undefined,
  heights: number[],
  columns: number,
  gap = MOSAIC_GAP,
  /** the card is past its settling window — hold the arrangement */
  settled = false
): number[][] => {
  const fresh = () => packColumns(heights, columns);
  if (!previous || previous.length !== columns) return fresh();
  const held = previous.flat();
  // the boxes themselves changed — the old deal is about other content
  if (held.length !== heights.length) return fresh();
  if (new Set(held).size !== heights.length) return fresh();
  if (settled) return previous;
  return shouldMatchHeights(columnHeights(previous, heights, gap))
    ? previous
    : fresh();
};

/** the whole decision, from measured box heights and a container width */
export const layOut = (
  heights: number[],
  width: number,
  min = MOSAIC_MIN,
  gap = MOSAIC_GAP,
  /** what the card is showing now — kept when it still levels */
  previous?: number[][],
  /** past the settling window: hold the arrangement, whatever the heights */
  settled = false
): { columns: number; cols: number[][]; match: boolean } => {
  const columns = columnsFor(width, min, gap);
  const cols = refine(previous, heights, columns, gap, settled);
  const perColumn = columnHeights(cols, heights, gap);
  return {
    columns,
    cols,
    // one column has no sibling to line up with, so there is nothing to
    // match and stretching would only pad the bottom of the card
    match: columns > 1 && (oneEach(cols) || shouldMatchHeights(perColumn)),
  };
};
