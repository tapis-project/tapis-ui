import { patchableSeed, diffPatch } from './UpdateSystemModalV2';
import { Systems } from '@tapis/tapis-typescript';

const system = (over: object = {}): Systems.TapisSystem =>
  ({
    id: 'stampede3',
    uuid: 'u-1',
    owner: 'pi-owner',
    created: '2024-01-01',
    host: 'stampede3.tacc.utexas.edu',
    effectiveUserId: 'cgarcia', // as READS resolve it for the caller
    isDynamicEffectiveUser: true,
    defaultAuthnMethod: 'PKI_KEYS',
    canExec: true,
    jobMaxJobs: 10,
    tags: ['hpc'],
    ...over,
  } as never);

describe('the update patch model', () => {
  it('restores the ${apiUserId} template a read resolved away', () => {
    // the v1 corruption: reads resolve effectiveUserId to the caller, and
    // patching that resolution back pinned everyone to one account
    const seed = patchableSeed(system());
    expect(seed.effectiveUserId).toBe('${apiUserId}');
  });

  it('keeps a static account literal — that one IS the stored truth', () => {
    const seed = patchableSeed(
      system({ isDynamicEffectiveUser: false, effectiveUserId: 'harvest' })
    );
    expect(seed.effectiveUserId).toBe('harvest');
  });

  it('never seeds the unpatchable — nothing derived can be clobbered', () => {
    const seed = patchableSeed(system()) as Record<string, unknown>;
    expect(seed.uuid).toBeUndefined();
    expect(seed.owner).toBeUndefined();
    expect(seed.created).toBeUndefined();
    expect(seed.canExec).toBeUndefined();
    expect(seed.id).toBeUndefined();
  });

  it('sends only what changed — a patch worth the name', () => {
    const seed = patchableSeed(system());
    const edited = { ...seed, jobMaxJobs: 25 };
    expect(diffPatch(seed, edited)).toEqual({ jobMaxJobs: 25 });
    // untouched editor → empty patch → the button refuses upstream
    expect(diffPatch(seed, { ...seed })).toEqual({});
  });
});
