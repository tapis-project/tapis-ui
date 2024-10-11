import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './DagViewHeader.module.scss';
import React, { useState } from 'react';
import {
  PipelineRunSummary,
  PipelineRunLogs,
  PipelineRunDuration,
} from 'app/Workflows/Pipelines/PipelineRuns/_components';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { Workflows } from '@tapis/tapis-typescript';
import { JSONDisplay } from '@tapis/tapisui-common';

type DagViewHeaderProps = {
  groupId: string;
  pipelineId: string;
  pipelineRunUuid: string | undefined;
  pipeline?: Workflows.Pipeline;
};

const DagViewHeader: React.FC<DagViewHeaderProps> = ({
  groupId,
  pipelineId,
  pipelineRunUuid,
  pipeline,
}) => {
  if (pipelineRunUuid === undefined) {
    return '';
  }
  const [open, setOpen] = useState<string | undefined>(undefined);
  const { data, isError, error, isLoading } = Hooks.PipelineRuns.useDetails({
    groupId,
    pipelineId,
    pipelineRunUuid,
  });
  const run = data?.result || {};
  return (
    <div className={styles['header']}>
      {isError && error.message}
      {isLoading ? (
        'Loading...'
      ) : (
        <div>
          <PipelineRunSummary status={run.status}>
            {pipelineId}
            <Link
              style={{ color: '#707070' }}
              to={`/workflows/pipelines/${groupId}/${pipelineId}/runs/${pipelineRunUuid}`}
            >
              {run.name || '?'}
            </Link>
            <PipelineRunDuration style={{ fontSize: '12px' }} run={run} />
            <Button
              size="small"
              onClick={() => {
                setOpen(open !== 'logs' ? 'logs' : undefined);
              }}
            >
              {open !== 'logs' ? 'show logs' : 'hide logs'}
            </Button>
            {pipeline && (
              <Button
                size="small"
                onClick={() => {
                  setOpen(open !== 'json' ? 'json' : undefined);
                }}
              >
                {open !== 'json' ? 'view json' : 'hide json'}
              </Button>
            )}
          </PipelineRunSummary>
          {open === 'logs' && (
            <div style={{ marginTop: '16px' }}>
              <PipelineRunLogs logs={run.logs} />
            </div>
          )}
          {open === 'json' && pipeline && (
            <div style={{ marginTop: '16px' }}>
              <JSONDisplay json={pipeline} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DagViewHeader;
