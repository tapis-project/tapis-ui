import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';

import { default as Groups } from '../Groups';
import { Users } from '../Users';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={path} exact>
        <Groups />
      </Route>

      <Route
        path={`${path}/:groupId`}
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => <Users groupId={groupId} />}
      />
    </Switch>
  );
};

export default Router;
