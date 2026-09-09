/**
 * How a job's ending reads to a person.
 *
 * The API reports endings twice: `condition` (a closed enum — the authority)
 * and `lastMessage` (an engineer-facing transcript line like
 * "JOBS_CMD_MSG_RECEIVED Job … received a JOB_CANCEL command from
 * JobsImpl-cancelCmdStatus with correlation id …"). The UI used to print the
 * transcript raw, in error red, even for a cancel the user asked for.
 *
 * This module owns the translation. Every condition in the generated
 * JobListDTOConditionEnum gets a plain sentence and a tone:
 *
 *   ok    — a clean finish; nothing to explain
 *   quiet — an expected, chosen ending (a cancel); neutral styling, never red
 *   warn  — the run ended by a limit (time, deadline, lost tracking)
 *   error — something actually went wrong
 *
 * A cancel matters doubly here: for a server app like FlexServ, cancelling
 * the job when you're done with the session is the NORMAL way it ends, and
 * the card should read that way. The raw transcript stays one press away —
 * translated, not hidden.
 */

export type EndTone = 'ok' | 'quiet' | 'warn' | 'error';
export type JobEndExplanation = { headline: string; tone: EndTone };

const C = (tone: EndTone, headline: string): JobEndExplanation => ({
  tone,
  headline,
});

/** Every value of JobListDTOConditionEnum, translated. */
export const CONDITION_COPY: Record<string, JobEndExplanation> = {
  NORMAL_COMPLETION: C('ok', 'Finished cleanly.'),
  CANCELLED_BY_USER: C(
    'quiet',
    'Cancelled on request: the job received the cancel and shut down. ' +
      'For a server run this is the normal way a session ends.'
  ),
  SCHEDULER_CANCELLED: C(
    'quiet',
    'Cancelled on the cluster: the scheduler ended it, on request or by policy.'
  ),
  SCHEDULER_STOPPED: C('warn', 'Stopped by the scheduler.'),
  SCHEDULER_TERMINATED: C('error', 'Terminated by the scheduler.'),
  SCHEDULER_TIMEOUT: C(
    'warn',
    'Hit its time limit: the scheduler ended it when the requested walltime ran out.'
  ),
  SCHEDULER_DEADLINE: C(
    'warn',
    "Hit the scheduler's deadline before it could finish."
  ),
  SCHEDULER_OUT_OF_MEMORY: C(
    'error',
    'Ran out of memory on the node. Request more memory or a larger node type.'
  ),
  JOB_LAUNCH_FAILURE: C(
    'error',
    'Never launched: the command failed to start on the execution system.'
  ),
  JOB_INVALID_DEFINITION: C(
    'error',
    'The job definition was rejected before anything ran.'
  ),
  JOB_UNABLE_TO_STAGE_INPUTS: C(
    'error',
    'Could not stage the inputs onto the execution system.'
  ),
  JOB_UNABLE_TO_STAGE_JOB: C(
    'error',
    'Could not stage the job itself onto the execution system.'
  ),
  JOB_TRANSFER_FAILED_OR_CANCELLED: C(
    'error',
    'A file transfer failed or was cancelled underneath the job.'
  ),
  JOB_TRANSFER_MONITORING_TIMEOUT: C(
    'warn',
    'Gave up waiting on a file transfer.'
  ),
  JOB_ARCHIVING_FAILED: C(
    'warn',
    'The run itself ended, but archiving its outputs failed. Results may ' +
      'only exist in the execution directory.'
  ),
  JOB_EXECUTION_MONITORING_TIMEOUT: C(
    'warn',
    'Tapis lost track of the run: monitoring timed out. The remote job may ' +
      'even have finished; the outputs are the evidence.'
  ),
  JOB_EXECUTION_MONITORING_ERROR: C(
    'error',
    'Monitoring the run failed on the Tapis side.'
  ),
  JOB_EXECUTION_MONITORING_ERROR_TIMEOUT: C(
    'error',
    'Monitoring the run kept failing until Tapis gave up.'
  ),
  JOB_QUEUE_MONITORING_ERROR: C(
    'error',
    'Watching the queue failed on the Tapis side.'
  ),
  JOB_RECOVERY_FAILURE: C(
    'error',
    'Tapis tried to recover the job after an interruption and could not.'
  ),
  JOB_RECOVERY_TIMEOUT: C(
    'warn',
    'Recovery gave up: the condition Tapis was waiting out never cleared.'
  ),
  JOB_REMOTE_ACCESS_ERROR: C(
    'error',
    'Could not reach the execution system, usually credentials or connectivity.'
  ),
  JOB_REMOTE_OUTCOME_ERROR: C(
    'error',
    'The remote job ended in a failed state on the execution system.'
  ),
  JOB_FILES_SERVICE_ERROR: C(
    'error',
    'A Files-service operation failed underneath the job.'
  ),
  JOB_DATABASE_ERROR: C('error', 'A Tapis-internal database error ended it.'),
  JOB_INTERNAL_ERROR: C('error', 'A Tapis-internal error ended it.'),
};

/**
 * Transcript patterns, for jobs whose condition is missing or unset but whose
 * lastMessage still tells the story (e.g. the cancel echo).
 */
const MESSAGE_PATTERNS: Array<{ re: RegExp; copy: JobEndExplanation }> = [
  {
    re: /JOBS_CMD_MSG_RECEIVED.*JOB_CANCEL/s,
    copy: CONDITION_COPY.CANCELLED_BY_USER,
  },
];

/**
 * A held run, read out loud. BLOCKED is not an ending: Tapis parked the
 * job on a recoverable condition — most often a quota — and retries on
 * its own. The quota refusal carries its numbers in the transcript, so
 * they are lifted into the sentence instead of left as a code.
 */
export type JobHoldExplanation = { headline: string; detail: string };

export const explainJobHold = (job: {
  status?: string;
  lastMessage?: string;
}): JobHoldExplanation | undefined => {
  if (job.status !== 'BLOCKED' && job.status !== 'PAUSED') return undefined;
  if (job.status === 'PAUSED') {
    return {
      headline: 'Paused: held until it is resumed.',
      detail: 'The job will not advance on its own while paused.',
    };
  }
  const message = job.lastMessage ?? '';
  const quota = /quota of (\d+) on system (\S+)/i.exec(message);
  if (quota) {
    const n = Number(quota[1]);
    return {
      headline: `Blocked on a quota: ${quota[2]} allows ${n} queued job${
        n === 1 ? '' : 's'
      } per user, and ${n === 1 ? 'that slot is' : 'they are all'} taken.`,
      detail:
        'Tapis retries on its own: this job advances when a slot frees, ' +
        'a queued or running job of yours ending (or being cancelled) ' +
        'clears the way.',
    };
  }
  if (/JOBS_QUOTA/i.test(message)) {
    return {
      headline:
        'Blocked on a quota: the system or queue is at its allowed number of jobs.',
      detail: 'Tapis retries on its own; this job advances when a slot frees.',
    };
  }
  return {
    headline: 'Blocked: parked on a recoverable condition.',
    detail:
      'Tapis retries on its own and the job resumes when the condition ' +
      'clears; the transcript says what it is waiting on.',
  };
};

export const explainJobEnd = (job: {
  status?: string;
  condition?: string;
  lastMessage?: string;
}): JobEndExplanation | undefined => {
  if (job.condition && CONDITION_COPY[job.condition]) {
    return CONDITION_COPY[job.condition];
  }
  // status carries the cancel even when condition lags behind
  if (job.status === 'CANCELLED') return CONDITION_COPY.CANCELLED_BY_USER;
  for (const { re, copy } of MESSAGE_PATTERNS) {
    if (job.lastMessage && re.test(job.lastMessage)) return copy;
  }
  return undefined;
};

/**
 * What each status the Jobs service can report actually means.
 *
 * The dashboard collapses eight of these into "queued" on purpose — a
 * listing cares that a job is alive and not yet computing. A detail page
 * does not have that excuse: the record says STAGING_INPUTS, so the page
 * should too, and then say what it means. Every key here is a value of
 * JobStatusEnum; the three endings need no gloss, since FINISHED,
 * CANCELLED and FAILED already say it.
 */
export const STATUS_COPY: Record<string, string> = {
  PENDING: 'accepted, not yet queued',
  PROCESSING_INPUTS: 'checking the inputs',
  STAGING_INPUTS: 'copying inputs in',
  STAGING_JOB: 'writing the job script',
  SUBMITTING_JOB: 'handing it to the scheduler',
  QUEUED: 'waiting for the scheduler',
  RUNNING: 'computing on the node',
  ARCHIVING: 'copying outputs out',
  BLOCKED: 'held, and retried automatically',
  PAUSED: 'held until resumed',
  FINISHED: '',
  CANCELLED: '',
  FAILED: '',
};

/** The gloss, or nothing — an unknown status is shown bare, not guessed at. */
export const explainJobStatus = (status?: string): string =>
  STATUS_COPY[status ?? ''] ?? '';
