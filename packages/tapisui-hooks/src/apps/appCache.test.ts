/**
 * The cache patch enable/disable relies on. Its whole reason to exist is
 * that useDetail caches under the LIST key, so one key prefix holds two
 * different response shapes and a naive patch corrupts one of them.
 */
import { describe, it, expect } from 'vitest';
import { patchCachedEnabled } from './appCache';

describe('patchCachedEnabled', () => {
  it('flips the app inside a list response', () => {
    const cached = {
      result: [
        { id: 'flexserv', enabled: true },
        { id: 'other', enabled: true },
      ],
    };
    const next = patchCachedEnabled(cached, 'flexserv', false) as any;
    expect(next.result[0].enabled).toBe(false);
    // the neighbour is untouched, and by identity — no needless rerenders
    expect(next.result[1]).toBe(cached.result[1]);
    // the input is not mutated under react-query
    expect(cached.result[0].enabled).toBe(true);
  });

  it('flips the app inside a detail response', () => {
    const cached = { result: { id: 'flexserv', enabled: false } };
    const next = patchCachedEnabled(cached, 'flexserv', true) as any;
    expect(next.result.enabled).toBe(true);
    expect(cached.result.enabled).toBe(false);
  });

  it('returns other apps’ cached responses untouched, by identity', () => {
    // react-query hands EVERY response under the key to this, including
    // ones for apps this mutation knows nothing about
    const list = { result: [{ id: 'other', enabled: true }] };
    expect(patchCachedEnabled(list, 'flexserv', false)).toBe(list);
    const detail = { result: { id: 'other', enabled: true } };
    expect(patchCachedEnabled(detail, 'flexserv', false)).toBe(detail);
  });

  it('does not throw on what an empty or half-built cache holds', () => {
    expect(patchCachedEnabled(undefined, 'a', true)).toBeUndefined();
    expect(patchCachedEnabled(null, 'a', true)).toBeNull();
    expect(patchCachedEnabled({}, 'a', true)).toEqual({});
    expect(patchCachedEnabled({ result: null }, 'a', true)).toEqual({
      result: null,
    });
    expect(patchCachedEnabled({ result: [] }, 'a', true)).toEqual({
      result: [],
    });
  });
});
