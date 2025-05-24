import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { SectionMessage } from '@tapis/tapisui-common';
import AppsToolbar from '../_components/AppsToolbar';
import AppDetails from '../AppDetails';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <div
          style={{
            margin: '1rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'auto',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'right' }}>
            <AppsToolbar />
          </div>
          <SectionMessage type="info">
            Select an app from the list.
          </SectionMessage>
        </div>
      </Route>

      <Route
        path={`${path}/:appId/:appVersion`}
        exact
        render={({
          match: {
            params: { appVersion, appId },
          },
        }: RouteComponentProps<{
          appId: string;
          appVersion: string;
        }>) => {
          return <AppDetails appId={appId} appVersion={appVersion} />;
        }}
      />
    </Switch>
  );
};

export default Router;
