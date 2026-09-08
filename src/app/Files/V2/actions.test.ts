import type { FileExplorerItem } from '@tapis/tapisui-common';
import { fileExplorerModalByActionId, getFileExplorerActions } from './actions';

const item = (type: FileExplorerItem['type']): FileExplorerItem => ({
  id: `/${type}`,
  name: type,
  type,
  parentId: '/',
  size: 0,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
});

const ids = (items: FileExplorerItem[], canModify: boolean) =>
  getFileExplorerActions(items, canModify).map((entry) => entry.id);

describe('Files V2 action eligibility', () => {
  it('offers read-only single-file actions without modify permission', () => {
    expect(ids([item('file')], false)).toEqual([
      'view',
      'visualize',
      'share',
      'dataset',
      'download',
    ]);
  });

  it('offers legacy directory mutations with modify permission', () => {
    expect(ids([item('directory')], true)).toEqual([
      'share',
      'dataset',
      'rename',
      'move',
      'copy',
      'download',
      'delete',
    ]);
  });

  it('limits multi-selection to copy and download', () => {
    expect(ids([item('file'), item('directory')], true)).toEqual([
      'copy',
      'download',
    ]);
  });

  it('maps View to the existing PostIt viewer modal', () => {
    expect(fileExplorerModalByActionId.view).toBe('postit');
  });

  it('places Visualize and Dataset registration in the More menu', () => {
    const actions = getFileExplorerActions([item('file')], true);
    const overflowIds = actions
      .filter((entry) => entry.showInOverflow)
      .map((entry) => entry.id);

    expect(overflowIds).toEqual(['visualize', 'dataset']);
  });
});
