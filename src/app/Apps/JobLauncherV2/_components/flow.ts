/**
 * Which section most wants attention: where the head line's "starting in"
 * points.
 *
 * Pure on purpose. An earlier version was a hook that recomputed blockers and
 * warnings for itself, which meant a second and third copy of the launcher's
 * debounce timers — three components each rescheduling a 200ms settle, and
 * the panel never came to rest. The caller already has both lists; this only
 * reads them. (The step count is the panel's own now, read off the nav.)
 */
import { sectionMeta } from './sections/meta';

export type FlowIssue = {
  id: string;
  kind: 'blocker' | 'warning';
  count: number;
};

const order = () => sectionMeta.map((section) => section.id);

/**
 * Blockers first, then warnings; within a kind the earliest section wins, so
 * the walk still runs top to bottom.
 */
export const firstIssue = (
  blockers: Array<{ sectionId: string }>,
  warnings: Array<{ sectionId: string }>
): FlowIssue | undefined => {
  const pick = (
    list: Array<{ sectionId: string }>,
    kind: FlowIssue['kind']
  ): FlowIssue | undefined => {
    const id = order().find((section) =>
      list.some((item) => item.sectionId === section)
    );
    return id
      ? { id, kind, count: list.filter((item) => item.sectionId === id).length }
      : undefined;
  };
  return pick(blockers, 'blocker') ?? pick(warnings, 'warning');
};
