import { runContextByApp, recentRunsForApp, successRate } from '../appsData';
import { JobLite } from 'app/Jobs/_components/jobsData';

const NOW = Date.parse('2026-09-01T12:00:00Z');
const ago = (h: number) => new Date(NOW - h * 3600_000).toISOString();

const jobs: JobLite[] = [
  { uuid: 'a1', appId: 'a', status: 'FINISHED', created: ago(5) },
  { uuid: 'a2', appId: 'a', status: 'FAILED', created: ago(2) },
  { uuid: 'a3', appId: 'a', status: 'RUNNING', created: ago(1) },
  { uuid: 'b1', appId: 'b', status: 'QUEUED', created: ago(3) },
  { uuid: 'x', appId: undefined, status: 'FINISHED', created: ago(1) },
];

describe('runContextByApp', () => {
  const ctx = runContextByApp(jobs);
  it('counts totals, failures, and running per app', () => {
    expect(ctx.get('a')).toMatchObject({ total: 3, failed: 1, running: 1 });
    expect(ctx.get('b')).toMatchObject({ total: 1, failed: 0 });
  });
  it('tracks the most recent run and its status + uuid', () => {
    expect(ctx.get('a')).toMatchObject({
      lastStatus: 'RUNNING',
      lastUuid: 'a3',
    });
  });
  it('skips jobs with no appId rather than inventing a bucket', () => {
    expect([...ctx.keys()].sort()).toEqual(['a', 'b']);
  });
});

describe('recentRunsForApp', () => {
  it('returns the app runs newest first, capped', () => {
    expect(recentRunsForApp(jobs, 'a', 2).map((j) => j.uuid)).toEqual([
      'a3',
      'a2',
    ]);
  });
});

describe('successRate', () => {
  it('rates only decisive runs — active jobs are not evidence yet', () => {
    expect(successRate(jobs, 'a')).toEqual({
      finished: 1,
      decisive: 2,
      cancelled: 0,
    });
    expect(successRate(jobs, 'b')).toEqual({
      finished: 0,
      decisive: 0,
      cancelled: 0,
    });
  });

  it('a cancel is a choice, not an outcome — counted, never blamed', () => {
    // a FlexServ pattern: every session ends by cancel, one crashed once
    const flex: JobLite[] = [
      { uuid: 'f1', appId: 'flexserv', status: 'CANCELLED', created: ago(9) },
      { uuid: 'f2', appId: 'flexserv', status: 'CANCELLED', created: ago(7) },
      { uuid: 'f3', appId: 'flexserv', status: 'CANCELLED', created: ago(5) },
      { uuid: 'f4', appId: 'flexserv', status: 'FINISHED', created: ago(3) },
      { uuid: 'f5', appId: 'flexserv', status: 'FAILED', created: ago(1) },
    ];
    expect(successRate(flex, 'flexserv')).toEqual({
      finished: 1,
      decisive: 2,
      cancelled: 3,
    });
  });
});
