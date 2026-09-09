/**
 * Blockers and warnings as one list.
 *
 * They are computed apart because they mean different things to a submission
 * (red stops it, amber does not), but everywhere they are *read* they are read
 * together: the review board stacks them, and a nav row wants both under one
 * label. Merging them here means the ordering and the wording are decided
 * once, in a module with no React in it, rather than three times in three
 * components that then disagree.
 */
import type { Blocker } from './blockers';
import type { Warning } from './warnings';
import { sectionMeta } from './sections/meta';

export type IssueKind = 'blocker' | 'warning';

export type LauncherIssue = {
  kind: IssueKind;
  sectionId: string;
  /** stable per render, for list keys */
  key: string;
  /** the whole complaint, for the review board */
  message: string;
  /** the identifying clause, for a nav row */
  short: string;
  // No "resolve it from here" press. The board used to offer one (Uncheck
  // Include, Include it), and it got pressed out of fidget more than intent:
  // a list of what is wrong says so, and the section is one press away.
};

const sectionOrder = (id: string) => {
  const index = sectionMeta.findIndex((section) => section.id === id);
  // an unattributed problem sorts last rather than first
  return index < 0 ? sectionMeta.length : index;
};

export const sectionLabel = (id: string) =>
  sectionMeta.find((section) => section.id === id)?.label ?? id;

/**
 * Blockers first, then warnings; within a kind, the order the sections are
 * walked in. That is the order the walk sends people through them, so the
 * board and the footer button cannot point at different "next" things.
 */
export const mergeIssues = (
  blockers: Array<Blocker>,
  warnings: Array<Warning>
): Array<LauncherIssue> => {
  const fromBlocker = (blocker: Blocker, index: number): LauncherIssue => ({
    kind: 'blocker',
    sectionId: blocker.sectionId,
    key: `blocker-${blocker.sectionId}-${blocker.label}-${index}`,
    message: blocker.message,
    short: blocker.short,
  });
  const fromWarning = (warning: Warning, index: number): LauncherIssue => ({
    kind: 'warning',
    sectionId: warning.sectionId,
    key: `warning-${warning.sectionId}-${warning.label}-${index}`,
    message: warning.message,
    short: warning.short,
  });
  const bySection = (a: LauncherIssue, b: LauncherIssue) =>
    sectionOrder(a.sectionId) - sectionOrder(b.sectionId);
  return [
    ...blockers.map(fromBlocker).sort(bySection),
    // warnings arrive already sorted with the costly ones first, and that
    // ranking matters more than which section they came from: they are all
    // scheduler flags anyway
    ...warnings.map(fromWarning),
  ];
};

/** The same list, indexed by the section that owns each issue. */
export const issuesBySection = (
  issues: Array<LauncherIssue>
): Record<string, Array<LauncherIssue>> => {
  const bySection: Record<string, Array<LauncherIssue>> = {};
  issues.forEach((issue) => {
    (bySection[issue.sectionId] ??= []).push(issue);
  });
  return bySection;
};
