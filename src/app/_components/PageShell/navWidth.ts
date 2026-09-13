/**
 * How wide the nav column is, as a number the reader owns.
 *
 * It used to be a constant in the stylesheet: 17rem, floored at 14 and
 * capped at 20. That is a fine guess and it is wrong on both ends — a pod
 * list of short ids wants less, a list of long system names or a wide
 * window wants more, and the column not moving meant the content pane paid
 * for the guess on every page.
 *
 * So: a per-device preference, dragged from the column's edge, persisted
 * like the density and the page width. The bounds are wide but real; a
 * column narrower than `NAV_MIN` cannot show a name, and one wider than
 * `NAV_MAX` is a second content pane.
 */
import { useSyncExternalStore } from 'react';

export const NAV_MIN = 176;
export const NAV_MAX = 560;
/** 17rem, the width it always had */
export const NAV_DEFAULT = 272;

const KEY = 'tapis.navWidth';

/**
 * Inside the bounds, and a number: a stored value can be neither.
 *
 * `Number(null)` and `Number('')` are 0, which is finite, so a missing or
 * empty entry would clamp to the MINIMUM and hand back a column collapsed
 * to its narrowest. Anything that is not a number or a numeric string is
 * the default instead.
 */
export const clampNavWidth = (value: unknown): number => {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
      ? Number(value)
      : NaN;
  if (!Number.isFinite(n)) return NAV_DEFAULT;
  return Math.min(NAV_MAX, Math.max(NAV_MIN, Math.round(n)));
};

const read = (): number => {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === null ? NAV_DEFAULT : clampNavWidth(raw);
  } catch {
    return NAV_DEFAULT;
  }
};

let current = read();
const listeners = new Set<() => void>();

export const getNavWidth = (): number => current;

const persist = (): void => {
  try {
    window.localStorage.setItem(KEY, String(current));
  } catch {
    // it still holds for this visit
  }
};

/**
 * Set the width. A drag passes `save: false` for every frame and calls
 * saveNavWidth once on release, so a drag is one storage write, not one
 * per pointer move.
 */
export const setNavWidth = (
  next: number,
  { save = true }: { save?: boolean } = {}
): void => {
  const width = clampNavWidth(next);
  if (width === current) return;
  current = width;
  if (save) persist();
  listeners.forEach((listener) => listener());
};

/** store whatever the width is now — the end of a drag */
export const saveNavWidth = (): void => persist();

export const resetNavWidth = (): void => setNavWidth(NAV_DEFAULT);

export const subscribeNavWidth = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useNavWidth = (): number =>
  useSyncExternalStore(subscribeNavWidth, getNavWidth, () => NAV_DEFAULT);
