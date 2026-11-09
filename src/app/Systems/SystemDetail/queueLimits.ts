/**
 * queueLimits — a logical queue's numbers as short aligned cells.
 *
 * The raw record is twelve fields of min/max pairs where the mins are
 * almost always 1 and -1 means unlimited. Each column keeps only what
 * constrains — a min that actually bites (large: 65-256 nodes) keeps its
 * range, everything else reads ≤max, and a bound that says nothing is a
 * '—' cell. The UI lays queues out as rows so the columns line up across
 * the whole system.
 */
import { Systems } from '@tapis/tapis-typescript';

/** a min/max pair as its shortest honest form; null when it says nothing */
export const fmtRange = (min?: number, max?: number): string | null => {
  const lo = min != null && min > 1 ? min : null;
  const hi = max != null && max > 0 ? max : null;
  if (hi == null) return lo != null ? `≥${lo}` : null;
  if (lo == null) return hi === 1 ? '1' : `≤${hi}`;
  return lo === hi ? `${lo}` : `${lo}-${hi}`;
};

/** minutes, in the unit a person schedules in — unit glued on, the
 *  dense-table way, so cells stay as narrow as they can */
export const fmtMinutes = (mins: number): string => {
  if (mins < 120) return `${mins}min`;
  const h = mins / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)}h`;
};

/** MB as GB once it earns it */
export const fmtMemMB = (mb: number): string =>
  mb >= 1024 ? `${Math.round(mb / 102.4) / 10}GB` : `${mb}MB`;

const rangeWith = (
  fmt: (n: number) => string,
  min?: number,
  max?: number
): string => {
  if (max == null || max <= 0) return '—';
  return min != null && min > 1 ? `${fmt(min)}-${fmt(max)}` : `≤${fmt(max)}`;
};

export type QueueColumn = {
  header: string;
  cell: (q: Systems.LogicalQueue) => string;
};

/**
 * The limits table's columns, in constraint order. The UI drops any
 * column that says '—' for every queue (maxJobs is -1 nearly always),
 * so the table only carries earned columns.
 */
export const QUEUE_COLUMNS: Array<QueueColumn> = [
  {
    header: 'nodes',
    cell: (q) => fmtRange(q.minNodeCount, q.maxNodeCount) ?? '—',
  },
  {
    header: 'cores/node',
    cell: (q) => fmtRange(q.minCoresPerNode, q.maxCoresPerNode) ?? '—',
  },
  {
    header: 'mem',
    cell: (q) => rangeWith(fmtMemMB, q.minMemoryMB, q.maxMemoryMB),
  },
  {
    header: 'time',
    cell: (q) => rangeWith(fmtMinutes, q.minMinutes, q.maxMinutes),
  },
  {
    header: 'jobs/user',
    cell: (q) =>
      q.maxJobsPerUser != null && q.maxJobsPerUser > 0
        ? `≤${q.maxJobsPerUser}`
        : '—',
  },
  {
    header: 'jobs',
    cell: (q) => (q.maxJobs != null && q.maxJobs > 0 ? `≤${q.maxJobs}` : '—'),
  },
];

/** the columns worth printing for THESE queues */
export const earnedColumns = (
  queues: Array<Systems.LogicalQueue>
): Array<QueueColumn> =>
  QUEUE_COLUMNS.filter((col) => queues.some((q) => col.cell(q) !== '—'));
