/**
 * The URL and the Tapis path are not the same string, and treating them as
 * one is how a directory with a space in its name stopped opening.
 *
 * filesRoute percent-encodes each segment on the way into the URL.
 * react-router 5 hands the parameter back STILL ENCODED — v6 decodes, v5 does
 * not — and the generated Files client encodes `path` itself before sending
 * it. So without a decode at the boundary the segment is encoded twice, and
 * the service is asked for a directory whose name literally contains "%20".
 *
 * These pin the round trip rather than either half, because either half alone
 * looks correct.
 */
import {
  filesRoute,
  folderFromPathname,
  pathFromRoute,
  pathSegments,
} from '../FilesBreadcrumbs';

// what react-router 5 does to `/files/:systemId/:systemPath*` — verified
// against matchPath: the parameter is the raw, still-encoded remainder
const routeParam = (route: string): string | undefined =>
  route.split('/').slice(3).join('/') || undefined;

const roundTrip = (systemId: string, segments: string[]) =>
  pathFromRoute(routeParam(filesRoute(systemId, segments)));

describe('a route and the Tapis path it stands for', () => {
  it('round-trips a plain path unchanged', () => {
    expect(roundTrip('mysys', ['data', 'out'])).toBe('data/out');
  });

  it('round-trips a name with a space, which is the case that broke', () => {
    // the URL must carry it encoded...
    expect(filesRoute('mysys', ['my folder'])).toBe('/files/mysys/my%20folder');
    // ...and what reaches the Files API must be the real name, or the client
    // encodes it a second time and the service looks for "my%20folder"
    expect(roundTrip('mysys', ['my folder'])).toBe('my folder');
  });

  it.each([
    ['a hash', 'notes#1'],
    ['an ampersand', 'a&b'],
    ['a plus', 'c++'],
    ['a percent', '100%done'],
    ['non-ascii', 'café'],
    ['a quote', "it's"],
  ])('round-trips %s', (_label, name) => {
    expect(roundTrip('mysys', [name])).toBe(name);
  });

  it('never leaves an escape sequence in the path handed to the API', () => {
    const path = roundTrip('mysys', ['my folder', 'a#b']);
    expect(path).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(path).toBe('my folder/a#b');
  });

  it('does not throw on a literal % that is not an escape', () => {
    // decodeURIComponent('100%done') raises URIError; a filename that is
    // merely unusual must not take the page down with it
    expect(() => pathFromRoute('100%done')).not.toThrow();
    expect(pathFromRoute('100%done')).toBe('100%done');
  });

  it('gives the system root a real path rather than an empty string', () => {
    // '' is not '/' to the Files service, and `systemPath ?? '/'` let the
    // empty string through because it is not nullish
    expect(pathFromRoute(undefined)).toBe('/');
    expect(pathFromRoute('')).toBe('/');
  });

  it('keeps a decoded slash from inventing a directory boundary', () => {
    // decoding per segment, not on the joined string
    expect(pathSegments(filesRoute('mysys', ['a', 'b']).slice(7))).toEqual([
      'mysys',
      'a',
      'b',
    ]);
  });
});

// The toolbar's writes (new folder, upload, rename, move, delete) read the
// folder from the URL too. Only the listing was decoded once, so a new
// folder inside "My Data" was created under "My%20Data".
describe('the folder the toolbar writes into', () => {
  it('is decoded like the listing', () => {
    expect(
      folderFromPathname(filesRoute('frontera', ['My Data', 'run #7']))
    ).toBe('My Data/run #7');
  });

  it('is empty at the root, so a child path keeps one leading slash', () => {
    expect(folderFromPathname('/files/frontera')).toBe('');
    expect(folderFromPathname('/files/frontera/')).toBe('');
  });
});
