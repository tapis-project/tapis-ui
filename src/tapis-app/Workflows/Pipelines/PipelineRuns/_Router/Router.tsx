import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { default as PipelineRuns } from '../PipelineRuns';

const Router: React.FC = () => {
  return (
    <Switch>
      <Route
        path={`/workflows/pipelines/:groupId/:pipelineId/runs`}
        render={({
          match: {
            params: { groupId, pipelineId },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
        }>) => <PipelineRuns groupId={groupId} pipelineId={pipelineId} />}
      />
    </Switch>
  );
};

export default Router;
