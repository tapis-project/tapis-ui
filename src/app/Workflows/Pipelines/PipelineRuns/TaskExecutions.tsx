import React from 'react';
import { Workflows } from '@tapis/tapisui-hooks';
import { SectionMessage } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table } from 'reactstrap';
import {
  Gantt,
  Task,
  ViewMode,
} from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import styles from './TaskExecutions.module.scss';

type TaskExecutionsProps = {
  groupId: string;
  pipelineId: string;
  pipelineRunUuid: string;
};

const TaskExecutions: React.FC<TaskExecutionsProps> = ({
  groupId,
  pipelineId,
  pipelineRunUuid,
}) => {
  const { data, isLoading, error } = Workflows.TaskExecutions.useList({
    groupId,
    pipelineId,
    pipelineRunUuid,
  });

  const result = data?.result ?? [];
  const taskExecutions = result.sort((a, b) =>
    a.started_at! > b.started_at! ? 1 : a.started_at! < b.started_at! ? -1 : 0
  );

  const tasks: Array<Task> = taskExecutions.map((taskExecution) => {
    return {
      start: new Date(Date.parse(taskExecution.started_at!)),
      end: new Date(Date.parse(taskExecution.last_modified!)),
      name: taskExecution.task_id!,
      id: taskExecution.task_id!,
      type: 'task',
      progress: 100,
      isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    };
  });

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div className={styles['task-executions-container']}> 
        {taskExecutions.length > 0 ? (
          <div className={styles['table-container']}>
            <Table dark bordered style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>task id</th>
                  <th>status</th>
                  <th>started at</th>
                  <th>last modified</th>
                  <th>uuid</th>
                  <th>stdout</th>
                  <th>stderr</th>
                </tr>
              </thead>
              {taskExecutions.length &&
                taskExecutions.map((taskExecution, i) => ( // Added index to map function
                  <tbody key={taskExecution.uuid}>
                    <tr>
                      <td>{i + 1}</td>
                      <td>{taskExecution.task_id}</td>
                      <td>{taskExecution.status}</td>
                      <td>{taskExecution.started_at}</td>
                      <td>{taskExecution.last_modified}</td>
                      <td>{taskExecution.uuid}</td>
                      <td>{taskExecution.stdout}</td>
                      <td>{taskExecution.stderr}</td>
                    </tr>
                  </tbody>
                ))}
            </Table>
          </div>
        ) : (
          <SectionMessage type="info">No task executions</SectionMessage>
        )}
      </div>
      <div className={styles['gantt-container']}>
        <Gantt
          tasks={tasks}
          headerHeight={0}
          listCellWidth={''}
          viewMode={ViewMode.Hour}
        />
      </div>
    </QueryWrapper>
  );
};

export default TaskExecutions;
