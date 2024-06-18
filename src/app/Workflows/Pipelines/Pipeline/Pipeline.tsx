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
import { DagView } from "./_components/DagView"
import { useExtension } from 'extensions';

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
    <div id={`task-${task.id}`} className={`${styles["container"]}`}>
      <div className={`${styles['task-header']}`}>
        {task.id}
        <Button
          className={styles['remove-button']}
          type="button"
          color="danger"
          onClick={() => {
            removeAsync(
              { groupId, pipelineId, taskId: task.id },
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
        {isError && error}
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

enum ViewEnum {
  Default = 'Default',
  Dag = 'Dag',
}

const Pipeline: React.FC<PipelineProps> = ({ groupId, pipelineId }) => {
  const { extension } = useExtension()
  const [view, setView] = useState<ViewEnum>(
    (extension?.serviceCustomizations.workflows?.dagDefaultView && ViewEnum.Dag)
    || ViewEnum.Default
  );
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
    <QueryWrapper isLoading={isLoadingPipeline} error={pipelineError}>
      {pipeline && (
        <div id={`pipeline`} className={styles['grid']}>
          <SectionHeader>
            <span>
              Tasks <span className={styles['count']}>{tasks.length}</span>
            </span>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={() => setView(ViewEnum.Default)}
                active={view === ViewEnum.Default}
              >
                Default
              </Button>
              <Button
                size="sm"
                onClick={() => setView(ViewEnum.Dag)}
                active={view === ViewEnum.Dag}
              >
                DAG
              </Button>
            </ButtonGroup>
          </SectionHeader>
          <Toolbar
            buttons={['createtask', 'runpipeline']}
            groupId={groupId}
            pipelineId={pipelineId}
          />
          
          {
            view == ViewEnum.Dag ?
            <DagView
              tasks={tasks}
              pipelineId={pipelineId}
              groupId={groupId}
            /> :
            <div>
              <Table dark bordered style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th className={styles['center']}>id</th>
                    <th>uuid</th>
                    <th>last run</th>
                    <th>previous run</th>
                    <th className={styles['center']}>runs</th>
                  </tr>
                </thead>
                <tbody>
                  <td className={styles['center']}>{pipeline.id}</td>
                  <td>{pipeline.uuid}</td>
                  <td>
                    {pipeline.current_run && (
                      <Link
                        to={`/workflows/pipelines/${groupId}/${pipelineId}/runs/${pipeline.current_run}`}
                      >
                        view
                      </Link>
                    )}
                  </td>
                  <td>
                    {pipeline.last_run && (
                      <Link
                        to={`/workflows/pipelines/${groupId}/${pipelineId}/runs/${pipeline.last_run}`}
                      >
                        view
                      </Link>
                    )}
                  </td>
                  <td className={styles['center']}>
                    <Link to={`/workflows/pipelines/${groupId}/${pipelineId}/runs`}>
                      view
                    </Link>
                  </td>
                </tbody>
              </Table>
              <QueryWrapper isLoading={isLoadingTasks} error={listTasksError}>
                {tasks.length ? (
                  <div id={'default-task-view'}>
                    {tasks.map((task) => {
                      return (
                        <div id="tasks" key={task.id} className={`${styles['tasks']}`}>
                          <Task task={task} groupId={groupId} pipelineId={pipelineId} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <SectionMessage type="info">No tasks</SectionMessage>
                )}
              </QueryWrapper>
            </div>
          }
        </div>
      )}
    </QueryWrapper>
  );
};

export default Pipeline;
