import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import FileListing from '../FileListing';
import { SectionMessage } from 'tapis-ui/_common';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SectionMessage type="info">
          Select a system from the list.
        </SectionMessage>
      </Route>

      <Route
        path={`${path}/:systemId/:systemPath*`}
        render={({
          match: {
            params: { systemId, systemPath },
          },
        }: RouteComponentProps<{ systemId: string, systemPath?: string}>) => (
          <FileListing systemId={systemId} path={systemPath ?? '/'} />
        )}
      />
    </Switch>
  );
};

export default Router;
