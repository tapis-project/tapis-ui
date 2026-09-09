/**
 * What actually happened to a run — as two questions, not one.
 *
 * Tapis answers with a status and a condition, and the pair collapses badly
 * into a single glyph. An interactive session you ran for two hours and then
 * cancelled is CANCELLED, and reads on the page exactly like one you killed
 * four seconds in because you fat-fingered the queue. A batch job that hit
 * the scheduler's wall clock after doing all its work is FAILED. The status
 * is a state machine's last transition, not a verdict.
 *
 * So this splits them:
 *
 *   outcome   did work happen on the machine — worked / partial / never ran
 *   reason    what ended it — you, the scheduler, a timeout, a failure
 *
 * The glyph shows the first and badges the second, so "it ran fine, I
 * stopped it" stops looking like a failure.
 *
 * "Long enough to count" is judged against the run's OWN allowance, not
 * against a fixed number of minutes. A job given one minute that ran four
 * did not "only run 4 min" — it ran everything it was allowed to, and then
 * some. A job given two days that ran four minutes did nothing. Same four
 * minutes, opposite verdicts, and only maxMinutes tells them apart.
 *
 * So, in order:
 *
 *   used its allowance   ran to (or past) the wall clock it asked for —
 *                        certain success, whatever ended it
 *   hit the time limit   the scheduler says the clock ran out, which is
 *                        the same fact even when we cannot see maxMinutes
 *   long enough          half the allowance, capped at MEANINGFUL_RUN_MS
 *
 * The cap matters at the top end: half of a 48-hour allowance is a day, and
 * a run does not have to last a day to have done work. MEANINGFUL_RUN_MS is
 * also the whole rule when there is no allowance to measure against, which
 * is every row in a listing — JobListDTO has no maxMinutes, only the detail
 * record does.
 */
import { JobLite, runtimeMs } from './jobsData';

/** the fallback floor, and the ceiling on the derived one */
export const MEANINGFUL_RUN_MS = 5 * 60 * 1000;

/** of its own allowance, a run this far in has done something */
export const SUBSTANTIAL_RATIO = 0.5;

/**
 * How close to the wall clock counts as having reached it. A scheduler
 * kills at the limit, but the window we measure (remoteStarted → ended) is
 * Tapis's view of the run and lands either side of the compute wall clock
 * by a little, so an exact `>=` would miss the very case this exists for.
 */
export const WALL_TOLERANCE = 0.95;

/** the wall clock the run was granted, ms — 0 when unknown */
const allowanceMs = (job: JobLite): number =>
  job.maxMinutes && job.maxMinutes > 0 ? job.maxMinutes * 60 * 1000 : 0;

/**
 * The conditions that mean the WALL CLOCK ran out.
 *
 * Not every timeout is this one. `reason: 'timeout'` also covers Tapis's own
 * watchers giving up — JOB_EXECUTION_MONITORING_TIMEOUT is "we lost track of
 * the run", which says nothing about how much of its allowance it used. Only
 * the scheduler's two say the time was actually spent, so only they may
 * stand in for a maxMinutes we cannot see.
 */
const WALL_CLOCK_CONDITIONS = new Set([
  'SCHEDULER_TIMEOUT',
  'SCHEDULER_DEADLINE',
]);

export const hitTheWallClock = (condition?: string): boolean =>
  WALL_CLOCK_CONDITIONS.has((condition ?? '').toUpperCase());

/** how long a run has to last before it counts, given what it was granted */
export const meaningfulMsFor = (job: JobLite): number => {
  const allowance = allowanceMs(job);
  if (!allowance) return MEANINGFUL_RUN_MS;
  return Math.min(MEANINGFUL_RUN_MS, allowance * SUBSTANTIAL_RATIO);
};

const TERMINAL = ['FINISHED', 'FAILED', 'CANCELLED'];

export type Outcome = 'in-flight' | 'worked' | 'partial' | 'never-ran';

export type Reason =
  | 'cancelled-by-you'
  | 'cancelled-by-scheduler'
  | 'timeout'
  | 'out-of-memory'
  | 'staging-failed'
  | 'archiving-failed'
  | 'failed'
  | null;

export type Verdict = {
  outcome: Outcome;
  reason: Reason;
  /** how long it was actually on the machine, ms */
  ranMs: number;
  /** the whole story in one sentence, for the glyph's tooltip */
  headline: string;
};

/** what ended it, from the condition the service recorded */
export const reasonOf = (status?: string, condition?: string): Reason => {
  const c = (condition ?? '').toUpperCase();
  if (c === 'NORMAL_COMPLETION') return null;
  if (c === 'CANCELLED_BY_USER') return 'cancelled-by-you';
  if (
    c === 'SCHEDULER_CANCELLED' ||
    c === 'SCHEDULER_STOPPED' ||
    c === 'SCHEDULER_TERMINATED'
  )
    return 'cancelled-by-scheduler';
  if (c === 'SCHEDULER_OUT_OF_MEMORY') return 'out-of-memory';
  if (c === 'SCHEDULER_TIMEOUT' || c === 'SCHEDULER_DEADLINE') return 'timeout';
  if (c.endsWith('_TIMEOUT')) return 'timeout';
  if (
    c === 'JOB_UNABLE_TO_STAGE_INPUTS' ||
    c === 'JOB_UNABLE_TO_STAGE_JOB' ||
    c === 'JOB_TRANSFER_FAILED_OR_CANCELLED'
  )
    return 'staging-failed';
  if (c === 'JOB_ARCHIVING_FAILED') return 'archiving-failed';
  // a bare CANCELLED condition, or none at all, on a cancelled run
  if (status === 'CANCELLED') return 'cancelled-by-you';
  if (c) return 'failed';
  return status === 'FAILED' ? 'failed' : null;
};

export const REASON_WORDS: Record<Exclude<Reason, null>, string> = {
  'cancelled-by-you': 'you cancelled it',
  'cancelled-by-scheduler': 'the scheduler cancelled it',
  timeout: 'it hit the time limit',
  'out-of-memory': 'it ran out of memory',
  'staging-failed': 'its files never arrived',
  'archiving-failed': 'its results were not archived',
  failed: 'it failed',
};

export const spell = (ms: number): string => {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return 'less than a minute';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export const jobVerdict = (job: JobLite, now = Date.now()): Verdict => {
  const status = job.status ?? '';
  const reason = reasonOf(status, job.condition);
  const ranMs = runtimeMs(job, now);

  if (!TERMINAL.includes(status)) {
    return {
      outcome: 'in-flight',
      reason: null,
      ranMs,
      headline: job.remoteStarted
        ? `Running, ${spell(ranMs)} so far`
        : (status || 'pending').toLowerCase().replace(/_/g, ' '),
    };
  }

  // it finished the way it meant to
  if (status === 'FINISHED' && !reason) {
    return {
      outcome: 'worked',
      reason: null,
      ranMs,
      // a listing that carries no timing (the nav's lite rows sometimes do
      // not) must not claim the run took less than a minute
      headline: job.remoteStarted
        ? `Finished normally after ${spell(ranMs)}`
        : 'Finished normally',
    };
  }

  const words = reason ? REASON_WORDS[reason] : 'it stopped';

  // it never got to the machine at all — nothing ran, whatever ended it
  if (!job.remoteStarted) {
    return {
      outcome: 'never-ran',
      reason,
      ranMs: 0,
      headline: `Never started, ${words}`,
    };
  }

  const allowance = allowanceMs(job);

  // it ran to the wall clock it asked for. Nothing more was going to
  // happen — the run is over because its time is, not because it broke.
  if (allowance && ranMs >= allowance * WALL_TOLERANCE) {
    return {
      outcome: 'worked',
      reason,
      ranMs,
      headline: `Ran its full ${spell(allowance)}, then ${words}`,
    };
  }

  // the same fact from the other direction: the scheduler only reports its
  // own timeout when the clock is spent, so it says the allowance was used
  // even on a listing row that cannot tell us what the allowance was
  if (hitTheWallClock(job.condition)) {
    return {
      outcome: 'worked',
      reason,
      ranMs,
      headline: `Ran ${spell(ranMs)} (its whole allowance), then ${words}`,
    };
  }

  // long enough that the work is done, whatever ended it. This is the
  // interactive session's case, and the whole point of the split.
  if (status === 'FINISHED' || ranMs >= meaningfulMsFor(job)) {
    return {
      outcome: 'worked',
      reason,
      ranMs,
      headline: `Ran ${spell(ranMs)}, then ${words}`,
    };
  }

  return {
    outcome: 'partial',
    reason,
    ranMs,
    // against what it was given, when we know — "20 s of its 2h" says how
    // little that was in a way "20 s" on its own cannot
    headline: allowance
      ? `Only ran ${spell(ranMs)} of its ${spell(allowance)} before ${words}`
      : `Only ran ${spell(ranMs)} before ${words}`,
  };
};

/**
 * A job still reading as live that has reached the wall clock it asked for.
 *
 * The same allowance, asked about from the other end. Everything above
 * judges a run that is over; this one judges a run the page still says is
 * RUNNING, because between the scheduler pulling the node and Tapis
 * noticing there is a window where the status is stale and the machine is
 * already gone.
 *
 * For a batch job that window is a curiosity — the outputs are written or
 * they are not. For a session app it IS the experience: FlexServ and
 * ParaView stop answering the moment the node goes, up to a minute before
 * the job reads as over, so the card sits there offering an address that
 * quietly stopped working. Both surfaces ask this, and say so.
 *
 * WALL_TOLERANCE is reused, and in the direction it already leans: the
 * window measured here starts when Tapis SAW the run start, at or after
 * the real one, so this elapsed under-reads the scheduler's. Warning a
 * little early is the right error to make — the alternative is a page that
 * keeps promising a session that has already gone.
 */
export type WallClockReached = {
  /** the allowance it asked for, ms */
  allowanceMs: number;
  /** how long it has been on the machine, ms */
  ranMs: number;
};

export const reachedItsWallClock = (
  job: JobLite,
  now = Date.now()
): WallClockReached | undefined => {
  // only a live run can be surprised by this; an ended one has its verdict
  if (TERMINAL.includes(job.status ?? '')) return undefined;
  // never reached the machine, so no clock has started
  if (!job.remoteStarted) return undefined;
  const allowance = allowanceMs(job);
  // listings carry no maxMinutes — no allowance, nothing to be past
  if (!allowance) return undefined;
  const ranMs = runtimeMs(job, now);
  if (ranMs < allowance * WALL_TOLERANCE) return undefined;
  return { allowanceMs: allowance, ranMs };
};
