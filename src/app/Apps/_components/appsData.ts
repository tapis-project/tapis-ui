/**
 * appsData — the join between the apps registry and the jobs history.
 *
 * An app row without run context is a name; with it, it answers "does anyone
 * actually use this and did it work last time". Pure functions over plain
 * rows, tested without React.
 */
import { normTs, TsLike } from 'app/_components/NavV2Kit/navKit';
import { classifyStatus, JobLite } from 'app/Jobs/_components/jobsData';

export interface AppRunContext {
  total: number;
  failed: number;
  running: number;
  last?: TsLike;
  lastStatus?: string;
  lastUuid?: string;
}

/** Per-appId run context from the shared jobs window. */
export const runContextByApp = (
  jobs: JobLite[]
): Map<string, AppRunContext> => {
  const out = new Map<string, AppRunContext>();
  for (const j of jobs) {
    if (!j.appId) continue;
    let c = out.get(j.appId);
    if (!c) {
      c = { total: 0, failed: 0, running: 0 };
      out.set(j.appId, c);
    }
    c.total += 1;
    const cls = classifyStatus(j.status);
    if (cls === 'failed') c.failed += 1;
    if (cls === 'running') c.running += 1;
    if (j.created && (!c.last || normTs(j.created) > normTs(c.last))) {
      c.last = j.created;
      c.lastStatus = j.status;
      c.lastUuid = j.uuid;
    }
  }
  return out;
};

/** Jobs for one app, newest first — the app detail's recent-runs table. */
export const recentRunsForApp = (
  jobs: JobLite[],
  appId: string,
  limit = 10
): JobLite[] =>
  jobs
    .filter((j) => j.appId === appId)
    .sort((a, b) => normTs(b.created ?? 0) - normTs(a.created ?? 0))
    .slice(0, limit);

/**
 * Success over DECISIVE runs — finishes and failures. Active jobs are not
 * evidence yet, and cancels are counted but kept out of the denominator: a
 * cancelled run is a choice, not an outcome, and for server apps (FlexServ)
 * it is the normal way a session ends. A 100% app that you stop every day
 * should read as 100%, not 20%.
 */
export const successRate = (
  jobs: JobLite[],
  appId: string
): { finished: number; decisive: number; cancelled: number } => {
  let finished = 0;
  let decisive = 0;
  let cancelled = 0;
  for (const j of jobs) {
    if (j.appId !== appId) continue;
    const c = classifyStatus(j.status);
    if (c === 'finished' || c === 'failed') {
      decisive += 1;
      if (c === 'finished') finished += 1;
    } else if (c === 'cancelled') {
      cancelled += 1;
    }
  }
  return { finished, decisive, cancelled };
};
