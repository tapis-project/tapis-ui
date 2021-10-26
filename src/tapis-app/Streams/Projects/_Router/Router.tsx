import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import Sites from "../../Sites";
import { ProjectsNav } from '../_components';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <ProjectsNav />
      </Route>

      <Route
        path={`${path}/:projectId`}
        render={({
          match: {
            params: { projectId },
          },
        }: RouteComponentProps<{ projectId: string }>) => (
          <Sites projectId={projectId} />
        )}
      />
    </Switch>
  );
};

export default Router;
