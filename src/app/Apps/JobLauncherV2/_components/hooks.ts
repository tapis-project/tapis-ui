import { useEffect, useState } from 'react';

/**
 * Trailing-edge debounce for derived state.
 *
 * Formik re-renders every consumer on each keystroke. The panel's expensive
 * derivations — the blocker list (which walks the whole error tree), the
 * section state chips, and the Review section's JSON preview (a deep clone plus
 * a json-view re-render) — do not need to keep up with typing. Debouncing them
 * also keeps the memoized values referentially stable between ticks, so the
 * panel shell can bail out of re-rendering entirely.
 */
/**
 * Shallow so that a caller passing a fresh object of unchanged members —
 * `useDebouncedValue({ values, errors })` — settles instead of rescheduling
 * forever. That loop re-rendered the whole panel every `delay` ms, which closed
 * any native <select> the moment it was opened.
 */
const settled = (a: unknown, b: unknown) => {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    return false;
  }
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) =>
      Object.is(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    )
  );
};

export const useDebouncedValue = <T>(value: T, delay = 200): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (settled(debounced, value)) {
      return;
    }
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay, debounced]);

  return debounced;
};

export default useDebouncedValue;
