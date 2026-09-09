import {
  fmtRange,
  fmtMinutes,
  fmtMemMB,
  QUEUE_COLUMNS,
  earnedColumns,
} from './queueLimits';

describe('fmtRange', () => {
  it('keeps only the bound that bites', () => {
    expect(fmtRange(1, 16)).toBe('≤16');
    expect(fmtRange(65, 256)).toBe('65-256');
    expect(fmtRange(1, 1)).toBe('1');
    expect(fmtRange(4, 4)).toBe('4');
    // -1 means unlimited — nothing to say
    expect(fmtRange(1, -1)).toBeNull();
    expect(fmtRange(undefined, undefined)).toBeNull();
    expect(fmtRange(65, -1)).toBe('≥65');
  });
});

describe('fmtMinutes', () => {
  it('speaks in the unit a person schedules in', () => {
    expect(fmtMinutes(90)).toBe('90min');
    expect(fmtMinutes(120)).toBe('2h');
    expect(fmtMinutes(2880)).toBe('48h');
    expect(fmtMinutes(150)).toBe('2.5h');
  });
});

describe('fmtMemMB', () => {
  it('earns GB at 1024', () => {
    expect(fmtMemMB(512)).toBe('512MB');
    expect(fmtMemMB(256000)).toBe('250GB');
    expect(fmtMemMB(1536)).toBe('1.5GB');
  });
});

// gpu-a100 on vista, verbatim
const gpuA100 = {
  name: 'gpu-a100',
  hpcQueueName: 'gpu-a100',
  maxJobs: -1,
  maxJobsPerUser: 40,
  minNodeCount: 1,
  maxNodeCount: 16,
  minCoresPerNode: 1,
  maxCoresPerNode: 128,
  minMemoryMB: 1,
  maxMemoryMB: 256000,
  minMinutes: 1,
  maxMinutes: 2880,
};

const rowFor = (q: typeof gpuA100) =>
  Object.fromEntries(QUEUE_COLUMNS.map((c) => [c.header, c.cell(q)]));

describe('QUEUE_COLUMNS', () => {
  it('a typical queue reads as short aligned cells', () => {
    expect(rowFor(gpuA100)).toEqual({
      nodes: '≤16',
      'cores/node': '≤128',
      mem: '≤250GB',
      time: '≤48h',
      'jobs/user': '≤40',
      jobs: '—',
    });
  });

  it('a min that bites keeps its range', () => {
    expect(
      rowFor({ ...gpuA100, name: 'large', minNodeCount: 65, maxNodeCount: 256 })
        .nodes
    ).toBe('65-256');
  });

  it('says nothing about fields it does not have', () => {
    const bare = { name: 'bare', hpcQueueName: 'bare' };
    QUEUE_COLUMNS.forEach((c) => expect(c.cell(bare)).toBe('—'));
  });
});

describe('earnedColumns', () => {
  it('drops a column no queue can fill — maxJobs is -1 nearly always', () => {
    const cols = earnedColumns([gpuA100]).map((c) => c.header);
    expect(cols).toEqual(['nodes', 'cores/node', 'mem', 'time', 'jobs/user']);
  });

  it('keeps it the moment one queue earns it', () => {
    const cols = earnedColumns([gpuA100, { ...gpuA100, maxJobs: 10 }]).map(
      (c) => c.header
    );
    expect(cols).toContain('jobs');
  });
});
