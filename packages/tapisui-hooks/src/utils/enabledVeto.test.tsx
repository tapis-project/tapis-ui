/**
 * @vitest-environment jsdom
 *
 * A list hook's `enabled` is the caller's veto AND the hook's own "only
 * with a token" — both must hold. Several hooks used to spread the caller's
 * options after their own `enabled: !!accessToken`, so a page passing
 * `{ enabled: !rebuilt }` replaced the token check and could fire a list
 * request before anyone was signed in. The files hook has its own test;
 * these pin the systems, apps, jobs and tenants lists.
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import Cookies from 'js-cookie';
import TapisContext from '../context/TapisContext';
import useSystemsList from '../systems/useList';
import useAppsList from '../apps/useList';
import useJobsList from '../jobs/useList';
import useTenantsList from '../tenants/useList';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    systems: vi.fn(),
    apps: vi.fn(),
    jobs: vi.fn(),
    tenants: vi.fn(),
  },
}));

vi.mock('@tapis/tapisui-api', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, any>;
  return {
    ...actual,
    Systems: { ...actual.Systems, list: mocks.systems },
    Apps: { ...actual.Apps, list: mocks.apps },
    Jobs: { ...actual.Jobs, list: mocks.jobs },
    Tenants: { ...actual.Tenants, list: mocks.tenants },
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

const hooks: Array<[keyof typeof mocks, () => unknown]> = [
  ['systems', () => useSystemsList(undefined, { enabled: true })],
  ['apps', () => useAppsList(undefined, { enabled: true })],
  ['jobs', () => useJobsList(undefined, { enabled: true })],
  ['tenants', () => useTenantsList(undefined, { enabled: true })],
];

beforeEach(() => {
  for (const m of Object.values(mocks)) {
    m.mockReset();
    m.mockResolvedValue({ result: [] });
  }
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => Cookies.remove('tapis-token'));

describe('a list hook with no session', () => {
  it.each(hooks)(
    '%s does not fetch, even when the caller says enabled',
    async (name, use) => {
      renderHook(use, { wrapper });
      await new Promise((r) => setTimeout(r, 20));
      expect(mocks[name]).not.toHaveBeenCalled();
    }
  );
});

describe('a list hook with a session', () => {
  it.each(hooks)('%s fetches when the caller allows it', async (name, use) => {
    seedSession();
    renderHook(use, { wrapper });
    await waitFor(() => expect(mocks[name]).toHaveBeenCalled());
  });
});
