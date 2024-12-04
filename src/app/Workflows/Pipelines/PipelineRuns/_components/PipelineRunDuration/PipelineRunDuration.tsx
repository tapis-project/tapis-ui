import { Workflows } from '@tapis/tapis-typescript';
import React, { useEffect, useState } from 'react';
import { AccessTime } from '@mui/icons-material';

const PipelineRunDuration: React.FC<{
  run: Workflows.PipelineRun;
  style?: React.CSSProperties;
}> = ({ run, style }) => {
  const isTerminal = (status: Workflows.EnumRunStatus) => {
    if (
      [
        Workflows.EnumRunStatus.Failed,
        Workflows.EnumRunStatus.Completed,
        Workflows.EnumRunStatus.Terminated,
        Workflows.EnumRunStatus.Suspended,
      ].includes(status)
    ) {
      return true;
    }

    return false;
  };
  const startedAt = Date.parse(run.started_at!);
  const now = Date.parse(run.last_modified!);
  let initialTime = [
    Math.floor((now - startedAt) / 1000 / 60),
    Math.floor(((now - startedAt) / 1000) % 60),
  ];
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (run.status && isTerminal(run.status)) {
      return;
    }
    const interval = setInterval(() => {
      let newTime;
      if (time[1] === 59) {
        newTime = [time[0] + 1, 0];
      } else {
        newTime = [time[0], time[1] + 1];
      }
      setTime(newTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  return (
    <div style={style}>
      <AccessTime fontSize="small" style={{ marginTop: '-2px' }} /> {time[0]}m{' '}
      {time[1]}s
    </div>
  );
};

export default PipelineRunDuration;
