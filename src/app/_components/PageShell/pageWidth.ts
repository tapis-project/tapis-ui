/**
 * pageWidth — bounded reading column, or the whole window.
 *
 * Dense tables read badly at ultrawide line lengths, so the working pane is
 * capped by default; the header toggle opens it up. Lifted out of the Pods
 * stacks page, which had this per-page, because the answer is a property of
 * the person and their monitor rather than of one table.
 *
 * Module-level with a localStorage backing, same pattern as infoDetail. One
 * subscriber list for both values: everything that cares about the width cares
 * about both of them.
 */
const KEY = 'ui.pageWide';
const BOUND_KEY = 'ui.pageBoundedWidth';

/**
 * How wide the bounded column is.
 *
 * 960 rather than the 1200 the Pods stacks page used: these pages are dense
 * tables and prose, both of which read worse the longer the line gets, and a
 * default should suit the common monitor rather than the widest one. Settings
 * moves it either way.
 */
export const DEFAULT_BOUNDED_WIDTH = 960;

/** What Settings offers. Free-form values still load, these just name the
 *  ones worth having a button for. */
export const BOUNDED_WIDTH_CHOICES = [840, 960, 1200, 1440, 1760];

/**
 * The nav column's width, from PageShell.module.scss.
 *
 * Duplicated here on purpose: the page header spans the nav AND the working
 * pane, so bounding its contents to the same right edge as the content column
 * means bounding to nav + column. If the scss changes, this follows it.
 */
export const NAV_COLUMN_WIDTH = 272;

const read = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // blocked storage — the bounded column is the safe default
    return false;
  }
};

const readBound = (): number => {
  try {
    const stored = Number(window.localStorage.getItem(BOUND_KEY));
    return Number.isFinite(stored) && stored >= 600
      ? stored
      : DEFAULT_BOUNDED_WIDTH;
  } catch {
    return DEFAULT_BOUNDED_WIDTH;
  }
};

let _wide = read();
let _bound = readBound();
const _listeners = new Set<() => void>();

const announce = () => _listeners.forEach((fn) => fn());

export const getPageWide = (): boolean => _wide;

export const getBoundedWidth = (): number => _bound;

export const setBoundedWidth = (width: number) => {
  if (width === _bound || !Number.isFinite(width) || width < 600) return;
  _bound = width;
  try {
    window.localStorage.setItem(BOUND_KEY, String(width));
  } catch {
    /* it still holds for this visit */
  }
  announce();
};

export const setPageWide = (wide: boolean) => {
  if (wide === _wide) return;
  _wide = wide;
  try {
    window.localStorage.setItem(KEY, wide ? '1' : '0');
  } catch {
    /* it still holds for this visit */
  }
  announce();
};

export const subscribePageWide = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
