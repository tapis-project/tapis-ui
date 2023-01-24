import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { useList } from 'tapis-hooks/workflows/pipelineruns';
import { SectionMessage, SectionHeader } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import styles from './PipelineRuns.module.scss';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Toolbar } from '../../_components';
import { RunPipelineModal } from '../../_components/Toolbar/RunPipelineModal';

type PipelineRunProps = {
  order: number;
  groupId: string;
  pipelineId: string;
  pipelineRun: Workflows.PipelineRun;
};

const PipelineRun: React.FC<PipelineRunProps> = ({
  order,
  groupId,
  pipelineId,
  pipelineRun,
}) => {
  return (
    <tr>
      <td className={styles['center']}>{order}</td>
      <td>{pipelineRun.status}</td>
      <td>{pipelineRun.started_at}</td>
      <td>{pipelineRun.last_modified}</td>
      <td>{pipelineRun.uuid}</td>
      <td className={styles['center']}>
        <Link
          to={`/workflows/pipelines/${groupId}/${pipelineId}/runs/${pipelineRun.uuid}`}
        >
          View
        </Link>
      </td>
    </tr>
  );
};

type PipelineRunsProps = {
  groupId: string;
  pipelineId: string;
};

const PipelineRuns: React.FC<PipelineRunsProps> = ({ groupId, pipelineId }) => {
  const { data, isLoading, error } = useList({
    groupId,
    pipelineId,
  });
  const result: Array<Workflows.PipelineRun> = data?.result ?? [];
  const pipelineRuns = result.sort((a, b) =>
    a.started_at! < b.started_at! ? 1 : a.started_at! > b.started_at! ? -1 : 0
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const toggle = () => {
    setShowModal(!showModal);
  };

  return (
    <div className={styles['grid']}>
      <SectionHeader>{pipelineId}</SectionHeader>
      <Toolbar
        buttons={['runpipeline']}
        pipelineId={pipelineId}
        groupId={groupId}
      />
      <QueryWrapper isLoading={isLoading} error={error}>
        <div id="pipelineruns">
          {pipelineRuns.length ? (
            <Table dark bordered style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th className={styles['center']}>#</th>
                  <th>status</th>
                  <th>started at</th>
                  <th>last modified</th>
                  <th>uuid</th>
                  <th>executions</th>
                </tr>
              </thead>
              <tbody>
                {pipelineRuns.map((pipelineRun, i) => (
                  <PipelineRun
                    order={pipelineRuns.length - i}
                    groupId={groupId}
                    pipelineId={pipelineId}
                    pipelineRun={pipelineRun}
                  />
                ))}
              </tbody>
            </Table>
          ) : (
            <SectionMessage type="info">
              No runs to show for pipeline '{pipelineId}'
            </SectionMessage>
          )}
        </div>
      </QueryWrapper>
      {showModal && groupId && pipelineId && (
        <RunPipelineModal
          groupId={groupId}
          pipelineId={pipelineId}
          toggle={toggle}
        />
      )}
    </div>
  );
};

export default PipelineRuns;
