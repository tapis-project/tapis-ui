import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon, ConfirmModal } from '@tapis/tapisui-common';
import styles from './JobsToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import UnhideJobModal from './UnhideJobModal';

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

const JobsLayoutToolbar: React.FC = () => {
  const url = window.location.href;
  const jobUuid = url.substring(url.indexOf('jobs/') + 5);
  console.log(jobUuid.includes('jobs'));
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { pathname } = useLocation();
  const { isLoading, isError, isSuccess, error, hideJob } = Hooks.useHideJob();

  const toggle = () => {
    setModal(undefined);
  };

  return (
    <div id="file-operation-toolbar">
      {pathname && (
        <div className={styles['toolbar-wrapper']}>
          <ToolbarButton
            text="Hide Job"
            icon="trash"
            disabled={jobUuid.includes('jobs')}
            onClick={() => setModal('ConfirmModal')}
            aria-label="hideJob"
          />
          <ToolbarButton
            text="Unhide Job"
            icon="trash"
            disabled={false}
            onClick={() => setModal('UnhideJobModal')}
            aria-label="unhideJob"
          />

          {modal === 'ConfirmModal' && (
            <ConfirmModal
              toggle={toggle}
              onConfirm={() => {
                hideJob(jobUuid);
              }}
              isLoading={isLoading}
              isError={isError}
              isSuccess={isSuccess}
              error={error}
            />
          )}
          {modal === 'UnhideJobModal' && <UnhideJobModal toggle={toggle} />}
        </div>
      )}
    </div>
  );
};

export default JobsLayoutToolbar;
