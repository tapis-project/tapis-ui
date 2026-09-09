/**
 * infoDetail — the "explain things" switch, shared by every page.
 *
 * The ? in a page header used to open the docs drawer. The docs have their own
 * glyph now, and ? does what a ? on a toolbar usually does: turns the
 * explanatory text on and off. On by default — someone who has never seen the
 * page should be told what it is, and someone who has can turn it off once and
 * never see it again.
 *
 * Module-level rather than context so the header switch and the boxes it
 * governs need no common ancestor. Same pattern as filesSearch.
 */
const KEY = 'ui.infoDetail';

const read = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) !== '0';
  } catch {
    // blocked storage — explaining things is the safe default
    return true;
  }
};

let _on = read();
const _listeners = new Set<() => void>();

export const getInfoDetail = (): boolean => _on;

export const setInfoDetail = (on: boolean) => {
  if (on === _on) return;
  _on = on;
  try {
    window.localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* it still holds for this visit */
  }
  _listeners.forEach((fn) => fn());
};

export const subscribeInfoDetail = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
