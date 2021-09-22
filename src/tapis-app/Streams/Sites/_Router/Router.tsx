import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { SitesNav } from '../_components';
import Instruments from "../../Instruments";

const Router: React.FC<{ projectId: string }> = ({
  projectId
}) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SitesNav projectId={projectId} />
      </Route>

      <Route
        path={`${path}/:siteId`}
        render={({
          match: {
            params: { siteId }
          }
        }: RouteComponentProps<{ siteId: string }>) => (
          <Instruments projectId={projectId} siteId={siteId} />
        )}
      />
    </Switch>
  );
};

export default Router;
