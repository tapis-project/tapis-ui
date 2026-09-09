import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import {
  assembleJob,
  errorsForFields,
  findFlagIndex,
  flattenErrors,
  hasPlaceholder,
  parseFlagValue,
} from '../utils';
import { makeValidate, validateSchedulerOptions } from '../validation';
import { sectionForField } from '../sections/meta';

describe('scheduler flag parsing', () => {
  const options: Array<Jobs.JobArgSpec> = [
    { name: 'profile', arg: '--tapis-profile tacc', include: true },
    { name: 'allocation', arg: '-A <<allocation>>', include: true },
    { name: 'reservation', arg: '--reservation=maintenance', include: false },
  ];

  it('finds an option by any of its flag spellings', () => {
    expect(findFlagIndex(options, ['-A', '--account'])).toBe(1);
    expect(findFlagIndex(options, ['--reservation'])).toBe(2);
    expect(findFlagIndex(options, ['--nope'])).toBe(-1);
  });

  it('does not match a flag that is only a prefix of another arg', () => {
    expect(findFlagIndex([{ arg: '-Alpha beta' }], ['-A'])).toBe(-1);
  });

  it('pulls the value out of space and equals separated flags', () => {
    expect(parseFlagValue('-A MY-PROJECT-1', ['-A'])).toBe('MY-PROJECT-1');
    expect(parseFlagValue('--reservation=maintenance', ['--reservation'])).toBe(
      'maintenance'
    );
    expect(parseFlagValue(undefined, ['-A'])).toBe('');
  });

  it('recognises unresolved placeholders', () => {
    expect(hasPlaceholder('-A <<allocation>>')).toBe(true);
    expect(hasPlaceholder('--reservation <reservation name>')).toBe(true);
    expect(hasPlaceholder('-A {{allocation}}')).toBe(true);
    expect(hasPlaceholder('-A MY-PROJECT-1')).toBe(false);
    expect(hasPlaceholder(undefined)).toBe(false);
  });

  it('only flags placeholders on options that are included', () => {
    const errors = validateSchedulerOptions({
      parameterSet: { schedulerOptions: options },
    });
    expect(errors).toBeDefined();
    expect(errors?.[1]?.arg).toContain('placeholder');
    // index 2 carries a placeholder-free value and index 0 is a real profile
    expect(errors?.[0]).toBeUndefined();
    expect(errors?.[2]).toBeUndefined();
  });

  it('passes an option whose placeholder was replaced', () => {
    expect(
      validateSchedulerOptions({
        parameterSet: {
          schedulerOptions: [{ arg: '-A MY-PROJECT-1', include: true }],
        },
      })
    ).toBeUndefined();
  });
});

describe('assembleJob', () => {
  it('coerces number inputs and drops empty optional fields', () => {
    const job = assembleJob({
      name: 'my-job',
      description: '',
      maxMinutes: '120' as unknown as number,
      nodeCount: '' as unknown as number,
      fileInputs: [],
      isMpi: false,
      cmdPrefix: 'srun',
      mpiCmd: 'ibrun',
      parameterSet: { appArgs: [], envVariables: [{ key: 'A', value: 'B' }] },
    });
    expect(job).toEqual({
      name: 'my-job',
      maxMinutes: 120,
      isMpi: false,
      cmdPrefix: 'srun',
      parameterSet: { envVariables: [{ key: 'A', value: 'B' }] },
    });
  });

  it('leaves FIXED args and env vars to the app definition', () => {
    // the service injects them itself, and rejects a restated one over any
    // difference — including the notes field the seeded rows never carried
    const app = {
      jobAttributes: {
        parameterSet: {
          containerArgs: [
            {
              name: 'NVIDIA Flag',
              arg: '--nv',
              inputMode: Apps.ArgInputModeEnum.Fixed,
              notes: { isHidden: true },
            },
          ],
          envVariables: [
            {
              key: 'PIPELINE',
              value: 'v2',
              inputMode: Apps.KeyValueInputModeEnum.Fixed,
            },
          ],
        },
      },
    } as Apps.TapisApp;

    const job = assembleJob(
      {
        parameterSet: {
          containerArgs: [
            { name: 'NVIDIA Flag', arg: '--nv', include: true },
            { name: 'mine', arg: '--mine', include: true },
          ],
          envVariables: [
            { key: 'PIPELINE', value: 'v2' },
            { key: 'MODE', value: 'fast' },
          ],
        },
      },
      app
    );
    expect(job.parameterSet?.containerArgs).toEqual([
      { name: 'mine', arg: '--mine', include: true },
    ]);
    expect(job.parameterSet?.envVariables).toEqual([
      { key: 'MODE', value: 'fast' },
    ]);
  });

  it('sends description only when it says something, and never inputMode', () => {
    // the submit schema requires minLength 1 on description when present,
    // and apps themselves ship rows with description: ""
    const job = assembleJob({
      parameterSet: {
        appArgs: [{ name: 'in', arg: '--in', description: '', include: true }],
        envVariables: [
          {
            key: 'email',
            value: '',
            description: '',
            inputMode: 'INCLUDE_BY_DEFAULT',
            include: true,
          } as unknown as Jobs.KeyValuePair,
        ],
      },
    });
    expect(job.parameterSet?.appArgs).toEqual([
      { name: 'in', arg: '--in', include: true },
    ]);
    expect(job.parameterSet?.envVariables).toEqual([
      { key: 'email', value: '', include: true },
    ]);
  });

  it('leaves FIXED file inputs to the app definition too', () => {
    // seen live on resubmit: paraview-vista declares its "shell script"
    // input FIXED, the stored job carries it with the RESOLVED targetPath,
    // and the service reads that as an attempted change
    // (JOBS_FIXED_INPUT_ERROR)
    const app = {
      jobAttributes: {
        fileInputs: [
          {
            name: 'shell script',
            inputMode: Apps.FileInputModeEnum.Fixed,
            targetPath: '*',
          },
          {
            name: 'data',
            inputMode: Apps.FileInputModeEnum.Optional,
          },
        ],
        fileInputArrays: [
          {
            name: 'fixed batch',
            inputMode: Apps.FileInputModeEnum.Fixed,
          },
        ],
      },
    } as Apps.TapisApp;

    const job = assembleJob(
      {
        fileInputs: [
          {
            name: 'shell script',
            sourceUrl: 'tapis://sys/apps/run.sh',
            targetPath: 'run.sh',
          },
          { name: 'data', sourceUrl: 'tapis://sys/data/in.csv' },
        ],
        fileInputArrays: [
          { name: 'fixed batch', sourceUrls: ['tapis://sys/a'] },
          { name: 'mine', sourceUrls: ['tapis://sys/b'] },
        ],
      },
      app
    );
    expect(job.fileInputs).toEqual([
      { name: 'data', sourceUrl: 'tapis://sys/data/in.csv' },
    ]);
    expect(job.fileInputArrays).toEqual([
      { name: 'mine', sourceUrls: ['tapis://sys/b'] },
    ]);
  });

  it('sends notes as objects or not at all', () => {
    // the two refusals seen live on resubmit: a stored job round-trips arg
    // notes as strings ("expected type: JSONObject, found: String") and
    // sometimes as an explicit null ("found: Null") — 23 schema violations
    // from one seeded definition
    const job = assembleJob({
      parameterSet: {
        appArgs: [
          {
            name: 'in',
            arg: '--in',
            include: true,
            notes: 'plain prose, not JSON',
          } as unknown as Jobs.JobArgSpec,
          {
            name: 'out',
            arg: '--out',
            include: true,
            notes: '{"isHidden": true}',
          } as unknown as Jobs.JobArgSpec,
        ],
        schedulerOptions: [
          {
            name: 'profile',
            arg: '--tapis-profile x',
            include: true,
            notes: null,
          } as unknown as Jobs.JobArgSpec,
        ],
        envVariables: [
          {
            key: 'MODE',
            value: 'fast',
            notes: '"a JSON string is still not an object"',
          } as unknown as Jobs.KeyValuePair,
          {
            key: 'KEEP',
            value: 'me',
            notes: { real: 'object' },
          } as unknown as Jobs.KeyValuePair,
        ],
      },
    });
    expect(job.parameterSet?.appArgs).toEqual([
      { name: 'in', arg: '--in', include: true },
      { name: 'out', arg: '--out', include: true, notes: { isHidden: true } },
    ]);
    expect(job.parameterSet?.schedulerOptions).toEqual([
      { name: 'profile', arg: '--tapis-profile x', include: true },
    ]);
    expect(job.parameterSet?.envVariables).toEqual([
      { key: 'MODE', value: 'fast' },
      { key: 'KEEP', value: 'me', notes: { real: 'object' } },
    ]);
  });

  it('drops the queue for FORK jobs and the prefix for MPI jobs', () => {
    const fork = assembleJob({
      jobType: Apps.JobTypeEnum.Fork,
      execSystemLogicalQueue: 'normal',
      isMpi: true,
      mpiCmd: 'ibrun',
      cmdPrefix: 'srun',
    });
    expect(fork.execSystemLogicalQueue).toBeUndefined();
    expect(fork.cmdPrefix).toBeUndefined();
    expect(fork.mpiCmd).toBe('ibrun');
  });
});

describe('error attribution', () => {
  it('flattens nested formik errors into dotted paths', () => {
    expect(
      flattenErrors({
        maxMinutes: 'too big',
        parameterSet: { schedulerOptions: [undefined, { arg: 'placeholder' }] },
      })
    ).toEqual([
      { path: 'maxMinutes', message: 'too big' },
      {
        path: 'parameterSet.schedulerOptions.1.arg',
        message: 'placeholder',
      },
    ]);
  });

  it('assigns each error path to the section that owns it', () => {
    expect(sectionForField('maxMinutes')?.id).toBe('execution');
    expect(sectionForField('parameterSet.schedulerOptions.1.arg')?.id).toBe(
      'scheduler'
    );
    expect(sectionForField('fileInputArrays.0.sourceUrls.0')?.id).toBe(
      'inputs'
    );
    expect(sectionForField('parameterSet.appArgs.0.arg')?.id).toBe('args');
  });

  it('matches whole path segments only', () => {
    expect(errorsForFields(['nodeCountExtra'], ['nodeCount'])).toEqual([]);
    expect(errorsForFields(['nodeCount'], ['nodeCount'])).toEqual([
      'nodeCount',
    ]);
  });
});

describe('queue limit validation', () => {
  const system: Systems.TapisSystem = {
    id: 'frontera',
    canRunBatch: true,
    batchDefaultLogicalQueue: 'normal',
    batchLogicalQueues: [
      {
        name: 'normal',
        hpcQueueName: 'normal',
        minMinutes: 1,
        maxMinutes: 120,
        minNodeCount: 1,
        maxNodeCount: 64,
      },
    ],
  } as Systems.TapisSystem;

  const app: Apps.TapisApp = {
    id: 'flexserv',
    version: '1.4.0',
    jobType: Apps.JobTypeEnum.Batch,
    jobAttributes: { execSystemId: 'frontera' },
  } as Apps.TapisApp;

  const validate = makeValidate({ app, systems: [system] });

  it('rejects a maxMinutes above the queue ceiling', () => {
    expect(validate({ maxMinutes: 240 }).maxMinutes).toBe(
      'The maximum number of minutes for a job on this queue is 120'
    );
  });

  it('accepts a maxMinutes inside the queue window', () => {
    expect(validate({ maxMinutes: 120 }).maxMinutes).toBeUndefined();
  });

  it('skips queue ceilings for FORK jobs', () => {
    expect(
      validate({ maxMinutes: 240, jobType: Apps.JobTypeEnum.Fork }).maxMinutes
    ).toBeUndefined();
  });

  it('reports a missing execution system when the app has no default', () => {
    const noSystem = makeValidate({
      app: { id: 'bare' } as Apps.TapisApp,
      systems: [system],
    });
    expect(noSystem({}).execSystemId).toContain(
      'does not have a default execution system'
    );
  });
});
