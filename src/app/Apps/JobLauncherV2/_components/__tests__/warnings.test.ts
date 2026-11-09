/**
 * The set-but-not-included flag.
 *
 * This is the mistake worth writing tests for: the value is on screen, so the
 * form looks right, and the job quietly runs somewhere else. What the reader
 * needs is not "it will not be sent" — they know what they typed — but what
 * the scheduler does instead.
 */
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { computeWarnings } from '../warnings';

const app = { id: 'app', version: '1' } as Apps.TapisApp;

const withOptions = (
  options: Array<Jobs.JobArgSpec>
): Partial<Jobs.ReqSubmitJob> => ({
  parameterSet: { schedulerOptions: options },
});

describe('computeWarnings', () => {
  it('says nothing when every set flag is included', () => {
    expect(
      computeWarnings({
        values: withOptions([{ arg: '-A TRA24006', include: true }]),
        app,
      })
    ).toEqual([]);
  });

  it('says an unsent reservation will not be sent, and stops there', () => {
    const [warning] = computeWarnings({
      values: withOptions([
        { arg: '--reservation Gateways-TEST', include: false },
      ]),
      app,
    });
    expect(warning.message).toContain('Gateways-TEST');
    // one sentence: the paragraph of consequences that used to follow it
    // was more than anyone read
    expect(warning.message.endsWith('so --reservation will not be sent.')).toBe(
      true
    );
    expect(warning.message).not.toMatch(/Instead|ordinary queue/);
    expect(warning.costly).toBe(true);
  });

  it('ranks an unsent allocation as costly, in the same one sentence', () => {
    const [warning] = computeWarnings({
      values: withOptions([{ arg: '-A TRA24006', include: false }]),
      app,
    });
    expect(warning.message.endsWith('so -A will not be sent.')).toBe(true);
    expect(warning.message).not.toMatch(/Instead|default project/);
    expect(warning.costly).toBe(true);
  });

  it('carries the include path, so the fix is one press from the review', () => {
    const [warning] = computeWarnings({
      values: withOptions([
        { arg: '--tapis-profile x', include: true },
        { arg: '-A TRA24006', include: false },
      ]),
      app,
    });
    expect(warning.includePath).toBe('parameterSet.schedulerOptions.1.include');
  });

  it('puts the costly flags first — a job name is not a queue slot', () => {
    const warnings = computeWarnings({
      values: withOptions([
        { arg: '-J my-run', include: false },
        { arg: '--reservation Gateways-TEST', include: false },
      ]),
      app,
    });
    expect(warnings.map((warning) => warning.label)).toEqual([
      '--reservation',
      '-J',
    ]);
    expect(warnings[1].costly).toBe(false);
  });
});

describe('a flag still holding a placeholder', () => {
  it('offers the second way out at review, not just in the row', () => {
    // the message has always said "replace it, or uncheck Include"; the
    // include path is what lets the review board make the second half a press
    const { includePathFor } = jest.requireActual('../blockers');
    expect(includePathFor('parameterSet.schedulerOptions.2.arg')).toBe(
      'parameterSet.schedulerOptions.2.include'
    );
    expect(
      includePathFor('parameterSet.schedulerOptions.2.name')
    ).toBeUndefined();
    expect(includePathFor('execSystemId')).toBeUndefined();
  });
});
