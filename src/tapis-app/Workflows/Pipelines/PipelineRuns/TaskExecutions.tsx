import React from 'react';
import { useList } from 'tapis-hooks/workflows/taskexecutions';
import { SectionMessage } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Table } from 'reactstrap';

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
  const { data, isLoading, error } = useList({
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
                <th>uuid</th>
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
                      <td>{taskExecution.started_at}</td>
                      <td>{taskExecution.last_modified}</td>
                      <td>{taskExecution.uuid}</td>
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
