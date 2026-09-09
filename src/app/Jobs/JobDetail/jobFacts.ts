/**
 * jobFacts — whether the job card's details box is open.
 *
 * The box is worth having as an object: a bordered grid of everything the
 * job knows, in one place. It is also two thirds of the card's height, and
 * someone watching a job run wants the status line and the output listing,
 * not the archive system's name.
 *
 * It used to ride the global ? switch, which is the wrong control twice
 * over: ? governs explanatory prose across every page, and turning it off to
 * shorten this one card took the words off the others too. So the box has
 * its own accordion, open by default, remembered.
 *
 * Module-level with a localStorage backing — the same shape as infoDetail.
 */
const KEY = 'ui.jobFacts';

const read = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) !== '0';
  } catch {
    // blocked storage: open is the state that shows what the page is for
    return true;
  }
};

let _open = read();
const _listeners = new Set<() => void>();

export const getJobFacts = (): boolean => _open;

export const setJobFacts = (open: boolean) => {
  if (open === _open) return;
  _open = open;
  try {
    window.localStorage.setItem(KEY, open ? '1' : '0');
  } catch {
    /* it still holds for this visit */
  }
  _listeners.forEach((fn) => fn());
};

export const subscribeJobFacts = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
