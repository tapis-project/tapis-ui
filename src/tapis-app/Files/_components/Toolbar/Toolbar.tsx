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
import TransferModal from './TransferModal';
import { useLocation } from 'react-router-dom';
import { useFilesSelect } from '../FilesContext';

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
            icon="gear"
            disabled={selectedFiles.length !== 1}
            onClick={() => setModal('permissions')}
          />
          <ToolbarButton
            text="Transfers"
            icon="globe"
            disabled={false}
            onClick={() => setModal('transfer')}
          />
          <ToolbarButton
            text="Download"
            icon="download"
            disabled={
              selectedFiles.length !== 1 ||
              (selectedFiles.length === 1 && selectedFiles[0].type !== 'file')
            }
            onClick={() => {
              console.log('Toolbar button');
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
          {modal === 'transfer' && (
            <TransferModal
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
