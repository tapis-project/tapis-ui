import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import IngestionDetail from '../Ingestions/IngestionDetail';
import IngestModel from '../Ingestions/IngestModel';
import { Dashboard } from '../Dashboard';
import { Layout as ModelsLayout } from '../PlatformModels/_Layout';
import { Layout as DatasetsLayout } from '../Datasets/_Layout';
import { Layout as ModelDetailsLayout } from '../Model';
import { ModelSearch } from '../ModelSearch';
import * as MLHubModels from '@mlhub/models-ts-sdk';
import { ModelFilterProvider } from '../_context/ModelFilterContext/ModelFilterContext';
import { useTapisConfig } from '@tapis/tapisui-hooks';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  const { username } = useTapisConfig();
  return (
    <>
      <Switch>
        <Route path={`${path}`} exact>
          <Dashboard />
        </Route>

        <Route path={`${path}/me/models`} exact>
          <ModelFilterProvider>
            <ModelSearch scope={'me'} />
          </ModelFilterProvider>
        </Route>

        <Route
          path={`${path}/me/models/:name`}
          render={({
            match: {
              params: { name },
            },
          }: any) => {
            return (
              <ModelDetailsLayout scope={'me'} author={username} name={name} />
            );
          }}
        />

        <Route path={`${path}/global/models`} exact>
          <ModelFilterProvider>
            <ModelSearch scope={'global'} />
          </ModelFilterProvider>
        </Route>

        <Route
          path={`${path}/global/models/:name`}
          render={({
            match: {
              params: { name },
            },
          }: any) => (
            <ModelDetailsLayout
              scope={MLHubModels.GetModelByAuthorAndNameScopeEnum.Global}
              author={'mlhub'}
              name={name}
            />
          )}
        />

        <Route
          path={`${path}/models/:author/:name`}
          render={({
            match: {
              params: { author, name },
            },
          }: any) => (
            <ModelDetailsLayout
              scope={MLHubModels.GetModelByAuthorAndNameScopeEnum.Tenant}
              author={author}
              name={name}
            />
          )}
        />

        {/* <Route path={`${path}/platforms`}>
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
        /> */}
      </Switch>
    </>
  );
};

export default Router;
