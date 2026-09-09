/**
 * Where the head line's "starting in" points, and why.
 *
 * Pure functions on purpose — an earlier version recomputed blockers inside a
 * hook, which gave three components their own copy of the launcher's debounce
 * timers and the panel never settled.
 */
import { firstIssue } from '../flow';

const at = (sectionId: string) => ({ sectionId });

describe('firstIssue', () => {
  it('is nothing when the job is clean', () => {
    expect(firstIssue([], [])).toBeUndefined();
  });

  it('sends you to a blocker before a warning, wherever they sit', () => {
    // scheduler comes after execution in the walk, but a blocker outranks
    // a warning regardless of order
    expect(firstIssue([at('scheduler')], [at('execution')])).toMatchObject({
      id: 'scheduler',
      kind: 'blocker',
    });
  });

  it('within a kind, the earliest section wins so the walk runs forward', () => {
    expect(firstIssue([at('scheduler'), at('basics')], [])).toMatchObject({
      id: 'basics',
    });
  });

  it('counts what that section owes', () => {
    expect(
      firstIssue([at('execution'), at('execution'), at('scheduler')], [])
    ).toMatchObject({ id: 'execution', count: 2 });
  });

  it('falls through to warnings once nothing blocks', () => {
    expect(firstIssue([], [at('scheduler')])).toMatchObject({
      id: 'scheduler',
      kind: 'warning',
    });
  });
});
