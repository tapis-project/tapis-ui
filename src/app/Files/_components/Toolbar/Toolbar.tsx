import { Files, Systems } from '@tapis/tapis-typescript';
import React, { useState, useCallback } from 'react';
import { Button } from 'reactstrap';
import { Icon, QueryWrapper } from '@tapis/tapisui-common';
import styles from './Toolbar.module.scss';
import CreateDirModal from './CreateDirModal';
import MoveCopyModal from './MoveCopyModal';
import RenameModal from './RenameModal';
import UploadModal from './UploadModal';
import PermissionsModal from './PermissionsModal';
import DeleteModal from './DeleteModal';
import CreatePostitModal from './CreatePostitModal';
import TransferModal from './TransferModal';
import { useLocation } from 'react-router-dom';
import { useFilesSelect } from '../FilesContext';
import {
  Files as FilesHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import { useNotifications } from 'app/_components/Notifications';
import { Alert, AlertTitle } from '@mui/material';

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

export type ToolbarModalProps = {
  toggle: () => void;
  systemId?: string;
  path?: string;
};

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  icon,
  onClick,
  disabled = true,
  ...rest
}) => {
  return (
    <div>
      <Button
        disabled={disabled}
        onClick={onClick}
        className={styles['toolbar-btn']}
        {...rest}
      >
        <Icon name={icon}></Icon>
        <span> {text}</span>
      </Button>
    </div>
  );
};

type Op =
  | 'view'
  | 'download'
  | 'upload'
  | 'copy'
  | 'rename'
  | 'move'
  | 'folder'
  | 'delete'
  | 'transfers';

type ToolbarProps = {
  systemId: string;
  currentPath: string;
  buttons?: Array<Op>;
};

const Toolbar: React.FC<ToolbarProps> = ({
  systemId,
  currentPath,
  buttons = [],
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { selectedFiles } = useFilesSelect();
  const { pathname } = useLocation();

  const { download } = FilesHooks.useDownload();
  const { add } = useNotifications();

  const {
    data,
    isLoading: isLoadingPermissions,
    error: errorPermissions,
  } = FilesHooks.usePermissions({ systemId, path: currentPath });
  const permission = data?.result?.permission;
  const {
    data: systemData,
    isLoading,
    error,
    isSuccess,
  } = SystemsHooks.useDetails({
    systemId,
    select: 'allAttributes',
  });

  const system = systemData?.result ?? undefined;

  const canModify = useCallback(
    (
      system: Systems.TapisSystem | undefined,
      permission: Files.PermEnum | undefined
    ) => {
      if (system && system.isPublic) {
        return true;
      }

      if (permission === Files.PermEnum.Modify) {
        return true;
      }

      return false;
    },
    [systemId, currentPath]
  );

  const show = useCallback(
    (button: Op, include: Array<Op>): boolean => {
      if (include.length === 0) {
        return true;
      }

      return include.includes(button);
    },
    [systemId, currentPath, buttons]
  );

  const onDownload = useCallback(() => {
    selectedFiles.forEach((file) => {
      const params: FilesHooks.DownloadStreamParams = {
        systemId,
        path: file.path ?? '',
        destination: file.name ?? 'tapisfile',
      };
      const isZip = file.type === 'dir';
      if (isZip) {
        params.zip = true;
        params.destination = `${params.destination}.zip`;
        add({ icon: 'data-files', message: `Preparing download` });
        params.onStart = (response: Response) => {
          add({ icon: 'data-files', message: `Starting download` });
        };
      }
      download(params, {
        onError: isZip
          ? () => {
              add({
                icon: 'data-files',
                message: `Download failed`,
                status: 'ERROR',
              });
            }
          : undefined,
      });
    });
  }, [selectedFiles, add, download, systemId]);

  const toggle = () => {
    setModal(undefined);
  };
  return (
    <QueryWrapper
      isLoading={isLoading || isLoadingPermissions}
      error={[error, errorPermissions]}
    >
      <div id="file-operation-toolbar">
        {pathname !== '/files' && (
          <div className={styles['toolbar-wrapper']}>
            {show('view', buttons) && (
              <ToolbarButton
                text="View"
                icon="file"
                disabled={
                  selectedFiles.length !== 1 ||
                  selectedFiles[0].type !== Files.FileTypeEnum.File
                }
                onClick={() => setModal('postit')}
                aria-label="View file"
              />
            )}
            {show('rename', buttons) && (
              <ToolbarButton
                text="Rename"
                icon="rename"
                disabled={
                  selectedFiles.length !== 1 || !canModify(system, permission)
                }
                onClick={() => setModal('rename')}
                aria-label="Rename"
              />
            )}
            {show('move', buttons) && (
              <ToolbarButton
                text="Move"
                icon="move"
                disabled={
                  selectedFiles.length !== 1 || !canModify(system, permission)
                }
                onClick={() => setModal('move')}
                aria-label="Move"
              />
            )}
            {show('copy', buttons) && (
              <ToolbarButton
                text="Copy"
                icon="copy"
                disabled={
                  selectedFiles.length === 0 || !canModify(system, permission)
                }
                onClick={() => setModal('copy')}
                aria-label="Copy"
              />
            )}
            {/*
                <ToolbarButton
                  text="Permissions"
                  icon="gear"
                  disabled={selectedFiles.length !== 1 || permission !== Files.FilePermissionPermissionEnum.Modify}
                  onClick={() => setModal('permissions')}
                />
              */}
            {show('transfers', buttons) && (
              <ToolbarButton
                text="Transfers"
                icon="globe"
                disabled={false}
                onClick={() => setModal('transfer')}
              />
            )}
            {show('download', buttons) && (
              <ToolbarButton
                text="Download"
                icon="download"
                disabled={selectedFiles.length === 0}
                onClick={onDownload}
                aria-label="Download"
              />
            )}
            {show('upload', buttons) && (
              <ToolbarButton
                text="Upload"
                icon="upload"
                disabled={!canModify(system, permission)}
                onClick={() => {
                  setModal('upload');
                }}
                aria-label="Upload"
              />
            )}
            {show('folder', buttons) && (
              <ToolbarButton
                text="Folder"
                icon="add"
                disabled={!canModify(system, permission)}
                onClick={() => setModal('createdir')}
                aria-label="Add"
              />
            )}
            {show('delete', buttons) && (
              <ToolbarButton
                text="Delete"
                icon="trash"
                disabled={
                  selectedFiles.length !== 1 || !canModify(system, permission)
                }
                onClick={() => setModal('delete')}
                aria-label="Delete"
              />
            )}
            {modal === 'createdir' && (
              <CreateDirModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
              />
            )}
            {modal === 'copy' && (
              <MoveCopyModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
                operation={Files.MoveCopyRequestOperationEnum.Copy}
              />
            )}
            {modal === 'move' && (
              <MoveCopyModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
                operation={Files.MoveCopyRequestOperationEnum.Move}
              />
            )}
            {modal === 'rename' && (
              <RenameModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
              />
            )}
            {modal === 'transfer' && (
              <TransferModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
              />
            )}
            {modal === 'upload' && (
              <UploadModal
                toggle={toggle}
                path={currentPath}
                systemId={systemId}
              />
            )}
            {modal === 'permissions' && (
              <PermissionsModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
              />
            )}
            {modal === 'delete' && (
              <DeleteModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
              />
            )}
            {modal === 'postit' && (
              <CreatePostitModal
                toggle={toggle}
                systemId={systemId}
                path={currentPath}
              />
            )}
          </div>
        )}
      </div>
    </QueryWrapper>
  );
};

export default Toolbar;
