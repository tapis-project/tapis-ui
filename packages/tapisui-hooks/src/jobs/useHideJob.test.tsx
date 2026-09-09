/**
 * @vitest-environment jsdom
 *
 * Hiding a job is a LISTING act — the whole point is that the run stops
 * appearing — so the one thing the hook has to do beyond the call is tell
 * the listings. It did not, and because the list hooks turn every automatic
 * refetch off (see utils/cachePolicy), nothing else was ever going to: the
 * job you just hid sat in the nav and on the dashboard until a hard reload,
 * which is exactly what "the hide button does nothing" looked like.
 *
 * Its own cache policy is why this is testable only here. From the cog there
 * is nothing to see — the request succeeds either way.
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import Cookies from 'js-cookie';
import TapisContext from '../context/TapisContext';
import useHideJob from './useHideJob';
import useUnhideJob from './useUnhideJob';

const { hideMock, unhideMock } = vi.hoisted(() => ({
  hideMock: vi.fn(),
  unhideMock: vi.fn(),
}));

vi.mock('@tapis/tapisui-api', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Jobs: {
      ...(actual.Jobs as object),
      hideJob: hideMock,
      unhideJob: unhideMock,
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
  hideMock.mockReset().mockResolvedValue({ status: 'success' });
  unhideMock.mockReset().mockResolvedValue({ status: 'success' });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  seedSession();
});

afterEach(() => {
  Cookies.remove('tapis-token');
  client.clear();
});

/** the keys the jobs listings and the detail page are cached under */
const seedCaches = () => {
  client.setQueryData(['jobs/list', {}, 'tok'], { result: [{ uuid: 'u-1' }] });
  client.setQueryData(['jobs/listWindow', {}, 20, 'tok'], {
    result: [{ uuid: 'u-1' }],
  });
  client.setQueryData(['jobs/details', { jobUuid: 'u-1' }, 'tok'], {
    result: { uuid: 'u-1', visible: true },
  });
};

const staleness = () => ({
  list: client.getQueryState(['jobs/list', {}, 'tok'])?.isInvalidated,
  window: client.getQueryState(['jobs/listWindow', {}, 20, 'tok'])
    ?.isInvalidated,
  details: client.getQueryState(['jobs/details', { jobUuid: 'u-1' }, 'tok'])
    ?.isInvalidated,
});

describe('hiding a job tells the listings', () => {
  it('marks the list, the window and the detail stale', async () => {
    seedCaches();
    expect(staleness()).toEqual({
      list: false,
      window: false,
      details: false,
    });

    const { result } = renderHook(() => useHideJob(), { wrapper });
    result.current.hideJob('u-1');

    await waitFor(() =>
      expect(hideMock).toHaveBeenCalledWith(
        'u-1',
        expect.any(String),
        expect.any(String)
      )
    );
    await waitFor(() =>
      expect(staleness()).toEqual({
        list: true,
        window: true,
        details: true,
      })
    );
  });

  it('does the same on the way back — an unhidden run has to return', async () => {
    seedCaches();
    const { result } = renderHook(() => useUnhideJob(), { wrapper });
    result.current.unhideJob('u-1');

    await waitFor(() => expect(unhideMock).toHaveBeenCalled());
    await waitFor(() =>
      expect(staleness()).toEqual({
        list: true,
        window: true,
        details: true,
      })
    );
  });

  it('leaves the caches alone when the call fails', async () => {
    seedCaches();
    hideMock.mockRejectedValue(new Error('nope'));
    const { result } = renderHook(() => useHideJob(), { wrapper });
    result.current.hideJob('u-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(staleness()).toEqual({ list: false, window: false, details: false });
  });
});
