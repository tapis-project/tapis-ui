import React from 'react';
import { Workflows } from '@tapis/tapisui-hooks';
import { SectionMessage } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table } from 'reactstrap';
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
  // TODO Remove 'as' after typescript binding update
  const result = data?.result ?? [];
  const taskExecutions = result.sort((a, b) =>
    a.started_at! > b.started_at! ? 1 : a.started_at! < b.started_at! ? -1 : 0
  );

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
                      <td>
                        <div className={styles['logs']}>
                          {taskExecution.stdout}
                        </div>
                      </td>
                      <td>
                        <div className={styles['logs']}>
                          {taskExecution.stderr}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                );
              })}
          </Table>
        ) : (
          <SectionMessage type="info">No task executions</SectionMessage>
        )}
      </div>
    </QueryWrapper>
  );
};

export default TaskExecutions;
