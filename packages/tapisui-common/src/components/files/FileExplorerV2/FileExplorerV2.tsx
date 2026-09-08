import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { ExplorerHeader } from './components/header/ExplorerHeader';
import { ExplorerToolbar } from './components/toolbar/ExplorerToolbar';
import { SelectionActionBar } from './components/toolbar/SelectionActionBar';
import { GridView } from './components/views/GridView';
import { TableView } from './components/views/TableView';
import { CompactView } from './components/views/CompactView';
import { FileContextMenu } from './components/context-menu/FileContextMenu';
import type {
  FileExplorerBreadcrumb,
  FileExplorerHistoryControls,
  FileExplorerItem,
  SortConfig,
  ViewMode,
} from './types/file-system';
import type { FileExplorerAction } from './types/actions';

const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 560;
const SIDEBAR_KEYBOARD_STEP = 16;

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
  historyControls?: FileExplorerHistoryControls;
  onOpenNavigateDialog?: () => void;
  onOpenItem: (item: FileExplorerItem) => void;
  onNewFolder?: () => void;
  onUploadFile?: () => void;
  onNewRootFolder?: () => void;
  onUploadRootFile?: () => void;
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
  historyControls,
  onOpenNavigateDialog,
  onOpenItem,
  onNewFolder,
  onUploadFile,
  onNewRootFolder,
  onUploadRootFile,
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
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    targets: FileExplorerItem[];
  } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const explorerBodyRef = useRef<HTMLDivElement | null>(null);

  const maximumSidebarWidth = () => {
    const availableWidth = explorerBodyRef.current?.clientWidth;
    return availableWidth
      ? Math.max(
          MIN_SIDEBAR_WIDTH,
          Math.min(MAX_SIDEBAR_WIDTH, availableWidth * 0.6)
        )
      : MAX_SIDEBAR_WIDTH;
  };

  const clampSidebarWidth = (width: number) =>
    Math.min(maximumSidebarWidth(), Math.max(MIN_SIDEBAR_WIDTH, width));

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
        historyControls={historyControls}
        onNavigateBreadcrumb={(id) =>
          onNavigatePath(
            breadcrumbs.find((breadcrumb) => breadcrumb.id === id)?.path || '/'
          )
        }
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenNavigateDialog={onOpenNavigateDialog}
        loading={loading || searchLoading}
      />
      <Box
        ref={explorerBodyRef}
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          userSelect: isResizingSidebar ? 'none' : undefined,
        }}
      >
        {sidebar && (
          <Box
            sx={{
              display: 'flex',
              flexShrink: 0,
              height: '100%',
              position: 'relative',
              flexDirection: 'column',
              width: sidebarCollapsed ? 44 : sidebarWidth,
              transition: isResizingSidebar ? 'none' : 'width 160ms ease',
              bgcolor: 'background.paper',
              borderRight: sidebarCollapsed ? '2px solid' : undefined,
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 3,
                height: 44,
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                gap: 1,
                px: sidebarCollapsed ? 0.5 : 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              {!sidebarCollapsed && (
                <Box
                  component="span"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Files & folders
                </Box>
              )}
              <Tooltip
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                placement="right"
              >
                <IconButton
                  size="small"
                  aria-label={
                    sidebarCollapsed
                      ? 'Expand file explorer sidebar'
                      : 'Collapse file explorer sidebar'
                  }
                  aria-expanded={!sidebarCollapsed}
                  onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
                  sx={{ flexShrink: 0 }}
                >
                  {sidebarCollapsed ? (
                    <MenuIcon fontSize="small" />
                  ) : (
                    <ChevronLeftIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
            {sidebarCollapsed && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  py: 1,
                }}
              >
                {onNewRootFolder && (
                  <Tooltip title="New folder" placement="right">
                    <IconButton
                      size="small"
                      aria-label="Create folder in root directory"
                      onClick={onNewRootFolder}
                    >
                      <CreateNewFolderOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onUploadRootFile && (
                  <Tooltip title="Upload file" placement="right">
                    <IconButton
                      size="small"
                      aria-label="Upload file to root directory"
                      onClick={onUploadRootFile}
                    >
                      <UploadFileOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Root directory" placement="right">
                  <IconButton
                    size="small"
                    aria-label="Go to root directory"
                    onClick={() => onNavigatePath('/')}
                  >
                    <HomeOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            <Box
              aria-hidden={sidebarCollapsed}
              sx={{
                flex: '1 1 auto',
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
                visibility: sidebarCollapsed ? 'hidden' : 'visible',
              }}
            >
              {sidebar}
            </Box>
            <Box
              role="separator"
              aria-label="Resize file explorer sidebar"
              aria-orientation="vertical"
              aria-valuemin={MIN_SIDEBAR_WIDTH}
              aria-valuemax={MAX_SIDEBAR_WIDTH}
              aria-valuenow={Math.round(sidebarWidth)}
              tabIndex={sidebarCollapsed ? -1 : 0}
              onDoubleClick={() => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  setSidebarWidth((width) =>
                    clampSidebarWidth(width - SIDEBAR_KEYBOARD_STEP)
                  );
                } else if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  setSidebarWidth((width) =>
                    clampSidebarWidth(width + SIDEBAR_KEYBOARD_STEP)
                  );
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  setSidebarWidth(MIN_SIDEBAR_WIDTH);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  setSidebarWidth(maximumSidebarWidth());
                }
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                setIsResizingSidebar(true);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                  return;
                }
                const bodyLeft =
                  explorerBodyRef.current?.getBoundingClientRect().left ?? 0;
                setSidebarWidth(clampSidebarWidth(event.clientX - bodyLeft));
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                setIsResizingSidebar(false);
              }}
              onPointerCancel={() => setIsResizingSidebar(false)}
              sx={{
                display: sidebarCollapsed ? 'none' : 'block',
                position: 'absolute',
                right: -6,
                top: 0,
                bottom: 0,
                width: 12,
                cursor: 'col-resize',
                touchAction: 'none',
                zIndex: 2,
                outline: 0,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 5,
                  width: isResizingSidebar ? 3 : 2,
                  bgcolor: isResizingSidebar ? 'primary.main' : 'divider',
                },
                '&:hover::after, &:focus-visible::after': {
                  width: 3,
                  bgcolor: 'primary.main',
                },
                '&:hover .FileExplorerV2-resizeGrip, &:focus-visible .FileExplorerV2-resizeGrip':
                  {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    color: 'primary.contrastText',
                  },
              }}
            >
              <MoreVertIcon
                className="FileExplorerV2-resizeGrip"
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 18,
                  height: 30,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  color: 'text.secondary',
                  pointerEvents: 'none',
                  transition:
                    'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
                }}
              />
            </Box>
          </Box>
        )}
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
