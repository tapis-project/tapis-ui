# MLHub Project Memory

## Architecture

- React 18 + TypeScript + Vite + MUI 9 (Material UI)
- HashRouter for routing
- Pages: Dashboard, Models, Model Marketplace, Datasets, Datasets Marketplace, Deployments, Artifacts, Detail pages
- Layout: DashboardLayout wraps DashboardAppBar (sticky nav) around page content

## Patterns Established

- **Page headers**: Every top-level page uses a consistent header pattern:
  ```tsx
  <Box sx={{ mb: 3 }}>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
      <IconComponent sx={{ fontSize: 28, color: 'color.main' }} />
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
      >
        Page Title
      </Typography>
    </Stack>
    <Typography variant="body1" color="text.secondary">
      Descriptive subtitle text.
    </Typography>
  </Box>
  ```
- **Detail pages** use breadcrumb-style header: `Models / Model Details` with subtitle
- **Marketplace pages** follow identical pattern: header → search/filter bar → results count → card grid → empty state

## Key Design Decisions

- KPI cards on dashboard are 6 cards at `lg={2}` per row (3 columns)
- Marketplace model cards: license as Chip in tags row, Fork button bottom-right
- Marketplace dataset cards: format/size/rows chips, license Chip in tags row, "Get Dataset" button bottom-right secondary-colored
- Nav has 7 items: Dashboard, Models, Marketplace, Deployments, Datasets, Data Market, Artifacts
- DatasetFormat type includes: csv, parquet, json, jsonl, image, text, delta, audio, custom
