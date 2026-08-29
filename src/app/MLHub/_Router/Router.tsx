import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import type {
  Model,
  Deployment,
  Artifact,
  Dataset,
  DatasetArtifact,
} from '../types';
import {
  mockModels,
  mockDeployments,
  mockArtifacts,
  mockDatasets,
  mockDatasetArtifacts,
  mockMarketplaceModels,
  mockMarketplaceDatasets,
} from '../data/mockData';

// Layout
import MLHubLayout from '../Layouts/MLHubLayout';

// Page-level components
import ModelsTab from '../pages/ModelsTab';
import DatasetsTab from '../pages/DatasetsTab';
import DeploymentsTab from '../pages/DeploymentsPage';
import ArtifactsTab from '../pages/ArtifactsTab';
import ModelDetailsPage from '../pages/ModelDetailsPage';
import DatasetDetailsPage from '../pages/DatasetDetailsPage';
import DeploymentDetailsPage from '../pages/DeploymentDetailsPage';
import DashboardOverview from '../pages/DashboardOverview';
import ModelMarketplace from '../pages/ModelMarketplace';
import NotFound404 from '../pages/NotFound404';
import ComingSoon from '../pages/ComingSoonPage';
// import DatasetMarketplace from '../pages/DatasetMarketplace';
import { ModelFilterProvider } from '../_context/ModelFilterContext/ModelFilterContext';
import { AgentControlPlane } from '../pages/AgentControlPlane';

/* ─── App Root ────────────────────────────────────────────────── */
export default function Router() {
  const [models, setModels] = React.useState<Model[]>(mockModels);
  const [deployments, setDeployments] =
    React.useState<Deployment[]>(mockDeployments);
  const [artifacts, setArtifacts] = React.useState<Artifact[]>(mockArtifacts);
  const [datasets, setDatasets] = React.useState<Dataset[]>(mockDatasets);
  const [datasetArtifacts, setDatasetArtifacts] =
    React.useState<DatasetArtifact[]>(mockDatasetArtifacts);

  // Model creation / edit dialog
  const [modelFormOpen, setModelFormOpen] = React.useState(false);

  // Derived data passed to child tabs
  const modelSummary = React.useMemo(
    () =>
      models.map((m) => ({
        id: m.id,
        name: m.name,
        version: m.version,
        libraries: m.libraries,
      })),
    [models]
  );

  const datasetSummary = React.useMemo(
    () =>
      datasets.map((d) => ({
        id: d.id,
        name: d.name,
        version: d.version,
        format: d.format,
      })),
    [datasets]
  );

  return (
    <Switch>
      {/* Dashboard Overview */}
      <Route path="/mlhub" exact>
        <MLHubLayout>
          <Box>
            <DashboardOverview
              models={models}
              artifacts={artifacts}
              datasets={datasets}
              onRegisterModel={() => setModelFormOpen(true)}
            />
          </Box>
        </MLHubLayout>
      </Route>

      {/* Models */}
      <Route path="/mlhub/models" exact>
        <MLHubLayout>
          <ModelsTab />
        </MLHubLayout>
      </Route>

      {/* Model Marketplace */}
      <Route path="/mlhub/marketplaces/models">
        <MLHubLayout>
          <ModelFilterProvider>
            <ModelMarketplace />
          </ModelFilterProvider>
        </MLHubLayout>
      </Route>

      {/* Dataset Marketplace */}
      <Route path="/mlhub/marketplaces/datasets">
        <MLHubLayout>
          <ComingSoon />
        </MLHubLayout>
      </Route>

      {/* Datasets */}
      <Route path="/mlhub/datasets">
        <MLHubLayout>
          <ComingSoon />
        </MLHubLayout>
      </Route>

      {/* Dataset Detail Page */}
      <Route path="/mlhub/datasets/:datasetId">
        <MLHubLayout>
          <ComingSoon />
        </MLHubLayout>
      </Route>

      {/* Deployments */}
      <Route path="/mlhub/deployments">
        <MLHubLayout>
          <DeploymentsTab />
        </MLHubLayout>
      </Route>

      {/* Deployment Detail Page */}
      <Route path="/mlhub/deployments/*">
        <MLHubLayout>
          <DeploymentDetailsPage
            deployments={deployments}
            onDelete={(id) => {
              setDeployments((prev) => prev.filter((d) => d.id !== id));
              window.history.back();
            }}
          />
        </MLHubLayout>
      </Route>

      {/* Artifacts */}
      <Route path="/mlhub/artifacts">
        <MLHubLayout>
          <ArtifactsTab
            artifacts={artifacts}
            onArtifactsChange={setArtifacts}
            models={modelSummary}
            datasets={datasetSummary}
          />
        </MLHubLayout>
      </Route>

      {/* Model Detail Page */}
      <Route path="/mlhub/models/:author/:name">
        <MLHubLayout>
          <ModelDetailsPage />
        </MLHubLayout>
      </Route>

      {/** Agents */}
      <Route path="/mlhub/agent-control-plane">
        <MLHubLayout fullBleed>
          <AgentControlPlane />
        </MLHubLayout>
      </Route>

      {/** Tools */}
      <Route path="/mlhub/tools">
        <MLHubLayout>
          <ComingSoon />
        </MLHubLayout>
      </Route>

      {/** Settings */}
      <Route path="/mlhub/settings">
        <MLHubLayout>
          <ComingSoon />
        </MLHubLayout>
      </Route>

      <Route path="*">
        <MLHubLayout>
          <NotFound404 />
        </MLHubLayout>
      </Route>
    </Switch>
  );
}
