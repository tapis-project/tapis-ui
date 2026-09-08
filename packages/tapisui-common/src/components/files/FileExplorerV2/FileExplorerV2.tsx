import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { ExplorerHeader } from './components/header/ExplorerHeader';
import { ExplorerToolbar } from './components/toolbar/ExplorerToolbar';
import { SelectionActionBar } from './components/toolbar/SelectionActionBar';
import { GridView } from './components/views/GridView';
import { TableView } from './components/views/TableView';
import { CompactView } from './components/views/CompactView';
import { FileContextMenu } from './components/context-menu/FileContextMenu';
import type {
  FileExplorerBreadcrumb,
  FileExplorerItem,
  SortConfig,
  ViewMode,
} from './types/file-system';
import type { FileExplorerAction } from './types/actions';

export interface FileExplorerV2Props {
  systemId: string;
  systemHost?: string;
  path: string;
  items: FileExplorerItem[];
  breadcrumbs: FileExplorerBreadcrumb[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  getActionsForItems: (items: FileExplorerItem[]) => FileExplorerAction[];
  onExecuteAction: (
    action: FileExplorerAction,
    items: FileExplorerItem[]
  ) => void;
  onNavigatePath: (path: string) => void;
  onOpenItem: (item: FileExplorerItem) => void;
  onNewFolder?: () => void;
  onUploadFile?: () => void;
  onTransfers?: () => void;
  toolbarExtras?: React.ReactNode;
  sidebar?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchLoading?: boolean;
}

export function FileExplorerV2({
  systemHost,
  path,
  items,
  breadcrumbs,
  selectedIds,
  onSelectedIdsChange,
  getActionsForItems,
  onExecuteAction,
  onNavigatePath,
  onOpenItem,
  onNewFolder,
  onUploadFile,
  onTransfers,
  toolbarExtras,
  sidebar,
  loading = false,
  error,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  searchQuery,
  onSearchChange,
  searchLoading = false,
}: FileExplorerV2Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    order: 'asc',
  });
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    targets: FileExplorerItem[];
  } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage || !onLoadMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) onLoadMore();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = items.filter((item) => {
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.extension?.toLowerCase().includes(query) ||
        item.mimeType?.toLowerCase().includes(query)
      );
    });
    return result.sort((a, b) => {
      if (!query && a.type !== b.type) {
        if (a.type === 'directory') return -1;
        if (b.type === 'directory') return 1;
      }
      let comparison = 0;
      if (sortConfig.field === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      } else if (sortConfig.field === 'updatedAt') {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortConfig.field === 'size') {
        comparison = a.size - b.size;
      } else {
        comparison = (a.extension || a.type).localeCompare(
          b.extension || b.type
        );
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
  }, [items, searchQuery, sortConfig]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const toggleSelect = (id: string, multi = false, range = false) => {
    if (range && selectedIds.length) {
      const previousIndex = displayedItems.findIndex(
        (item) => item.id === selectedIds[selectedIds.length - 1]
      );
      const nextIndex = displayedItems.findIndex((item) => item.id === id);
      if (previousIndex >= 0 && nextIndex >= 0) {
        const [start, end] = [previousIndex, nextIndex].sort((a, b) => a - b);
        onSelectedIdsChange(
          Array.from(
            new Set([
              ...selectedIds,
              ...displayedItems.slice(start, end + 1).map((item) => item.id),
            ])
          )
        );
        return;
      }
    }
    if (multi) {
      onSelectedIdsChange(
        selectedIds.includes(id)
          ? selectedIds.filter((selectedId) => selectedId !== id)
          : [...selectedIds, id]
      );
      return;
    }
    onSelectedIdsChange(
      selectedIds.length === 1 && selectedIds[0] === id ? [] : [id]
    );
  };

  const openContextMenu = (event: React.MouseEvent, item: FileExplorerItem) => {
    event.preventDefault();
    event.stopPropagation();
    const targets = selectedIds.includes(item.id) ? selectedItems : [item];
    if (!selectedIds.includes(item.id)) onSelectedIdsChange([item.id]);
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, targets });
  };

  const renderView = () => {
    const props = {
      items: displayedItems,
      selectedIds,
      onToggleSelect: toggleSelect,
      onOpenItem,
      onContextMenu: openContextMenu,
      onOpenActionMenu: openContextMenu,
    };
    if (viewMode === 'grid') {
      return <GridView {...props} onNewFolder={onNewFolder} />;
    }
    if (viewMode === 'compact') return <CompactView {...props} />;
    return (
      <TableView
        {...props}
        onSelectAll={() =>
          onSelectedIdsChange(displayedItems.map((item) => item.id))
        }
        onClearSelection={() => onSelectedIdsChange([])}
        onNewFolder={onNewFolder}
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <ExplorerHeader
        breadcrumbs={breadcrumbs}
        systemHost={systemHost}
        onNavigateBreadcrumb={(id) =>
          onNavigatePath(
            breadcrumbs.find((breadcrumb) => breadcrumb.id === id)?.path || '/'
          )
        }
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        loading={loading || searchLoading}
      />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {sidebar}
        <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: 2.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}
          <SelectionActionBar
            selectedItems={selectedItems}
            applicableActions={getActionsForItems(selectedItems)}
            onExecuteAction={(action) => onExecuteAction(action, selectedItems)}
            onClearSelection={() => onSelectedIdsChange([])}
          />
          <ExplorerToolbar
            currentFolder={null}
            title={breadcrumbs[breadcrumbs.length - 1]?.name}
            displayedCount={displayedItems.length}
            totalSelected={selectedIds.length}
            sortConfig={sortConfig}
            searchQuery={searchQuery}
            onSortChange={(field) =>
              setSortConfig((current) => ({ ...current, field }))
            }
            onToggleSortOrder={() =>
              setSortConfig((current) => ({
                ...current,
                order: current.order === 'asc' ? 'desc' : 'asc',
              }))
            }
            onSelectAll={() =>
              onSelectedIdsChange(displayedItems.map((item) => item.id))
            }
            onClearSelection={() => onSelectedIdsChange([])}
            onNewFolder={onNewFolder}
            onUploadFile={onUploadFile}
            onTransfers={onTransfers}
            additionalActions={toolbarExtras}
          />
          {loading && !items.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderView()
          )}
          <Box ref={loadMoreRef} sx={{ textAlign: 'center', py: 1 }}>
            {hasNextPage && (
              <Button
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
                variant="outlined"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      <FileContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        getApplicableActions={getActionsForItems}
        onExecuteAction={onExecuteAction}
      />
    </Box>
  );
}

export default FileExplorerV2;
