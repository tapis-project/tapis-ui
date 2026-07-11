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
  Chip,
} from '@mui/material';
import type { Deployment, DeploymentEnvironment } from '../types';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import * as Models from '@mlhub/models-ts-sdk';
import { getPlatformConfig } from '../enums';

interface DeploymentDialogProps {
  open: boolean;
  onClose: () => void;
  author: string;
}

const cpuOptions = ['250m', '500m', '1', '2', '4'];
const memoryOptions = ['256Mi', '512Mi', '1Gi', '2Gi', '4Gi', '8Gi'];

const uniqueIdFromStratRef = (strat: Models.DeploymentStrategyReference) => {
  return strat.platform + ':' + strat.name;
};

export default function DeploymentDialog({
  open,
  onClose,
  author,
}: DeploymentDialogProps) {
  const [selectedModelName, setSelectedModelName] = React.useState('');
  const [selectedDeploymentStrategy, setSelectedDeploymentStrategy] =
    React.useState<undefined | Models.DeploymentStrategyReference>(undefined);
  const [environment, setEnvironment] = React.useState<
    DeploymentEnvironment | undefined
  >(undefined);
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

        {selectedModel && (
          <TextField
            label="Choose Deployment Strategy"
            value={undefined}
            onChange={(e) => {}}
            select
            fullWidth
            required
          >
            {selectedModel.deployment_strategy_refs.map((strat) => {
              const cfg = getPlatformConfig(strat.platform);
              return (
                <MenuItem
                  key={uniqueIdFromStratRef(strat)}
                  value={uniqueIdFromStratRef(strat)}
                  sx={{ borderBottom: '1px solid #CCCCCC' }}
                  onClick={() => {
                    setSelectedDeploymentStrategy(strat);
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      size="small"
                      sx={{ bgcolor: cfg.color }}
                      label={`${cfg.icon} ${cfg.label}`}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {strat.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {strat.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </TextField>
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
          <MenuItem value="production">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🚀 Production — Live traffic
            </Box>
          </MenuItem>
          <MenuItem value="test">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🧪 Test — Pre-production testing
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
