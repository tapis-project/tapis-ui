import { Apps, Jobs } from '@tapis/tapis-typescript';
import {
  computeBlockers,
  flagLabelsByIndex,
  navShort,
  schedulerIndexOf,
} from '../blockers';

const app = {
  id: 'flexserv',
  version: '1.4.0',
  jobType: Apps.JobTypeEnum.Batch,
  jobAttributes: { execSystemId: 'frontera' },
} as Apps.TapisApp;

const values = (
  options: Array<Jobs.JobArgSpec>
): Partial<Jobs.ReqSubmitJob> => ({
  name: 'a-job',
  parameterSet: { schedulerOptions: options },
});

const blockersFor = (options: Array<Jobs.JobArgSpec>, errors: object = {}) =>
  computeBlockers({
    values: values(options),
    errors,
    app,
    systems: [],
  });

// the fixture app is deliberately incomplete elsewhere (no file inputs, no
// exec system on the job), so these cases ask only about the scheduler
const schedulerBlockers = (
  options: Array<Jobs.JobArgSpec>,
  errors: object = {}
) => blockersFor(options, errors).filter((b) => b.sectionId === 'scheduler');

describe('naming the scheduler row that is wrong', () => {
  it('maps each row to the flag it holds', () => {
    expect(
      flagLabelsByIndex([
        { arg: '--reservation res1' },
        { arg: '-A MY-PROJECT' },
        { arg: '--exclusive' },
      ])
    ).toEqual({ 0: 'Reservation name', 1: 'Allocation (project)' });
  });

  it('reads the index out of a formik path, and only the right shape', () => {
    expect(schedulerIndexOf('parameterSet.schedulerOptions.3.arg')).toBe(3);
    expect(
      schedulerIndexOf('parameterSet.schedulerOptions.3.name')
    ).toBeUndefined();
    expect(schedulerIndexOf('execSystemId')).toBeUndefined();
  });

  it('says which flag is still a placeholder, not "this value"', () => {
    const [blocker] = blockersFor(
      [{ arg: '-A <<allocation>>', include: true }],
      {
        parameterSet: {
          schedulerOptions: [
            {
              arg: 'This value is still a placeholder. Replace it with a real value, or uncheck Include.',
            },
          ],
        },
      }
    );
    expect(blocker.message).toBe(
      'Allocation (project) is still a placeholder. Replace it with a real value, or uncheck Include.'
    );
    expect(blocker.short).toBe('Allocation (project) is still a placeholder');
  });

  it('leaves a message it cannot attribute exactly as it was', () => {
    const [blocker] = blockersFor([{ arg: '--exclusive', include: true }], {
      parameterSet: {
        schedulerOptions: [{ arg: 'This value is still a placeholder.' }],
      },
    });
    expect(blocker.message).toBe('This value is still a placeholder.');
  });
});

describe('a flag included with nothing after it', () => {
  // the Scheduler row cannot produce this: emptying the field unchecks
  // Include and the checkbox is disabled while it is blank. Pasted JSON can,
  // and so can an app that declares one, and assembleJob would send a bare
  // `-A` that the scheduler refuses
  it('is blocked, and offers the checkbox that settles it', () => {
    const [blocker] = schedulerBlockers([{ arg: '-A', include: true }]);
    expect(blocker.message).toMatch(
      /Allocation \(project\) is included but has no value/
    );
    expect(blocker.short).toBe('Allocation (project) is included but empty');
    expect(blocker.includePath).toBe('parameterSet.schedulerOptions.0.include');
  });

  it('is silent when the flag is not included', () => {
    expect(schedulerBlockers([{ arg: '-A', include: false }])).toEqual([]);
  });

  it('is silent when the flag has a value', () => {
    expect(
      schedulerBlockers([{ arg: '-A MY-PROJECT', include: true }])
    ).toEqual([]);
  });

  // --exclusive, --nice and friends are meant to be bare
  it('never fires on a flag we do not give a field to', () => {
    expect(schedulerBlockers([{ arg: '--exclusive', include: true }])).toEqual(
      []
    );
  });
});

describe('navShort', () => {
  it('trades a long validation sentence for the fact', () => {
    expect(
      navShort(
        'This app does not have a default execution system. You must specify one for this job'
      )
    ).toBe('An execution system is required');
  });

  it('falls back to the first clause of anything it does not know', () => {
    expect(navShort('Something new went wrong. Go and fix it.')).toBe(
      'Something new went wrong'
    );
  });
});
