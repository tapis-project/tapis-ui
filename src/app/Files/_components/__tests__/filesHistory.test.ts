import {
  canGoBack,
  canGoForward,
  getFilesHistory,
  goToFilesHistory,
  replaceNextVisit,
  resetFilesHistory,
  stepFilesHistory,
  visitFilesLocation,
} from '../filesHistory';

const T = 'test-trail';

beforeEach(() => resetFilesHistory());

const walk = (...locations: string[]) =>
  locations.forEach((location) => visitFilesLocation(T, location));

/** The trail records when each place was last visited; most of these are
 *  about the order, so they compare the where and ignore the when. */
const where = () => getFilesHistory(T).entries.map((entry) => entry.location);

describe('filesHistory', () => {
  it('has nowhere to go before you have been anywhere', () => {
    expect(canGoBack(T)).toBe(false);
    expect(canGoForward(T)).toBe(false);
    expect(stepFilesHistory(T, -1)).toBeUndefined();
  });

  it('walks back and forward over the places you visited', () => {
    walk('/files/a', '/files/a/one', '/files/a/one/two');
    expect(canGoBack(T)).toBe(true);
    expect(canGoForward(T)).toBe(false);

    expect(stepFilesHistory(T, -1)).toBe('/files/a/one');
    expect(stepFilesHistory(T, -1)).toBe('/files/a');
    expect(canGoBack(T)).toBe(false);
    expect(stepFilesHistory(T, 1)).toBe('/files/a/one');
  });

  it('ignores arriving where you already are', () => {
    walk('/files/a', '/files/a');
    expect(where()).toEqual(['/files/a']);
  });

  it('drops the future when you step somewhere new from the middle', () => {
    walk('/files/a', '/files/b', '/files/c');
    stepFilesHistory(T, -1);
    stepFilesHistory(T, -1);
    visitFilesLocation(T, '/files/d');

    expect(where()).toEqual(['/files/a', '/files/d']);
    expect(canGoForward(T)).toBe(false);
  });

  it("moves the cursor for the browser's own back rather than rewriting", () => {
    walk('/files/a', '/files/b', '/files/c');
    // the browser went back: same journey, so the forward half must survive
    visitFilesLocation(T, '/files/b', true);

    expect(where()).toEqual(['/files/a', '/files/b', '/files/c']);
    expect(getFilesHistory(T).index).toBe(1);
    expect(canGoForward(T)).toBe(true);
  });

  it('records a POP to somewhere it has never seen', () => {
    walk('/files/a');
    visitFilesLocation(T, '/files/elsewhere', true);
    expect(where()).toEqual(['/files/a', '/files/elsewhere']);
  });

  it('jumps straight to an entry, and refuses one that is not there', () => {
    walk('/files/a', '/files/b', '/files/c');
    expect(goToFilesHistory(T, 0)).toBe('/files/a');
    expect(getFilesHistory(T).index).toBe(0);
    expect(goToFilesHistory(T, 9)).toBeUndefined();
    expect(getFilesHistory(T).index).toBe(0);
  });

  it('keeps a session convenience, not an archive', () => {
    walk(...Array.from({ length: 60 }, (_, n) => `/files/s/${n}`));
    const { entries, index } = getFilesHistory(T);
    expect(entries).toHaveLength(50);
    // the cursor still points at where you are, not at a trimmed offset
    expect(entries[index].location).toBe('/files/s/59');
  });
});

describe('when you were last there', () => {
  it('stamps every visit, so the trail menu can say how long ago', () => {
    visitFilesLocation(T, '/files/a', false, 1000);
    visitFilesLocation(T, '/files/b', false, 2000);
    expect(getFilesHistory(T).entries.map((entry) => entry.at)).toEqual([
      1000, 2000,
    ]);
  });

  it('re-stamps a place you come back to — last touched, not first seen', () => {
    visitFilesLocation(T, '/files/a', false, 1000);
    visitFilesLocation(T, '/files/b', false, 2000);

    stepFilesHistory(T, -1, 5000);
    expect(getFilesHistory(T).entries[0].at).toBe(5000);

    goToFilesHistory(T, 1, 9000);
    expect(getFilesHistory(T).entries[1].at).toBe(9000);
  });

  it("re-stamps on the browser's own back too", () => {
    visitFilesLocation(T, '/files/a', false, 1000);
    visitFilesLocation(T, '/files/b', false, 2000);
    visitFilesLocation(T, '/files/a', true, 7000);
    expect(getFilesHistory(T).entries[0].at).toBe(7000);
    // and it moved the cursor rather than recording a third visit
    expect(where()).toEqual(['/files/a', '/files/b']);
  });
});

describe('replacing the cursor rather than appending', () => {
  // Back falls through to climbing a directory when the trail is spent.
  // Appending the parent after the child would make the next back walk
  // straight down again — two directories, forever.
  it('overwrites where you are instead of adding after it', () => {
    walk('/files/s/a/b');
    replaceNextVisit(T);
    visitFilesLocation(T, '/files/s/a');

    expect(where()).toEqual(['/files/s/a']);
    expect(getFilesHistory(T).index).toBe(0);
    expect(canGoBack(T)).toBe(false);
  });

  it('climbs without ever growing the trail', () => {
    walk('/files/s/a/b/c');
    ['/files/s/a/b', '/files/s/a', '/files/s'].forEach((up) => {
      replaceNextVisit(T);
      visitFilesLocation(T, up);
    });
    expect(where()).toEqual(['/files/s']);
  });

  it('is spent after one visit, and does not linger', () => {
    walk('/files/s/a');
    replaceNextVisit(T);
    visitFilesLocation(T, '/files/s');
    visitFilesLocation(T, '/files/s/other');
    // the second is an ordinary visit again
    expect(where()).toEqual(['/files/s', '/files/s/other']);
  });

  it('falls back to appending when there is nothing to replace', () => {
    replaceNextVisit(T);
    visitFilesLocation(T, '/files/s');
    expect(where()).toEqual(['/files/s']);
  });

  it('is forgotten along with the trail it was set on', () => {
    replaceNextVisit(T);
    resetFilesHistory();
    walk('/files/s/a', '/files/s/b');
    expect(where()).toEqual(['/files/s/a', '/files/s/b']);
  });
});
