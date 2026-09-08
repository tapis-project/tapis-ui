import { Files } from '@tapis/tapis-typescript';
import {
  filesV2Breadcrumbs,
  pathFromRouteParam,
  toFileExplorerItem,
  toFilesV2Route,
} from './utils';

describe('Files V2 route and item adapters', () => {
  it('encodes system ids and each path segment', () => {
    expect(toFilesV2Route('system/name', '/My Folder/100% ready')).toBe(
      '/files/v2/system%2Fname/My%20Folder/100%25%20ready'
    );
    expect(pathFromRouteParam('My%20Folder/100%25%20ready')).toBe(
      '/My Folder/100% ready'
    );
  });

  it('maps Tapis directories and converts kilobytes to bytes', () => {
    const item = toFileExplorerItem(
      {
        type: Files.FileTypeEnum.Dir,
        name: 'results',
        path: '/project/results',
        size: 2,
        lastModified: new Date('2026-09-05T12:00:00Z'),
      },
      '/project'
    );

    expect(item).toMatchObject({
      id: '/project/results',
      name: 'results',
      type: 'directory',
      parentId: '/project',
      size: 2048,
      updatedAt: '2026-09-05T12:00:00.000Z',
    });
  });

  it('builds path-addressable breadcrumbs', () => {
    expect(filesV2Breadcrumbs('test.system', '/one/two')).toEqual([
      { id: '/', name: 'test.system', path: '/' },
      { id: '/one', name: 'one', path: '/one' },
      { id: '/one/two', name: 'two', path: '/one/two' },
    ]);
  });
});
