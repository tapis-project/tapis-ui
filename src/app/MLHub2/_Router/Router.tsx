import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
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
  // mockMarketplaceModels,
  // mockMarketplaceDatasets,
} from '../data/mockData';

// Layout
import DashboardLayout from '../Layouts/DashboardLayout';

// Dialog components (shared across pages)
// import DeploymentDialog from './_components/DeploymentDialog';
// import ArtifactDialog from './_components/ArtifactDialog';
import ModelFormDialog from '../_components/ModelFormDialog';

// Page-level components
// import ModelsTab from './pages/ModelsTab';
// import DatasetsTab from './pages/DatasetsTab';
// import DeploymentsTab from './pages/DeploymentsTab';
// import ArtifactsTab from './pages/ArtifactsTab';
// import ModelDetailsPage from './pages/ModelDetailsPage';
// import DatasetDetailsPage from './pages/DatasetDetailsPage';
import DashboardOverview from '../pages/DashboardOverview';
// import ModelMarketplace from './pages/ModelMarketplace';
// import DatasetMarketplace from './pages/DatasetMarketplace';

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
        framework: m.framework,
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
      <Route path="/">
        <DashboardLayout>
          <Box>
            <DashboardOverview
              models={models}
              deployments={deployments}
              artifacts={artifacts}
              datasets={datasets}
              onRegisterModel={() => setModelFormOpen(true)}
            />
            <ModelFormDialog
              open={modelFormOpen}
              model={editingModel}
              onClose={handleCloseModelForm}
              onSave={handleSaveModel}
            />
          </Box>
        </DashboardLayout>
      </Route>

      {/* Models */}
      <Route
        path="/models"
        // element={
        //   <DashboardLayout>
        //     <ModelsTab
        //       models={models}
        //       onModelsChange={setModels}
        //       deployments={deployments}
        //       artifacts={artifacts}
        //     />
        //   </DashboardLayout>
        // }
      />

      {/* Model Marketplace */}
      {/* <Route
        path="/marketplace"
        element={
          <DashboardLayout>
            <ModelMarketplace models={mockMarketplaceModels} />
          </DashboardLayout>
        }
      /> */}

      {/* Dataset Marketplace */}
      {/* <Route
        path="/dataset-marketplace"
        element={
          <DashboardLayout>
            <DatasetMarketplace datasets={mockMarketplaceDatasets} />
          </DashboardLayout>
        }
      /> */}

      {/* Datasets */}
      {/* <Route
        path="/datasets"
        element={
          <DashboardLayout>
            <DatasetsTab
              datasets={datasets}
              onDatasetsChange={setDatasets}
              datasetArtifacts={datasetArtifacts}
            />
          </DashboardLayout>
        }
      /> */}

      {/* Dataset Detail Page */}
      {/* <Route
        path="/datasets/:datasetId"
        element={
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
        }
      /> */}

      {/* Deployments */}
      {/* <Route
        path="/deployments"
        element={
          <DashboardLayout>
            <DeploymentsTab
              deployments={deployments}
              onDeploymentsChange={setDeployments}
              models={modelSummary}
            />
          </DashboardLayout>
        }
      /> */}

      {/* Artifacts */}
      {/* <Route
        path="/artifacts"
        element={
          <DashboardLayout>
            <ArtifactsTab
              artifacts={artifacts}
              onArtifactsChange={setArtifacts}
              models={modelSummary}
              datasets={datasetSummary}
            />
          </DashboardLayout>
        }
      /> */}

      {/* Model Detail Page */}
      {/* <Route
        path="/models/:modelId"
        element={
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
                model={editingModel}
                onClose={handleCloseModelForm}
                onSave={handleSaveModel}
              />
            </Box>
          </DashboardLayout>
        }
      /> */}
    </Switch>
  );
}
