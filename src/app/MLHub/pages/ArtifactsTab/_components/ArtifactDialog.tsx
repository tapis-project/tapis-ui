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
  ToggleButtonGroup,
  ToggleButton,
  alpha as muiAlpha,
} from '@mui/material';
import type {
  Artifact,
  ArtifactStorageType,
  ArtifactType,
} from '../../../types';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DatasetIcon from '@mui/icons-material/Dataset';

interface ArtifactDialogProps {
  open: boolean;
  models: Array<{
    id: string;
    name: string;
    version: string;
    libraries: string[];
  }>;
  datasets: Array<{
    id: string;
    name: string;
    format: string;
    version: string;
  }>;
  onClose: () => void;
  onSave: (
    artifact: Omit<Artifact, 'id' | 'createdAt' | 'checksum' | 'status'>
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
    placeholder: '/artifacts/model-001/model_weights.pt',
  },
  {
    value: 's3',
    label: '🪣 Amazon S3',
    description: 'Reference an S3 bucket object',
    placeholder: 's3://my-bucket/models/model.pt',
  },
  {
    value: 'gcs',
    label: '☁️ Google Cloud Storage',
    description: 'Reference a GCS blob',
    placeholder: 'gs://my-bucket/models/model.pb',
  },
  {
    value: 'azure',
    label: '🔷 Azure Blob Storage',
    description: 'Reference an Azure Blob Storage object',
    placeholder: 'https://account.blob.core.windows.net/container/model.onnx',
  },
  {
    value: 'url',
    label: '🔗 Remote URL',
    description: 'Any publicly accessible URL',
    placeholder: 'https://cdn.example.com/artifacts/model.joblib',
  },
];

export default function ArtifactDialog({
  open,
  models,
  datasets,
  onClose,
  onSave,
}: ArtifactDialogProps) {
  const [artifactType, setArtifactType] = React.useState<ArtifactType>('model');
  const [selectedModelId, setSelectedModelId] = React.useState('');
  const [selectedDatasetId, setSelectedDatasetId] = React.useState('');
  const [name, setName] = React.useState('');
  const [storageType, setStorageType] =
    React.useState<ArtifactStorageType>('platform');
  const [path, setPath] = React.useState('');
  const [size, setSize] = React.useState('');

  const selectedStorage = storageTypes.find((s) => s.value === storageType);

  // Dynamic placeholder based on owner type
  const getPathPlaceholder = (): string => {
    if (storageType === 'platform') {
      return artifactType === 'model'
        ? '/artifacts/model-001/model_weights.pt'
        : '/datasets/dataset-001/data.zip';
    }
    return selectedStorage?.placeholder ?? '';
  };

  React.useEffect(() => {
    if (open) {
      setArtifactType('model');
      setSelectedModelId('');
      setSelectedDatasetId('');
      setName('');
      setStorageType('platform');
      setPath('');
      setSize('');
    }
  }, [open]);

  const handleSave = () => {
    if (artifactType === 'model') {
      if (!selectedModelId || !name || !path) return;
      const model = models.find((m) => m.id === selectedModelId);
      if (!model) return;

      onSave({
        artifactType: 'model',
        modelId: selectedModelId,
        modelName: model.name,
        name,
        storageType,
        path,
        size: size || '~ Unknown',
      });
    } else {
      if (!selectedDatasetId || !name || !path) return;
      const dataset = datasets.find((d) => d.id === selectedDatasetId);
      if (!dataset) return;

      onSave({
        artifactType: 'dataset',
        datasetId: selectedDatasetId,
        datasetName: dataset.name,
        name,
        storageType,
        path,
        size: size || '~ Unknown',
      });
    }
    onClose();
  };

  const isFormValid =
    name.trim() &&
    path.trim() &&
    (artifactType === 'model' ? !!selectedModelId : !!selectedDatasetId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ typography: 'h6', display: 'flex', alignItems: 'center', gap: 1 }}
      >
        Add Artifact
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
      >
        {/* ── Owner Type Toggle ─────────────────────────── */}
        <Box>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ fontWeight: 500, mb: 1 }}
          >
            Artifact Type
          </Typography>
          <ToggleButtonGroup
            value={artifactType}
            exclusive
            onChange={(_, val) => val && setArtifactType(val)}
            fullWidth
            size="small"
          >
            <ToggleButton value="model" sx={{ gap: 0.75 }}>
              <SmartToyIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Model
              </Typography>
            </ToggleButton>
            <ToggleButton value="dataset" sx={{ gap: 0.75 }}>
              <DatasetIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Dataset
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ── Owner Picker (swaps based on type) ───────── */}
        {artifactType === 'model' ? (
          <TextField
            label="Associated Model"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            select
            fullWidth
            required
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {model.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    v{model.version} · {model.libraries.join(', ')}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            label="Associated Dataset"
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            select
            fullWidth
            required
          >
            {datasets.map((ds) => (
              <MenuItem key={ds.id} value={ds.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ds.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    v{ds.version} · {ds.format} format
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* ── Artifact Name ────────────────────────────── */}
        <TextField
          label="Artifact Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          placeholder={
            artifactType === 'model'
              ? 'e.g., model_weights.pt, config.yaml, tokenizer.json'
              : 'e.g., data.zip, schema.json, manifest.csv'
          }
        />

        {/* ── Storage Location ─────────────────────────── */}
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
                    storageType === st.value ? 'primary.main' : 'divider',
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

        {/* ── Path / URI ───────────────────────────────── */}
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
          placeholder={getPathPlaceholder()}
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

        {/* ── File Size ────────────────────────────────── */}
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
          disabled={!isFormValid}
        >
          Add Artifact
        </Button>
      </DialogActions>
    </Dialog>
  );
}
