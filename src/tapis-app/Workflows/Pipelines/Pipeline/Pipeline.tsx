import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { useDetails } from 'tapis-hooks/workflows/pipelines';
import { SectionMessage, SectionHeader } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Link } from 'react-router-dom';
import { Toolbar } from '../../_components';
import styles from './Pipeline.module.scss';

type TaskProps = {
  task: Workflows.Task;
};

const Task: React.FC<TaskProps> = ({ task }) => {
  return (
    <div id={`task-${task.id}`} className={`${styles['task']}`}>
      <div className={`${styles['task-header']}`}>{task.id}</div>
      <div className={`${styles['task-body']}`}>
        <p>
          <b>type: </b>
          {task.type}
        </p>
        <p>
          <b>description: </b>
          {task.description || <i>None</i>}
        </p>
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
};

const Pipeline: React.FC<PipelineProps> = ({ groupId, pipelineId }) => {
  const { data, isLoading, error } = useDetails({ groupId, pipelineId });
  const pipeline: Workflows.Pipeline = data?.result!;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {pipeline && (
        <div id={`pipeline`}>
          <h2>
            {pipeline.id}{' '}
            <Link to={`/workflows/pipelines/${groupId}/${pipeline.id}/runs`}>
              View Runs
            </Link>
          </h2>
          <Toolbar
            buttons={['createtask', 'runpipeline']}
            groupId={groupId}
            pipelineId={pipelineId}
          />
          <SectionHeader>Tasks</SectionHeader>
          {pipeline.tasks?.length ? (
            pipeline.tasks?.map((task) => {
              return (
                <div id="tasks" key={task.id} className={`${styles['tasks']}`}>
                  <Task task={task} />
                </div>
              );
            })
          ) : (
            <SectionMessage type="info">No tasks</SectionMessage>
          )}
        </div>
      )}
    </QueryWrapper>
  );
};

export default Pipeline;
