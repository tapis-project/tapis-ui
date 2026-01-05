import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import IngestionDetail from '../Ingestions/IngestionDetail';
import IngestModel from '../Ingestions/IngestModel';
import { Dashboard } from '../Dashboard';
import { Layout as ModelsLayout } from '../Models/_Layout';
import { Layout as DatasetsLayout } from '../Datasets/_Layout';
import { Models, NativeModelsSearch } from '../Models';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Dashboard />
      </Route>

      <Route path={`${path}/models`} exact>
        <NativeModelsSearch />
      </Route>

      <Route path={`${path}/platforms`}>
        <ModelsLayout />
      </Route>

      <Route path={`${path}/datasets`}>
        <DatasetsLayout />
      </Route>

      <Route path={`${path}/ingestions`} exact>
        <IngestModel />
      </Route>

      <Route
        path={`${path}/ingestions/:ingestionId`}
        render={({
          match: {
            params: { ingestionId },
          },
        }: any) => <IngestionDetail ingestionId={ingestionId} />}
      />
    </Switch>
  );
};

export default Router;
