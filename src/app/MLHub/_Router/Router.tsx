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
import DashboardLayout from '../Layouts/DashboardLayout';

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
        <DashboardLayout>
          <Box>
            <DashboardOverview
              models={models}
              deployments={deployments}
              artifacts={artifacts}
              datasets={datasets}
              onRegisterModel={() => setModelFormOpen(true)}
            />
          </Box>
        </DashboardLayout>
      </Route>

      {/* Models */}
      <Route path="/mlhub/models" exact>
        <DashboardLayout>
          <ModelsTab />
        </DashboardLayout>
      </Route>

      {/* Model Marketplace */}
      <Route path="/mlhub/marketplaces/models">
        <DashboardLayout>
          <ModelFilterProvider>
            <ModelMarketplace />
          </ModelFilterProvider>
        </DashboardLayout>
      </Route>

      {/* Dataset Marketplace */}
      <Route path="/mlhub/marketplaces/datasets">
        <DashboardLayout>
          Coming Soon!
          {/* <DatasetMarketplace datasets={mockMarketplaceDatasets} /> */}
        </DashboardLayout>
      </Route>

      {/* Datasets */}
      <Route path="/mlhub/datasets">
        <DashboardLayout>
          <ComingSoon />
        </DashboardLayout>
      </Route>

      {/* Dataset Detail Page */}
      <Route path="/mlhub/datasets/:datasetId">
        <DashboardLayout>
          <ComingSoon />
        </DashboardLayout>
      </Route>

      {/* Deployments */}
      <Route path="/mlhub/deployments">
        <DashboardLayout>
          <DeploymentsTab
            deployments={deployments}
            onDeploymentsChange={setDeployments}
            models={modelSummary}
          />
        </DashboardLayout>
      </Route>

      {/* Deployment Detail Page */}
      <Route path="/mlhub/deployments/*">
        <DashboardLayout>
          <DeploymentDetailsPage
            deployments={deployments}
            onDelete={(id) => {
              setDeployments((prev) => prev.filter((d) => d.id !== id));
              window.history.back();
            }}
          />
        </DashboardLayout>
      </Route>

      {/* Artifacts */}
      <Route path="/mlhub/artifacts">
        <DashboardLayout>
          <ArtifactsTab
            artifacts={artifacts}
            onArtifactsChange={setArtifacts}
            models={modelSummary}
            datasets={datasetSummary}
          />
        </DashboardLayout>
      </Route>

      {/* Model Detail Page */}
      <Route path="/mlhub/models/:author/:name">
        <DashboardLayout>
          <ModelDetailsPage />
        </DashboardLayout>
      </Route>

      {/** Agents */}
      <Route path="/mlhub/agents">
        <DashboardLayout>
          <ComingSoon />
        </DashboardLayout>
      </Route>

      {/** Tools */}
      <Route path="/mlhub/tools">
        <DashboardLayout>
          <ComingSoon />
        </DashboardLayout>
      </Route>

      <Route path="*">
        <NotFound404 />
      </Route>
    </Switch>
  );
}
