/**
 * @vitest-environment jsdom
 *
 * The hook itself, not just its extracted rules. This is the module that
 * decides whether a browser is holding a usable session, and the effect that
 * clears a token is the one that silently signs people out — so each reason
 * it can fire gets a case, alongside the cookie read/write it all rests on.
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import Cookies from 'js-cookie';
import TapisContext from './TapisContext';
import useTapisConfig from './useTapisConfig';

/** A structurally valid JWT. The signature is never verified client-side. */
const jwt = (payload: Record<string, unknown>): string => {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64({ typ: 'JWT', alg: 'RS256' })}.${b64(payload)}.sig`;
};

const inHours = (h: number) => Math.floor(Date.now() / 1000) + h * 3600;

const seedSession = (access_token: string) => {
  Cookies.set(
    'tapis-token',
    JSON.stringify({
      access_token,
      expires_in: 14400,
      expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    })
  );
};

const wrapper =
  (basePath: string) =>
  ({ children }: { children: React.ReactNode }) => {
    // retry:false so a failing query surfaces immediately instead of backing off
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return (
      <QueryClientProvider client={client}>
        <TapisContext.Provider value={{ basePath, mlHubBasePath: '' }}>
          {children}
        </TapisContext.Provider>
      </QueryClientProvider>
    );
  };

const TACC = 'https://tacc.develop.tapis.io';

describe('useTapisConfig', () => {
  beforeEach(() => {
    Cookies.remove('tapis-token');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('reading the session', () => {
    it('has no token when no cookie is present', () => {
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      expect(result.current.accessToken).toBeUndefined();
      expect(result.current.claims).toEqual({});
    });

    it('reads an existing cookie and decodes its claims', () => {
      const token = jwt({
        exp: inHours(4),
        'tapis/tenant_id': 'tacc',
        'tapis/username': 'someone',
      });
      seedSession(token);
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      expect(result.current.accessToken?.access_token).toEqual(token);
      expect(result.current.claims['tapis/username']).toEqual('someone');
    });
  });

  describe('writing the session', () => {
    it('setAccessToken stores a readable tapis-token cookie', async () => {
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      const token = jwt({ exp: inHours(4), 'tapis/tenant_id': 'tacc' });
      await result.current.setAccessToken({
        access_token: token,
        expires_in: 14400,
        expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      } as any);

      const raw = Cookies.get('tapis-token');
      expect(raw).toBeDefined();
      expect(JSON.parse(raw as string).access_token).toEqual(token);
    });

    it('setAccessToken(null) removes the session cookie', async () => {
      seedSession(jwt({ exp: inHours(4), 'tapis/tenant_id': 'tacc' }));
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      await result.current.setAccessToken(null);
      expect(Cookies.get('tapis-token')).toBeUndefined();
    });
  });

  // Each of these ends with the user signed out. They are the reasons a
  // session can vanish without the UI ever saying why.
  describe('clears the session when the token is unusable', () => {
    it('drops a token that is not a decodable JWT', async () => {
      seedSession('not-a-jwt');
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      await waitFor(() => expect(Cookies.get('tapis-token')).toBeUndefined());
    });

    it('drops an expired token', async () => {
      seedSession(jwt({ exp: inHours(-1), 'tapis/tenant_id': 'tacc' }));
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      await waitFor(() => expect(Cookies.get('tapis-token')).toBeUndefined());
    });

    it('drops a token minted for a different tenant', async () => {
      seedSession(jwt({ exp: inHours(4), 'tapis/tenant_id': 'icicleai' }));
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      await waitFor(() => expect(Cookies.get('tapis-token')).toBeUndefined());
    });

    // The case that must NOT fire: a good token on the right host survives.
    // A false positive here logs people out of working sessions.
    it('keeps a live token whose tenant matches the host', async () => {
      const token = jwt({ exp: inHours(4), 'tapis/tenant_id': 'tacc' });
      seedSession(token);
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      await waitFor(() =>
        expect(result.current.claims['tapis/tenant_id']).toEqual('tacc')
      );
      expect(Cookies.get('tapis-token')).toBeDefined();
      expect(result.current.domainsMatched).toBe(true);
    });
  });

  describe('parsing the deployment out of basePath', () => {
    it('reads tenant and site from a develop host', () => {
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper(TACC),
      });
      expect(result.current.pathTenantId).toEqual('tacc');
      expect(result.current.pathSiteId).toEqual('develop');
    });

    it('reads the tenant from a production host', () => {
      const { result } = renderHook(() => useTapisConfig(), {
        wrapper: wrapper('https://icicleai.tapis.io'),
      });
      expect(result.current.pathTenantId).toEqual('icicleai');
    });
  });
});
