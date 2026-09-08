import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Files, Systems } from '@tapis/tapis-typescript';
import {
  FileExplorerV2,
  HostEvalNavigationButton,
  type FileExplorerAction,
  type FileExplorerItem,
} from '@tapis/tapisui-common';
import {
  Files as FilesHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import { useHistory } from 'react-router-dom';
import { useNotifications } from 'app/_components/Notifications';
import { useFilesSelect } from '../_components/FilesContext';
import ToolbarModalHost, {
  type FileToolbarModal,
} from '../_components/Toolbar/ToolbarModalHost';
import LazyFilesTree from './LazyFilesTree';
import {
  fileInfoPath,
  filesV2Breadcrumbs,
  normalizeFilePath,
  toFileExplorerItem,
  toFilesV2Route,
} from './utils';
import { fileExplorerModalByActionId, getFileExplorerActions } from './actions';

export interface FilesV2ExplorerProps {
  systemId: string;
  path: string;
}

export default function Explorer({ systemId, path }: FilesV2ExplorerProps) {
  const history = useHistory();
  const { add } = useNotifications();
  const { selectedFiles, setSelectedFiles } = useFilesSelect();
  const [modal, setModal] = useState<FileToolbarModal>();
  const [modalPath, setModalPath] = useState(path);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigateDialogOpen, setNavigateDialogOpen] = useState(false);
  const [navigatePathInput, setNavigatePathInput] = useState(path);
  const listing = FilesHooks.useList({ systemId, path }, { retry: 0 });
  const permissions = FilesHooks.usePermissions({ systemId, path });
  const rootPermissions = FilesHooks.usePermissions({ systemId, path: '/' });
  const systemQuery = SystemsHooks.useDetails({
    systemId,
    select: 'allAttributes',
  });
  const { download } = FilesHooks.useDownload();

  useEffect(() => {
    setSelectedFiles([]);
    setSearchQuery('');
  }, [path, systemId, setSelectedFiles]);

  useEffect(() => {
    if (
      searchQuery.trim() &&
      listing.hasNextPage &&
      !listing.isFetchingNextPage &&
      !listing.isError
    ) {
      listing.fetchNextPage();
    }
  }, [
    searchQuery,
    listing.hasNextPage,
    listing.isFetchingNextPage,
    listing.isError,
    listing.fetchNextPage,
  ]);

  const files = listing.concatenatedResults || [];
  const fileByPath = useMemo(
    () =>
      new Map(files.map((file) => [fileInfoPath(file, path), file] as const)),
    [files, path]
  );
  const items = useMemo(
    () => files.map((file) => toFileExplorerItem(file, path)),
    [files, path]
  );
  const selectedIds = selectedFiles.map((file) => fileInfoPath(file, path));
  const system = systemQuery.data?.result;
  const canModify =
    system?.isPublic ||
    permissions.data?.result?.permission === Files.PermEnum.Modify;
  const canModifyRoot =
    system?.isPublic ||
    rootPermissions.data?.result?.permission === Files.PermEnum.Modify;

  const navigate = useCallback(
    (nextPath: string) => history.push(toFilesV2Route(systemId, nextPath)),
    [history, systemId]
  );

  const openNavigateDialog = useCallback(() => {
    setNavigatePathInput(path);
    setNavigateDialogOpen(true);
  }, [path]);

  const navigateFromDialog = useCallback(() => {
    if (!navigatePathInput.trim()) return;
    setNavigateDialogOpen(false);
    navigate(normalizeFilePath(navigatePathInput));
  }, [navigate, navigatePathInput]);

  const navigateFromHostVariable = useCallback(
    (nextPath: string) => {
      setNavigateDialogOpen(false);
      navigate(nextPath);
    },
    [navigate]
  );

  const setSelection = useCallback(
    (ids: string[]) => {
      setSelectedFiles(
        ids.flatMap((id) => {
          const file = fileByPath.get(id);
          return file ? [file] : [];
        })
      );
    },
    [fileByPath, setSelectedFiles]
  );

  const getActionsForItems = useCallback(
    (targets: FileExplorerItem[]) =>
      getFileExplorerActions(targets, !!canModify),
    [canModify]
  );

  const openModalForItems = useCallback(
    (nextModal: FileToolbarModal, targets: FileExplorerItem[]) => {
      setSelection(targets.map((target) => target.id));
      setModalPath(path);
      setModal(nextModal);
    },
    [path, setSelection]
  );

  const openDirectoryModal = useCallback(
    (nextModal: FileToolbarModal, targetPath = path) => {
      setModalPath(targetPath);
      setModal(nextModal);
    },
    [path]
  );

  const executeAction = useCallback(
    (selectedAction: FileExplorerAction, targets: FileExplorerItem[]) => {
      if (selectedAction.id === 'download') {
        targets.forEach((target) => {
          const file = fileByPath.get(target.id);
          if (!file) return;
          const isDirectory = file.type === Files.FileTypeEnum.Dir;
          if (isDirectory) {
            add({ icon: 'data-files', message: 'Preparing download' });
          }
          download(
            {
              systemId,
              path: file.path || target.id,
              destination: `${file.name || 'tapisfile'}${
                isDirectory ? '.zip' : ''
              }`,
              zip: isDirectory || undefined,
              onStart: isDirectory
                ? () =>
                    add({ icon: 'data-files', message: 'Starting download' })
                : undefined,
            },
            {
              onError: () => {
                add({
                  icon: 'data-files',
                  status: 'ERROR',
                  message: 'Download failed',
                });
              },
            }
          );
        });
        return;
      }
      const modalId =
        fileExplorerModalByActionId[
          selectedAction.id as keyof typeof fileExplorerModalByActionId
        ];
      if (modalId) openModalForItems(modalId, targets);
    },
    [add, download, fileByPath, openModalForItems, systemId]
  );

  const openItem = useCallback(
    (item: FileExplorerItem) => {
      if (item.type === 'directory') navigate(item.id);
      else openModalForItems('postit', [item]);
    },
    [navigate, openModalForItems]
  );

  const openTreeFile = useCallback(
    (file: Files.FileInfo) => {
      setSelectedFiles([file]);
      setModalPath(path);
      setModal('postit');
    },
    [path, setSelectedFiles]
  );

  const showHostEvalButton =
    system?.systemType === Systems.SystemTypeEnum.Linux &&
    system?.isDynamicEffectiveUser &&
    (!system.rootDir || system.rootDir === '/');

  return (
    <>
      <FileExplorerV2
        systemId={systemId}
        systemHost={system?.host}
        path={path}
        items={items}
        breadcrumbs={filesV2Breadcrumbs(systemId, path)}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelection}
        getActionsForItems={getActionsForItems}
        onExecuteAction={executeAction}
        onNavigatePath={navigate}
        onOpenNavigateDialog={openNavigateDialog}
        onOpenItem={openItem}
        onNewFolder={
          canModify ? () => openDirectoryModal('createdir') : undefined
        }
        onUploadFile={
          canModify ? () => openDirectoryModal('upload') : undefined
        }
        onTransfers={() => openDirectoryModal('transfer')}
        sidebar={
          <LazyFilesTree
            systemId={systemId}
            currentPath={path}
            onNavigate={navigate}
            onOpenFile={openTreeFile}
            onNewRootFolder={
              canModifyRoot
                ? () => openDirectoryModal('createdir', '/')
                : undefined
            }
            onNewRootFile={
              canModifyRoot
                ? () => openDirectoryModal('upload', '/')
                : undefined
            }
          />
        }
        loading={listing.isLoading}
        error={listing.error || null}
        hasNextPage={listing.hasNextPage}
        isFetchingNextPage={listing.isFetchingNextPage}
        onLoadMore={() => listing.fetchNextPage()}
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSelectedFiles([]);
          setSearchQuery(value);
        }}
        searchLoading={Boolean(
          searchQuery.trim() &&
            (listing.hasNextPage || listing.isFetchingNextPage)
        )}
      />
      <ToolbarModalHost
        modal={modal}
        toggle={() => {
          setModal(undefined);
          listing.refetch();
        }}
        systemId={systemId}
        path={modalPath}
      />
      <Dialog
        open={navigateDialogOpen}
        onClose={() => setNavigateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            navigateFromDialog();
          },
        }}
      >
        <DialogTitle>Navigate to directory</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter an absolute path on {systemId}.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Directory path"
            placeholder="/path/to/directory"
            value={navigatePathInput}
            onChange={(event) => setNavigatePathInput(event.target.value)}
            helperText="Paths are resolved from the system root."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {showHostEvalButton && (
            <Box sx={{ mr: 'auto' }}>
              <HostEvalNavigationButton
                systemId={systemId}
                isAuthenticated={!permissions.isLoading && !permissions.error}
                variant="v2"
                onNavigate={navigateFromHostVariable}
              />
            </Box>
          )}
          <Button onClick={() => setNavigateDialogOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!navigatePathInput.trim()}
          >
            Navigate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
