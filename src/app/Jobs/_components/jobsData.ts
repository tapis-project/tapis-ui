/**
 * jobsData — pure aggregation over the jobs list.
 *
 * Everything the Jobs nav and dashboard say about jobs is computed here from
 * the plain JobListDTO rows, with no React and no fetch, so the arithmetic is
 * testable and the components stay declarative. All "now"-relative functions
 * take `now` explicitly for the same reason.
 */
import { normTs, TsLike } from 'app/_components/NavV2Kit/navKit';

export interface JobLite {
  uuid?: string;
  name?: string;
  owner?: string;
  appId?: string;
  appVersion?: string;
  execSystemId?: string;
  status?: string;
  condition?: string;
  created?: TsLike;
  ended?: TsLike;
  remoteStarted?: TsLike;
  lastUpdated?: TsLike;
  /**
   * The wall clock the run was granted, in minutes. On the detail record
   * only — JobListDTO does not carry it — so everything that reads it must
   * work without it. See jobVerdict, which uses it to judge a run against
   * its own allowance rather than against a fixed number of minutes.
   */
  maxMinutes?: number;
}

/** The five buckets the dashboard reasons in. Finer states (STAGING_INPUTS,
 *  ARCHIVING, …) all read as "queued" — a user cares that the job is alive
 *  and not yet computing, not which internal pipeline stage holds it. */
export type JobClass =
  | 'running'
  | 'queued'
  | 'blocked'
  | 'finished'
  | 'failed'
  | 'cancelled';

export const classifyStatus = (status: string | undefined): JobClass => {
  switch (status) {
    case 'RUNNING':
      return 'running';
    case 'FINISHED':
      return 'finished';
    case 'FAILED':
      return 'failed';
    case 'CANCELLED':
      return 'cancelled';
    case 'BLOCKED':
    case 'PAUSED':
      return 'blocked';
    default:
      return 'queued';
  }
};

export const isActive = (status: string | undefined): boolean => {
  const c = classifyStatus(status);
  return c === 'running' || c === 'queued' || c === 'blocked';
};

export const countsByClass = (jobs: JobLite[]): Record<JobClass, number> => {
  const out: Record<JobClass, number> = {
    running: 0,
    queued: 0,
    blocked: 0,
    finished: 0,
    failed: 0,
    cancelled: 0,
  };
  for (const j of jobs) out[classifyStatus(j.status)] += 1;
  return out;
};

const within = (ts: TsLike | undefined, days: number, now: number): boolean =>
  !!ts && now - normTs(ts) <= days * 24 * 60 * 60_000;

/** Failures, newest first — `condition` is the why (EXEC error, quota, …). */
export const failuresWithin = (
  jobs: JobLite[],
  days: number,
  now = Date.now()
): JobLite[] =>
  jobs
    .filter(
      (j) =>
        classifyStatus(j.status) === 'failed' &&
        within(j.ended ?? j.lastUpdated, days, now)
    )
    .sort(
      (a, b) =>
        normTs(b.ended ?? b.lastUpdated ?? '') -
        normTs(a.ended ?? a.lastUpdated ?? '')
    );

export interface AppActivity {
  appId: string;
  total: number;
  failed: number;
  running: number;
  /** most recent created ts across the app's jobs */
  last?: TsLike;
  lastStatus?: string;
}

/** Runs grouped by app, most recently used first — the dashboard's answer to
 *  "what actually gets run around here". */
export const perAppActivity = (jobs: JobLite[]): AppActivity[] => {
  const byApp = new Map<string, AppActivity>();
  for (const j of jobs) {
    const appId = j.appId ?? '(unknown app)';
    let a = byApp.get(appId);
    if (!a) {
      a = { appId, total: 0, failed: 0, running: 0 };
      byApp.set(appId, a);
    }
    a.total += 1;
    const c = classifyStatus(j.status);
    if (c === 'failed') a.failed += 1;
    if (c === 'running') a.running += 1;
    if (j.created && (!a.last || normTs(j.created) > normTs(a.last))) {
      a.last = j.created;
      a.lastStatus = j.status;
    }
  }
  return [...byApp.values()].sort(
    (a, b) => normTs(b.last ?? '') - normTs(a.last ?? '')
  );
};

export interface DayOutcome {
  /** ISO date, e.g. 2026-09-01 (UTC day) */
  day: string;
  finished: number;
  failed: number;
  cancelled: number;
  /** submitted that day and still not terminal */
  active: number;
}

/** Job outcomes bucketed by UTC submission day for the last `days` days,
 *  oldest→newest, empty days included so the chart's time axis is honest. */
export const byDayOutcome = (
  jobs: JobLite[],
  days: number,
  now = Date.now()
): DayOutcome[] => {
  const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const buckets = new Map<string, DayOutcome>();
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(now - i * 24 * 60 * 60_000);
    buckets.set(key, {
      day: key,
      finished: 0,
      failed: 0,
      cancelled: 0,
      active: 0,
    });
  }
  for (const j of jobs) {
    if (!j.created) continue;
    const b = buckets.get(dayKey(normTs(j.created)));
    if (!b) continue;
    const c = classifyStatus(j.status);
    if (c === 'finished') b.finished += 1;
    else if (c === 'failed') b.failed += 1;
    else if (c === 'cancelled') b.cancelled += 1;
    else b.active += 1;
  }
  return [...buckets.values()];
};

export const runtimeMs = (j: JobLite, now = Date.now()): number => {
  if (!j.remoteStarted) return 0;
  const end = j.ended ? normTs(j.ended) : now;
  return Math.max(0, end - normTs(j.remoteStarted));
};

/** Currently-running jobs, longest runtime first. */
export const longestRunning = (jobs: JobLite[], now = Date.now()): JobLite[] =>
  jobs
    .filter((j) => classifyStatus(j.status) === 'running')
    .sort((a, b) => runtimeMs(b, now) - runtimeMs(a, now));

export const fmtDuration = (ms: number): string => {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
};

// ── scheduler notes ─────────────────────────────────────────────────────────

export interface SchedulerNotes {
  allocation?: string;
  reservation?: string;
}

/**
 * The things a job's own scheduler options quietly say — surfaced, never
 * required.
 *
 * A submitted job carries its truth in parameterSet.schedulerOptions:
 * `-A TRA24006` is THE allocation this run charged, `--reservation X` the
 * reservation it rode. That beats any store of remembered refusals, because
 * it is per-run fact, not per-system memory. parameterSet arrives as a JSON
 * string on the details read and as an object elsewhere; both are welcome,
 * and anything unparseable is simply "no notes".
 */
export const parseSchedulerNotes = (parameterSet: unknown): SchedulerNotes => {
  let ps: any = parameterSet;
  if (typeof ps === 'string') {
    try {
      ps = JSON.parse(ps);
    } catch {
      return {};
    }
  }
  const options: any[] = Array.isArray(ps?.schedulerOptions)
    ? ps.schedulerOptions
    : [];
  const notes: SchedulerNotes = {};
  for (const option of options) {
    if (option?.include === false) continue; // declared but not sent
    const arg = String(option?.arg ?? '');
    const alloc =
      /(?:^|\s)-A[ =](\S+)/.exec(arg) ?? /--account[ =](\S+)/.exec(arg);
    if (alloc && !notes.allocation) notes.allocation = alloc[1];
    const rsv = /--reservation[ =](\S+)/.exec(arg);
    if (rsv && !notes.reservation) notes.reservation = rsv[1];
  }
  return notes;
};
