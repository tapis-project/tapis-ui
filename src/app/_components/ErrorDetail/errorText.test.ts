import { errorHeadline, formatErrorBody, reflowError } from './errorText';

// The real thing, newlines already flattened by the time it reaches the UI.
const SBATCH = [
  'JOBS_WORKER_PROCESSING_ERROR An exception occurred on JobWorker',
  'wk2-DefaultQueue-46 on queue tapis.jobq.submit.DefaultQueue running',
  'wk2-DefaultQueue-JobQueueProcessor while processing job',
  '785f04cb-ce9e-4ca8-9e55-53a9dc8a5681-007: JOBS_SUBMIT_ERROR2 ZipLauncher',
  'received exit code 1 when submitting job',
  '785f04cb-ce9e-4ca8-9e55-53a9dc8a5681-007 using command "cd',
  "'/scratch/05107/cgarcia/tapis/785f04cb-ce9e-4ca8-9e55-53a9dc8a5681-007';sbatch",
  'tapisjob.sh". Result: ----- Welcome to the Vista Supercomputer -----',
  '--> Verifying valid submit host (login2)...OK',
  '--> Verifying valid jobname...OK',
  '--> Verifying access to desired queue (gh-shared)...OK',
  '--> Checking available allocation (TACC-ACI-CIC)...OK',
  'sbatch: error: Batch job submission failed: Requested reservation is invalid',
].join(' ');

describe('errorHeadline', () => {
  it('finds the cause at the far end of the wrapper chain', () => {
    // NOT 'an exception occurred on JobWorker wk2-…', which you knew
    expect(errorHeadline(SBATCH)).toBe(
      'Batch job submission failed: Requested reservation is invalid'
    );
  });

  it('takes the last marker, since each layer wraps the one below', () => {
    expect(
      errorHeadline('outer error: wrapped\ninner error: the real one')
    ).toBe('the real one');
  });

  it('stops at the end of the line — the rest is aftermath, not the failure', () => {
    const tacc = [
      'ERROR: Unknown project Tapis+Tutorial+Gateways-shared-test (in accounting_check_prod.pl).',
      '',
      'Please report this problem: ',
      'U. of TX users contact (https://portal.tacc.utexas.edu/consulting)',
      'FAILED',
    ].join('\n');
    expect(errorHeadline(tacc)).toBe(
      'Unknown project Tapis+Tutorial+Gateways-shared-test (in accounting_check_prod.pl).'
    );
  });

  it('has no opinion about a message with no marker', () => {
    expect(errorHeadline('Something went wrong')).toBeUndefined();
    // and does not offer an empty headline
    expect(errorHeadline('failed with error:')).toBeUndefined();
  });
});

describe('reflowError', () => {
  it('puts the scheduler transcript back on its own lines', () => {
    const out = reflowError(SBATCH);
    expect(out.split('\n').length).toBeGreaterThan(5);
    expect(out).toContain('\n--> Verifying valid jobname...OK');
    expect(out).toContain('\nsbatch: error:');
  });

  it('leaves a message that already has newlines alone', () => {
    const already = 'line one\n--> line two';
    expect(reflowError(already)).toBe(already);
  });
});

describe('formatErrorBody', () => {
  it('pretty-prints a JSON body', () => {
    expect(formatErrorBody('{"status":"error","message":"bad queue"}')).toBe(
      '{\n  "status": "error",\n  "message": "bad queue"\n}'
    );
  });

  it('reflows anything that is not JSON', () => {
    expect(formatErrorBody('a --> b')).toBe('a\n--> b');
  });

  it('does not mangle something that only looks like JSON', () => {
    expect(formatErrorBody('{not json after all')).toBe('{not json after all');
  });
});
