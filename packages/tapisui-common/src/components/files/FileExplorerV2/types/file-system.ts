export type ItemType = 'file' | 'directory';

export interface FileItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null; // null represents root
  size: number; // in bytes (0 for empty folder or calculated)
  mimeType?: string;
  extension?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isFavorite?: boolean;
  isLocked?: boolean;
  isShared?: boolean;
  isTrash?: boolean;
  content?: string; // Text / markdown / code content for preview/editing
  thumbnail?: string; // Image URL or data preview
  author?: string;
  permissions?: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  metadata?: Record<string, any>;
}

/** API-agnostic item rendered by FileExplorerV2. */
export type FileExplorerItem = FileItem;

export interface FileExplorerBreadcrumb {
  id: string | null;
  name: string;
  path: string;
}

export interface FileExplorerHistoryControls {
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onOpenHistory: () => void;
}

export type ViewMode = 'grid' | 'table' | 'compact';

export type SortField = 'name' | 'updatedAt' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface ListFilesRequest {
  systemId: string;
  path: string;
  limit?: number;
  offset?: number;
}
