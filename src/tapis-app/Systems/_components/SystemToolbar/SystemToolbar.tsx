import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from 'tapis-ui/_common';
import styles from './SystemToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import CreateSystemModal from './CreateSystemModal';
import DeleteSystemModal from './DeleteSystemModal';
import UndeleteSystemModal from './UndeleteSystemModal';

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

export type ToolbarModalProps = {
  toggle: () => void;
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

const SystemToolbar: React.FC = () => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { pathname } = useLocation();

  const toggle = () => {
    setModal(undefined);
  };
  return (
    <div id="file-operation-toolbar">
      {pathname && (
        <div className={styles['toolbar-wrapper']}>
          <ToolbarButton
            text="Create"
            icon="add"
            disabled={false}
            onClick={() => setModal('createsystem')}
            aria-label="createSystem"
          />
          <ToolbarButton
            text="Delete"
            icon="trash"
            disabled={false}
            onClick={() => setModal('deletesystem')}
            aria-label="deleteSystem"
          />
          <ToolbarButton
            text="Undelete"
            icon="add"
            disabled={false}
            onClick={() => setModal('undeletesystem')}
            aria-label="undeleteSystem"
          />

          {modal === 'createsystem' && <CreateSystemModal toggle={toggle} />}
          {modal === 'deletesystem' && <DeleteSystemModal toggle={toggle} />}
          {modal === 'undeletesystem' && (
            <UndeleteSystemModal toggle={toggle} />
          )}
        </div>
      )}
    </div>
  );
};

export default SystemToolbar;
