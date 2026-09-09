import { describe, expect, it } from 'vitest';
import { uploadUrl } from './insertAxios';

const BASE = 'https://tacc.tapis.io';

describe('the upload url', () => {
  it('puts the file in the folder, with one slash between them', () => {
    expect(uploadUrl(BASE, 'frontera', '/scratch/run/', 'out.txt')).toBe(
      `${BASE}/v3/files/ops/frontera/scratch/run/out.txt`
    );
    expect(uploadUrl(BASE, 'frontera', '', 'out.txt')).toBe(
      `${BASE}/v3/files/ops/frontera/out.txt`
    );
  });

  // A '#' or '?' left raw ends the path: the browser sends everything after
  // it as a fragment or a query, and the file lands somewhere else
  it('encodes each name, so reserved characters stay part of it', () => {
    expect(uploadUrl(BASE, 'frontera', '/My Data', 'run #7?.txt')).toBe(
      `${BASE}/v3/files/ops/frontera/My%20Data/run%20%237%3F.txt`
    );
    expect(uploadUrl(BASE, 'frontera', '/a', '100%.csv')).toBe(
      `${BASE}/v3/files/ops/frontera/a/100%25.csv`
    );
  });
});
