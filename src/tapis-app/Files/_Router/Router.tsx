import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
  useLocation,
} from 'react-router-dom';
import FileListing from '../FileListing';
import { SectionMessage } from 'tapis-ui/_common';

export const backLocation = (
  systemPath: string | undefined,
  pathname: string
) =>
  systemPath ? `${pathname.split('/').slice(0, -2).join('/')}/` : undefined;

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  const { pathname } = useLocation();

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
        }: RouteComponentProps<{ systemId: string; systemPath?: string }>) => {
          return (
            <FileListing
              systemId={systemId}
              path={systemPath ?? '/'}
              location={pathname}
            />
          );
        }}
      />
    </Switch>
  );
};

export default Router;
