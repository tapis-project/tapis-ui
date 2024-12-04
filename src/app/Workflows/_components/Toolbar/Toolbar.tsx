import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './Toolbar.module.scss';
import { CreatePipelineModal } from './CreatePipelineModal';
// import { CreateTaskModal } from './CreateTaskModal';
import { CreateGroupModal } from './CreateGroupModal';
import { CreateArchiveModal } from './CreateArchiveModal';
import { CreateIdentityModal } from './CreateIdentityModal';
import { AddGroupUsersModal } from './AddGroupUsersModal';
import { RunPipelineModal } from './RunPipelineModal';
import { Workflows } from '@tapis/tapis-typescript';
import {
  CreateTaskModal,
  CreateSecretModal,
  AddGroupSecretModal,
} from '../Modals';

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
  pipeline?: Workflows.Pipeline;
  buttons?: Array<string>;
};

const Toolbar: React.FC<WorkflowsToolbarProps> = ({
  groupId,
  pipelineId,
  pipeline = undefined,
  buttons = [],
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);

  const toggle = () => {
    setModal(undefined);
  };

  return (
    <div id="pipeline-toolbar">
      <div className={styles['toolbar-wrapper']}>
        {buttons.includes('creategroup') && (
          <ToolbarButton
            text="New Group"
            icon="add"
            disabled={false}
            onClick={() => setModal('creategroup')}
            aria-label="Create group"
          />
        )}
        {buttons.includes('createsecret') && (
          <ToolbarButton
            text="Create secret"
            icon="add"
            disabled={false}
            onClick={() => setModal('createsecret')}
            aria-label="Create secret"
          />
        )}
        {buttons.includes('addgroupsecret') && (
          <ToolbarButton
            text="Add group secret"
            icon="add"
            disabled={false}
            onClick={() => setModal('addgroupsecret')}
            aria-label="Add group secret"
          />
        )}
        {buttons.includes('createpipeline') && (
          <ToolbarButton
            text="New Pipeline"
            icon="add"
            disabled={false}
            onClick={() => setModal('createpipeline')}
            aria-label="Create pipeline"
          />
        )}
        {buttons.includes('createtask') && (
          <ToolbarButton
            text="New Task"
            icon="add"
            disabled={false}
            onClick={() => setModal('createtask')}
            aria-label="Create task"
          />
        )}
        {buttons.includes('createarchive') && (
          <ToolbarButton
            text="New Archive"
            icon="add"
            disabled={false}
            onClick={() => setModal('createarchive')}
            aria-label="Create archive"
          />
        )}
        {buttons.includes('createidentity') && (
          <ToolbarButton
            text="New Identity"
            icon="add"
            disabled={false}
            onClick={() => setModal('createidentity')}
            aria-label="Create identity"
          />
        )}
        {buttons.includes('addgroupuser') && (
          <ToolbarButton
            text="Add Users"
            icon="add"
            disabled={false}
            onClick={() => setModal('addgroupusers')}
            aria-label="Add user"
          />
        )}
        {buttons.includes('runpipeline') && (
          <ToolbarButton
            text="Run Pipeline"
            icon="publications"
            disabled={false}
            onClick={() => setModal('runpipeline')}
            aria-label="Add user"
          />
        )}
        {modal === 'createpipeline' && groupId && (
          <CreatePipelineModal toggle={toggle} groupId={groupId} />
        )}
        {groupId && (
          <AddGroupSecretModal
            open={modal === 'addgroupsecret'}
            groupId={groupId}
            toggle={toggle}
          />
        )}
        {groupId && pipelineId && (
          <CreateTaskModal
            open={modal === 'createtask'}
            groupId={groupId}
            pipelineId={pipelineId}
            toggle={toggle}
          />
        )}
        <CreateSecretModal open={modal === 'createsecret'} toggle={toggle} />
        {modal === 'runpipeline' && groupId && pipelineId && pipeline && (
          <RunPipelineModal
            groupId={groupId}
            pipelineId={pipelineId}
            pipeline={pipeline}
            toggle={toggle}
          />
        )}
        {modal === 'creategroup' && <CreateGroupModal toggle={toggle} />}
        {modal === 'createarchive' && groupId && (
          <CreateArchiveModal groupId={groupId} toggle={toggle} />
        )}
        {modal === 'createidentity' && <CreateIdentityModal toggle={toggle} />}
        {modal === 'addgroupusers' && groupId && (
          <AddGroupUsersModal groupId={groupId} toggle={toggle} />
        )}
      </div>
    </div>
  );
};

export default Toolbar;
