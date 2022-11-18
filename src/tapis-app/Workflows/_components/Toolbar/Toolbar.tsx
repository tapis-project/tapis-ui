import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from 'tapis-ui/_common';
import styles from './Toolbar.module.scss';
import { CreatePipelineModal } from './CreatePipelineModal';
import { CreateTaskModal } from "./CreateTaskModal"
import { CreateGroupModal } from './CreateGroupModal';
import { CreateArchiveModal } from './CreateArchiveModal';
import { CreateIdentityModal } from './CreateIdentityModal';
import { AddGroupUserModal } from './AddGroupUserModal';

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
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

type WorkflowsToolbarProps = {
  groupId?: string;
  pipelineId?: string;
  buttons?: Array<string>;
};

const Toolbar: React.FC<WorkflowsToolbarProps> = ({
  groupId,
  pipelineId,
  buttons = []
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);

  const toggle = () => {
    setModal(undefined);
  };

  return (
    <div id="pipeline-toolbar">
      <div className={styles['toolbar-wrapper']}>
        {buttons.includes("creategroup") && (
          <ToolbarButton
            text="New Group"
            icon="add"
            disabled={false}
            onClick={() => setModal('creategroup')}
            aria-label="Create group"
          />
        )}
        {buttons.includes("createpipeline") && (
          <ToolbarButton
            text="New Pipeline"
            icon="add"
            disabled={false}
            onClick={() => setModal('createpipeline')}
            aria-label="Create pipeline"
          />
        )}
        {buttons.includes("createtask") && (
          <ToolbarButton
            text="New Task"
            icon="add"
            disabled={false}
            onClick={() => setModal('createtask')}
            aria-label="Create task"
          />
        )}
        {buttons.includes("createarchive") && (
          <ToolbarButton
            text="New Archive"
            icon="add"
            disabled={false}
            onClick={() => setModal('createarchive')}
            aria-label="Create archive"
          />
        )}
        {buttons.includes("createidentity") && (
          <ToolbarButton
            text="Create Identity"
            icon="add"
            disabled={false}
            onClick={() => setModal('createidentity')}
            aria-label="Create archive"
          />
        )}
        {buttons.includes("addgroupuser") && (
          <ToolbarButton
            text="Add User"
            icon="add"
            disabled={false}
            onClick={() => setModal('addgroupuser')}
            aria-label="Add user"
          />
        )}
        {modal === 'createpipeline' && (
          <CreatePipelineModal toggle={toggle} groupId={groupId} />
        )}
        {modal === 'createtask' && <CreateTaskModal groupId={groupId} pipelineId={pipelineId} toggle={toggle} />}
        {modal === 'creategroup' && <CreateGroupModal toggle={toggle} />}
        {modal === 'createarchive' && <CreateArchiveModal groupId={groupId} toggle={toggle} />}
        {modal === 'createidentity' && <CreateIdentityModal groupId={groupId} toggle={toggle} />}
        {modal === 'addgroupuser' && <AddGroupUserModal groupId={groupId} toggle={toggle} />}
      </div>
    </div>
  );
};

export default Toolbar;
