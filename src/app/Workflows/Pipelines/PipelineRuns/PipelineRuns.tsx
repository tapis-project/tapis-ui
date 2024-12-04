import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import styles from './PipelineRuns.module.scss';
import { useHistory, useLocation } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  AccordionActions,
} from '@mui/material';
import { Table } from 'reactstrap';
import {
  PipelineRunSummary,
  PipelineRunLogs,
  PipelineRunDuration,
} from './_components';

type PipelineRunsProps = {
  groupId: string;
  pipelineId: string;
};

const PipelineRuns: React.FC<PipelineRunsProps> = ({ groupId, pipelineId }) => {
  const { data, isLoading, error } = Hooks.PipelineRuns.useList({
    groupId,
    pipelineId,
  });
  const result: Array<Workflows.PipelineRun> = data?.result ?? [];
  const pipelineRuns = result.sort((a, b) =>
    a.started_at! < b.started_at! ? 1 : a.started_at! > b.started_at! ? -1 : 0
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <div className={styles['grid']}>
      <QueryWrapper isLoading={isLoading} error={error}>
        <div id="pipelineruns" className={styles['runs']}>
          {pipelineRuns.length ? (
            pipelineRuns.map((run, i) => {
              return (
                <Accordion defaultExpanded={i === 0 ? true : undefined}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="pipeline-run-summary"
                    id={`pipeline-${pipelineId}-run-summary-${i}`}
                  >
                    <PipelineRunSummary status={run.status}>
                      {run.name}
                    </PipelineRunSummary>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table
                      dark
                      bordered
                      style={{ margin: 0 }}
                      className={styles['runs-table']}
                    >
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'center' }}>#</th>
                          <th>name</th>
                          <th>status</th>
                          <th>duration</th>
                          <th>started</th>
                          <th>last modified</th>
                        </tr>
                      </thead>
                      <tr>
                        <th style={{ textAlign: 'center' }} scope="row">
                          {pipelineRuns.length - i}
                        </th>
                        <td>{run.name}</td>
                        <td>{run.status}</td>
                        <td>{<PipelineRunDuration run={run} />}</td>
                        <td>{run.started_at}</td>
                        <td>{run.last_modified}</td>
                      </tr>
                    </Table>
                    <PipelineRunLogs logs={run.logs} />
                  </AccordionDetails>
                  <AccordionActions>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        history.push(`${pathname}/${run.uuid}`);
                      }}
                    >
                      View
                    </Button>
                  </AccordionActions>
                </Accordion>
              );
            })
          ) : (
            <SectionMessage type="info">
              No runs to show for pipeline '{pipelineId}'
            </SectionMessage>
          )}
        </div>
      </QueryWrapper>
    </div>
  );
};

export default PipelineRuns;
