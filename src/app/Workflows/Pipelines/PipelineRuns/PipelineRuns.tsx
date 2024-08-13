import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, SectionHeader } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import styles from './PipelineRuns.module.scss';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  AccordionActions,
} from '@mui/material';
import { Table } from 'reactstrap';

type PipelineRunProps = {
  order: number;
  groupId: string;
  pipelineId: string;
  pipelineRun: Workflows.PipelineRun;
};

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
              const startedAt = Date.parse(run.started_at!);
              const lastModified = Date.parse(run.last_modified!);
              const duration = `${Math.floor(
                (lastModified - startedAt) / 1000 / 60
              )}m ${Math.floor(((lastModified - startedAt) / 1000) % 60)}s`;
              return (
                <Accordion defaultExpanded={i === 0 ? true : undefined}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="pipeline-run-summary"
                    id={`pipeline-${pipelineId}-run-summary-${i}`}
                  >
                    <b>{run.name}</b>
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
                          <th>#</th>
                          <th>name</th>
                          <th>status</th>
                          <th>duration</th>
                          <th>started</th>
                          <th>last modified</th>
                        </tr>
                      </thead>
                      <tr>
                        <th scope="row">{pipelineRuns.length - i}</th>
                        <td>{run.name}</td>
                        <td>{run.status}</td>
                        <td>{duration}</td>
                        <td>{run.started_at}</td>
                        <td>{run.last_modified}</td>
                      </tr>
                    </Table>
                    <pre className={styles['logs']}>{run.logs}</pre>
                  </AccordionDetails>
                  <AccordionActions>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        history.push(`${pathname}/${run.uuid}`);
                      }}
                    >
                      View Task Executions
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
