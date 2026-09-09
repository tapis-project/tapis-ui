/**
 * The two-question reading of a job. The cases that matter are the ones
 * where status alone lies: a long interactive session you cancelled, and a
 * batch job the scheduler killed after it had already done its work.
 */
import {
  MEANINGFUL_RUN_MS,
  hitTheWallClock,
  jobVerdict,
  meaningfulMsFor,
  reachedItsWallClock,
  reasonOf,
} from '../jobVerdict';

const MIN = 60 * 1000;
const NOW = Date.parse('2026-09-07T12:00:00Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();

const job = (over: object = {}) => ({
  uuid: 'j1',
  status: 'FINISHED',
  condition: 'NORMAL_COMPLETION',
  ...over,
});

describe('reasonOf', () => {
  it('reads the conditions people actually see', () => {
    expect(reasonOf('CANCELLED', 'CANCELLED_BY_USER')).toBe('cancelled-by-you');
    expect(reasonOf('FAILED', 'SCHEDULER_TIMEOUT')).toBe('timeout');
    expect(reasonOf('FAILED', 'SCHEDULER_DEADLINE')).toBe('timeout');
    expect(reasonOf('FAILED', 'SCHEDULER_OUT_OF_MEMORY')).toBe('out-of-memory');
    expect(reasonOf('FAILED', 'SCHEDULER_CANCELLED')).toBe(
      'cancelled-by-scheduler'
    );
    expect(reasonOf('FAILED', 'JOB_UNABLE_TO_STAGE_INPUTS')).toBe(
      'staging-failed'
    );
    expect(reasonOf('FAILED', 'JOB_ARCHIVING_FAILED')).toBe('archiving-failed');
  });

  it('treats a normal completion as no reason at all', () => {
    expect(reasonOf('FINISHED', 'NORMAL_COMPLETION')).toBeNull();
  });

  it('catches the timeouts that are not the scheduler’s', () => {
    expect(reasonOf('FAILED', 'JOB_EXECUTION_MONITORING_TIMEOUT')).toBe(
      'timeout'
    );
  });

  it('assumes a cancelled run with no condition was cancelled by you', () => {
    expect(reasonOf('CANCELLED', undefined)).toBe('cancelled-by-you');
  });

  it('falls back to plain failure, and to nothing when nothing happened', () => {
    expect(reasonOf('FAILED', 'JOB_INTERNAL_ERROR')).toBe('failed');
    expect(reasonOf('FAILED', undefined)).toBe('failed');
    expect(reasonOf('QUEUED', undefined)).toBeNull();
  });
});

describe('the case this exists for', () => {
  it('calls a long interactive session that you stopped a success', () => {
    const v = jobVerdict(
      job({
        status: 'CANCELLED',
        condition: 'CANCELLED_BY_USER',
        remoteStarted: ago(120 * MIN),
        ended: ago(0),
      }),
      NOW
    );
    // the work happened; you ending it is not a failure
    expect(v.outcome).toBe('worked');
    expect(v.reason).toBe('cancelled-by-you');
    expect(v.headline).toBe('Ran 2h, then you cancelled it');
  });

  it('does not extend that courtesy to one you killed immediately', () => {
    const v = jobVerdict(
      job({
        status: 'CANCELLED',
        condition: 'CANCELLED_BY_USER',
        remoteStarted: ago(40 * 1000),
        ended: ago(0),
      }),
      NOW
    );
    expect(v.outcome).toBe('partial');
    expect(v.headline).toMatch(/Only ran/);
  });

  it('counts a job that hit the wall clock after real work as worked', () => {
    const v = jobVerdict(
      job({
        status: 'FAILED',
        condition: 'SCHEDULER_TIMEOUT',
        remoteStarted: ago(48 * 60 * MIN),
        ended: ago(0),
      }),
      NOW
    );
    expect(v.outcome).toBe('worked');
    expect(v.reason).toBe('timeout');
  });
});

describe('judged against its own allowance', () => {
  const ran = (mins: number, over: object = {}) =>
    jobVerdict(
      job({
        status: 'FAILED',
        condition: 'SCHEDULER_TIMEOUT',
        remoteStarted: ago(mins * MIN),
        ended: ago(0),
        ...over,
      }),
      NOW
    );

  it('never says "only ran" about a job that outlasted its own limit', () => {
    // the reported case: one minute requested, four minutes on the clock,
    // and the page called it "Only ran 4 min before it hit the time limit"
    const v = ran(4, { maxMinutes: 1 });
    expect(v.outcome).toBe('worked');
    expect(v.headline).toBe('Ran its full 1 min, then it hit the time limit');
    expect(v.headline).not.toMatch(/Only ran/);
  });

  it('counts reaching the wall clock, not passing it', () => {
    // a scheduler kills AT the limit, and the window Tapis records lands
    // either side of it — an exact >= would miss the case entirely
    expect(ran(60, { maxMinutes: 60 }).outcome).toBe('worked');
    expect(ran(58, { maxMinutes: 60 }).outcome).toBe('worked');
  });

  it('scales what counts as a real run to what was granted', () => {
    // 40 s of a 1-minute allowance is most of it — the flat five-minute
    // rule called this partial, which was nonsense for a short job
    const short = jobVerdict(
      job({
        status: 'CANCELLED',
        condition: 'CANCELLED_BY_USER',
        remoteStarted: ago(40 * 1000),
        ended: ago(0),
        maxMinutes: 1,
      }),
      NOW
    );
    expect(short.outcome).toBe('worked');

    // the same 40 s against two days is nothing, and says so with the
    // allowance in hand
    const long = jobVerdict(
      job({
        status: 'CANCELLED',
        condition: 'CANCELLED_BY_USER',
        remoteStarted: ago(40 * 1000),
        ended: ago(0),
        maxMinutes: 48 * 60,
      }),
      NOW
    );
    expect(long.outcome).toBe('partial');
    expect(long.headline).toBe(
      'Only ran 1 min of its 48h before you cancelled it'
    );
  });

  it('caps the derived threshold, so a long job need not run for a day', () => {
    // half of 48h is a day; MEANINGFUL_RUN_MS is the ceiling
    expect(meaningfulMsFor({ maxMinutes: 48 * 60 })).toBe(MEANINGFUL_RUN_MS);
    expect(meaningfulMsFor({ maxMinutes: 4 })).toBe(2 * MIN);
    // a listing row has no allowance to measure against
    expect(meaningfulMsFor({})).toBe(MEANINGFUL_RUN_MS);
  });

  it('does not let a Tapis watchdog claim the allowance was spent', () => {
    // "we lost track of the run" says nothing about how long it ran, so it
    // gets no free pass — only the scheduler's own two conditions do
    expect(hitTheWallClock('SCHEDULER_TIMEOUT')).toBe(true);
    expect(hitTheWallClock('SCHEDULER_DEADLINE')).toBe(true);
    expect(hitTheWallClock('JOB_EXECUTION_MONITORING_TIMEOUT')).toBe(false);

    const v = ran(1, { condition: 'JOB_EXECUTION_MONITORING_TIMEOUT' });
    expect(v.outcome).toBe('partial');
  });
});

describe('the boundary', () => {
  it('is inclusive at exactly the meaningful run', () => {
    const at = (ms: number) =>
      jobVerdict(
        job({
          status: 'CANCELLED',
          condition: 'CANCELLED_BY_USER',
          remoteStarted: ago(ms),
          ended: ago(0),
        }),
        NOW
      ).outcome;
    expect(at(MEANINGFUL_RUN_MS)).toBe('worked');
    expect(at(MEANINGFUL_RUN_MS - 1000)).toBe('partial');
  });
});

describe('the rest of the states', () => {
  it('says nothing ran when it never reached the machine', () => {
    const v = jobVerdict(
      job({ status: 'FAILED', condition: 'JOB_UNABLE_TO_STAGE_INPUTS' }),
      NOW
    );
    expect(v.outcome).toBe('never-ran');
    expect(v.ranMs).toBe(0);
    expect(v.headline).toBe('Never started, its files never arrived');
  });

  it('leaves a job still in flight to the state machine', () => {
    // a pipeline stage is not a verdict, and drawing it as one would lie
    expect(jobVerdict(job({ status: 'STAGING_INPUTS' }), NOW).outcome).toBe(
      'in-flight'
    );
    expect(jobVerdict(job({ status: 'QUEUED' }), NOW).outcome).toBe(
      'in-flight'
    );
    expect(
      jobVerdict(job({ status: 'RUNNING', remoteStarted: ago(9 * MIN) }), NOW)
        .headline
    ).toBe('Running, 9 min so far');
  });

  it('reads a clean finish as itself', () => {
    const v = jobVerdict(
      job({ remoteStarted: ago(30 * MIN), ended: ago(0) }),
      NOW
    );
    expect(v.outcome).toBe('worked');
    expect(v.reason).toBeNull();
    expect(v.headline).toBe('Finished normally after 30 min');
  });

  it('still calls a short clean finish a success', () => {
    // FINISHED means the job said it was done — the five-minute rule is
    // only for runs that ended some OTHER way
    const v = jobVerdict(
      job({ remoteStarted: ago(20 * 1000), ended: ago(0) }),
      NOW
    );
    expect(v.outcome).toBe('worked');
  });
});

describe('a live run that has reached its wall clock', () => {
  // the window the page cannot see: the scheduler pulls the node at
  // maxMinutes, and the status only moves once Tapis notices. For a
  // session app the address stops answering first.
  const live = (over: object = {}) =>
    job({
      status: 'RUNNING',
      condition: undefined,
      maxMinutes: 60,
      remoteStarted: ago(30 * MIN),
      ...over,
    });

  it('says nothing while the run is comfortably inside its allowance', () => {
    expect(reachedItsWallClock(live(), NOW)).toBeUndefined();
  });

  it('reports the allowance and the elapsed once the clock is up', () => {
    const past = reachedItsWallClock(
      live({ remoteStarted: ago(61 * MIN) }),
      NOW
    );
    expect(past?.allowanceMs).toBe(60 * MIN);
    expect(past?.ranMs).toBe(61 * MIN);
  });

  it('warns a little early, on purpose', () => {
    // remoteStarted is when Tapis SAW the run start, at or after the real
    // one, so this elapsed under-reads the scheduler's — WALL_TOLERANCE
    // leans the same way it does for an ended run
    expect(
      reachedItsWallClock(live({ remoteStarted: ago(58 * MIN) }), NOW)
    ).toBeDefined();
    expect(
      reachedItsWallClock(live({ remoteStarted: ago(56 * MIN) }), NOW)
    ).toBeUndefined();
  });

  it('has nothing to say about a run that is already over', () => {
    // an ended job has a verdict; this is only for the stale-status window
    expect(
      reachedItsWallClock(
        live({ status: 'FINISHED', remoteStarted: ago(90 * MIN) }),
        NOW
      )
    ).toBeUndefined();
  });

  it('stays quiet without an allowance or a start', () => {
    // every listing row: JobListDTO carries no maxMinutes
    expect(
      reachedItsWallClock(live({ maxMinutes: undefined }), NOW)
    ).toBeUndefined();
    expect(
      reachedItsWallClock(live({ remoteStarted: undefined }), NOW)
    ).toBeUndefined();
  });
});
