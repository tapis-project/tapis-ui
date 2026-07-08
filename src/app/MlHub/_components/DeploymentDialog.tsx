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
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import * as Models from '@mlhub/models-ts-sdk';

interface DeploymentDialogProps {
  open: boolean;
  onClose: () => void;
  author: string;
}

const cpuOptions = ['250m', '500m', '1', '2', '4'];
const memoryOptions = ['256Mi', '512Mi', '1Gi', '2Gi', '4Gi', '8Gi'];

export default function DeploymentDialog({
  open,
  onClose,
  author,
}: DeploymentDialogProps) {
  const [selectedModelName, setSelectedModelName] = React.useState('');
  const [environment, setEnvironment] =
    React.useState<DeploymentEnvironment>('test');
  const [replicas, setReplicas] = React.useState(2);
  const [cpu, setCpu] = React.useState('1');
  const [memory, setMemory] = React.useState('1Gi');
  const { data, isLoading, error } = Hooks.Models.useListByAuthor({ author });

  const models = data?.result ?? [];

  React.useEffect(() => {
    if (open) {
      setSelectedModelName('');
      setEnvironment('test');
      setReplicas(2);
      setCpu('1');
      setMemory('1Gi');
    }
  }, [open]);

  const selectedModel = models.find((m) => m.name === selectedModelName);

  const handleDeploy = () => {
    // onDeploy({
    //   modelId: selectedModel.id,
    //   modelName: selectedModel.name,
    //   modelVersion: selectedModel.version,
    //   environment,
    //   endpoint: `https://api.ml-platform.io/v1/models/${selectedModel.name
    //     .toLowerCase()
    //     .replace(/\s+/g, '-')}/predict`,
    //   replicas,
    //   cpu,
    //   memory,
    //   startedBy: 'Current User',
    // });
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
          value={selectedModelName}
          onChange={(e) => setSelectedModelName(e.target.value)}
          select
          fullWidth
          required
        >
          {models.map((model) => (
            <MenuItem key={model.name} value={model.name}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {model.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        {models.length === 0 && (
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
          <MenuItem value="test">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🧪 Test — Pre-production testing
            </Box>
          </MenuItem>
          <MenuItem value="production">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🚀 Production — Live traffic
            </Box>
          </MenuItem>
        </TextField>

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
              <strong>Model:</strong> {selectedModel.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Endpoint:</strong>{' '}
              <code style={{ fontSize: '0.75rem' }}>
                https://api.ml-platform.io/v1/models/
                {selectedModel.name.toLowerCase().replace(/\s+/g, '-')}/predict
              </code>
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
          disabled={!selectedModelName}
        >
          🚀 Deploy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
