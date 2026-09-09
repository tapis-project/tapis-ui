import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
  useLocation,
} from 'react-router-dom';
import FileListing from '../FileListing';
import FilesOverview from '../_components/FilesOverview';

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
        <FilesOverview />
      </Route>

      <Route
        path={`${path}/:systemId/:systemPath*`}
        render={({
          match: {
            params: { systemId, systemPath },
          },
        }: RouteComponentProps<{ systemId: string; systemPath?: string }>) => {
          return (
            <div
              // No top or side inset: the shell's right-pane margin is the
              // page's, the same as the overview and every Pods page. This
              // had a margin of its own on top of that, so the explorer sat
              // half a rem further in than the page it belongs to.
              style={{
                paddingBottom: '16px',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <FileListing
                systemId={systemId}
                path={systemPath ?? '/'}
                location={pathname}
              />
            </div>
          );
        }}
      />
    </Switch>
  );
};

export default Router;
