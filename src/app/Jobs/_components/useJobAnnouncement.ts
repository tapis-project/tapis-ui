/**
 * useJobAnnouncement — a job that announces something through a file.
 *
 * The FlexServ pattern, generalized: a run writes one announcement line
 * into a dedicated file beside tapisjob.out (older runs only into the log),
 * and the page wants it the moment it exists — without hammering the
 * Files service, without a stale copy leaking onto another job, and with
 * an honest look-back once the run is over.
 *
 * What a caller hands in: the job, an `enabled` gate (is this announcement
 * even a thing for this job?), the file name — optional: apps that only
 * ever print into the log (ParaView) skip the file watcher entirely and
 * ride the log's fixed cadence — and a STABLE parse function
 * (module-level — it sits in dependency arrays). What comes back:
 *
 *   announced     — the parsed announcement, derived every render from the
 *                   uuid-keyed react-query caches. Derived, never stored:
 *                   a revisit paints instantly from cache, and another
 *                   job's find has no state to leak through.
 *   wasAnnounced  — the over-job look-back (file first, log fallback),
 *                   for gravestones.
 *   watching/over — the job's phase, gated by `enabled`.
 *   gaveUp        — the 30-minute watch ceiling ran out (it restarts when
 *                   the job actually reaches RUNNING, so queue time does
 *                   not eat the watch).
 *   error         — the primary watcher's failure, for non-404 surprises.
 *
 * The polling economics: the dedicated file is a ~100-byte read on a
 * 10s→60s backoff; the whole log idles behind it at a fixed 60s for runs
 * older than the file; both stop the moment the line is found, and never
 * run for jobs the announcement does not apply to. Finding the line also
 * invalidates the exec system's file listings ONCE — new files just
 * appeared — but only on the genuine waiting→found transition, never on a
 * cache-warm revisit.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import { jobTerminalStatuses } from '@tapis/tapisui-common';

const CEILING_MS = 30 * 60 * 1000;
const pollDelay = (waitedMs: number): number =>
  waitedMs < 60_000 ? 10_000 : waitedMs < 5 * 60_000 ? 20_000 : 60_000;

export type JobAnnouncement<T> = {
  announced: T | undefined;
  wasAnnounced: T | undefined;
  watching: boolean;
  over: boolean;
  gaveUp: boolean;
  error: Error | null;
};

export const useJobAnnouncement = <T>({
  job,
  enabled,
  file,
  parse,
}: {
  job?: Jobs.Job;
  enabled: boolean;
  /** the dedicated announcement file; absent = the log is the only source */
  file?: string;
  parse: (text: string) => T | undefined;
}): JobAnnouncement<T> => {
  const queryClient = useQueryClient();
  const startedAt = useRef(Date.now());
  // gates the watchers off once found — presentation never reads this
  const [foundOnce, setFoundOnce] = useState(false);
  // true only after a render that was genuinely waiting, so the files
  // nudge fires on the live transition, not on every cache-warm visit
  const sawWaiting = useRef(false);

  // the poll clock and the gates are per-run; the page outlives navigation
  useEffect(() => {
    setFoundOnce(false);
    sawWaiting.current = false;
    startedAt.current = Date.now();
  }, [job?.uuid]);
  // the ceiling is about the RUN, not the wait in the queue
  const jobRunning = job?.status === 'RUNNING';
  useEffect(() => {
    if (jobRunning) startedAt.current = Date.now();
  }, [jobRunning]);

  const running =
    !!job?.status && !jobTerminalStatuses.includes(job.status as never);
  const watching = enabled && running;
  const over = enabled && !!job?.status && !running;

  // The one look back, dedicated file first: it is one line where the log
  // is the whole run. The file is finished writing, so no polling, no
  // retries, and a missing/archived file just means there is nothing to say.
  const finalAccess = Hooks.useGetJobOutputText(
    {
      jobUuid: job?.uuid ?? '',
      outputPath: file ?? 'tapisjob.out',
      allowIfRunning: false,
    },
    { enabled: over && !!file, retry: false }
  );
  const finalParsed = useMemo(
    () => (over && file ? parse(finalAccess.data ?? '') : undefined),
    [over, file, finalAccess.data, parse]
  );
  const needLogLookback =
    over &&
    (!file || finalAccess.isError || (finalAccess.isSuccess && !finalParsed));
  const { data: finalText } = Hooks.useGetJobOutputText(
    {
      jobUuid: job?.uuid ?? '',
      outputPath: 'tapisjob.out',
      allowIfRunning: false,
    },
    { enabled: needLogLookback, retry: false }
  );
  const wasAnnounced = useMemo(
    () => finalParsed ?? (needLogLookback ? parse(finalText ?? '') : undefined),
    [finalParsed, needLogLookback, finalText, parse]
  );

  // the watchers: the dedicated file on the backoff, the log idling behind
  const watchAccess = Hooks.useGetJobOutputText(
    {
      jobUuid: job?.uuid ?? '',
      outputPath: file ?? 'tapisjob.out',
      allowIfRunning: true,
    },
    {
      enabled: watching && !foundOnce && !!file,
      // the file does not exist for the first minutes of a run — a 404 is
      // the expected answer, not a fault to retry three times over
      retry: false,
      refetchInterval: () => {
        const waited = Date.now() - startedAt.current;
        return waited > CEILING_MS ? false : pollDelay(waited);
      },
      refetchIntervalInBackground: false,
    }
  );
  const watchLog = Hooks.useGetJobOutputText(
    {
      jobUuid: job?.uuid ?? '',
      outputPath: 'tapisjob.out',
      allowIfRunning: true,
    },
    {
      enabled: watching && !foundOnce,
      retry: false,
      refetchInterval: () => {
        const waited = Date.now() - startedAt.current;
        if (waited > CEILING_MS) return false;
        // idling behind the dedicated file it holds a fixed 60s; as the
        // ONLY source (log-only apps) it takes the file's backoff instead
        return file ? 60_000 : pollDelay(waited);
      },
      refetchIntervalInBackground: false,
    }
  );

  const announced = useMemo(
    () =>
      watching || foundOnce
        ? parse(watchAccess.data ?? '') ?? parse(watchLog.data ?? '')
        : undefined,
    [watching, foundOnce, watchAccess.data, watchLog.data, parse]
  );

  useEffect(() => {
    if (watching && !announced) sawWaiting.current = true;
    if (!announced) return;
    setFoundOnce(true);
    // the announcement appearing is the one live signal: files that did
    // not exist a poll ago now do, so the exec system's listings look again
    if (sawWaiting.current && job?.execSystemId) {
      sawWaiting.current = false;
      queryClient.invalidateQueries(['files/list', job.execSystemId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watching, announced, job?.execSystemId]);

  const gaveUp = useMemo(
    () => Date.now() - startedAt.current > CEILING_MS,
    // recomputed on each render the queries cause; exact enough for a caption
    [watchAccess.isFetching, watchLog.isFetching]
  );

  return {
    announced,
    wasAnnounced,
    watching,
    over,
    gaveUp,
    // the primary watcher's failure: the file's when there is one, else
    // the log's — the only watcher a log-only app runs
    error:
      ((file ? watchAccess.error : watchLog.error) as Error | null) ?? null,
  };
};

export default useJobAnnouncement;
