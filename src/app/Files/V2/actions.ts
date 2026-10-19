import type {
  FileExplorerAction,
  FileExplorerItem,
} from '@tapis/tapisui-common';

const action = (
  id: string,
  name: string,
  iconName: string,
  category: FileExplorerAction['category'],
  targetType: FileExplorerAction['targetType'],
  supportsMultiSelect: boolean,
  color?: FileExplorerAction['color'],
  showInOverflow = false
): FileExplorerAction => ({
  id,
  name,
  description: name,
  iconName,
  category,
  targetType,
  supportsMultiSelect,
  color,
  showInOverflow,
});

const actions = {
  view: action(
    'view',
    'View',
    'Visibility',
    'primary',
    'file',
    false,
    'primary'
  ),
  visualize: action(
    'visualize',
    'Visualize',
    'AnalyticsOutlined',
    'primary',
    'file',
    false,
    'primary',
    true
  ),
  share: action('share', 'Share', 'ShareOutlined', 'share', 'both', false),
  dataset: action(
    'dataset',
    'Register as Dataset',
    'DataObject',
    'share',
    'both',
    false,
    undefined,
    true
  ),
  rename: action(
    'rename',
    'Rename',
    'DriveFileRenameOutline',
    'manage',
    'both',
    false
  ),
  move: action('move', 'Move', 'DriveFileMove', 'manage', 'both', false),
  copy: action('copy', 'Copy', 'FileCopy', 'manage', 'both', true),
  download: action('download', 'Download', 'Download', 'manage', 'both', true),
  delete: action(
    'delete',
    'Delete',
    'DeleteOutline',
    'manage',
    'both',
    false,
    'error'
  ),
};

export const fileExplorerModalByActionId = {
  view: 'postit',
  visualize: 'visualize',
  share: 'share',
  dataset: 'dataset',
  rename: 'rename',
  move: 'move',
  copy: 'copy',
  delete: 'delete',
} as const;

export const getFileExplorerActions = (
  targets: FileExplorerItem[],
  canModify: boolean
) => {
  if (!targets.length) return [];
  const single = targets.length === 1;
  const allFiles = targets.every((target) => target.type === 'file');
  const result: FileExplorerAction[] = [];
  if (single && allFiles) result.push(actions.view, actions.visualize);
  if (single) result.push(actions.share, actions.dataset);
  if (canModify && single) result.push(actions.rename, actions.move);
  if (canModify) result.push(actions.copy);
  result.push(actions.download);
  if (canModify && single) result.push(actions.delete);
  return result;
};
