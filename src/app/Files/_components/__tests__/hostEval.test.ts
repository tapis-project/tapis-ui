import { Systems } from '@tapis/tapis-typescript';
import { canHostEval, hostEvalBlocker } from '../hostEval';

const linux = (extra: Partial<Systems.TapisSystem> = {}): Systems.TapisSystem =>
  ({
    id: 'frontera',
    systemType: Systems.SystemTypeEnum.Linux,
    isDynamicEffectiveUser: true,
    rootDir: '/',
    ...extra,
  } as Systems.TapisSystem);

describe('canHostEval', () => {
  it('says yes to a Linux system with a per-user effective id at /', () => {
    expect(canHostEval(linux())).toBe(true);
    // no rootDir at all is the same as being rooted at /
    expect(canHostEval(linux({ rootDir: undefined }))).toBe(true);
  });

  it('says no to a system that runs as one fixed user', () => {
    // there is no personal $HOME to ask about
    expect(canHostEval(linux({ isDynamicEffectiveUser: false }))).toBe(false);
  });

  it('says no to a system rooted below /', () => {
    // a resolved path would fall outside the root, and Tapis will not list it
    expect(canHostEval(linux({ rootDir: '/scratch/project' }))).toBe(false);
  });

  it('says no to anything that is not a Linux host', () => {
    expect(canHostEval(linux({ systemType: Systems.SystemTypeEnum.S3 }))).toBe(
      false
    );
    expect(canHostEval(undefined)).toBe(false);
  });
});

describe('hostEvalBlocker', () => {
  it('says nothing when there is nothing in the way', () => {
    expect(hostEvalBlocker(linux())).toBeUndefined();
  });

  it('names the reason, so a greyed button is not a mystery', () => {
    expect(hostEvalBlocker(undefined)).toMatch(/reading the system/);
    expect(
      hostEvalBlocker(linux({ systemType: Systems.SystemTypeEnum.S3 }))
    ).toMatch(/Linux/);
    expect(hostEvalBlocker(linux({ isDynamicEffectiveUser: false }))).toMatch(
      /one fixed user/
    );
    expect(hostEvalBlocker(linux({ rootDir: '/scratch' }))).toMatch(
      /rooted at \/scratch/
    );
  });

  it('agrees with canHostEval, which is the point of both', () => {
    const systems = [
      linux(),
      linux({ isDynamicEffectiveUser: false }),
      linux({ rootDir: '/scratch' }),
      undefined,
    ];
    systems.forEach((system) => {
      expect(canHostEval(system)).toBe(hostEvalBlocker(system) === undefined);
    });
  });
});
