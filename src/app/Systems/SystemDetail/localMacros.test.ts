import { resolveLocalMacros, splitPerJobTail } from './SystemSummaryCard';

const macros = {
  apiUserId: 'jdoe',
  tenant: 'tacc',
  owner: 'pi-owner',
  JobOwner: 'jdoe',
  JobTenant: 'tacc',
  EffectiveUserId: 'cg-host',
  RootDir: '/home1',
};

describe("local macro resolution (the docs' table, minus per-job)", () => {
  it('substitutes everything knowable without a job', () => {
    expect(
      resolveLocalMacros('/projects/${tenant}/${owner}/${JobOwner}', macros)
    ).toBe('/projects/tacc/pi-owner/jdoe');
    expect(
      resolveLocalMacros('${RootDir}/work/${EffectiveUserId}', macros)
    ).toBe('/home1/work/cg-host');
  });

  it('leaves the per-job pair strictly alone', () => {
    expect(
      resolveLocalMacros('/scratch/${JobOwner}/${JobUUID}/${JobName}', macros)
    ).toBe('/scratch/jdoe/${JobUUID}/${JobName}');
  });

  it('leaves unknown macros untouched rather than guessing', () => {
    expect(resolveLocalMacros('/x/${SomethingElse}/y', macros)).toBe(
      '/x/${SomethingElse}/y'
    );
  });

  it('feeds the per-job split exactly what it needs', () => {
    const localized = resolveLocalMacros(
      '/scratch/02222/${JobOwner}/tapis/${JobUUID}',
      macros
    );
    expect(splitPerJobTail(localized)).toEqual({
      browsable: '/scratch/02222/jdoe/tapis',
      perJob: '/${JobUUID}',
    });
  });
});
