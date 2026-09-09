import React, { useState } from 'react';
import styles from './AppsToolbar.module.scss';
import CreateAppModal from './CreateAppModal';
import { Add, RocketLaunch, Update } from '@mui/icons-material';
import UpdateAppModal from './UpdateAppModal';
import { Apps } from '@tapis/tapis-typescript';
import JobLaunchModal from './JobLaunchModal';
import PodBarButton from 'app/Pods/_utils/PodBarButton';

type ToolbarButtonProps = {
  text: string;
  icon: any;
  onClick: () => void;
  disabled: boolean;
};

export type ToolbarModalProps = {
  toggle: () => void;
};

/** the house bar button — the same press every landing's actions wear;
 *  these were the last default-MUI outlined buttons on a landing page */
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  icon,
  onClick,
  disabled = true,
  ...rest
}) => {
  return (
    <PodBarButton onClick={onClick} disabled={disabled} {...rest}>
      {icon &&
        React.cloneElement(icon, {
          sx: { fontSize: 14, mr: 0.25, verticalAlign: 'text-top' },
        })}
      {text}
    </PodBarButton>
  );
};

type AppsToolbarProps = {
  include?: Array<'create' | 'update' | 'submit'>;
  app?: Apps.RespApp | undefined;
  /**
   * Riding a head line beside chips rather than sitting under a table.
   * The stylesheet's half-em top margin is right above a toolbar's own
   * row and wrong inside a centered flex line, where it drops the
   * buttons below everything next to them.
   */
  inline?: boolean;
};

const AppsToolbar: React.FC<AppsToolbarProps> = ({
  app,
  include = ['create'],
  inline,
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);

  const toggle = () => {
    setModal(undefined);
  };
  return (
    <div id="file-operation-toolbar">
      <div
        className={styles['toolbar-wrapper']}
        style={{ justifyContent: 'right', marginTop: inline ? 0 : undefined }}
      >
        {app && include.includes('submit') && (
          <ToolbarButton
            text="submit job"
            icon={<RocketLaunch />}
            disabled={false}
            onClick={() => setModal('submitapp')}
            aria-label="submitapp"
          />
        )}
        {app && include.includes('update') && (
          <ToolbarButton
            text="Update"
            icon={<Update />}
            disabled={false}
            onClick={() => setModal('updateapp')}
            aria-label="updateapp"
          />
        )}
        {include.includes('create') && (
          <ToolbarButton
            text="new app"
            icon={<Add />}
            disabled={false}
            onClick={() => setModal('createapp')}
            aria-label="createapp"
          />
        )}
        {modal === 'createapp' && <CreateAppModal toggle={toggle} />}
        {modal === 'updateapp' && app && (
          <UpdateAppModal app={app} toggle={toggle} />
        )}
        {modal === 'submitapp' && app && (
          <JobLaunchModal app={app} toggle={toggle} />
        )}
      </div>
    </div>
  );
};

export default AppsToolbar;
