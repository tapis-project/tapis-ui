import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { default as Pipeline } from '../Pipeline';

const Router: React.FC = () => {
  return (
    <Switch>
      <Route
        path={`/workflows/pipelines/:groupId/:pipelineId`}
        render={({
          match: {
            params: { groupId, pipelineId },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
        }>) => <Pipeline groupId={groupId} pipelineId={pipelineId} />}
      />
    </Switch>
  );
};

export default Router;
