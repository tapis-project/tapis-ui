import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';

import { default as Pipelines } from '../Pipelines';
import { default as Pipeline } from '../Pipeline';
import { default as PipelineRuns } from '../PipelineRuns';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Pipelines />
      </Route>

      <Route path={`${path}/:groupId`} exact>
        <Pipelines />
      </Route>

      <Route path={`${path}/:groupId/:pipelineId`} exact>
        <Pipeline />
      </Route>

      <Route path={`${path}/:groupId/:pipelineId/runs`}>
        <PipelineRuns />
      </Route>
    </Switch>
  );
};

export default Router;
