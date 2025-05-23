import React, { useState } from 'react';
import styles from './AppsToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import CreateAppModal from './CreateAppModal';
import { Button } from '@mui/material';
import { Add, Update } from '@mui/icons-material';
import UpdateAppModal from './UpdateAppModal';
import { Apps } from '@tapis/tapis-typescript';

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

type AppsToolbarProps = {
  include?: Array<"create" | "update">
  app?: Apps.RespApp | undefined
}

const AppsToolbar: React.FC<AppsToolbarProps> = ({
  app,
  include = ["create"]
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);

  const toggle = () => {
    setModal(undefined);
  };
  return (
    <div id="file-operation-toolbar">
      <div className={styles['toolbar-wrapper']} style={{justifyContent: "right"}}>
        {
          app && include.includes("update") && (
            <ToolbarButton
              text="Update"
              icon={<Update />}
              disabled={false}
              onClick={() => setModal('updateapp')}
              aria-label="updateapp"
            />
          )
        }
        {
          include.includes("create") && (
            <ToolbarButton
              text="new"
              icon={<Add />}
              disabled={false}
              onClick={() => setModal('createapp')}
              aria-label="createapp"
            />
          )
        }
        {modal === 'createapp' && <CreateAppModal toggle={toggle} />}
        {modal === 'updateapp' && app && <UpdateAppModal app={app} toggle={toggle} />}
      </div>
    </div>
  );
};

export default AppsToolbar;
