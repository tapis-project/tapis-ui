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
import DatasetIcon from '@mui/icons-material/Dataset';
import type { Dataset, DatasetArtifact } from '../../types';
import DatasetFormDialog from './_components/DatasetFormDialog';
import {
  datasetStatusColorMap,
  datasetFormatIconMap,
  datasetFormatLabelMap,
} from '../../_components/constants';

interface DatasetsTabProps {
  datasets: Dataset[];
  onDatasetsChange: (datasets: Dataset[]) => void;
  datasetArtifacts?: DatasetArtifact[];
}

export default function DatasetsTab({
  datasets,
  onDatasetsChange,
  datasetArtifacts = [],
}: DatasetsTabProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedDataset, setSelectedDataset] = React.useState<Dataset | null>(
    null
  );
  const navigate = useNavigate();

  const handleCreate = () => {
    setSelectedDataset(null);
    setDialogOpen(true);
  };

  const handleEdit = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setDialogOpen(true);
  };

  const handleSave = (
    data: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedDataset) {
      // Edit existing
      onDatasetsChange(
        datasets.map((d) =>
          d.id === selectedDataset.id
            ? { ...d, ...data, updatedAt: new Date().toISOString() }
            : d
        )
      );
    } else {
      // Create new
      const newDataset: Dataset = {
        id: `dataset-${String(datasets.length + 1).padStart(3, '0')}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onDatasetsChange([...datasets, newDataset]);
    }
  };

  const handleDelete = (id: string) => {
    onDatasetsChange(datasets.filter((d) => d.id !== id));
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Dataset Name',
      flex: 1.5,
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatasetIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'format',
      headerName: 'Format',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            datasetFormatLabelMap[params.value as Dataset['format']] ||
            params.value
          }
          size="small"
          variant="outlined"
          icon={
            <span>
              {datasetFormatIconMap[params.value as Dataset['format']] || ''}
            </span>
          }
          sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
        />
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
            datasetStatusColorMap[params.value as Dataset['status']] ||
            'default'
          }
          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'rowCount',
      headerName: 'Rows',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_value, row) =>
        row.rowCount ? row.rowCount.toLocaleString() : '—',
      renderCell: (params) =>
        params.row.rowCount ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color:
                params.row.rowCount >= 10_000_000
                  ? 'success.main'
                  : params.row.rowCount >= 1_000_000
                  ? 'warning.main'
                  : 'text.primary',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          >
            {(params.row.rowCount / 1_000_000).toFixed(
              params.row.rowCount >= 10_000_000 ? 0 : 1
            )}
            M
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 95,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.78rem' }}
        >
          {params.value}
        </Typography>
      ),
    },
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
              onClick={() => navigate(`/datasets/${params.row.id}`)}
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
    datasets.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return counts;
  }, [datasets]);

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <DatasetIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Datasets
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Organize and manage your datasets — track formats, validation status,
          row counts, and storage locations.
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
            label: 'Total Datasets',
            count: datasets.length,
            color: 'secondary' as const,
          },
          {
            label: 'Validating',
            count: statusCounts['validating'] || 0,
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

      {/* Datasets Table */}
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
          <Typography variant="h6">Dataset Registry</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            size="small"
          >
            New Dataset
          </Button>
        </Box>
        <DataGrid
          rows={datasets}
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
            // ── Vertical centering fix ──
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            },
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

      <DatasetFormDialog
        open={dialogOpen}
        dataset={selectedDataset}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
