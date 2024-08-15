import { Workflows } from '@tapis/tapis-typescript';
import React from 'react';

const PipelineRunDuration: React.FC<{
  run: Workflows.PipelineRun;
  style?: React.CSSProperties;
}> = ({ run, style }) => {
  const startedAt = Date.parse(run.started_at!);
  const lastModified = Date.parse(run.last_modified!);
  const duration = `${Math.floor(
    (lastModified - startedAt) / 1000 / 60
  )}m ${Math.floor(((lastModified - startedAt) / 1000) % 60)}s`;
  return <div style={style}>{duration}</div>;
};

export default PipelineRunDuration;
