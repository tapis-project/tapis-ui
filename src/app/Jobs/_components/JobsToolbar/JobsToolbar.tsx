import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './JobsToolbar.module.scss';
import { useLocation, useHistory } from 'react-router-dom';
import { ConfirmModal } from '@tapis/tapisui-common';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';

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
  const { isLoading, isError, isSuccess, error, cancel } = Hooks.useCancel();
  const { data } = Hooks.useDetails(jobUuid);
  const job: Jobs.Job | undefined = data?.result;

  const toggle = () => {
    setModal(undefined);
  };

  const history = useHistory();
  const handleClickFiles = () => {
    if (job) {
      const path = `/files/${job.execSystemId}${job.execSystemOutputDir}`;
      history.push(path);
    }
  };
  // Check if the job is in a non-terminal state
  const isCancelable =
    job && !['FINISHED', 'FAILED', 'CANCELLED'].includes(job.status ?? '');

  return (
    <div id="file-operation-toolbar">
      {pathname && (
        <div className={styles['toolbar-wrapper']}>
          <ToolbarButton
            text="See Files"
            icon="copy"
            disabled={false}
            onClick={handleClickFiles}
            aria-label="createSystem"
          />
          <ToolbarButton
            text="Cancel Job"
            icon="trash"
            disabled={isCancelable ? false : true}
            onClick={() => setModal('ConfirmModal')}
            aria-label="cancelJob" // Updated aria-label to be more descriptive
          />

          {modal === 'ConfirmModal' && (
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
