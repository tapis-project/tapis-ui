import React from 'react';
import { Workflows } from '@tapis/tapisui-hooks';
import { SectionMessage } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table } from 'reactstrap';
import {
  Gantt,
  Task,
  EventOption,
  StylingOption,
  ViewMode,
  DisplayOption,
} from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

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
  // TODO Remove 'as' after typescript binding update
  const result = data?.result ?? [];
  const taskExecutions = result.sort((a, b) =>
    a.started_at! > b.started_at! ? 1 : a.started_at! < b.started_at! ? -1 : 0
  );

  const tasks: Array<Task | undefined> = taskExecutions.map((taskExecution) => {
    console.log({ taskExecution });
    if (
      taskExecution.started_at === undefined ||
      taskExecution.last_modified === undefined
    ) {
      console.log(taskExecution.task_id);
      return undefined;
    }

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
      <div>
        {taskExecutions.length > 0 ? (
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
              taskExecutions.map((taskExecution, i) => {
                return (
                  <tbody>
                    <tr>
                      <td>{i + 1}</td>
                      <td>{taskExecution.task_id}</td>
                      <td>{taskExecution.status}</td>
                      <td>{taskExecution.started_at || 'unknown'}</td>
                      <td>{taskExecution.last_modified || 'unknown'}</td>
                      <td>{taskExecution.uuid}</td>
                      <td>{taskExecution.stdout}</td>
                      <td>{taskExecution.stderr}</td>
                    </tr>
                  </tbody>
                );
              })}
          </Table>
        ) : (
          <SectionMessage type="info">No task executions</SectionMessage>
        )}
      </div>
      {!tasks.includes(undefined) && !(taskExecutions.length < 1) && (
        <Gantt
          tasks={tasks as Array<Task>}
          headerHeight={0}
          listCellWidth={''}
          viewMode={ViewMode.Hour}
        />
      )}
    </QueryWrapper>
  );
};

export default TaskExecutions;
