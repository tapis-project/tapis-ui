import { Files } from '@tapis/tapis-typescript';
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from 'tapis-ui/_common';
import styles from './Toolbar.module.scss';
import CreateDirModal from './CreateDirModal';
import CopyMoveModal from './CopyMoveModal';
import RenameModal from './RenameModal';
import DeleteModal from './DeleteModal';
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
}) => {
  return (
    <div>
      <Button
        disabled={disabled}
        onClick={onClick}
        className={styles['toolbar-btn']}
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
          />
          <ToolbarButton
            text="Move"
            icon="move"
            disabled={selectedFiles.length === 0}
            onClick={() => setModal('move')}
          />
          <ToolbarButton
            text="Copy"
            icon="copy"
            disabled={selectedFiles.length === 0}
            onClick={() => setModal('copy')}
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
          />
          <ToolbarButton
            text="Upload"
            icon="upload"
            disabled={true}
            onClick={() => {
              console.log('Toolbar button');
            }}
          />
          <ToolbarButton
            text="Folder"
            icon="add"
            disabled={!(selectedFiles.length === 0)}
            onClick={() => setModal('createdir')}
          />
          <ToolbarButton
            text="Trash"
            icon="trash"
            disabled={selectedFiles.length === 0}
            onClick={() => setModal('delete')}
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
