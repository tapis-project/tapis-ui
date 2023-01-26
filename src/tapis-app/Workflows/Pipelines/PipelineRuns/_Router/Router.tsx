import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { default as PipelineRuns } from '../PipelineRuns';
import { default as TaskExecutions } from '../TaskExecutions';

const Router: React.FC = () => {
  return (
    <Switch>
      <Route
        path={`/workflows/pipelines/:groupId/:pipelineId/runs`}
        exact
        render={({
          match: {
            params: { groupId, pipelineId },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
        }>) => <PipelineRuns groupId={groupId} pipelineId={pipelineId} />}
      />
      <Route
        path={`/workflows/pipelines/:groupId/:pipelineId/runs/:pipelineRunUuid`}
        render={({
          match: {
            params: { groupId, pipelineId, pipelineRunUuid },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
          pipelineRunUuid: string;
        }>) => (
          <TaskExecutions
            groupId={groupId}
            pipelineId={pipelineId}
            pipelineRunUuid={pipelineRunUuid}
          />
        )}
      />
    </Switch>
  );
};

export default Router;
