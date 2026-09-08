export type FileExplorerActionCategory =
  | 'primary'
  | 'manage'
  | 'transform'
  | 'share'
  | 'dev';

export type FileExplorerActionTarget = 'file' | 'directory' | 'both';

/** Controlled action descriptor rendered by FileExplorerV2. */
export interface FileExplorerAction {
  id: string;
  name: string;
  description?: string;
  iconName: string;
  category: FileExplorerActionCategory;
  targetType: FileExplorerActionTarget;
  supportsMultiSelect: boolean;
  showInOverflow?: boolean;
  shortcut?: string;
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | 'inherit';
}
