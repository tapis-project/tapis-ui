import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from 'tapis-ui/_common';
import styles from './JobsToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import ConfirmModal from 'tapis-ui/_common/ConfirmModal';
import { useCancel } from 'tapis-hooks/jobs';

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

const JobsToolbar: React.FC<{ jobUuid: string }> = ({ jobUuid }) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { pathname } = useLocation();
  const { isLoading, isError, isSuccess, error, cancel } = useCancel();

  


  const toggle = () => {
    setModal(undefined);
  };

  return (
    <div id="file-operation-toolbar">
      {pathname && (
        <div className={styles["toolbar-wrapper"]}>
          <ToolbarButton
            text="Cancel Job"
            icon="trash"
            disabled={false}
            onClick={() => setModal("ConfirmModal")}
            aria-label="createSystem"
          />

          {modal === "ConfirmModal" && (
            <ConfirmModal
              toggle={toggle}
              onConfirm={() => {
                cancel({ jobUuid });
              }}
              isLoading={isLoading}
              isError={isError}
              isSuccess={isSuccess}
              error={error}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default JobsToolbar;

// JobUuid = pathname.split("/")[2]