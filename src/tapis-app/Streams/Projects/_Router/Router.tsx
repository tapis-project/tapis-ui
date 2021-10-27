import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import Sites from "../../Sites";
import { ProjectsNav } from '../_components';
import {
  PageLayout,
  LayoutHeader
} from 'tapis-ui/_common';

const Router: React.FC = () => {

  const header = (
    <LayoutHeader>
      <div>Projects</div>
    </LayoutHeader>
  );
  
  const body = (
    <ProjectsNav />
  );

  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <PageLayout top={header} left={body} />
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
