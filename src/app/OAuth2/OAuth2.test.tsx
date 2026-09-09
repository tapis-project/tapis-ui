import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { getParam } from './OAuth2';
import OAuth2 from './OAuth2';

// The OIDC callback is the most sensitive hop in the app: it converts a URL
// fragment into a stored session. These cover every branch — good token,
// missing token, a destination to return to, no destination, a cookie the
// browser refused to keep, and StrictMode's double mount.

const replace = jest.fn();
const push = jest.fn();
jest.mock('react-router-dom', () => ({
  useHistory: () => ({ replace, push }),
}));

let mockSetAccessToken: jest.Mock;
jest.mock('@tapis/tapisui-hooks', () => ({
  // the real rules: the callback must refuse exactly what the hook would clear
  checkAccessToken: jest.requireActual('@tapis/tapisui-hooks').checkAccessToken,
  useTapisConfig: () => ({
    setAccessToken: mockSetAccessToken,
    accessToken: undefined,
    basePath: 'https://icicleai.tapis.io',
  }),
}));

/** A structurally valid JWT; the signature is never checked client-side. */
const jwt = (payload: Record<string, unknown>): string => {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ typ: 'JWT', alg: 'RS256' })}.${b64(payload)}.sig`;
};
const inHours = (h: number) => Math.floor(Date.now() / 1000) + h * 3600;
const GOOD = jwt({ exp: inHours(4), 'tapis/tenant_id': 'icicleai' });
const callbackWith = (token: string) =>
  `https://icicleai.tapis.io/#/oauth2#access_token=${token}&expires_in=14400&state=x`;

/** Simulate the cookie the real setAccessToken would have written. */
const storeCookie = () => {
  document.cookie = 'tapis-token=' + encodeURIComponent('{"a":1}') + '; path=/';
};
const clearCookie = () => {
  document.cookie =
    'tapis-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

const CALLBACK = callbackWith(GOOD);

describe('OAuth2 callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    clearCookie();
    mockSetAccessToken = jest
      .fn()
      .mockImplementation(async () => storeCookie());
  });

  describe('getParam', () => {
    it('reads params out of the double-hash implicit callback', () => {
      expect(getParam(CALLBACK, 'access_token')).toEqual(GOOD);
      expect(getParam(CALLBACK, 'expires_in')).toEqual('14400');
    });

    it('returns undefined for a param that is absent', () => {
      expect(getParam(CALLBACK, 'id_token')).toBeUndefined();
    });

    it('url-decodes values', () => {
      expect(getParam('http://x/#a=one%20two', 'a')).toEqual('one two');
    });
  });

  it('stores the token, then returns to the stashed destination', async () => {
    sessionStorage.setItem('tapis-login-from', '/pods');
    render(<OAuth2 href={CALLBACK} />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/pods'));

    expect(mockSetAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        access_token: GOOD,
        expires_in: 14400,
      })
    );
    // the stash is consumed so a later login does not reuse it
    expect(sessionStorage.getItem('tapis-login-from')).toBeNull();
  });

  it('falls back to / when nothing was stashed', async () => {
    render(<OAuth2 href={CALLBACK} />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });

  it('replaces rather than pushes — the token fragment must leave history', async () => {
    render(<OAuth2 href={CALLBACK} />);
    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
  });

  it('sends the user to /login when the callback carries no token', async () => {
    render(
      <OAuth2 href="https://icicleai.tapis.io/#/oauth2#error=access_denied" />
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(mockSetAccessToken).not.toHaveBeenCalled();
  });

  it('defaults expires_in when the provider omits it', async () => {
    render(
      <OAuth2
        href={`https://icicleai.tapis.io/#/oauth2#access_token=${GOOD}`}
      />
    );
    await waitFor(() => expect(mockSetAccessToken).toHaveBeenCalled());
    expect(mockSetAccessToken.mock.calls[0][0].expires_in).toEqual(14400);
  });

  // The failure this makes impossible: land on a page rendering logged-out
  // with nothing explaining why (cookie over the size limit, `secure` on
  // http, cookies disabled).
  it('explains itself instead of redirecting when the cookie did not stick', async () => {
    mockSetAccessToken = jest.fn().mockResolvedValue(undefined); // writes nothing
    const { findByText } = render(<OAuth2 href={CALLBACK} />);
    expect(await findByText(/could not be stored/)).toBeDefined();
    expect(replace).not.toHaveBeenCalled();
  });

  // React 18 StrictMode mounts effects twice in development. The second pass
  // used to find `tapis-login-from` already consumed and pushed '/' over the
  // real destination — the "why am I back home?" bug.
  it('consumes the callback once under a double mount (StrictMode)', async () => {
    sessionStorage.setItem('tapis-login-from', '/pods');
    render(
      <React.StrictMode>
        <OAuth2 href={CALLBACK} />
      </React.StrictMode>
    );
    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/pods');
    expect(mockSetAccessToken).toHaveBeenCalledTimes(1);
  });

  // Refused before anything is stored: storing it would only have the hook
  // clear it again and drop the user on the login page with no reason given.
  describe('a token this deployment cannot use', () => {
    it.each([
      ['cannot be read', 'not.a.jwt', /cannot read/],
      [
        'has expired',
        jwt({ exp: inHours(-1), 'tapis/tenant_id': 'icicleai' }),
        /already expired/,
      ],
      [
        'is for another tenant',
        jwt({ exp: inHours(4), 'tapis/tenant_id': 'tacc' }),
        /for the tacc tenant/,
      ],
    ])('is refused when it %s', async (_why, token, message) => {
      const { findByText } = render(<OAuth2 href={callbackWith(token)} />);
      expect(await findByText(message)).toBeDefined();
      expect(mockSetAccessToken).not.toHaveBeenCalled();
      expect(replace).not.toHaveBeenCalled();
    });
  });
});
