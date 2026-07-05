# Project Memory

## Architecture Decisions

- **Artifacts are polymorphic**: `Artifact.artifactType` is `'model' | 'dataset'`. A single unified artifact list (via `generateArtifacts(models, datasets)`) serves the Artifacts tab.
  - Model artifacts carry `modelId` + `modelName`
  - Dataset artifacts carry `datasetId` + `datasetName`
- **Separate `DatasetArtifact` type** still exists for dataset-specific contexts (DatasetsTab, DatasetDetailsPage, DatasetArtifactDialog) — these use their own `mockDatasetArtifacts` array
- **`DatasetMarketplace.tsx`** follows exact same pattern as `ModelMarketplace.tsx`
- Navigation has 7 items: Dashboard, Models, Marketplace, Data Market, Datasets, Deployments, Artifacts

## File Structure (Refactored)

```
/project/
├── Layouts/                    (capital L) ← was components/layout/
│   └── DashboardLayout/
│       ├── index.tsx         (DashboardLayout + DashboardAppBar)
│       └── DashboardAppBar.tsx
├── pages/                      (was components/)
│   ├── DashboardOverview/
│   │   ├── index.tsx         (page component)
│   │   └── _components/      (page-specific children)
│   │       ├── KpiStatCards.tsx
│   │       ├── QuickActionsCard.tsx
│   │       ├── ModelStatusBreakdown.tsx
│   │       ├── FrameworkPieChart.tsx
│   │       ├── FrameworkBarChartModal.tsx
│   │       ├── RecentModelsList.tsx
│   │       ├── RecentDeploymentsList.tsx
│   │       ├── DeploymentStatusChart.tsx
│   │       └── PieChartCard.tsx
│   ├── DatasetsTab/
│   │   ├── index.tsx         (page with vertical centering fix)
│   │   └── _components/
│   │       └── DatasetFormDialog.tsx
│   ├── ModelsTab/
│   │   ├── index.tsx
│   │   └── _components/
│   │       └── ModelFormDialog.tsx
│   ├── DeploymentsTab/
│   │   ├── index.tsx
│   │   └── _components/
│   │       └── DeploymentDialog.tsx
│   ├── ArtifactsTab/
│   │   ├── index.tsx
│   │   └── _components/
│   │       └── ArtifactDialog.tsx
│   ├── ModelDetailsPage/
│   │   └── index.tsx
│   ├── DatasetDetailsPage/
│   │   ├── index.tsx
│   │   └── _components/
│   │       └── DatasetArtifactDialog.tsx
│   ├── ModelMarketplace/
│   │   └── index.tsx
│   └── DatasetMarketplace/
│       └── index.tsx
├── _components/               (reusable/shared)
│   ├── constants.ts             (color/icon/label maps for models, deployments, datasets)
│   └── MetaItem.tsx             (reusable metadata row component)
├── data/, types.ts, App.tsx     (unchanged locations)
```

## Vertical Centering Fix (Datasets Tab)

- Applied to all 4 DataGrid tables: `MuiDataGrid-cellContent` now has `display: 'flex'` + `alignItems: 'center'`
- This ensures custom renderCell content (icon + text in Dataset Name column) is properly centered
