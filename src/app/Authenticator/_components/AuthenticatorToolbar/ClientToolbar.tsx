import React, { useState } from 'react';
// import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './ClientToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import CreateClientModal from '../ClientCard/ClientCardModals/CreateClientModal';
// import CreateUserCredentialModal from './CreateUserCredentialModal';
import { Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

type ToolbarButtonProps = {
  text: string;
  icon: any;
  onClick: () => void;
  disabled: boolean;
  [key: string]: any;
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
        startIcon={icon}
        variant="outlined"
        size="small"
        {...rest}
      >
        <span>{text}</span>
      </Button>
    </div>
  );
};

const ClientToolbar: React.FC = () => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { pathname } = useLocation();

  const toggle = () => {
    setModal(undefined);
  };
  // Handling of the modal state
  return (
    <div id="file-operation-toolbar">
      {pathname && (
        <div className={styles['toolbar-wrapper']}>
          <ToolbarButton
            text="Create Client"
            icon={<Add />}
            disabled={false}
            onClick={() => setModal('createclient')}
            aria-label="createClient"
          />
          {modal === 'createclient' && <CreateClientModal toggle={toggle} />}
        </div>
      )}
    </div>
  );
};

export default ClientToolbar;
