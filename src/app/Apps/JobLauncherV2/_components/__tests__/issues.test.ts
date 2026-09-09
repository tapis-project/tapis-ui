import { firstSentence } from '../blockers';
import { issuesBySection, mergeIssues } from '../issues';
import type { Blocker } from '../blockers';
import type { Warning } from '../warnings';

const blocker = (over: Partial<Blocker> = {}): Blocker => ({
  sectionId: 'scheduler',
  label: 'parameterSet.schedulerOptions.0.arg',
  message: 'This value is still a placeholder. Replace it, or uncheck Include.',
  short: 'This value is still a placeholder',
  ...over,
});

const warning = (over: Partial<Warning> = {}): Warning => {
  const label = over.label ?? '--reservation';
  return {
    sectionId: 'scheduler',
    label,
    message: `${label} is set but not included, so it goes away.`,
    short: `${label} set but not included`,
    costly: true,
    ...over,
  };
};

describe('firstSentence', () => {
  it('keeps the clause that names the problem and drops the instruction', () => {
    expect(
      firstSentence(
        'This value is still a placeholder. Replace it with a real value, or uncheck Include.'
      )
    ).toBe('This value is still a placeholder');
  });

  it('leaves a message that is already one clause alone', () => {
    expect(firstSentence('A job name is required')).toBe(
      'A job name is required'
    );
  });

  // a version numbers, a decimal or a path segment is not a sentence end, and
  // truncating there would leave the nav saying "The app flexserv v0"
  it('does not break on a full stop with no space after it', () => {
    expect(firstSentence('The app flexserv v0.0.1 has no default queue')).toBe(
      'The app flexserv v0.0.1 has no default queue'
    );
  });
});

describe('mergeIssues', () => {
  it('puts every blocker ahead of every warning', () => {
    const merged = mergeIssues(
      [blocker({ sectionId: 'archive' })],
      [warning()]
    );
    expect(merged.map((issue) => issue.kind)).toEqual(['blocker', 'warning']);
  });

  it('walks blockers in the order the sections are walked in', () => {
    // handed over in the wrong order on purpose: flattenErrors follows the
    // shape of the error object, not the shape of the panel
    const merged = mergeIssues(
      [
        blocker({ sectionId: 'archive', label: 'a' }),
        blocker({ sectionId: 'basics', label: 'b' }),
        blocker({ sectionId: 'inputs', label: 'c' }),
      ],
      []
    );
    expect(merged.map((issue) => issue.sectionId)).toEqual([
      'basics',
      'inputs',
      'archive',
    ]);
  });

  it('leaves warnings in the order they arrive, so the costly one stays first', () => {
    const merged = mergeIssues(
      [],
      [
        warning({ label: '--reservation', costly: true }),
        warning({ label: '--mail-type', costly: false }),
      ]
    );
    expect(merged.map((issue) => issue.short)).toEqual([
      '--reservation set but not included',
      '--mail-type set but not included',
    ]);
  });

  it('says what is wrong without offering to do it', () => {
    // a one-press fix on the board got pressed out of fidget more than
    // intent, even where there is a checkbox it could have pressed
    const merged = mergeIssues(
      [blocker({ includePath: 'parameterSet.schedulerOptions.0.include' })],
      [warning({ includePath: 'parameterSet.schedulerOptions.1.include' })]
    );
    merged.forEach((issue) => expect(issue).not.toHaveProperty('action'));
  });

  it('gives every issue a key of its own, including two on one field', () => {
    const merged = mergeIssues([blocker(), blocker()], [warning()]);
    expect(new Set(merged.map((issue) => issue.key)).size).toBe(3);
  });
});

describe('issuesBySection', () => {
  it('indexes by the section that owns each issue', () => {
    const merged = mergeIssues(
      [blocker({ sectionId: 'basics' }), blocker({ sectionId: 'scheduler' })],
      [warning()]
    );
    const bySection = issuesBySection(merged);
    expect(bySection.basics).toHaveLength(1);
    expect(bySection.scheduler).toHaveLength(2);
    expect(bySection.archive).toBeUndefined();
  });

  it('keeps blockers ahead of warnings inside a section', () => {
    const bySection = issuesBySection(mergeIssues([blocker()], [warning()]));
    expect(bySection.scheduler.map((issue) => issue.kind)).toEqual([
      'blocker',
      'warning',
    ]);
  });
});
