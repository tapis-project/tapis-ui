import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Stack,
  alpha,
  Button,
  Popover,
  ListItemIcon,
  ListItemText,
  List,
  ListItemButton,
} from '@mui/material';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import type {
  Model,
  Deployment,
  Artifact,
  InferenceBackend,
} from '../../types';
import ModelFormDialog from '../../_components/ModelFormDialog';
import {
  modelStatusColorMap,
  frameworkIconMap as inferenceBackendIconMap,
  frameworkLabelMap as inferenceBackendLabelMap,
} from '../../_components/constants';
import { useNavigate } from '../../_context/NavContext';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import * as Models from '@mlhub/models-ts-sdk';

interface ModelsTabProps {
  onModelsChange: (models: Model[]) => void;
  deployments?: Deployment[];
  artifacts?: Artifact[];
}

export default function ModelsTab({
  onModelsChange,
  deployments = [],
  artifacts = [],
}: ModelsTabProps) {
  const { username } = useTapisConfig();
  const { data, isLoading, error } = Hooks.Models.useListByAuthor({
    author: username,
  });
  const models = data?.result ?? [];
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState<Model | null>(null);
  const [actionsAnchor, setActionsAnchor] = React.useState<HTMLElement | null>(
    null
  );
  const [actionsRow, setActionsRow] = React.useState<Model | null>(null);
  const { navigate } = useNavigate();

  const handleCreate = () => {
    setSelectedModel(null);
    setDialogOpen(true);
  };

  const handleEdit = (model: Model) => {
    setSelectedModel(model);
    setDialogOpen(true);
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

  const columns: GridColDef[] = [
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
          onClick={() => navigate(`/models/${params.row.id}`)}
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
          {(params.value as InferenceBackend[]).map((lib) => (
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
          label={params.value}
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
          {(params.value as string[]).slice(0, 3).map((tag: string) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          ))}
          {(params.value as string[]).length > 3 && (
            <Chip
              label={`+${(params.value as string[]).length - 3}`}
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
        new Date(row.last_modified).toLocaleDateString(),
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
              setActionsAnchor(e.currentTarget);
              setActionsRow(params.row);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    return { pending: 0, ready: 0, draft: 0 }; // TODO
    // models.forEach((m) => {
    //   counts[m.status] = (counts[m.status] || 0) + 1;
    // });
    // return counts;
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
            label: 'Total Models',
            count: models.length,
            color: 'primary' as const,
          },
          {
            label: 'Pending',
            count: statusCounts['pending'] || 0,
            color: 'warning' as const,
          },
          {
            label: 'Ready',
            count: statusCounts['ready'] || 0,
            color: 'success' as const,
          },
          {
            label: 'Drafts',
            count: statusCounts['draft'] || 0,
            color: 'info' as const,
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

      {/* Models Table */}
      <Card sx={{ '& .MuiDataGrid-root': { border: 'none' } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            pb: 1,
          }}
        >
          <Typography variant="h6">Model Registry</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            size="small"
          >
            New Model
          </Button>
        </Box>
        <DataGrid
          getRowId={(row) => row.author + row.name}
          rows={models}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } },
          }}
          pageSizeOptions={[8, 15, 25]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
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
            '& .MuiDataGrid-iconButtonContainer': { color: 'text.secondary' },
            '& .MuiDataGrid-menuIconButton': { color: 'text.secondary' },
          }}
        />
      </Card>

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
              if (actionsRow) navigate(`/models/${actionsRow.id}`);
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
              if (actionsRow) handleDelete(actionsRow.id);
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
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      /> */}
    </Box>
  );
}
