import React from 'react';
import {
  Route,
  useRouteMatch,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import { Models } from '../../Models';
import ModelsByPlatform from '../../Models/ModelsByPlatform';
import ModelDetails from '../../Models/ModelDetails';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Models />
      </Route>

      <Route
        path={`${path}/platforms/:platform/models/:modelId*`}
        render={({
          match: {
            params: { platform, modelId },
          },
        }: RouteComponentProps<{ platform: string; modelId?: string }>) => {
          console.log({ platform, modelId });
          return <ModelDetails platform={platform} modelId={modelId!} />;
        }}
      />

      <Route path={`${path}/platforms/:platform/models`}>
        <ModelsByPlatform />
      </Route>
    </Switch>
  );
};

export default Router;
