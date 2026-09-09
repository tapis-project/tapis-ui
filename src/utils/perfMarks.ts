/**
 * Component mount timings, via the User Timing API.
 *
 * Why not React's <Profiler>: it is compiled out of production React unless you
 * ship the profiling build, so the numbers would exist only where they matter
 * least. `performance.measure` works identically in dev and prod, survives a
 * minified build, and is readable from outside the app — the benchmark harness
 * reads these straight off the page, and a future in-app readout can use the
 * same entries with no second mechanism.
 *
 * Cost is one `performance.now()` per mount plus one entry in the browser's
 * timing buffer, so this stays on in production rather than hiding behind a
 * flag that would guarantee it is off exactly when someone reports slowness.
 *
 * Mark the surfaces where a decision is possible — an editor that could be a
 * text box, a chart that could be a sparkline, a table that could be
 * virtualized — not every component. An unattributed 15 s of blocking is a
 * mystery; "codemirror-logs: 900 ms" is a task.
 */
import { useLayoutEffect, useRef } from 'react';

export const PERF_PREFIX = 'tapisui:';

/** Records `tapisui:<name>` spanning first render → committed to the DOM. */
export const useMountTiming = (name: string): void => {
  const startRef = useRef<number | undefined>(undefined);
  if (startRef.current === undefined) startRef.current = performance.now();

  useLayoutEffect(() => {
    const start = startRef.current;
    if (start === undefined) return;
    try {
      performance.measure(PERF_PREFIX + name, {
        start,
        duration: performance.now() - start,
      });
    } catch {
      /* older browser without the options form — a missing number, not a crash */
    }
    // Mount cost only: re-render cost is a different question, measured
    // differently, and mixing them would make this number meaningless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/** Time an imperative span (a lazy import, a parse) under the same prefix. */
export const timeSpan = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    try {
      performance.measure(PERF_PREFIX + name, {
        start,
        duration: performance.now() - start,
      });
    } catch {
      /* ignore */
    }
  }
};

/** All recorded spans, newest last: { name, ms }. */
export const collectMarks = (): Array<{ name: string; ms: number }> =>
  performance
    .getEntriesByType('measure')
    .filter((e) => e.name.startsWith(PERF_PREFIX))
    .map((e) => ({
      name: e.name.slice(PERF_PREFIX.length),
      ms: Math.round(e.duration * 10) / 10,
    }));
