/**
 * @vitest-environment jsdom
 *
 * The list hooks turn automatic refetches off, so a write only reaches the
 * nav and the landing pages through invalidation.
 */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import Cookies from 'js-cookie';
import TapisContext from '../context/TapisContext';
import useCreateApp from '../apps/useCreateApp';
import useCreateSystem from '../systems/useCreateSystem';
import useChangeOwner from '../systems/useChangeOwner';
import useCheckCredential from '../systems/useCheckCredential';
import useGetCredential from '../systems/useGetCredential';

const { createAppMock, createSystemMock, checkMock, getMock } = vi.hoisted(
  () => ({
    createAppMock: vi.fn(),
    createSystemMock: vi.fn(),
    checkMock: vi.fn(),
    getMock: vi.fn(),
  })
);

vi.mock('@tapis/tapisui-api', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Apps: { ...(actual.Apps as object), createApp: createAppMock },
    Systems: {
      ...(actual.Systems as object),
      createSystem: createSystemMock,
      checkUserCredential: checkMock,
      getUserCredential: getMock,
    },
  };
});

const jwt = (payload: Record<string, unknown>): string => {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64({ typ: 'JWT', alg: 'RS256' })}.${b64(payload)}.sig`;
};

let client: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>
    <TapisContext.Provider
      value={{ basePath: 'https://tenant.tapis.io', mlHubBasePath: '' }}
    >
      {children}
    </TapisContext.Provider>
  </QueryClientProvider>
);

beforeEach(() => {
  vi.resetAllMocks();
  createAppMock.mockResolvedValue({ status: 'success' });
  createSystemMock.mockResolvedValue({ status: 'success' });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  Cookies.set(
    'tapis-token',
    JSON.stringify({
      access_token: jwt({
        exp: Math.floor(Date.now() / 1000) + 4 * 3600,
        tapis_tenant_id: 'dev',
        'tapis/username': 'jdoe',
      }),
      expires_in: 14400,
      expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    })
  );
});

afterEach(() => {
  Cookies.remove('tapis-token');
  client.clear();
});

const seed = (...keys: string[]) =>
  keys.forEach((key) => client.setQueryData([key, {}], { result: [] }));

const invalidated = (key: string) =>
  client.getQueryState([key, {}])?.isInvalidated;

describe('list refresh after a write', () => {
  it('useCreateApp refreshes the apps list and nav window', async () => {
    seed('apps/list', 'apps/listWindow');
    const { result } = renderHook(() => useCreateApp(), { wrapper });
    act(() => result.current.createApp({} as never));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidated('apps/list')).toBe(true);
    expect(invalidated('apps/listWindow')).toBe(true);
  });

  it('useCreateSystem refreshes the systems list and nav window', async () => {
    seed('systems/list', 'systems/listWindow');
    const { result } = renderHook(() => useCreateSystem(), { wrapper });
    await act(async () => {
      await result.current.createSystem({} as never);
    });
    expect(invalidated('systems/list')).toBe(true);
    expect(invalidated('systems/listWindow')).toBe(true);
  });

  it('useChangeOwner refreshes every read that shows the owner', () => {
    seed('systems/details', 'systems/list', 'systems/listWindow');
    const { result } = renderHook(() => useChangeOwner(), { wrapper });
    act(() => result.current.invalidate());
    expect(invalidated('systems/details')).toBe(true);
    expect(invalidated('systems/list')).toBe(true);
    expect(invalidated('systems/listWindow')).toBe(true);
  });
});

describe('credential reads', () => {
  it('stay idle on mount unless a caller enables them', () => {
    renderHook(() => useCheckCredential({ systemId: 's' }), { wrapper });
    renderHook(() => useGetCredential({ systemId: 's' }), { wrapper });
    expect(checkMock).not.toHaveBeenCalled();
    expect(getMock).not.toHaveBeenCalled();
  });
});
