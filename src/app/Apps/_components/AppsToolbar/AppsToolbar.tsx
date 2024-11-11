import React, { useState } from 'react';
// import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './AppsToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import CreateAppModal from './CreateAppModal';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';

type ToolbarButtonProps = {
  text: string;
  icon: any;
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

const AppsToolbar: React.FC = () => {
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
            text="Create App"
            icon={<Add />}
            disabled={false}
            onClick={() => setModal('createApp')}
            aria-label="createApp"
          />
          {modal === 'createApp' && <CreateAppModal toggle={toggle} />}
        </div>
      )}
    </div>
  );
};

export default AppsToolbar;
