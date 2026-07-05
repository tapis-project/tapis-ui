import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Stack,
  alpha,
  Tooltip,
  Button,
} from '@mui/material';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import type { Model, Deployment, Artifact, ModelFramework } from '../../types';
import ModelFormDialog from '../../_components/ModelFormDialog';
import {
  modelStatusColorMap,
  frameworkIconMap,
  frameworkLabelMap,
} from '../../_components/constants';

interface ModelsTabProps {
  models: Model[];
  onModelsChange: (models: Model[]) => void;
  deployments?: Deployment[];
  artifacts?: Artifact[];
}

export default function ModelsTab({
  models,
  onModelsChange,
  deployments = [],
  artifacts = [],
}: ModelsTabProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState<Model | null>(null);
  const navigate = useNavigate();

  const handleCreate = () => {
    setSelectedModel(null);
    setDialogOpen(true);
  };

  const handleEdit = (model: Model) => {
    setSelectedModel(model);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedModel) {
      // Edit existing
      onModelsChange(
        models.map((m) =>
          m.id === selectedModel.id
            ? { ...m, ...data, updatedAt: new Date().toISOString() }
            : m
        )
      );
    } else {
      // Create new
      const newModel: Model = {
        id: `model-${String(models.length + 1).padStart(3, '0')}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onModelsChange([...models, newModel]);
    }
  };

  const handleDelete = (id: string) => {
    onModelsChange(models.filter((m) => m.id !== id));
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Model Name',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'framework',
      headerName: 'Framework',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(params.value as ModelFramework[]).map((fw) => (
            <Chip
              key={fw}
              label={frameworkLabelMap[fw] ?? fw}
              size="small"
              variant="outlined"
              icon={<span>{frameworkIconMap[fw] || ''}</span>}
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
      field: 'version',
      headerName: 'Version',
      width: 90,
      align: 'center',
      headerAlign: 'center',
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
    // {
    //   field: 'f1Score',
    //   headerName: 'F1 Score',
    //   width: 100,
    //   align: 'center',
    //   headerAlign: 'center',
    //   valueGetter: (_value, row) => (row.f1Score ? `${row.f1Score}%` : '—'),
    //   renderCell: (params) =>
    //     params.row.f1Score ? (
    //       <Typography
    //         variant="body2"
    //         sx={{
    //           fontWeight: 600,
    //           color:
    //             params.row.f1Score >= 95
    //               ? 'success.main'
    //               : params.row.f1Score >= 85
    //                 ? 'warning.main'
    //                 : 'error.main',
    //         }}
    //       >
    //         {params.value}
    //       </Typography>
    //     ) : (
    //       <Typography variant="body2" color="text.secondary">
    //         —
    //       </Typography>
    //     ),
    // },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 180,
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
      field: 'author',
      headerName: 'Author',
      width: 130,
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 120,
      valueGetter: (_value, row) =>
        new Date(row.updatedAt).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/models/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    models.forEach((m) => {
      counts[m.status] = (counts[m.status] || 0) + 1;
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

      <ModelFormDialog
        open={dialogOpen}
        model={selectedModel}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
