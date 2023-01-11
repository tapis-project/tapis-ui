import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { default as Pipelines } from '../Pipelines';

const Router: React.FC = () => {
  return (
    <Switch>
      <Route path={`/workflows/pipelines`} exact>
        <Pipelines />
      </Route>
      <Route
        path={`/workflows/pipelines/:groupId`}
        exact
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => <Pipelines groupId={groupId} />}
      />
    </Switch>
  );
};

export default Router;
