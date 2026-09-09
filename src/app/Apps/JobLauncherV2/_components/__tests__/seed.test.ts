import { Jobs } from '@tapis/tapis-typescript';
import { jobToSeed } from '../seed';

const storedJob = (over: object = {}): Jobs.Job =>
  ({
    uuid: 'u-1',
    name: 'sweep-42',
    description: 'the good run',
    appId: 'flexserv',
    appVersion: '1.4.0',
    jobType: 'BATCH',
    execSystemId: 'frontera',
    execSystemLogicalQueue: 'normal',
    // resolved per-run: these contain the OLD job's uuid
    execSystemExecDir: '/scratch/u/jobs/u-1/exec',
    execSystemInputDir: '/scratch/u/jobs/u-1/input',
    execSystemOutputDir: '/scratch/u/jobs/u-1/output',
    archiveSystemId: 'cloud.data',
    archiveSystemDir: '/archive/jobs/u-1',
    archiveOnAppError: false,
    dynamicExecSystem: true,
    nodeCount: 2,
    coresPerNode: 4,
    memoryMB: 100,
    maxMinutes: 30,
    tags: ['sweep'],
    parameterSet: JSON.stringify({
      appArgs: [{ name: 'arg1', arg: '--alpha 3' }],
      schedulerOptions: [{ name: 'allocation', arg: '-A MY-PROJECT' }],
      envVariables: [
        { key: 'FOO', value: 'bar' },
        { key: '_tapisJobUUID', value: 'u-1' },
      ],
    }),
    fileInputs: JSON.stringify([
      {
        name: 'data',
        sourceUrl: 'tapis://cloud.data/in.csv',
        targetPath: 'in.csv',
        description: '',
        srcSharedAppCtx: 'server-bookkeeping',
        dstSharedAppCtx: 'server-bookkeeping',
      },
    ]),
    ...over,
  } as unknown as Jobs.Job);

describe('jobToSeed', () => {
  it('carries the identity and resources, never the resolved directories', () => {
    const seed = jobToSeed(storedJob());
    expect(seed.name).toBe('sweep-42');
    expect(seed.appId).toBe('flexserv');
    expect(seed.execSystemId).toBe('frontera');
    expect(seed.execSystemLogicalQueue).toBe('normal');
    expect(seed.nodeCount).toBe(2);
    expect(seed.maxMinutes).toBe(30);
    expect(seed.archiveSystemId).toBe('cloud.data');
    // false is a real answer, not an empty one
    expect(seed.archiveOnAppError).toBe(false);
    // the old run's folders must not become the new run's folders
    expect(seed).not.toHaveProperty('execSystemExecDir');
    expect(seed).not.toHaveProperty('execSystemInputDir');
    expect(seed).not.toHaveProperty('execSystemOutputDir');
    expect(seed).not.toHaveProperty('archiveSystemDir');
    expect(seed).not.toHaveProperty('dynamicExecSystem');
    expect(seed).not.toHaveProperty('uuid');
  });

  it('keeps the user env and drops the service injections', () => {
    const seed = jobToSeed(storedJob());
    expect(seed.parameterSet?.envVariables).toEqual([
      { key: 'FOO', value: 'bar' },
    ]);
    expect(seed.parameterSet?.appArgs?.[0]?.arg).toBe('--alpha 3');
    expect(seed.parameterSet?.schedulerOptions?.[0]?.arg).toBe('-A MY-PROJECT');
  });

  it('curates file inputs down to what a person asked for', () => {
    const seed = jobToSeed(storedJob());
    expect(seed.fileInputs).toEqual([
      {
        name: 'data',
        sourceUrl: 'tapis://cloud.data/in.csv',
        targetPath: 'in.csv',
        // the empty description and both SharedAppCtx fields are gone
      },
    ]);
  });

  it('sheds the stored nulls the validation would refuse', () => {
    // seen live: stored rows carry description: null and include: null,
    // and the seeded form blocked on eight "must be a boolean, but the
    // final value was: null" errors before anything could be submitted
    const seed = jobToSeed(
      storedJob({
        parameterSet: JSON.stringify({
          appArgs: [
            { name: 'a1', arg: '--a', description: null, include: null },
          ],
          containerArgs: [
            { name: 'c1', arg: '--nv', description: null, include: null },
            // false is a real answer and must survive the shed
            { name: 'c2', arg: '--x', description: 'kept', include: false },
          ],
          schedulerOptions: [
            { name: 's1', arg: '-A P', include: null, notes: null },
          ],
          envVariables: [
            { key: 'EMPTY', value: null, description: null, include: null },
          ],
        }),
      })
    );
    expect(seed.parameterSet?.appArgs).toEqual([{ name: 'a1', arg: '--a' }]);
    expect(seed.parameterSet?.containerArgs).toEqual([
      { name: 'c1', arg: '--nv' },
      { name: 'c2', arg: '--x', description: 'kept', include: false },
    ]);
    expect(seed.parameterSet?.schedulerOptions).toEqual([
      { name: 's1', arg: '-A P' },
    ]);
    // an env var's value is coerced to '', never dropped — set-to-empty
    // is a real thing to say about a variable
    expect(seed.parameterSet?.envVariables).toEqual([
      { key: 'EMPTY', value: '' },
    ]);
  });

  it('implies MPI from the stored command', () => {
    const plain = jobToSeed(storedJob());
    expect(plain).not.toHaveProperty('isMpi');
    const mpi = jobToSeed(storedJob({ mpiCmd: 'ibrun' }));
    expect(mpi.isMpi).toBe(true);
    expect(mpi.mpiCmd).toBe('ibrun');
  });

  it('still seeds the scalars when the stored JSON does not parse', () => {
    const seed = jobToSeed(
      storedJob({ parameterSet: 'not json', fileInputs: '{broken' })
    );
    expect(seed.name).toBe('sweep-42');
    expect(seed.nodeCount).toBe(2);
    expect(seed).not.toHaveProperty('parameterSet');
    expect(seed).not.toHaveProperty('fileInputs');
  });
});
