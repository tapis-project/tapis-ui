import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import IngestionDetail from '../Ingestions/IngestionDetail';
import IngestModel from '../Ingestions/IngestModel';
import ArtifactDetail from '../Artifacts/ArtifactDetail';
import ArtifactsList from '../Artifacts/ArtifactsList';
import { Dashboard } from '../Dashboard';
import { Layout as ModelsLayout } from '../Models/_Layout';
import { Layout as DatasetsLayout } from '../Datasets/_Layout';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Dashboard />
      </Route>

      <Route path={`${path}/models`}>
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

      <Route path={`${path}/artifacts`} exact>
        <ArtifactsList />
      </Route>

      <Route
        path={`${path}/artifacts/:artifactId`}
        render={({
          match: {
            params: { artifactId },
          },
        }: any) => <ArtifactDetail artifactId={artifactId} />}
      />
    </Switch>
  );
};

export default Router;
