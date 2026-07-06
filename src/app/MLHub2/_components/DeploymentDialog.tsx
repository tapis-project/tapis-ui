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
  Slider,
  InputAdornment,
} from '@mui/material';
import type { Deployment, DeploymentEnvironment } from '../types';

interface DeploymentDialogProps {
  open: boolean;
  models: Array<{
    id: string;
    name: string;
    version: string;
    libraries: string[];
    status?: string;
  }>;
  onClose: () => void;
  onDeploy: (
    deployment: Omit<Deployment, 'id' | 'status' | 'deployedAt'>
  ) => void;
}

const cpuOptions = ['250m', '500m', '1', '2', '4'];
const memoryOptions = ['256Mi', '512Mi', '1Gi', '2Gi', '4Gi', '8Gi'];

export default function DeploymentDialog({
  open,
  models,
  onClose,
  onDeploy,
}: DeploymentDialogProps) {
  const [selectedModelId, setSelectedModelId] = React.useState('');
  const [environment, setEnvironment] =
    React.useState<DeploymentEnvironment>('staging');
  const [replicas, setReplicas] = React.useState(2);
  const [cpu, setCpu] = React.useState('1');
  const [memory, setMemory] = React.useState('1Gi');

  const readyModels = React.useMemo(
    () => models.filter((m) => m.status === 'ready'),
    [models]
  );

  React.useEffect(() => {
    if (open) {
      setSelectedModelId('');
      setEnvironment('staging');
      setReplicas(2);
      setCpu('1');
      setMemory('1Gi');
    }
  }, [open]);

  const selectedModel = readyModels.find((m) => m.id === selectedModelId);

  const handleDeploy = () => {
    if (!selectedModel) return;

    onDeploy({
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      modelVersion: selectedModel.version,
      environment,
      endpoint: `https://api.ml-platform.io/v1/models/${selectedModel.name
        .toLowerCase()
        .replace(/\s+/g, '-')}/predict`,
      replicas,
      cpu,
      memory,
      startedBy: 'Current User',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ typography: 'h6' }}>Deploy Model</DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
      >
        <TextField
          label="Select Model"
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          select
          fullWidth
          required
        >
          {readyModels.map((model) => (
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

        {readyModels.length === 0 && (
          <Typography variant="body2" color="warning.main" sx={{ mt: -1 }}>
            No models with &quot;Ready&quot; status available for deployment.
          </Typography>
        )}

        <TextField
          label="Environment"
          value={environment}
          onChange={(e) =>
            setEnvironment(e.target.value as DeploymentEnvironment)
          }
          select
          fullWidth
        >
          <MenuItem value="staging">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🧪 Staging — Pre-production testing
            </Box>
          </MenuItem>
          <MenuItem value="production">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🚀 Production — Live traffic
            </Box>
          </MenuItem>
        </TextField>

        <Box>
          <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
            Replicas: {replicas}
          </Typography>
          <Slider
            value={replicas}
            onChange={(_, val) => setReplicas(val as number)}
            min={environment === 'production' ? 2 : 1}
            max={10}
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: 5, label: '5' },
              { value: 10, label: '10' },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="CPU Request"
            value={cpu}
            onChange={(e) => setCpu(e.target.value)}
            select
            fullWidth
          >
            {cpuOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt} cores{Number(opt) > 0 ? '' : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Memory"
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            select
            fullWidth
          >
            {memoryOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {selectedModel && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Deployment Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Model:</strong> {selectedModel.name} (v
              {selectedModel.version})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Endpoint:</strong>{' '}
              <code style={{ fontSize: '0.75rem' }}>
                https://api.ml-platform.io/v1/models/
                {selectedModel.name.toLowerCase().replace(/\s+/g, '-')}/predict
              </code>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Resources:</strong> {cpu} CPU · {memory} Memory ·{' '}
              {replicas} replica(s)
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
          onClick={handleDeploy}
          disabled={!selectedModelId}
        >
          🚀 Deploy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
