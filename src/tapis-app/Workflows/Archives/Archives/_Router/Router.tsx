import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';

import { default as Archives } from '../Archives';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`/workflows/archives`} exact>
        <Archives />
      </Route>

      <Route
        path={`/workflows/archives/:groupId`}
        exact
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => <Archives groupId={groupId} />}
      />
    </Switch>
  );
};

export default Router;
