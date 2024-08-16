import React, { useState, useCallback } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, SectionHeader, Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Link } from 'react-router-dom';
import { Toolbar } from '../../_components';
import styles from './Pipeline.module.scss';
import { Button, ButtonGroup, Table } from 'reactstrap';
import { useQueryClient } from 'react-query';
import { DagView, Menu } from './_components';
import { useExtension } from 'extensions';
import { Alert } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

type TaskProps = {
  task: Workflows.Task;
  groupId: string;
  pipelineId: string;
};

const Task: React.FC<TaskProps> = ({ task, groupId, pipelineId }) => {
  const { removeAsync, isLoading, isError, error, isSuccess, reset } =
    Hooks.Tasks.useDelete();

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.Tasks.queryKeys.list);
    reset();
  }, [queryClient, reset]);

  return (
    <div id={`task-${task.id}`} className={`${styles['container']}`}>
      <div className={`${styles['task-header']}`}>
        {task.id}
        <Button
          className={styles['remove-button']}
          type="button"
          color="danger"
          onClick={() => {
            removeAsync(
              { groupId, pipelineId, taskId: task.id ?? '' },
              { onSuccess }
            );
          }}
          size="sm"
          disabled={isLoading || isSuccess}
        >
          <QueryWrapper isLoading={isLoading} error={error}>
            <Icon name="trash" />
          </QueryWrapper>
        </Button>
      </div>
      <div className={`${styles['task-body']}`}>
        <p>
          <b>type: </b>
          {task.type}
        </p>
        <p>
          <b>description: </b>
          {task.description || <i>None</i>}
        </p>
        {isError && error && <Alert severity="error">{error.message}</Alert>}
      </div>
      {!!task?.depends_on?.length && (
        <div>
          <div className={`${styles['task-header']}`}>dependencies</div>
          <div className={`${styles['task-body']}`}>
            {task.depends_on.map((dependency) => {
              return <p>{dependency.id}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

type PipelineProps = {
  groupId: string;
  pipelineId: string;
  tab?: string;
};

const Pipeline: React.FC<PipelineProps> = ({
  groupId,
  pipelineId,
  tab = 'tasks',
}) => {
  const {
    data: pipelineData,
    isLoading: isLoadingPipeline,
    error: pipelineError,
  } = Hooks.Pipelines.useDetails({ groupId, pipelineId });

  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    error: listTasksError,
  } = Hooks.Tasks.useList({ groupId, pipelineId });

  const pipeline: Workflows.Pipeline = pipelineData?.result!;
  const tasks: Array<Workflows.Task> = tasksData?.result! || [];

  return (
    <QueryWrapper
      isLoading={isLoadingPipeline || isLoadingTasks}
      error={pipelineError || listTasksError}
    >
      {pipeline && tasks && (
        <div id={`pipeline`} className={styles['grid']}>
          {tab === 'tasks' && <DagView pipeline={pipeline} groupId={groupId} />}
          {tab === 'execprofile' && <>Exec Profile</>}
          {tab === 'env' && <>Env</>}
          {tab === 'params' && <>Parameters</>}
          {tab === 'uses' && <>Inheritance</>}
        </div>
      )}
    </QueryWrapper>
  );
};

export default Pipeline;
