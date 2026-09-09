/**
 * Making a Tapis error legible.
 *
 * A failed submission comes back as a chain of wrappers with the actual cause
 * buried at the far end:
 *
 *   JOBS_WORKER_PROCESSING_ERROR An exception occurred on JobWorker
 *   wk2-DefaultQueue-46 on queue tapis.jobq.submit.DefaultQueue running
 *   wk2-DefaultQueue-JobQueueProcessor while processing job 785f…-007:
 *   JOBS_SUBMIT_ERROR2 ZipLauncher received exit code 1 when submitting job
 *   785f…-007 using command "cd '/scratch/…';sbatch tapisjob.sh". Result:
 *   … Welcome to the Vista Supercomputer … --> Verifying valid submit
 *   host (login2)...OK … sbatch: error: Batch job submission failed:
 *   Requested reservation is invalid
 *
 * Everything you need is the last dozen words. Showing the head of that in a
 * one-line box tells you a worker had an exception, which you knew.
 */

const ERROR_MARKER = 'error:';

/**
 * The part of an error worth putting on the collapsed line.
 *
 * Scheduler and shell tooling all announce the real failure the same way —
 * `<tool>: error: <cause>` — and it is always the LAST one, because each
 * layer wraps the one below it. Take what follows, up to the end of its line:
 * what comes after that is the aftermath, not the failure.
 *
 *   ERROR: Unknown project Tapis+Tutorial-shared-test (in accounting.pl).
 *
 *   Please report this problem:
 *   U. of TX users contact (https://portal.tacc.utexas.edu/consulting)
 *   FAILED
 *
 * The first line is the answer; the rest belongs behind the chevron.
 *
 * Undefined when there is no such marker, in which case the caller should
 * just show the message and let it ellipsize.
 */
export const errorHeadline = (message: string): string | undefined => {
  const at = message.toLowerCase().lastIndexOf(ERROR_MARKER);
  if (at < 0) return undefined;
  const tail = message.slice(at + ERROR_MARKER.length);
  // A flattened message has no newline to stop at, so this is the whole tail —
  // which is what the sbatch case wants.
  const firstLine = tail.split('\n')[0].trim();
  // a message ENDING in 'error:' has told us nothing
  return firstLine || undefined;
};

// Markers that conventionally begin their own line in scheduler output.
const LINE_STARTS = /\s+(-->|Result:|sbatch:|srun:|salloc:|sacct:|qsub:)/g;

/**
 * Reflow a single-line error for reading.
 *
 * Job errors reach the UI with their newlines flattened, so an sbatch
 * transcript — banner, a dozen `--> Verifying …OK` checks, then the failure —
 * arrives as one 900-character run. This puts the breaks back in front of the
 * markers that started the lines, and leaves anything that still has real
 * newlines completely alone.
 *
 * Display only: `errorHeadline` and the copy button both read the original.
 */
export const reflowError = (message: string): string =>
  message.includes('\n') ? message : message.replace(LINE_STARTS, '\n$1');

/**
 * Pretty-print an error body that turns out to be JSON, otherwise reflow it.
 */
export const formatErrorBody = (message: string): string => {
  const trimmed = message.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      // not JSON after all — fall through
    }
  }
  return reflowError(message);
};
