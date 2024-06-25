import { Files } from '@tapis/tapis-typescript';
import React, { useState, useCallback } from 'react';
import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './Toolbar.module.scss';
import CreateDirModal from './CreateDirModal';
import MoveCopyModal from './MoveCopyModal';
import RenameModal from './RenameModal';
import UploadModal from './UploadModal';
import PermissionsModal from './PermissionsModal';
import DeleteModal from './DeleteModal';
import TransferModal from './TransferModal';
import { useLocation } from 'react-router-dom';
import { useFilesSelect } from '../FilesContext';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { useNotifications } from 'app/_components/Notifications';

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

const Toolbar: React.FC = () => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { selectedFiles } = useFilesSelect();
  const { pathname } = useLocation();
  const systemId = pathname.split('/')[2];
  const currentPath = pathname.split('/').splice(3).join('/');
  const { download } = Hooks.useDownload();
  const { add } = useNotifications();

  const { data } = Hooks.usePermissions({ systemId, path: currentPath });
  const permission = data?.result?.permission;

  const onDownload = useCallback(() => {
    selectedFiles.forEach((file) => {
      // TODO Consider making the DownloadStreamParams in a type in this file
      const params: Hooks.DownloadStreamParams = {
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
    <div id="file-operation-toolbar">
      {pathname !== '/files' && (
        <div className={styles['toolbar-wrapper']}>
          <ToolbarButton
            text="Rename"
            icon="rename"
            disabled={
              selectedFiles.length !== 1 ||
              permission !== Files.FilePermissionPermissionEnum.Modify
            }
            onClick={() => setModal('rename')}
            aria-label="Rename"
          />
          <ToolbarButton
            text="Move"
            icon="move"
            disabled={
              selectedFiles.length === 0 ||
              permission !== Files.FilePermissionPermissionEnum.Modify
            }
            onClick={() => setModal('move')}
            aria-label="Move"
          />
          <ToolbarButton
            text="Copy"
            icon="copy"
            disabled={selectedFiles.length === 0}
            onClick={() => setModal('copy')}
            aria-label="Copy"
          />
          {/*
              <ToolbarButton
                text="Permissions"
                icon="gear"
                disabled={selectedFiles.length !== 1 || permission !== Files.FilePermissionPermissionEnum.Modify}
                onClick={() => setModal('permissions')}
              />
            */}
          <ToolbarButton
            text="Transfers"
            icon="globe"
            disabled={false}
            onClick={() => setModal('transfer')}
          />
          <ToolbarButton
            text="Download"
            icon="download"
            disabled={selectedFiles.length === 0}
            onClick={onDownload}
            aria-label="Download"
          />
          <ToolbarButton
            text="Upload"
            icon="upload"
            disabled={permission !== Files.FilePermissionPermissionEnum.Modify}
            onClick={() => {
              setModal('upload');
            }}
            aria-label="Upload"
          />
          <ToolbarButton
            text="Folder"
            icon="add"
            disabled={permission !== Files.FilePermissionPermissionEnum.Modify}
            onClick={() => setModal('createdir')}
            aria-label="Add"
          />
          <ToolbarButton
            text="Delete"
            icon="trash"
            disabled={
              selectedFiles.length === 0 ||
              permission !== Files.FilePermissionPermissionEnum.Modify
            }
            onClick={() => setModal('delete')}
            aria-label="Delete"
          />
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
        </div>
      )}
    </div>
  );
};

export default Toolbar;
