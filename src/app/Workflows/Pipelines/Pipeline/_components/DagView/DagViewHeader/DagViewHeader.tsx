import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './DagViewHeader.module.scss';
import React, { useState } from 'react';
import {
  PipelineRunSummary,
  PipelineRunLogs,
} from 'app/Workflows/Pipelines/PipelineRuns/_components';

type DagViewHeaderProps = {
  groupId: string;
  pipelineId: string;
  pipelineRunUuid: string | undefined;
};

const DagViewHeader: React.FC<DagViewHeaderProps> = ({
  groupId,
  pipelineId,
  pipelineRunUuid,
}) => {
  if (pipelineRunUuid === undefined) {
    return '';
  }
  const [open, setOpen] = useState(false);
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
          <PipelineRunSummary
            status={run.status}
            text={`${pipelineId} - ${run.name || '?'}`}
          />
          {open && <PipelineRunLogs logs={run.logs} />}
        </div>
      )}
    </div>
  );
};

export default DagViewHeader;
