import * as React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  Stack,
  alpha,
  Button,
  Popover,
  ListItemIcon,
  ListItemText,
  List,
  ListItemButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import type { Model, InferenceBackend } from '../../types';
import ModelFormDialog from '../../_components/ModelFormDialog';
import DeploymentDialog from '../../_components/DeploymentDialog';
import {
  modelStatusColorMap,
  frameworkIconMap as inferenceBackendIconMap,
  frameworkLabelMap as inferenceBackendLabelMap,
} from '../../_components/constants';
import { useNavigate } from '../../_context/NavContext';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import * as Models from '@mlhub/models-ts-sdk';

type ModelViewMode = 'list' | 'grid' | 'compact';
type OwnedModel = Models.ModelMetadata & {
  id?: string;
  last_modified?: string;
  status?: Model['status'];
};

const modelKey = (model: OwnedModel) => `${model.author}/${model.name}`;

const filterModels = (models: OwnedModel[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return models;

  return models.filter((model) =>
    [
      model.name,
      model.author,
      model.description ?? '',
      model.model_type ?? '',
      model.license ?? '',
      ...(model.libraries ?? []),
      ...(model.tags ?? []),
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  );
};

interface ModelViewItemProps {
  model: OwnedModel;
  onOpen: (model: OwnedModel) => void;
  onOpenActions: (
    event: React.MouseEvent<HTMLElement>,
    model: OwnedModel
  ) => void;
}

function ModelGridCard({ model, onOpen, onOpenActions }: ModelViewItemProps) {
  const libraries = model.libraries ?? [];
  const tags = model.tags ?? [];
  const deployable = model.deployment_strategy_refs?.length > 0;

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(model)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(model)}
      role="link"
      tabIndex={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'primary.light',
          boxShadow: (theme) =>
            `0 10px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SmartToyIcon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ fontWeight: 700, lineHeight: 1.3 }}
            >
              {model.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              by {model.author}
            </Typography>
          </Box>
          <Tooltip title="Model actions">
            <IconButton
              size="small"
              aria-label={`Actions for ${model.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onOpenActions(event, model);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {model.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              minHeight: 44,
            }}
          >
            {model.description}
          </Typography>
        )}

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 2 }}>
          {deployable && (
            <Chip label="Deployable" color="success" size="small" />
          )}
          {model.model_type && (
            <Chip label={model.model_type} size="small" variant="outlined" />
          )}
          {libraries.slice(0, 2).map((library) => (
            <Chip
              key={library}
              label={
                inferenceBackendLabelMap[library as InferenceBackend] ?? library
              }
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>

        <Box sx={{ flex: 1 }} />
        {tags.length > 0 && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {tags.slice(0, 4).map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                sx={{ height: 21, fontSize: '0.66rem' }}
              />
            ))}
            {tags.length > 4 && (
              <Chip
                label={`+${tags.length - 4}`}
                size="small"
                sx={{ height: 21, fontSize: '0.66rem' }}
              />
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function ModelCompactRow({ model, onOpen, onOpenActions }: ModelViewItemProps) {
  const libraries = model.libraries ?? [];

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(model)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(model)}
      role="link"
      tabIndex={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.light' },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}
      >
        <SmartToyIcon sx={{ color: 'primary.main', fontSize: 21 }} />
        <Box sx={{ minWidth: 0, flex: '1 1 240px' }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
            {model.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {model.author}
          </Typography>
        </Box>
        <Stack
          direction="row"
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 0.5,
            flex: '1 1 220px',
          }}
        >
          {libraries.slice(0, 2).map((library) => (
            <Chip
              key={library}
              label={
                inferenceBackendLabelMap[library as InferenceBackend] ?? library
              }
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.68rem' }}
            />
          ))}
        </Stack>
        <Chip
          label={
            model.deployment_strategy_refs?.length ? 'Deployable' : 'Model'
          }
          size="small"
          color={model.deployment_strategy_refs?.length ? 'success' : 'default'}
          variant="outlined"
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
        <IconButton
          size="small"
          aria-label={`Actions for ${model.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpenActions(event, model);
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Card>
  );
}

export default function ModelsTab() {
  const { username } = useTapisConfig();
  const { data, isLoading, error } = Hooks.Models.useListByAuthor({
    author: username,
  });
  const models = (data?.result ?? []) as OwnedModel[];
  const [viewMode, setViewMode] = React.useState<ModelViewMode>('list');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialog, setDialog] = React.useState<string | undefined>(undefined);
  const [selectedModel, setSelectedModel] = React.useState<OwnedModel | null>(
    null
  );
  const [actionsAnchor, setActionsAnchor] = React.useState<HTMLElement | null>(
    null
  );
  const [actionsRow, setActionsRow] = React.useState<OwnedModel | null>(null);
  const { navigate } = useNavigate();
  const filteredModels = React.useMemo(
    () => filterModels(models, searchQuery),
    [models, searchQuery]
  );

  const openModel = React.useCallback(
    (model: OwnedModel) =>
      navigate(
        `/models/${encodeURIComponent(model.author)}/${encodeURIComponent(
          model.name
        )}`
      ),
    [navigate]
  );

  const openModelActions = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, model: OwnedModel) => {
      setActionsAnchor(event.currentTarget);
      setActionsRow(model);
    },
    []
  );

  const handleCreate = () => {
    setSelectedModel(null);
    setDialog(undefined);
  };

  const handleEdit = (model: OwnedModel) => {
    setSelectedModel(model);
    setDialog(undefined);
  };

  const handleSave = (
    data: Omit<Models.ModelMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedModel) {
      // Edit existing
      // onModelsChange(
      //   models.map((m) =>
      //     m.id === selectedModel.id
      //       ? { ...m, ...data, updatedAt: new Date().toISOString() }
      //       : m
      //   )
      // );
    } else {
      // // Create new
      // const newModel: Model = {
      //   id: `model-${String(models.length + 1).padStart(3, '0')}`,
      //   ...data,
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString(),
      // };
      // onModelsChange([...models, newModel]);
    }
  };

  const handleDelete = (id: string) => {
    // onModelsChange(models.filter((m) => m.id !== id));
  };

  const columns: GridColDef<OwnedModel>[] = [
    {
      field: 'name',
      headerName: 'Model Name',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': {
              '& .MuiTypography-root': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            },
          }}
          onClick={() => openModel(params.row)}
        >
          <SmartToyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'author',
      headerName: 'Author',
      width: 130,
    },
    {
      field: 'libraries',
      headerName: 'Inference Backend',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {((params.value ?? []) as InferenceBackend[]).map((lib) => (
            <Chip
              key={lib}
              label={inferenceBackendLabelMap[lib] ?? lib}
              size="small"
              variant="outlined"
              icon={<span>{inferenceBackendIconMap[lib] || ''}</span>}
              sx={{
                textTransform: 'capitalize',
                height: 24,
                fontSize: '0.7rem',
              }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.value ||
            (params.row.deployment_strategy_refs?.length
              ? 'deployable'
              : 'registered')
          }
          size="small"
          color={
            modelStatusColorMap[params.value as Model['status']] || 'default'
          }
          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 320,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {((params.value ?? []) as string[]).slice(0, 3).map((tag: string) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          ))}
          {((params.value ?? []) as string[]).length > 3 && (
            <Chip
              label={`+${((params.value ?? []) as string[]).length - 3}`}
              size="small"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 120,
      valueGetter: (_value, row) =>
        row.last_modified
          ? new Date(row.last_modified).toLocaleDateString()
          : '—',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => {
              openModelActions(e, params.row);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      deployable: 0,
      ready: 0,
      draft: 0,
      pub: 0,
      priv: 0,
    };

    models.forEach((m) => {
      const strats = m.deployment_strategy_refs ?? [];
      if (strats.length > 0) {
        counts['deployable'] += 1;
      }
    });
    return counts;
  }, [models]);

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <SmartToyIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Models
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Manage your ML models — track versions, performance metrics, and
          deployment readiness across the full lifecycle.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, flexWrap: 'wrap' }}
        useFlexGap
      >
        {[
          {
            label: 'Total',
            count: models.length,
            color: 'primary' as const,
          },
          {
            label: '🚀  Deployable',
            count: statusCounts['deployable'] || 0,
            color: 'success' as const,
          },
          {
            label: '🌎  Public',
            count: statusCounts['pub'] || 0,
            color: 'info' as const,
          },
          {
            label: '🔒  Private',
            count: statusCounts['priv'] || 0,
            color: 'secondary' as const,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            sx={{
              flex: '1 1 180px',
              minWidth: 160,
              background: (theme) =>
                alpha(theme.palette[stat.color].main, 0.08),
              borderLeft: '4px solid',
              borderColor: `${stat.color}.main`,
            }}
          >
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="h4"
                color={`${stat.color}.main`}
                sx={{ fontWeight: 700 }}
              >
                {stat.count}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Model collection controls */}
      <Card
        elevation={0}
        sx={{
          mb: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            p: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Model Registry
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredModels.length} of {models.length} model
              {models.length === 1 ? '' : 's'}
            </Typography>
          </Box>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: 1.25, flex: '1 1 520px' }}
          >
            <TextField
              fullWidth
              size="small"
              value={searchQuery}
              placeholder="Search your models..."
              onChange={(event) => setSearchQuery(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ maxWidth: { md: 420 } }}
            />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, nextView: ModelViewMode | null) =>
                nextView && setViewMode(nextView)
              }
              aria-label="Model view"
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="list" aria-label="List view">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="Grid view">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="compact" aria-label="Compact view">
                <ViewCompactIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      </Card>

      {isLoading ? (
        <Card
          variant="outlined"
          sx={{ py: 9, display: 'flex', justifyContent: 'center' }}
        >
          <CircularProgress />
        </Card>
      ) : error ? (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unable to load models.'}
        </Alert>
      ) : filteredModels.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <SmartToyIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            {models.length ? 'No models match your search' : 'No models found'}
          </Typography>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} sx={{ mt: 1 }}>
              Clear search
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {filteredModels.map((model) => (
            <Grid key={modelKey(model)} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ModelGridCard
                model={model}
                onOpen={openModel}
                onOpenActions={openModelActions}
              />
            </Grid>
          ))}
        </Grid>
      ) : viewMode === 'compact' ? (
        <Stack spacing={1}>
          {filteredModels.map((model) => (
            <ModelCompactRow
              key={modelKey(model)}
              model={model}
              onOpen={openModel}
              onOpenActions={openModelActions}
            />
          ))}
        </Stack>
      ) : (
        <Card sx={{ '& .MuiDataGrid-root': { border: 'none' } }}>
          <DataGrid
            getRowId={modelKey}
            rows={filteredModels}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 8 } },
            }}
            pageSizeOptions={[8, 15, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
              '& .MuiDataGrid-cellContent': {
                display: 'flex',
                alignItems: 'center',
                overflow: 'visible',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              },
              '& .MuiDataGrid-columnHeader': {
                color: 'text.primary',
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  color: 'text.primary',
                },
              },
              '& .MuiDataGrid-iconButtonContainer': {
                color: 'text.secondary',
              },
              '& .MuiDataGrid-menuIconButton': { color: 'text.secondary' },
            }}
          />
        </Card>
      )}

      <Popover
        open={Boolean(actionsAnchor)}
        anchorEl={actionsAnchor}
        onClose={() => {
          setActionsAnchor(null);
          setActionsRow(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { width: 180, mt: 0.5 } },
        }}
      >
        <List dense disablePadding>
          <ListItemButton
            onClick={() => {
              if (actionsRow) openModel(actionsRow);
              setActionsAnchor(null);
              setActionsRow(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="View Details"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              if (actionsRow) handleEdit(actionsRow);
              setActionsAnchor(null);
              setActionsRow(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Edit"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              if (actionsRow) handleDelete(modelKey(actionsRow));
              setActionsAnchor(null);
              setActionsRow(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Delete"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        </List>
      </Popover>

      {/* <ModelFormDialog
        open={dialogOpen}
        model={selectedModel}
        onClose={() => setDialog(false)}
        onSave={handleSave}
      /> */}
    </Box>
  );
}
