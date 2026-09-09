/**
 * The mosaic's decisions: how many columns, which box goes where, and
 * whether the bottoms are worth lining up. All of the judgement lives
 * here; CardMosaic only measures and renders.
 */
import {
  MOSAIC_MIN,
  columnHeights,
  columnsFor,
  layOut,
  packColumns,
  refine,
  shouldMatchHeights,
  spreadColumns,
} from '../mosaic';

describe('columnsFor', () => {
  it('counts what fits, gaps included', () => {
    expect(columnsFor(900)).toBe(2);
    expect(columnsFor(1100)).toBe(3);
    expect(columnsFor(400)).toBe(1);
  });

  it('never goes below one, even before the first measurement', () => {
    expect(columnsFor(0)).toBe(1);
    expect(columnsFor(100)).toBe(1);
  });

  it('takes a caller’s narrower minimum', () => {
    expect(columnsFor(900, 220)).toBe(3);
  });

  it('is exact at the boundary', () => {
    // two 340s and the 8 between them
    expect(columnsFor(688)).toBe(2);
    expect(columnsFor(687)).toBe(1);
  });
});

describe('packColumns', () => {
  it('puts each box in the shortest column so far', () => {
    expect(packColumns([500, 60, 70, 180], 2)).toEqual([[0], [1, 2, 3]]);
  });

  it('keeps source order within a column', () => {
    const cols = packColumns([100, 100, 100, 100], 2);
    cols.forEach((col) => {
      expect(col).toEqual([...col].sort((a, b) => a - b));
    });
  });

  it('deals evenly when everything is the same height', () => {
    expect(packColumns([100, 100, 100, 100], 2)).toEqual([
      [0, 2],
      [1, 3],
    ]);
  });

  it('handles one column, and more columns than boxes', () => {
    expect(packColumns([10, 20], 1)).toEqual([[0, 1]]);
    expect(packColumns([10, 20], 3)).toEqual([[0], [1], []]);
  });
});

describe('columnHeights', () => {
  it('counts the gaps between boxes but not around them', () => {
    expect(columnHeights([[0, 1], [2]], [100, 100, 50])).toEqual([208, 50]);
  });
});

describe('shouldMatchHeights', () => {
  it('lines up columns that came out close', () => {
    expect(shouldMatchHeights([500, 460])).toBe(true);
  });

  it('leaves a lopsided pack alone', () => {
    // stretching by 300px makes one box a mostly-empty rectangle, which
    // is the fault the mosaic exists to fix
    expect(shouldMatchHeights([600, 300])).toBe(false);
  });

  it('is generous in proportion on a tall card', () => {
    // 18% of 1200 is more than the flat 96px floor
    expect(shouldMatchHeights([1200, 1030])).toBe(true);
    expect(shouldMatchHeights([1200, 900])).toBe(false);
  });

  it('has nothing to say about a single column', () => {
    expect(shouldMatchHeights([500])).toBe(false);
    expect(shouldMatchHeights([])).toBe(false);
  });
});

describe('layOut', () => {
  it('lines up a row of one-box columns however different they are', () => {
    // the wide-window case: this is a row of cards, and a row of cards
    // with ragged bottoms just looks accidental
    const plan = layOut([400, 120, 90], 1100);
    expect(plan.columns).toBe(3);
    expect(plan.cols).toEqual([[0], [1], [2]]);
    expect(plan.match).toBe(true);
  });

  it('refuses to stretch when one column is genuinely taller', () => {
    const plan = layOut([600, 80, 60], 900);
    expect(plan.columns).toBe(2);
    expect(plan.match).toBe(false);
  });

  it('lines up a two-column pack that landed close', () => {
    const plan = layOut([300, 280, 40], 900);
    expect(plan.match).toBe(true);
  });

  it('never matches in one column — there is no sibling to match', () => {
    expect(layOut([300, 280], 400).match).toBe(false);
  });
});

describe('spreadColumns', () => {
  it('deals round-robin before anything is measured', () => {
    expect(spreadColumns(5, 2)).toEqual([
      [0, 2, 4],
      [1, 3],
    ]);
  });

  it('is the identity for one column', () => {
    expect(spreadColumns(3, 1)).toEqual([[0, 1, 2]]);
  });
});

describe('the minimum itself', () => {
  it('is the width a fact box stops being readable below', () => {
    expect(MOSAIC_MIN).toBe(340);
  });
});

describe('refine', () => {
  const shown = [
    [0, 1],
    [2, 3],
  ];

  it('keeps a deal that still levels, so boxes do not hop mid-read', () => {
    // the boxes on these pages grow as their queries land; re-packing on
    // every arrival moves them under the cursor
    expect(refine(shown, [100, 100, 120, 100], 2)).toBe(shown);
  });

  it('deals again once the deal has gone lopsided', () => {
    expect(refine(shown, [400, 400, 40, 40], 2)).not.toBe(shown);
  });

  it('deals again when the column count changed', () => {
    expect(refine(shown, [100, 100, 100, 100], 3)).toHaveLength(3);
  });

  it('deals again when the boxes themselves changed', () => {
    // a box appeared or went away — the old deal is about other content
    expect(refine(shown, [100, 100, 100], 2)).not.toBe(shown);
  });

  it('deals from scratch when there is nothing to keep', () => {
    expect(refine(undefined, [100, 50], 2)).toEqual([[0], [1]]);
  });

  describe('once the card has settled', () => {
    it('holds the arrangement even when it has gone lopsided', () => {
      // the same heights that force a re-deal while the card is filling in
      expect(refine(shown, [400, 400, 40, 40], 2)).not.toBe(shown);
      // after the settling window, a box moving out from under the cursor
      // costs more than a level pair of columns is worth
      expect(refine(shown, [400, 400, 40, 40], 2, undefined, true)).toBe(shown);
    });

    it('still deals again when the column count changes', () => {
      // a window resize is the user asking for a different shape
      expect(
        refine(shown, [100, 100, 100, 100], 3, undefined, true)
      ).toHaveLength(3);
    });

    it('still deals again when the boxes themselves change', () => {
      // a system whose access probe resolves gains whole boxes: the old
      // deal is about other content, held or not
      expect(refine(shown, [100, 100, 100], 2, undefined, true)).not.toBe(
        shown
      );
    });
  });
});

describe('layOut with a deal in hand', () => {
  it('honours it, and still decides levelling for itself', () => {
    const shown = [[0], [1]];
    const plan = layOut([300, 280], 900, undefined, undefined, shown);
    expect(plan.cols).toBe(shown);
    expect(plan.match).toBe(true);
  });
});
