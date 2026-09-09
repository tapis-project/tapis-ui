import { renderHook, act } from '@testing-library/react';
import { Systems as SystemsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import useCredentialProbe, {
  isHostDown,
  isNoCredential,
} from './useCredentialProbe';

jest.mock('@tapis/tapisui-hooks');

let lookup: { refetch: jest.Mock; remove: jest.Mock; [k: string]: unknown };
let check: { refetch: jest.Mock; remove: jest.Mock; [k: string]: unknown };

beforeEach(() => {
  lookup = {
    refetch: jest.fn().mockResolvedValue({}),
    remove: jest.fn(),
    isFetching: false,
  };
  check = {
    refetch: jest.fn().mockResolvedValue({}),
    remove: jest.fn(),
    isFetching: false,
  };
  (SystemsHooks.useGetCredential as jest.Mock).mockReturnValue(lookup);
  (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue(check);
  (useTapisConfig as jest.Mock).mockReturnValue({
    claims: { 'tapis/username': 'jdoe' },
  });
});

const system = (over: object = {}) =>
  ({
    id: 'frontera',
    systemType: 'LINUX',
    owner: 'jdoe',
    effectiveUserId: 'hostacct',
    ...over,
  } as never);

const probe = (props: {
  accessError?: Error | null;
  authenticated?: boolean;
  sys?: object;
}) =>
  renderHook(
    (p: typeof props) =>
      useCredentialProbe({
        system: system(p.sys),
        accessError: p.accessError,
        authenticated: p.authenticated ?? false,
      }),
    { initialProps: props }
  );

describe('the refusal classifiers', () => {
  it('splits no-credential from a machine that is down', () => {
    expect(isNoCredential('CRED_NOT_FOUND for jdoe')).toBe(true);
    expect(isNoCredential('unknown host x')).toBe(false);
    expect(isHostDown('unknown host x')).toBe(true);
  });
});

describe('who the credential belongs to', () => {
  it('is the host account on a static system, the caller on a dynamic one', () => {
    expect(probe({}).result.current.credUserName).toBe('hostacct');
    expect(
      probe({ sys: { isDynamicEffectiveUser: true } }).result.current
        .credUserName
    ).toBe('jdoe');
  });

  it('is dialable by the owner of a static system only', () => {
    expect(probe({}).result.current.canDial).toBe(true);
    expect(probe({ sys: { owner: 'other' } }).result.current.canDial).toBe(
      false
    );
    expect(
      probe({ sys: { systemType: 'GLOBUS' } }).result.current.canDial
    ).toBe(false);
  });
});

describe('the lookup that follows a refusal', () => {
  it('runs once per distinct refusal, never for a host that is down', () => {
    const err = new Error('permission denied');
    const { rerender } = probe({ accessError: err });
    expect(lookup.refetch).toHaveBeenCalledTimes(1);
    rerender({ accessError: new Error('permission denied') });
    expect(lookup.refetch).toHaveBeenCalledTimes(1);
    rerender({ accessError: new Error('connection refused') });
    expect(lookup.refetch).toHaveBeenCalledTimes(1);
  });

  it('runs again for the same refusal after the credential is forgotten', () => {
    const err = new Error('permission denied');
    const { result } = probe({ accessError: err });
    expect(lookup.refetch).toHaveBeenCalledTimes(1);

    act(() => result.current.forget());

    expect(lookup.remove).toHaveBeenCalled();
    expect(check.remove).toHaveBeenCalled();
    expect(lookup.refetch).toHaveBeenCalledTimes(2);
  });

  it('runs again for the same refusal after a working probe in between', () => {
    const { rerender } = probe({ accessError: new Error('permission denied') });
    rerender({ authenticated: true, accessError: null });
    rerender({ accessError: new Error('permission denied') });
    expect(lookup.refetch).toHaveBeenCalledTimes(2);
  });
});

describe('the two-step check', () => {
  it('stops after a positive none-stored answer', async () => {
    lookup.refetch.mockResolvedValue({
      error: new Error('CRED_NOT_FOUND'),
    });
    const { result } = probe({});
    await act(async () => {
      await result.current.runCredCheck();
    });
    expect(check.refetch).not.toHaveBeenCalled();
  });

  it('dials after any other lookup answer', async () => {
    lookup.refetch.mockResolvedValue({ error: new Error('SYSLIB_UNAUTH') });
    const { result } = probe({});
    await act(async () => {
      await result.current.runCredCheck();
    });
    expect(check.refetch).toHaveBeenCalledTimes(1);
  });
});
