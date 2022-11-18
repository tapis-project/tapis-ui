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
      <Route path={`${path}`} exact>
        <Archives />
      </Route>

      <Route
        path={`${path}/:groupId`}
        exact
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => <Archives groupId={groupId}/>
      }
      />

    </Switch>
  );
};

export default Router;
