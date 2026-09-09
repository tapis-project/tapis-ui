/**
 * @vitest-environment jsdom
 *
 * The file listing hook's two contracts, both of which were broken and
 * both of which are invisible from the component that calls it:
 *
 *   1. it must not refetch in the background — the listing used to re-run
 *      on every window focus, so alt-tabbing back to a system you hold no
 *      credentials for re-logged the refusal, forever;
 *   2. a caller's `enabled: false` must be honoured — it used to be
 *      overwritten by a hardcoded `!!accessToken` sitting after the
 *      options spread, so the systems page's "don't knock on a deleted
 *      system" guard did nothing at all.
 */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider, focusManager } from 'react-query';
import Cookies from 'js-cookie';
import TapisContext from '../context/TapisContext';
import useList from './useList';
import useInvalidateFiles from './useInvalidateFiles';

// vi.hoisted, because vi.mock is lifted above every const in the file —
// a plain top-level spy is still in its temporal dead zone when the
// factory runs
const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

// partial: the hooks barrel reaches every service's API, so replacing the
// whole module leaves pods (and others) undefined at import time
vi.mock('@tapis/tapisui-api', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Files: { ...(actual.Files as object), list: listMock },
  };
});

/** A structurally valid JWT: useTapisConfig decodes the token and clears
 *  one it cannot read, so a placeholder string is no session at all. */
const jwt = (payload: Record<string, unknown>): string => {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64({ typ: 'JWT', alg: 'RS256' })}.${b64(payload)}.sig`;
};

const seedSession = () =>
  Cookies.set(
    'tapis-token',
    JSON.stringify({
      access_token: jwt({
        exp: Math.floor(Date.now() / 1000) + 4 * 3600,
        tapis_tenant_id: 'dev',
      }),
      expires_in: 14400,
      expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    })
  );

let client: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>
    <TapisContext.Provider
      value={{ basePath: 'https://tacc.develop.tapis.io', mlHubBasePath: '' }}
    >
      {children}
    </TapisContext.Provider>
  </QueryClientProvider>
);

beforeEach(() => {
  listMock.mockReset();
  listMock.mockResolvedValue({ result: [{ name: 'a.txt' }] });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  seedSession();
});

afterEach(() => {
  Cookies.remove('tapis-token');
  client.clear();
});

describe('background refetching', () => {
  it('does not re-request when the window is focused again', async () => {
    renderHook(() => useList({ systemId: 'frontera', path: '/' }), {
      wrapper,
    });
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    // the alt-tab that used to re-log SSH_POOL_MISSING_CREDENTIALS on
    // every return to the tab
    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it('still refreshes when something actually changed the directory', async () => {
    const { result } = renderHook(
      () => ({
        list: useList({ systemId: 'frontera', path: '/' }),
        invalidate: useInvalidateFiles(),
      }),
      { wrapper }
    );
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    // what an upload / mkdir / delete now does instead of faking focus.
    // Invalidation refetches an on-screen query regardless of the
    // refetchOn* flags — which is exactly why it is the right signal.
    await act(() => result.current.invalidate('frontera'));
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
  });

  it('leaves other systems alone when one system is invalidated', async () => {
    const { result } = renderHook(
      () => ({
        frontera: useList({ systemId: 'frontera', path: '/' }),
        vista: useList({ systemId: 'vista', path: '/' }),
        invalidate: useInvalidateFiles(),
      }),
      { wrapper }
    );
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));

    await act(() => result.current.invalidate('frontera'));
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(3));

    // three, not four: vista's listing was not disturbed
    expect(
      listMock.mock.calls.filter(
        (call) => (call[0] as any).systemId === 'vista'
      )
    ).toHaveLength(1);
  });
});

describe("the caller's enabled", () => {
  it('is a veto, not a suggestion', async () => {
    // the systems page's guard: a deleted system must not be knocked on
    renderHook(
      () => useList({ systemId: 'frontera', path: '/' }, { enabled: false }),
      { wrapper }
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(listMock).not.toHaveBeenCalled();
  });

  it('still requires a token when the caller says enabled', async () => {
    Cookies.remove('tapis-token');
    renderHook(
      () => useList({ systemId: 'frontera', path: '/' }, { enabled: true }),
      { wrapper }
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(listMock).not.toHaveBeenCalled();
  });

  it('runs when the caller is silent and a token is held', async () => {
    renderHook(() => useList({ systemId: 'frontera', path: '/' }), {
      wrapper,
    });
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));
  });
});
