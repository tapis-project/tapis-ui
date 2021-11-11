import { Files } from '@tapis/tapis-typescript';
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from 'tapis-ui/_common';
import styles from './Toolbar.module.scss';
import CreateDirModal from './CreateDirModal';
import CopyMoveModal from './CopyMoveModal';
import RenameModal from './RenameModal';
import PermissionsModal from './PermissionsModal';
import DeleteModal from './DeleteModal';
import { useLocation } from 'react-router-dom';
import { useFilesSelect } from '../FilesContext';
import { useDownload, DownloadStreamParams } from 'tapis-hooks/files';
import { useNotifications } from 'tapis-app/_components/Notifications';

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
  const { download } = useDownload();
  const { add } = useNotifications();
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
            disabled={selectedFiles.length !== 1}
            onClick={() => setModal('rename')}
            aria-label="Rename"
          />
          <ToolbarButton
            text="Move"
            icon="move"
            disabled={selectedFiles.length === 0}
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
          <ToolbarButton
            text="Permissions"
            icon="toolbox"
            disabled={selectedFiles.length !== 1}
            onClick={() => setModal('permissions')}
          />
          <ToolbarButton
            text="Download"
            icon="download"
            disabled={selectedFiles.length !== 1}
            onClick={() => {
              const params: DownloadStreamParams = {
                systemId,
                path: selectedFiles[0].path ?? '',
                destination: selectedFiles[0].name ?? 'tapisfile',
              }
              const isZip = selectedFiles[0].type === 'dir';
              if (isZip) {
                params.zip = true;
                params.destination = `${params.destination}.zip`;
                const notificationId = add({ icon: 'data-files', message: `Preparing download`});
                params.onStart = (response: Response) => { 
                  add({ icon: 'data-files', message: `Starting download`});
                };
              }
              download(
                params,
                {
                  onError: isZip
                    ? () => {
                        add({
                          icon: 'data-files',
                          message: `Download failed`,
                          status: 'ERROR'
                        })
                      }
                    : undefined
                }
              );
            }}
            aria-label="Download"
          />
          <ToolbarButton
            text="Upload"
            icon="upload"
            disabled={false}
            onClick={() => {
              console.log('Toolbar button');
            }}
            aria-label="Upload"
          />
          <ToolbarButton
            text="Folder"
            icon="add"
            disabled={false}
            onClick={() => setModal('createdir')}
            aria-label="Add"
          />
          <ToolbarButton
            text="Delete"
            icon="trash"
            disabled={selectedFiles.length === 0}
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
            <CopyMoveModal
              toggle={toggle}
              systemId={systemId}
              path={currentPath}
              operation={Files.MoveCopyRequestOperationEnum.Copy}
            />
          )}
          {modal === 'move' && (
            <CopyMoveModal
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
