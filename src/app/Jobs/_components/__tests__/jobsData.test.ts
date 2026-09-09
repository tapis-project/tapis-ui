import {
  classifyStatus,
  isActive,
  countsByClass,
  failuresWithin,
  perAppActivity,
  byDayOutcome,
  longestRunning,
  runtimeMs,
  fmtDuration,
  JobLite,
  parseSchedulerNotes,
} from '../jobsData';
import { midEllipsis } from 'app/_components/NavV2Kit/navKit';

const NOW = Date.parse('2026-09-01T12:00:00Z');
const ago = (h: number) => new Date(NOW - h * 3600_000).toISOString();

const job = (over: Partial<JobLite>): JobLite => ({
  uuid: 'u',
  name: 'j',
  appId: 'app-a',
  status: 'FINISHED',
  created: ago(1),
  ...over,
});

describe('classifyStatus', () => {
  it('maps terminal and running states directly', () => {
    expect(classifyStatus('RUNNING')).toBe('running');
    expect(classifyStatus('FINISHED')).toBe('finished');
    expect(classifyStatus('FAILED')).toBe('failed');
    expect(classifyStatus('CANCELLED')).toBe('cancelled');
  });
  it('reads every staging state as queued — alive, not yet computing', () => {
    for (const s of [
      'PENDING',
      'PROCESSING_INPUTS',
      'STAGING_INPUTS',
      'STAGING_JOB',
      'SUBMITTING_JOB',
      'QUEUED',
      'ARCHIVING',
    ])
      expect(classifyStatus(s)).toBe('queued');
  });
  it('parks BLOCKED and PAUSED in their own bucket', () => {
    expect(classifyStatus('BLOCKED')).toBe('blocked');
    expect(classifyStatus('PAUSED')).toBe('blocked');
  });
  it('treats undefined as queued rather than crashing', () => {
    expect(classifyStatus(undefined)).toBe('queued');
    expect(isActive(undefined)).toBe(true);
  });
});

describe('countsByClass', () => {
  it('tallies every bucket', () => {
    const c = countsByClass([
      job({ status: 'RUNNING' }),
      job({ status: 'RUNNING' }),
      job({ status: 'QUEUED' }),
      job({ status: 'FAILED' }),
    ]);
    expect(c.running).toBe(2);
    expect(c.queued).toBe(1);
    expect(c.failed).toBe(1);
    expect(c.finished).toBe(0);
  });
});

describe('failuresWithin', () => {
  it('keeps only failures inside the window, newest first', () => {
    const jobs = [
      job({ uuid: 'old', status: 'FAILED', ended: ago(24 * 10) }),
      job({ uuid: 'new', status: 'FAILED', ended: ago(2) }),
      job({ uuid: 'newer', status: 'FAILED', ended: ago(1) }),
      job({ uuid: 'ok', status: 'FINISHED', ended: ago(1) }),
    ];
    expect(failuresWithin(jobs, 7, NOW).map((j) => j.uuid)).toEqual([
      'newer',
      'new',
    ]);
  });
  it('falls back to lastUpdated when ended is missing', () => {
    const jobs = [
      job({ status: 'FAILED', ended: undefined, lastUpdated: ago(3) }),
    ];
    expect(failuresWithin(jobs, 1, NOW)).toHaveLength(1);
  });
});

describe('perAppActivity', () => {
  it('groups by app, most recently used first, with counts', () => {
    const acts = perAppActivity([
      job({ appId: 'a', created: ago(5) }),
      job({ appId: 'a', created: ago(1), status: 'RUNNING' }),
      job({ appId: 'b', created: ago(2), status: 'FAILED' }),
    ]);
    expect(acts.map((a) => a.appId)).toEqual(['a', 'b']);
    expect(acts[0]).toMatchObject({
      total: 2,
      running: 1,
      lastStatus: 'RUNNING',
    });
    expect(acts[1]).toMatchObject({ total: 1, failed: 1 });
  });
  it('buckets appId-less rows instead of dropping them', () => {
    expect(perAppActivity([job({ appId: undefined })])[0].appId).toBe(
      '(unknown app)'
    );
  });
});

describe('byDayOutcome', () => {
  it('includes empty days so the axis is honest', () => {
    const days = byDayOutcome([job({ created: ago(1) })], 3, NOW);
    expect(days).toHaveLength(3);
    expect(days[2].day).toBe('2026-09-01');
    expect(days[2].finished).toBe(1);
    expect(days[0].finished).toBe(0);
  });
  it('counts non-terminal jobs as active on their submission day', () => {
    const days = byDayOutcome(
      [job({ created: ago(1), status: 'QUEUED' })],
      1,
      NOW
    );
    expect(days[0].active).toBe(1);
  });
  it('ignores jobs outside the window', () => {
    const days = byDayOutcome([job({ created: ago(24 * 40) })], 3, NOW);
    expect(days.every((d) => d.finished === 0)).toBe(true);
  });
});

describe('runtime + longestRunning', () => {
  it('measures running jobs against now and ended jobs against ended', () => {
    expect(runtimeMs(job({ remoteStarted: ago(2) }), NOW)).toBe(2 * 3600_000);
    expect(runtimeMs(job({ remoteStarted: ago(2), ended: ago(1) }), NOW)).toBe(
      3600_000
    );
    expect(runtimeMs(job({ remoteStarted: undefined }), NOW)).toBe(0);
  });
  it('sorts running jobs longest first', () => {
    const l = longestRunning(
      [
        job({ uuid: 'short', status: 'RUNNING', remoteStarted: ago(1) }),
        job({ uuid: 'long', status: 'RUNNING', remoteStarted: ago(9) }),
        job({ uuid: 'done', status: 'FINISHED', remoteStarted: ago(20) }),
      ],
      NOW
    );
    expect(l.map((j) => j.uuid)).toEqual(['long', 'short']);
  });
});

describe('fmtDuration', () => {
  it('scales units', () => {
    expect(fmtDuration(30_000)).toBe('30s');
    expect(fmtDuration(90_000)).toBe('1m 30s');
    expect(fmtDuration(3 * 3600_000)).toBe('3h 0m');
    expect(fmtDuration(50 * 3600_000)).toBe('2d 2h');
  });
});

describe('midEllipsis', () => {
  it('keeps short names whole and folds the middle of long ones', () => {
    expect(midEllipsis('short-name')).toBe('short-name');
    const folded = midEllipsis(
      'hello-world-test-20260901-093000-attempt-4',
      26
    );
    expect(folded.length).toBeLessThanOrEqual(26);
    expect(folded.startsWith('hello-world')).toBe(true);
    expect(folded.endsWith('empt-4')).toBe(true);
    expect(folded).toContain('…');
  });
});

describe('parseSchedulerNotes', () => {
  // the real shape off a FlexServ run, profile and job-name included
  const schedulerOptions = [
    { arg: '--tapis-profile tacc-apptainer', name: 'TACC Scheduler Profile' },
    { arg: '--job-name tap_FlexServ-1.4.0', name: 'Slurm job name' },
    { arg: '-A TRA24006', name: 'TACC Resource Allocation', include: true },
    {
      arg: '--reservation Tapis+Tutorial+Gateways-TEST',
      name: 'Reservation Name',
      include: true,
    },
  ];

  it('lifts the allocation and reservation out of the run itself', () => {
    expect(parseSchedulerNotes({ schedulerOptions })).toEqual({
      allocation: 'TRA24006',
      reservation: 'Tapis+Tutorial+Gateways-TEST',
    });
  });

  it('reads the JSON-string form the details endpoint hands over', () => {
    expect(parseSchedulerNotes(JSON.stringify({ schedulerOptions }))).toEqual({
      allocation: 'TRA24006',
      reservation: 'Tapis+Tutorial+Gateways-TEST',
    });
  });

  it('skips options declared but not sent', () => {
    expect(
      parseSchedulerNotes({
        schedulerOptions: [
          { arg: '-A NOPE-1', include: false },
          { arg: '-A YES-2', include: true },
        ],
      })
    ).toEqual({ allocation: 'YES-2' });
  });

  it('shrugs at garbage — no notes is a fine answer', () => {
    expect(parseSchedulerNotes(undefined)).toEqual({});
    expect(parseSchedulerNotes('not json {')).toEqual({});
    expect(parseSchedulerNotes({ schedulerOptions: 'nope' })).toEqual({});
  });
});
