# Project Memory

## Architecture Decisions

- **Artifacts are polymorphic**: `Artifact.artifactType` is `'model' | 'dataset'`. A single unified artifact list (via `generateArtifacts(models, datasets)`) serves the Artifacts tab.
  - Model artifacts carry `modelId` + `modelName`
  - Dataset artifacts carry `datasetId` + `datasetName`
- **Separate `DatasetArtifact` type** still exists for dataset-specific contexts (DatasetsTab, DatasetDetailsPage, DatasetArtifactDialog) — these use their own `mockDatasetArtifacts` array
- **`DatasetMarketplace.tsx`** follows exact same pattern as `ModelMarketplace.tsx`
- Navigation has 7 items: Dashboard, Models, Marketplace, Data Market, Datasets, Deployments, Artifacts

## File Structure Conventions

- **Active project structure** (`/project/components/` was removed — it was stale pre-refactor):
  - `/project/App.tsx` — entry point with HashRouter + Routes
  - `/project/Layouts/DashboardLayout/` — layout shell (`index.tsx` + `DashboardAppBar.tsx`)
  - `/project/pages/*/` — page components, each with `index.tsx` + `_components/` subfolder
    - `DashboardOverview`, `ModelsTab`, `DatasetsTab`, `DeploymentsTab`, `ArtifactsTab`
    - `ModelDetailsPage`, `DatasetDetailsPage`, `ModelMarketplace`, `DatasetMarketplace`
  - `/project/_components/` — **shared cross-page components** (imported by multiple pages)
    - `DeploymentDialog.tsx`, `ArtifactDialog.tsx`, `ModelFormDialog.tsx` (dialogs used by Dashboard + their respective tabs + App)
    - `MetaItem.tsx`, `constants.ts` (shared utilities)
  - `/project/data/mockData.ts` — mock data
  - `/project/types.ts` — TypeScript types
  - `/project/theme.tsx` — MUI theme

## Key Rule: Cross-page imports → /\_components/

If a page imports from _another_ page's `_components/` directory, that component belongs in `/_components/`. Page-local `_components/` are private to that page only.
