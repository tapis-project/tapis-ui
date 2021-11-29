import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { SitesNav } from '../_components';
import Instruments from '../../Instruments';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';

const Router: React.FC<{ projectId: string }> = ({ projectId }) => {
  const header = (
    <LayoutHeader>
      <div>Sites</div>
    </LayoutHeader>
  );

  const body = <SitesNav projectId={projectId} />;

  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <PageLayout top={header} left={body} />;
      </Route>

      <Route
        path={`${path}/:siteId`}
        render={({
          match: {
            params: { siteId },
          },
        }: RouteComponentProps<{ siteId: string }>) => (
          <Instruments projectId={projectId} siteId={siteId} />
        )}
      />
    </Switch>
  );
};

export default Router;
