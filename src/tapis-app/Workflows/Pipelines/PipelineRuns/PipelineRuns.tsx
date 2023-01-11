import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { useList as useListPipelineRuns } from 'tapis-hooks/workflows/pipelineruns';
import { useList as useListTaskExecutions } from 'tapis-hooks/workflows/taskexecutions';
import { useDetails } from 'tapis-hooks/workflows/pipelines';
import { SectionMessage, Collapse } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import styles from './PipelineRuns.module.scss';
import { Table, Button } from 'reactstrap';

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
  const { data, isLoading, error } = useListTaskExecutions({
    groupId,
    pipelineId,
    pipelineRunUuid,
  });
  const taskExecutions = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div>
        {taskExecutions.length > 0 ? (
          <Table dark bordered style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>task</th>
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
                      <td>{i}</td>
                      <td>{taskExecution.task}</td>
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

type PipelineRunProps = {
  groupId: string;
  pipelineId: string;
  pipelineRun: Workflows.PipelineRun;
};

const PipelineRun: React.FC<PipelineRunProps> = ({
  groupId,
  pipelineId,
  pipelineRun,
}) => {
  const [showTaskExecutions, setShowTaskExecutions] = useState(false);
  const { data, isLoading, error } = useDetails({ groupId, pipelineId });
  const pipeline: Workflows.Pipeline = data?.result!;

  const toggle = () => {
    setShowTaskExecutions(!showTaskExecutions);
  };

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {pipeline && (
        <Collapse
          title={`${pipelineRun.uuid}: ${pipelineRun.status}`}
          className={styles['pipeline-run-container']}
        >
          <div
            id={`pipelinerun-${pipelineRun.uuid}`}
            className={styles['pipeline-run-body']}
          >
            <Table dark bordered style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>pipeline</th>
                  <th>status</th>
                  <th>started at</th>
                  <th>last modified</th>
                  <th>uuid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{pipeline.id}</td>
                  <td>{pipelineRun.status}</td>
                  <td>{pipelineRun.started_at}</td>
                  <td>{pipelineRun.last_modified}</td>
                  <td>{pipelineRun.uuid}</td>
                </tr>
              </tbody>
            </Table>
            <div className={styles['section-header']}>
              <h2>Task Executions</h2>
            </div>
            <div className={styles['task-executions']}>
              {showTaskExecutions ? (
                <TaskExecutions
                  groupId={groupId}
                  pipelineId={pipelineId}
                  pipelineRunUuid={pipelineRun.uuid!}
                />
              ) : (
                <Button onClick={toggle}>Load Task Executions</Button>
              )}
            </div>
          </div>
        </Collapse>
      )}
    </QueryWrapper>
  );
};

type PipelineRunsProps = {
  groupId: string;
  pipelineId: string;
};

const PipelineRuns: React.FC<PipelineRunsProps> = ({ groupId, pipelineId }) => {
  const { data, isLoading, error } = useListPipelineRuns({
    groupId,
    pipelineId,
  });
  const pipelineRuns: Array<Workflows.PipelineRun> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div id="pipelineruns">
        <h2>
          Pipeline: <b>{pipelineId}</b>
        </h2>
        {pipelineRuns.length ? (
          pipelineRuns.map((pipelineRun) => (
            <PipelineRun
              groupId={groupId}
              pipelineId={pipelineId}
              pipelineRun={pipelineRun}
            />
          ))
        ) : (
          <SectionMessage type="info">
            No runs to show for pipeline '{pipelineId}'
          </SectionMessage>
        )}
      </div>
    </QueryWrapper>
  );
};

export default PipelineRuns;
