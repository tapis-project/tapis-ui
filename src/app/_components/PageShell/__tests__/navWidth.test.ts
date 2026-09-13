import {
  NAV_DEFAULT,
  NAV_MAX,
  NAV_MIN,
  clampNavWidth,
  getNavWidth,
  resetNavWidth,
  saveNavWidth,
  setNavWidth,
  subscribeNavWidth,
} from '../navWidth';

afterEach(() => resetNavWidth());

describe('the nav column width', () => {
  it('stays inside its bounds however it is asked', () => {
    expect(clampNavWidth(300)).toBe(300);
    expect(clampNavWidth(10)).toBe(NAV_MIN);
    expect(clampNavWidth(9000)).toBe(NAV_MAX);
  });

  it('survives a stored value that is not a width', () => {
    expect(clampNavWidth('280')).toBe(280);
    expect(clampNavWidth('wide please')).toBe(NAV_DEFAULT);
    expect(clampNavWidth(null)).toBe(NAV_DEFAULT);
    expect(clampNavWidth(undefined)).toBe(NAV_DEFAULT);
  });

  it('rounds, so a drag cannot store a fraction of a pixel', () => {
    expect(clampNavWidth(280.4)).toBe(280);
  });

  it('tells its listeners, and only when it moved', () => {
    const heard = jest.fn();
    const stop = subscribeNavWidth(heard);
    setNavWidth(300);
    expect(getNavWidth()).toBe(300);
    expect(heard).toHaveBeenCalledTimes(1);
    // the same width again is not a change; a drag sends many of these
    setNavWidth(300);
    expect(heard).toHaveBeenCalledTimes(1);
    // and a value outside the bounds lands on the bound, once
    setNavWidth(9000);
    setNavWidth(9001);
    expect(getNavWidth()).toBe(NAV_MAX);
    expect(heard).toHaveBeenCalledTimes(2);
    stop();
    setNavWidth(NAV_DEFAULT);
    expect(heard).toHaveBeenCalledTimes(2);
  });

  it('goes back where it started', () => {
    setNavWidth(500);
    resetNavWidth();
    expect(getNavWidth()).toBe(NAV_DEFAULT);
  });
});

// A drag sets a width per frame; writing each one to storage was a
// localStorage write per pointer move. The drag saves once, on release.
describe('a drag', () => {
  it('moves the width without storing it, then stores it once', () => {
    const KEY_WRITES = jest.spyOn(Storage.prototype, 'setItem');
    KEY_WRITES.mockClear();
    setNavWidth(300, { save: false });
    setNavWidth(320, { save: false });
    expect(getNavWidth()).toBe(320);
    expect(KEY_WRITES).not.toHaveBeenCalled();
    saveNavWidth();
    expect(KEY_WRITES).toHaveBeenCalledTimes(1);
    KEY_WRITES.mockRestore();
  });
});
