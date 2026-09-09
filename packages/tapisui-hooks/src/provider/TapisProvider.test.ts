import { describe, it, expect } from 'vitest';
import { is401, shouldRetry } from './TapisProvider';

// The dividing line this guards: a dead SESSION logs out; a dead SYSTEM
// does not. The exact error that used to log people out of a job page is
// the first case below.

describe('is401 — remote-host refusals never end the session', () => {
  it('a Files listing refused by the remote machine', () => {
    expect(
      is401(
        new Error(
          'FILES_REMOTE_LIST_ERROR Query system vista-tapis path= /scratch/x/output/flexserv_access_info.txt with limit=100 offset=0, user = jdoe, tenant = tacc: 401'
        )
      )
    ).toBe(false);
  });

  it('a system with no registered credential', () => {
    expect(
      is401(
        new Error(
          'SSH_POOL_MISSING_CREDENTIALS Missing credentials Tenant: tacc, Host: vista.tacc.utexas.edu, Port: 22, EffectiveUserId: jdoe, AuthnMethod: PKI_KEYS'
        )
      )
    ).toBe(false);
  });

  it('systems-service credential and permission refusals', () => {
    expect(is401(new Error('SYSAPI_CRED_NOT_FOUND for user'))).toBe(false);
    expect(
      is401(new Error('SYSLIB_UNAUTH Not authorized for systems operation'))
    ).toBe(false);
    expect(is401(new Error('FILES_CLIENT_SSH_AUTH credentials invalid'))).toBe(
      false
    );
  });

  it('a bare 401 or "unauthorized" in an unrelated message', () => {
    expect(is401(new Error('job 401abc failed'))).toBe(false);
    expect(is401(new Error('Unauthorized to view this pod'))).toBe(false);
    expect(is401(new Error('no access token found in output file'))).toBe(
      false
    );
  });

  it('nothing at all', () => {
    expect(is401(undefined)).toBe(false);
    expect(is401(null)).toBe(false);
  });
});

describe('is401 — the request’s own JWT being refused does', () => {
  it('java services: TAPIS_SECURITY_JWT_* codes', () => {
    expect(
      is401(new Error('TAPIS_SECURITY_JWT_PARSE_ERROR Unable to parse JWT'))
    ).toBe(true);
  });

  it('anything that blames the JWT by name', () => {
    expect(is401(new Error('JWT signature validation failed'))).toBe(true);
  });

  it('python services: expired / invalid token phrasings', () => {
    expect(is401(new Error('Tapis token has expired'))).toBe(true);
    expect(is401(new Error('Invalid Tapis token format'))).toBe(true);
    expect(is401(new Error('token is invalid'))).toBe(true);
    expect(is401(new Error('expired access token'))).toBe(true);
  });

  it('the authenticator refusing outright', () => {
    expect(is401(new Error('invalid_credentials'))).toBe(true);
  });
});

describe('shouldRetry', () => {
  it('stops on the first 4xx answer', () => {
    [400, 401, 403, 404].forEach((status) =>
      expect(shouldRetry(0, { status })).toBe(false)
    );
  });

  it('reads the status of a raw response error', () => {
    expect(shouldRetry(0, { response: { status: 404 } })).toBe(false);
  });

  it('retries timeouts, throttling and 5xx, three times', () => {
    [408, 429, 500, 503].forEach((status) => {
      expect(shouldRetry(2, { status })).toBe(true);
      expect(shouldRetry(3, { status })).toBe(false);
    });
  });

  it('retries a network failure, which has no status', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
  });
});
