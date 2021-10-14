import '@testing-library/jest-dom/extend-expect';
import { backLocation } from './Router';

describe('FileListing Router', () => {
  it('calculates correct backLocation', () => {
    expect(backLocation(undefined, '/files/test.system/')).toBeUndefined();
    expect(backLocation('/dir/', '/files/test.system/dir/')).toEqual(
      '/files/test.system/'
    );
  });
});
