import React from 'react';
import {
  Route,
  useRouteMatch,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import { Models, LocalModels } from '../../Models';
import ModelsByPlatform from '../ModelsByPlatform';
import ModelDetails from '../ModelDetails';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Models />
      </Route>

      <Route path={`${path}/local`} exact>
        <LocalModels />
      </Route>

      <Route
        path={`${path}/platform/:platform/:modelId`}
        render={({
          match: {
            params: { platform, modelId },
          },
        }: RouteComponentProps<{ platform: string; modelId: string }>) => {
          return <ModelDetails platform={platform} modelId={modelId} />;
        }}
      />

      <Route path={`${path}/platform/:platform`}>
        <ModelsByPlatform />
      </Route>
    </Switch>
  );
};

export default Router;
