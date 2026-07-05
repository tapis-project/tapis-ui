import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  InputAdornment,
  alpha as muiAlpha,
} from '@mui/material';
import type {
  DatasetArtifact,
  Dataset,
  ArtifactStorageType,
} from '../../../types';

interface DatasetArtifactDialogProps {
  open: boolean;
  datasets: Array<{
    id: string;
    name: string;
    version: string;
    format: string;
  }>;
  onClose: () => void;
  onSave: (
    artifact: Omit<DatasetArtifact, 'id' | 'createdAt' | 'checksum' | 'status'>
  ) => void;
}

const storageTypes: {
  value: ArtifactStorageType;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    value: 'platform',
    label: '📁 On-Platform',
    description: 'Store artifact within the platform storage',
    placeholder: '/datasets/dataset-001/data.zip',
  },
  {
    value: 's3',
    label: '🪣 Amazon S3',
    description: 'Reference an S3 bucket object',
    placeholder: 's3://ml-dataset-bucket/datasets/data.zip',
  },
  {
    value: 'gcs',
    label: '☁️ Google Cloud Storage',
    description: 'Reference a GCS blob',
    placeholder: 'gs://ml-platform-datasets/datasets/data.zip',
  },
  {
    value: 'azure',
    label: '🔷 Azure Blob Storage',
    description: 'Reference an Azure Blob Storage object',
    placeholder: 'https://account.blob.core.windows.net/container/data.zip',
  },
  {
    value: 'url',
    label: '🔗 Remote URL',
    description: 'Any publicly accessible URL',
    placeholder: 'https://cdn.dataset-registry.io/datasets/data.zip',
  },
];

export default function DatasetArtifactDialog({
  open,
  datasets,
  onClose,
  onSave,
}: DatasetArtifactDialogProps) {
  const [selectedDatasetId, setSelectedDatasetId] = React.useState('');
  const [name, setName] = React.useState('');
  const [storageType, setStorageType] =
    React.useState<ArtifactStorageType>('platform');
  const [path, setPath] = React.useState('');
  const [size, setSize] = React.useState('');

  const selectedStorage = storageTypes.find((s) => s.value === storageType);

  React.useEffect(() => {
    if (open) {
      setSelectedDatasetId('');
      setName('');
      setStorageType('platform');
      setPath('');
      setSize('');
    }
  }, [open]);

  const handleSave = () => {
    if (!selectedDatasetId || !name || !path) return;

    const dataset = datasets.find((d) => d.id === selectedDatasetId);
    if (!dataset) return;

    onSave({
      datasetId: selectedDatasetId,
      datasetName: dataset.name,
      name,
      storageType,
      path,
      size: size || '~ Unknown',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ typography: 'h6' }}>Add Dataset Artifact</DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
      >
        <TextField
          label="Associated Dataset"
          value={selectedDatasetId}
          onChange={(e) => setSelectedDatasetId(e.target.value)}
          select
          fullWidth
          required
        >
          {datasets.map((dataset) => (
            <MenuItem key={dataset.id} value={dataset.id}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {dataset.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  v{dataset.version} · {dataset.format.toUpperCase()}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Artifact Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          placeholder="e.g., data.zip, manifest.json, schema.json"
        />

        <Box>
          <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
            Storage Location
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
            {storageTypes.map((st) => (
              <Button
                key={st.value}
                variant={storageType === st.value ? 'contained' : 'outlined'}
                onClick={() => {
                  setStorageType(st.value);
                  setPath('');
                }}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  p: 1.25,
                  borderColor:
                    storageType === st.value ? 'secondary.main' : 'divider',
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      fontWeight: storageType === st.value ? 600 : 400,
                    }}
                  >
                    {st.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{
                      display: storageType === st.value ? 'block' : 'none',
                      mt: 0.25,
                    }}
                  >
                    {st.description}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </Box>

        <TextField
          label={
            storageType === 'platform'
              ? 'Platform Path'
              : storageType === 'url'
              ? 'Artifact URL'
              : storageType === 'azure'
              ? 'Blob URL'
              : 'URI / Object Path'
          }
          value={path}
          onChange={(e) => setPath(e.target.value)}
          fullWidth
          required
          placeholder={selectedStorage?.placeholder}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {storageType === 's3' && 's3://'}
                  {storageType === 'gcs' && 'gs://'}
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="File Size (approximate)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          fullWidth
          placeholder="e.g., 256 MB, 1.2 GB"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">optional</InputAdornment>
              ),
            },
          }}
        />

        {/* Info box for selected storage */}
        {selectedStorage && (
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: muiAlpha(
                storageType === 'platform'
                  ? '#10b981'
                  : storageType === 'url'
                  ? '#3b82f6'
                  : '#8b5cf6',
                0.08
              ),
              border: '1px solid',
              borderColor: muiAlpha(
                storageType === 'platform'
                  ? '#10b981'
                  : storageType === 'url'
                  ? '#3b82f6'
                  : '#8b5cf6',
                0.2
              ),
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color:
                  storageType === 'platform'
                    ? 'success.dark'
                    : storageType === 'url'
                    ? 'info.dark'
                    : 'purple',
              }}
            >
              {selectedStorage.label.split(' ')[1]}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{ lineHeight: 1.6 }}
            >
              {selectedStorage.description}. Artifacts stored{' '}
              {storageType === 'platform'
                ? 'on-platform are managed and versioned automatically by the platform.'
                : `remotely in ${selectedStorage.label
                    .split(' ')
                    .slice(1)
                    .join(
                      ' '
                    )} are referenced by URI/path and validated on access.`}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!selectedDatasetId || !name.trim() || !path.trim()}
        >
          Add Artifact
        </Button>
      </DialogActions>
    </Dialog>
  );
}
