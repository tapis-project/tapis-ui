import { Files as API } from '@tapis/tapisui-api';

/**
 * Where an uploaded file lands.
 *
 * The URL used to be built as `${path}${file.name}`, which needs every caller
 * to hand over a path with a trailing slash. The upload modal did, by
 * appending one and de-duplicating it; the listing's drag-and-drop did not,
 * and wrote /outtapisjob.out into the parent directory.
 */
const at = (path: string, name = 'tapisjob.out') =>
  API.uploadUrl('https://tapis.test', 'frontera', path, name);

describe('uploadUrl', () => {
  it('separates the directory from the name', () => {
    expect(at('/out')).toBe(
      'https://tapis.test/v3/files/ops/frontera/out/tapisjob.out'
    );
  });

  it('does not double the slash a caller already added', () => {
    // the upload modal has been appending one for years
    expect(at('/out/')).toBe(
      'https://tapis.test/v3/files/ops/frontera/out/tapisjob.out'
    );
  });

  it('handles the top of a system, however it is spelled', () => {
    const top = 'https://tapis.test/v3/files/ops/frontera/tapisjob.out';
    expect(at('/')).toBe(top);
    expect(at('')).toBe(top);
  });

  it('keeps a deep path intact', () => {
    expect(at('/scratch/runs/01/')).toBe(
      'https://tapis.test/v3/files/ops/frontera/scratch/runs/01/tapisjob.out'
    );
  });
});
