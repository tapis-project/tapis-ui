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

// Dialog components (shared across pages)
import DeploymentDialog from '../_components/DeploymentDialog';
import ArtifactDialog from '../_components/ArtifactDialog';
import ModelFormDialog from '../_components/ModelFormDialog';

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
import DatasetMarketplace from '../pages/DatasetMarketplace';
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
  const [editingModel, setEditingModel] = React.useState<Model | null>(null);

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

  // Handle model creation from dashboard quick action
  const handleCreateModel = React.useCallback(
    (data: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newModel: Model = {
        id: `model-${String(models.length + 1).padStart(3, '0')}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setModels((prev) => [...prev, newModel]);
    },
    [models.length]
  );

  // Handle opening the form dialog in edit mode
  const handleEditModel = React.useCallback((model: Model) => {
    setEditingModel(model);
    setModelFormOpen(true);
  }, []);

  // Close the dialog and reset editing state
  const handleCloseModelForm = React.useCallback(() => {
    setModelFormOpen(false);
    setEditingModel(null);
  }, []);

  // Save handler that handles both create and update
  const handleSaveModel = React.useCallback(
    (data: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingModel) {
        // Update existing model
        setModels((prev) =>
          prev.map((m) =>
            m.id === editingModel.id
              ? { ...m, ...data, updatedAt: new Date().toISOString() }
              : m
          )
        );
      } else {
        // Create new model
        const newModel: Model = {
          id: `model-${String(models.length + 1).padStart(3, '0')}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setModels((prev) => [...prev, newModel]);
      }
    },
    [editingModel, models.length]
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
          <ModelsTab
            onModelsChange={setModels}
            deployments={deployments}
            artifacts={artifacts}
          />
        </DashboardLayout>
      </Route>

      {/* Model Marketplace */}
      <Route path="/mlhub/marketplace">
        <DashboardLayout>
          <ModelFilterProvider>
            <ModelMarketplace />
          </ModelFilterProvider>
        </DashboardLayout>
      </Route>

      {/* Dataset Marketplace */}
      <Route path="/mlhub/dataset-marketplace">
        <DashboardLayout>
          <DatasetMarketplace datasets={mockMarketplaceDatasets} />
        </DashboardLayout>
      </Route>

      {/* Datasets */}
      <Route path="/mlhub/datasets">
        <DashboardLayout>
          <DatasetsTab
            datasets={datasets}
            onDatasetsChange={setDatasets}
            datasetArtifacts={datasetArtifacts}
          />
        </DashboardLayout>
      </Route>

      {/* Dataset Detail Page */}
      <Route path="/mlhub/datasets/:datasetId">
        <DashboardLayout>
          <DatasetDetailsPage
            datasets={datasets}
            datasetArtifacts={datasetArtifacts}
            onEdit={() => window.history.back()}
            onDelete={(id) => {
              setDatasets((prev) => prev.filter((d) => d.id !== id));
              window.history.back();
            }}
          />
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
          <Box>
            <ModelDetailsPage
              models={models}
              deployments={deployments}
              artifacts={artifacts}
              onEdit={handleEditModel}
              onDelete={(id) => {
                setModels((prev) => prev.filter((m) => m.id !== id));
                window.history.back();
              }}
            />
            <ModelFormDialog
              open={modelFormOpen}
              model={null}
              onClose={handleCloseModelForm}
            />
          </Box>
        </DashboardLayout>
      </Route>
    </Switch>
  );
}
