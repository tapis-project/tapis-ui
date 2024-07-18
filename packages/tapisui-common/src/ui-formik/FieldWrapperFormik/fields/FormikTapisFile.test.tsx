import '@testing-library/jest-dom/extend-expect';
import { parseTapisURI } from './FormikTapisFile';

describe('FormikTapisFile', () => {
  it('parses tapis URIs', () => {
    expect(parseTapisURI('tapis://system-name.storage/path/to/file')).toEqual({
      systemId: 'system-name.storage',
      file: {
        name: 'file',
        path: '/path/to/file',
      },
      parent: '/path/to',
    });
    expect(parseTapisURI('https://web/url')).not.toBeDefined();
    expect(parseTapisURI('tapis://system-name.storage/file')).toEqual({
      systemId: 'system-name.storage',
      file: {
        name: 'file',
        path: '/file',
      },
      parent: '/',
    });
  });
});
