import { Apps, Jobs } from '@tapis/tapis-typescript';
import { keepFixedRows } from '../fixedRows';
import { assembleJob } from '../utils';

const app = {
  id: 'sleeper',
  version: '1',
  jobAttributes: {
    fileInputs: [
      { name: 'data', inputMode: Apps.FileInputModeEnum.Fixed },
      { name: 'extra', inputMode: Apps.FileInputModeEnum.Optional },
    ],
    parameterSet: {
      appArgs: [
        { name: 'mode', inputMode: Apps.ArgInputModeEnum.Fixed },
        { name: 'steps', inputMode: Apps.ArgInputModeEnum.Required },
      ],
      envVariables: [
        { key: 'LICENSE', inputMode: Apps.KeyValueInputModeEnum.Fixed },
      ],
    },
  },
} as unknown as Apps.TapisApp;

const form = (): Partial<Jobs.ReqSubmitJob> => ({
  name: 'run',
  fileInputs: [
    { name: 'data', sourceUrl: 'tapis://sys/fixed' },
    { name: 'extra', sourceUrl: 'tapis://sys/extra' },
  ],
  parameterSet: {
    appArgs: [
      { name: 'mode', arg: '--fast' },
      { name: 'steps', arg: '10' },
    ],
    envVariables: [
      { key: 'LICENSE', value: 'site' },
      { key: 'OMP_NUM_THREADS', value: '4' },
    ],
  },
});

describe('keepFixedRows', () => {
  it('puts FIXED rows back where they were, around what was edited', () => {
    const current = form();
    // the editor's view: FIXED rows left out by assembleJob
    const edited = assembleJob(current, app) as Partial<Jobs.ReqSubmitJob>;
    expect(edited.fileInputs?.map((i) => i.name)).toEqual(['extra']);
    edited.parameterSet!.appArgs![0].arg = '20';

    const merged = keepFixedRows(edited, current, app);
    expect(merged.fileInputs?.map((i) => i.name)).toEqual(['data', 'extra']);
    expect(merged.parameterSet?.appArgs).toEqual([
      { name: 'mode', arg: '--fast' },
      expect.objectContaining({ name: 'steps', arg: '20' }),
    ]);
    expect(merged.parameterSet?.envVariables?.map((v) => v.key)).toEqual([
      'LICENSE',
      'OMP_NUM_THREADS',
    ]);
  });

  it('keeps everything else the edit changed', () => {
    const edited = { ...assembleJob(form(), app), name: 'renamed' };
    expect(keepFixedRows(edited, form(), app).name).toBe('renamed');
  });

  it('is the edit itself when there is no app to say what is FIXED', () => {
    const edited = { name: 'x' };
    expect(keepFixedRows(edited, form(), undefined)).toBe(edited);
  });
});
