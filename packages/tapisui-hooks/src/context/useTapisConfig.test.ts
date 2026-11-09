import { describe, it, expect } from 'vitest';
import {
  isJwtExpired,
  tenantMatchesHost,
  checkAccessToken,
} from './useTapisConfig';

// These two rules decide whether a user is silently signed out. A false
// positive on either logs somebody out of a perfectly good session, so the
// boundaries are worth pinning down exactly.

describe('isJwtExpired', () => {
  const now = 1_700_000_000_000; // ms

  it('treats a token without exp as live', () => {
    expect(isJwtExpired({}, now)).toBe(false);
  });

  it('is live one second before exp', () => {
    expect(isJwtExpired({ exp: now / 1000 + 1 }, now)).toBe(false);
  });

  it('is expired exactly at exp', () => {
    // `>=`: a token expiring this instant is not usable
    expect(isJwtExpired({ exp: now / 1000 }, now)).toBe(true);
  });

  it('is expired after exp', () => {
    expect(isJwtExpired({ exp: now / 1000 - 1 }, now)).toBe(true);
  });

  it('reads exp as seconds, not milliseconds', () => {
    // exp in ms would look like the year 55000 and never expire
    expect(isJwtExpired({ exp: now }, now)).toBe(false);
  });
});

describe('tenantMatchesHost', () => {
  it('matches a tenant against its own host', () => {
    expect(tenantMatchesHost('https://tacc.develop.tapis.io', 'tacc')).toBe(
      true
    );
  });

  it('matches regardless of case', () => {
    expect(tenantMatchesHost('https://ICICLEAI.tapis.io', 'icicleai')).toBe(
      true
    );
  });

  it('rejects a token minted for a different tenant', () => {
    expect(tenantMatchesHost('https://icicleai.tapis.io', 'tacc')).toBe(false);
  });

  // The trailing dot is what makes this safe: "tacc" must not match
  // "taccdev.tapis.io", or one tenant's token would be accepted on another's
  // host whenever the id happens to prefix it.
  it('does not accept a tenant that merely prefixes the host', () => {
    expect(tenantMatchesHost('https://taccdev.tapis.io', 'tacc')).toBe(false);
  });

  // ...nor may a tenant whose id is the tail of another's: "cc." is a
  // substring of "tacc.", so only a whole-label match is safe.
  it('does not match a tenant that is the tail of the host tenant', () => {
    expect(tenantMatchesHost('https://tacc.tapis.io', 'cc')).toBe(false);
    expect(tenantMatchesHost('https://tacc.develop.tapis.io', 'acc')).toBe(
      false
    );
  });

  it('ignores a port and a path', () => {
    expect(tenantMatchesHost('https://tacc.tapis.io:443/x', 'tacc')).toBe(true);
  });

  it('is false when either side is missing', () => {
    expect(tenantMatchesHost(undefined, 'tacc')).toBe(false);
    expect(tenantMatchesHost('https://tacc.tapis.io', undefined)).toBe(false);
  });

  // Only the hostname counts: a tenant id elsewhere in the URL is not a match.
  it('does not match a tenant id appearing only in the path', () => {
    expect(tenantMatchesHost('https://other.tapis.io/tacc.', 'tacc')).toBe(
      false
    );
  });
});

describe('checkAccessToken', () => {
  const now = 1_700_000_000_000;
  const b64 = (o: object) => btoa(JSON.stringify(o));
  const tok = (claims: object) => `${b64({ alg: 'none' })}.${b64(claims)}.sig`;
  const live = now / 1000 + 600;

  it('accepts a live token for this tenant', () => {
    const t = tok({ exp: live, 'tapis/tenant_id': 'tacc' });
    expect(
      checkAccessToken(t, { basePath: 'https://tacc.tapis.io', now })
    ).toBeUndefined();
  });

  it('refuses a token it cannot decode', () => {
    expect(
      checkAccessToken('nope', { basePath: 'https://tacc.tapis.io', now })
    ).toEqual({ reason: 'unreadable' });
  });

  it('refuses an expired token', () => {
    const t = tok({ exp: now / 1000 - 1, 'tapis/tenant_id': 'tacc' });
    expect(
      checkAccessToken(t, { basePath: 'https://tacc.tapis.io', now })?.reason
    ).toBe('expired');
  });

  it('refuses another tenant and names it', () => {
    const t = tok({ exp: live, 'tapis/tenant_id': 'cc' });
    expect(
      checkAccessToken(t, { basePath: 'https://tacc.tapis.io', now })
    ).toEqual({ reason: 'tenant-mismatch', tenant: 'cc' });
  });

  it('skips the tenant check for a localhost basePath only', () => {
    const t = tok({ exp: live, 'tapis/tenant_id': 'tacc' });
    expect(
      checkAccessToken(t, { basePath: 'http://localhost:8000', now })
    ).toBeUndefined();
    expect(checkAccessToken(t, { basePath: undefined, now })?.reason).toBe(
      'tenant-mismatch'
    );
  });

  it('accepts a token without a tenant claim', () => {
    const t = tok({ exp: live });
    expect(
      checkAccessToken(t, { basePath: 'https://tacc.tapis.io', now })
    ).toBeUndefined();
  });
});
