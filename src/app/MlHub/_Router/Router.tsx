import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import IngestionDetail from '../Ingestions/IngestionDetail';
import IngestModel from '../Ingestions/IngestModel';
import ArtifactDetail from '../Artifacts/ArtifactDetail';
import ArtifactsList from '../Artifacts/ArtifactsList';
import PublicationDetail from '../Publications/PublicationDetail';
import PublicationsList from '../Publications/PublicationsList';
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

      <Route path={`${path}/publications`} exact>
        <PublicationsList />
      </Route>

      <Route
        path={`${path}/publications/:publicationId`}
        render={({
          match: {
            params: { publicationId },
          },
        }: any) => <PublicationDetail publicationId={publicationId} />}
      />
    </Switch>
  );
};

export default Router;
