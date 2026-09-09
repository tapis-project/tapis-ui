import { describe, it, expect } from 'vitest';
import { isJwtExpired, tenantMatchesHost } from './useTapisConfig';

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

  it('is false when either side is missing', () => {
    expect(tenantMatchesHost(undefined, 'tacc')).toBe(false);
    expect(tenantMatchesHost('https://tacc.tapis.io', undefined)).toBe(false);
  });

  // Known looseness, documented rather than asserted as desirable: the test is
  // a substring search, so a tenant id appearing anywhere in the URL matches.
  // Recorded in docs/AUTH_AND_PERF_BACKLOG.md as a stricter-parse candidate.
  it('currently matches a tenant id appearing elsewhere in the URL', () => {
    expect(tenantMatchesHost('https://other.tapis.io/tacc.', 'tacc')).toBe(
      true
    );
  });
});
