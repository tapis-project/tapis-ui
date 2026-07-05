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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DatasetIcon from '@mui/icons-material/Dataset';
import type { Artifact, ArtifactStorageType, ArtifactType } from '../../types';
import ArtifactDialog from '../../_components/ArtifactDialog';

interface ArtifactsTabProps {
  artifacts: Artifact[];
  onArtifactsChange: (artifacts: Artifact[]) => void;
  models: Array<{
    id: string;
    name: string;
    version: string;
    framework: string[];
  }>;
  datasets: Array<{
    id: string;
    name: string;
    format: string;
    version: string;
  }>;
}

type FilterType = 'all' | 'platform' | 'remote';
type OwnerFilter = 'all' | 'model' | 'dataset';

const storageConfig: Record<
  ArtifactStorageType,
  {
    label: string;
    icon: React.ReactElement;
    color: 'success' | 'warning' | 'info' | 'error' | 'secondary' | 'primary';
    chipColor:
      | 'default'
      | 'success'
      | 'warning'
      | 'info'
      | 'error'
      | 'primary'
      | 'secondary';
  }
> = {
  platform: {
    label: 'On-Platform',
    icon: <StorageIcon sx={{ fontSize: 16 }} />,
    color: 'success',
    chipColor: 'success',
  },
  s3: {
    label: 'Amazon S3',
    icon: <CloudQueueIcon sx={{ fontSize: 16 }} />,
    color: 'warning',
    chipColor: 'warning',
  },
  gcs: {
    label: 'GCS',
    icon: <CloudQueueIcon sx={{ fontSize: 16 }} />,
    color: 'info',
    chipColor: 'info',
  },
  azure: {
    label: 'Azure Blob',
    icon: <CloudUploadIcon sx={{ fontSize: 16 }} />,
    color: 'info',
    chipColor: 'info',
  },
  url: {
    label: 'Remote URL',
    icon: <LinkIcon sx={{ fontSize: 16 }} />,
    color: 'primary',
    chipColor: 'primary',
  },
};

const statusColorMap: Record<
  Artifact['status'],
  'success' | 'default' | 'warning' | 'error' | 'info'
> = {
  available: 'success',
  uploading: 'warning',
  error: 'error',
  archived: 'default',
};

const ownerConfig: Record<
  ArtifactType,
  {
    label: string;
    icon: React.ReactElement;
    chipColor: 'primary' | 'secondary';
  }
> = {
  model: {
    label: 'Model',
    icon: <SmartToyIcon sx={{ fontSize: 14 }} />,
    chipColor: 'primary',
  },
  dataset: {
    label: 'Dataset',
    icon: <DatasetIcon sx={{ fontSize: 14 }} />,
    chipColor: 'secondary',
  },
};

export default function ArtifactsTab({
  artifacts,
  onArtifactsChange,
  models,
  datasets,
}: ArtifactsTabProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [storageFilter, setStorageFilter] = React.useState<FilterType>('all');
  const [ownerFilter, setOwnerFilter] = React.useState<OwnerFilter>('all');
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);

  const filteredArtifacts = React.useMemo(() => {
    let result = artifacts;

    // Filter by storage type
    if (storageFilter === 'platform') {
      result = result.filter((a) => a.storageType === 'platform');
    } else if (storageFilter === 'remote') {
      result = result.filter((a) => a.storageType !== 'platform');
    }

    // Filter by owner type
    if (ownerFilter !== 'all') {
      result = result.filter((a) => a.artifactType === ownerFilter);
    }

    return result;
  }, [artifacts, storageFilter, ownerFilter]);

  const handleSave = (
    data: Omit<Artifact, 'id' | 'createdAt' | 'checksum' | 'status'>
  ) => {
    const newArtifact: Artifact = {
      ...data,
      id: `artifact-${String(artifacts.length + 1).padStart(3, '0')}`,
      status: data.storageType === 'platform' ? 'uploading' : 'available',
      createdAt: new Date().toISOString(),
      checksum: `sha256:${
        crypto.randomUUID?.() || Math.random().toString(36).slice(2)
      }`,
    };
    onArtifactsChange([...artifacts, newArtifact]);
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard?.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Artifact Name',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderOpenIcon
            sx={{
              fontSize: 20,
              color:
                params.row.name.endsWith('.pt') ||
                params.row.name.endsWith('.pb')
                  ? '#ff6f00'
                  : params.row.name.endsWith('.onnx')
                  ? '#7c4dff'
                  : params.row.name.endsWith('.joblib')
                  ? '#0288d1'
                  : params.row.name.endsWith('.zip')
                  ? '#e65100'
                  : params.row.name.endsWith('.json') ||
                    params.row.name.endsWith('.jsonl')
                  ? '#2e7d32'
                  : params.row.name.endsWith('.parquet')
                  ? '#6a1b9a'
                  : 'text.secondary',
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'artifactType',
      headerName: 'Owner Type',
      width: 120,
      sortComparator: (v1, v2) => v1.localeCompare(v2),
      renderCell: (params) => {
        const key = params.value as ArtifactType;
        const config = ownerConfig[key];
        return (
          <Chip
            icon={config.icon}
            label={config.label}
            size="small"
            color={config.chipColor}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'parentName',
      headerName: 'Parent',
      width: 200,
      valueGetter: (_value, row) =>
        row.artifactType === 'model' ? row.modelName : row.datasetName,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ maxWidth: 185 }}
        />
      ),
    },
    {
      field: 'storageType',
      headerName: 'Storage Type',
      width: 140,
      renderCell: (params) => {
        const key = params.value as ArtifactStorageType;
        const config = storageConfig[key];
        return (
          <Chip
            icon={config.icon}
            label={config.label}
            size="small"
            color={config.chipColor}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'path',
      headerName: 'Location / URI',
      flex: 2,
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            component="code"
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
              color: (theme) =>
                theme.palette.mode === 'dark' ? 'grey.200' : 'text.secondary',
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: params.row.storageType === 'platform' ? 140 : 260,
              fontSize: '0.68rem',
              border: (theme) =>
                theme.palette.mode === 'dark' ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            {params.value}
          </Typography>
          <Tooltip
            title={copiedPath === params.value ? 'Copied!' : 'Copy path'}
          >
            <IconButton
              size="small"
              onClick={() => handleCopyPath(params.value)}
              color={copiedPath === params.value ? 'success' : 'default'}
              sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
            >
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 95,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            statusColorMap[params.value as Artifact['status']] || 'default'
          }
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 115,
      valueGetter: (_value, row) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: () => (
        <Tooltip title="Download / Access">
          <IconButton size="small" color="primary">
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Compute stats
  const stats = React.useMemo(() => {
    const modelCount = artifacts.filter(
      (a) => a.artifactType === 'model'
    ).length;
    const datasetCount = artifacts.filter(
      (a) => a.artifactType === 'dataset'
    ).length;
    const platformCount = artifacts.filter(
      (a) => a.storageType === 'platform'
    ).length;
    const remoteCount = artifacts.length - platformCount;
    const availableCount = artifacts.filter(
      (a) => a.status === 'available'
    ).length;
    return {
      modelCount,
      datasetCount,
      platformCount,
      remoteCount,
      availableCount,
    };
  }, [artifacts]);

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <FolderOpenIcon sx={{ fontSize: 28, color: 'warning.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Artifacts
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Track all artifacts — model weights, dataset files, tokenizers,
          configs, and more across on-platform and remote storage.
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
            label: 'Total Artifacts',
            count: artifacts.length,
            icon: '📦',
            color: 'primary' as const,
          },
          {
            label: 'Model Artifacts',
            count: stats.modelCount,
            icon: '🤖',
            color: 'info' as const,
          },
          {
            label: 'Dataset Artifacts',
            count: stats.datasetCount,
            icon: '📊',
            color: 'secondary' as const,
          },
          {
            label: 'On-Platform',
            count: stats.platformCount,
            icon: '💾',
            color: 'success' as const,
          },
          {
            label: 'Remote Storage',
            count: stats.remoteCount,
            icon: '☁️',
            color: 'warning' as const,
          },
          {
            label: 'Available',
            count: stats.availableCount,
            icon: '✅',
            color: 'success' as const,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            sx={{
              flex: '1 1 140px',
              minWidth: 130,
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
                {stat.icon} {stat.label}
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

      {/* Artifacts Table */}
      <Card sx={{ '& .MuiDataGrid-root': { border: 'none' } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            pb: 1,
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Typography variant="h6">All Artifacts</Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            {/* Owner type filter */}
            <ToggleButtonGroup
              value={ownerFilter}
              exclusive
              onChange={(_, val) => val && setOwnerFilter(val)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontSize: '0.78rem',
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="model">🤖 Models</ToggleButton>
              <ToggleButton value="dataset">📊 Datasets</ToggleButton>
            </ToggleButtonGroup>

            {/* Storage type filter */}
            <ToggleButtonGroup
              value={storageFilter}
              exclusive
              onChange={(_, val) => val && setStorageFilter(val)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontSize: '0.78rem',
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="platform">📁 Platform</ToggleButton>
              <ToggleButton value="remote">☁️ Remote</ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              size="small"
            >
              Add Artifact
            </Button>
          </Stack>
        </Box>

        <DataGrid
          rows={filteredArtifacts}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } },
            sorting: {
              sortModel: [{ field: 'createdAt', sort: 'desc' }],
            },
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

      <ArtifactDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        models={models}
        datasets={datasets}
      />
    </Box>
  );
}
