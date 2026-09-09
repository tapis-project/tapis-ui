/**
 * @vitest-environment jsdom
 *
 * The caching policy, counted rather than asserted. Each case mounts a
 * real QueryClient and a real useQuery under the policy, and counts how
 * many times the query function actually ran — which is the only thing
 * the user of a page feels.
 */
import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  QueryObserverOptions,
} from 'react-query';
import {
  detailPolicy,
  DETAIL_STALE_MS,
  noBackgroundRefetch,
} from './cachePolicy';

/** a client with retries off, so a case is one fetch and not three */
const makeClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const wrapperFor = (client: QueryClient) => {
  const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
    children,
  }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return Wrapper;
};

const setup = (options: QueryObserverOptions<string, Error> = {}) => {
  const client = makeClient();
  const fetcher = vi.fn(async () => 'answer');
  const wrapper = wrapperFor(client);
  const mount = () =>
    renderHook(
      () =>
        useQuery<string, Error>(['thing'], fetcher, {
          ...detailPolicy<string>(),
          ...options,
        } as QueryObserverOptions<string, Error>),
      { wrapper }
    );
  return { client, fetcher, mount };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('a detail record', () => {
  it('is fetched once on the first arrival', async () => {
    const { fetcher, mount } = setup();
    const first = mount();
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    first.unmount();
  });

  it('costs nothing to navigate away and back inside the window', async () => {
    // the case this exists for: the nav moves between records constantly,
    // and going back to one just looked at should not re-ask for it
    const { fetcher, mount } = setup();
    const first = mount();
    await settle();
    first.unmount();

    const second = mount();
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    second.unmount();
  });

  it('refreshes on the arrival after it has gone stale', async () => {
    // not frozen: a record changed from another tab is still picked up,
    // just on the next visit rather than on every focus event.
    // A real (tiny) staleTime rather than fake timers — react-query dates
    // its cache entries from its own clock, and faking that clock while
    // ALSO waiting on the fetch's promise chain deadlocks the test.
    const { fetcher, mount } = setup({ staleTime: 10 });
    const first = mount();
    await settle();
    first.unmount();

    await new Promise((resolve) => setTimeout(resolve, 40));
    const second = mount();
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(2);
    second.unmount();
  });

  it('ships a window long enough to cover a walk through the nav', () => {
    expect(DETAIL_STALE_MS).toBeGreaterThanOrEqual(30_000);
  });
});

describe('what the policy refuses outright', () => {
  it('never refetches in the background — focus, reconnect, or a timer', () => {
    // the alt-tab storm: react-query's own defaults have the first two ON,
    // and a detail page now carries four queries at once
    expect(noBackgroundRefetch.refetchOnWindowFocus).toBe(false);
    expect(noBackgroundRefetch.refetchOnReconnect).toBe(false);
    expect(noBackgroundRefetch.refetchInterval).toBe(false);
    expect(noBackgroundRefetch.refetchIntervalInBackground).toBe(false);
  });

  it('still lets a caller poll on purpose', async () => {
    // the job page polls a RUNNING job; the policy is a default, not a cage
    const { fetcher, mount } = setup({ refetchInterval: 10 });
    const view = mount();
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(fetcher.mock.calls.length).toBeGreaterThan(1);
    view.unmount();
  });
});
