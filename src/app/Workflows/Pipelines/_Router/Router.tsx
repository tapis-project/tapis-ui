import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { default as PipelinesLayout } from '../Pipelines';
import { default as PipelineLayout } from '../Pipeline';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <PipelinesLayout />
      </Route>

      <Route path={`${path}/:groupId`} exact>
        <PipelinesLayout />
      </Route>

      <Route path={`${path}/:groupId/:pipelineId`}>
        <PipelineLayout />
      </Route>
    </Switch>
  );
};

export default Router;
