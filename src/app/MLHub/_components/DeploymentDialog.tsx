import { useMemo, useState } from 'react';
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
  Alert,
  AlertTitle,
} from '@mui/material';
import type { Deployment, DeploymentEnvironment } from '../types';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import * as Models from '@mlhub/models-ts-sdk';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { getPlatformConfig } from '../enums';

interface DeploymentDialogProps {
  model?: Models.ModelMetadata;
  strat?: Deployments.Strategy;
  open: boolean;
  onClose: () => void;
  author: string;
}

const stratId = (strat: Models.DeploymentStrategyReference) => {
  return strat.platform + ':' + strat.name;
};

const removePrefix = (str: string, prefix: string) => {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
};

export default function DeploymentDialog({
  open,
  onClose,
  author,
  model = undefined,
  strat = undefined,
}: DeploymentDialogProps) {
  const { mlHubBasePath } = useTapisConfig();
  const [selectedModel, setSelectedModel] = useState(model);
  const [selectedDeploymentStrategy, setSelectedDeploymentStrategy] =
    useState(strat);
  const [env, setEnv] = useState<'test' | 'production'>('test');
  const [selectedParams, setSelectedParams] = useState<{ [key: string]: any }>(
    {}
  );

  // Models hooks
  const { data: modelsData } = Hooks.Models.useListByAuthor({ author });
  const models = modelsData?.result ?? [];

  // Deployments hooks
  const { data: strategiesData, error } =
    Hooks.Deployments.Strategies.useList();
  const strats = strategiesData?.result ?? [];

  const handleDeploy = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ typography: 'h6' }}>Deploy Model</DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
      >
        {models.length === 0 ? (
          <Alert severity="warning">
            <AlertTitle>You have no models that we can deploy!</AlertTitle>
            Search the Model Marketplace for deployable models
          </Alert>
        ) : (
          <TextField
            label="Select Model"
            value={selectedModel}
            select
            fullWidth
            required
          >
            {models.map((model) => (
              <MenuItem
                onClick={() => {
                  setSelectedModel(model);
                }}
                key={model.name}
                value={model.name}
                disabled={model.deployment_strategy_refs.length === 0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {model.deployment_strategy_refs.length === 0 ? '🚫' : '🤖'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {model.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.author}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </TextField>
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
            {selectedModel.deployment_strategy_refs.map((ref) => {
              const cfg = getPlatformConfig(ref.platform);
              return (
                <MenuItem
                  key={stratId(ref)}
                  value={stratId(ref)}
                  sx={{ borderBottom: '1px solid #CCCCCC' }}
                  onClick={() => {
                    let strat = strats.filter((s) => {
                      return s.platform === ref.platform && s.name === ref.name;
                    })[0];
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
                        {ref.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ref.description}
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
          value={env}
          onChange={(e) => setEnv(e.target.value as 'test' | 'production')}
          select
          fullWidth
        >
          <MenuItem key="env-test" value="test">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                🚀
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Production
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Live traffic
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem key="env-test" value="producion">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                🧪
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Test
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pre-production testing
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        </TextField>

        {selectedDeploymentStrategy && (
          <DeploymentStratParameters
            params={selectedDeploymentStrategy.parameters}
            selectedParams={selectedParams}
            handleSelectParam={(k, v) => {
              setSelectedParams({ ...selectedParams, [k]: v });
            }}
          />
        )}

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
                {`https://endpoints.mlhub.${removePrefix(
                  mlHubBasePath,
                  'https://'
                )}`}
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
          disabled={true /** TODO */}
        >
          🚀 Deploy
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type DeploymentStratParametersProps = {
  params: Deployments.Parameter[];
  selectedParams: { [key: string]: any };
  handleSelectParam: (key: string, value: any) => void;
};

const DeploymentStratParameters: React.FC<DeploymentStratParametersProps> = ({
  params,
  selectedParams,
  handleSelectParam,
}) => {
  return (
    <>
      {params.map((param) => {
        switch (!!param.choices) {
          case true:
            return (
              <SelectParamField
                param={param}
                selectedParams={selectedParams}
                handleSelectParam={handleSelectParam}
              />
            );
          case false:
            return (
              <TextParamField
                param={param}
                selectedParams={selectedParams}
                handleSelectParam={handleSelectParam}
              />
            );
        }
      })}
    </>
  );
};

type ParamProps = {
  param: Deployments.Parameter;
  selectedParams: { [key: string]: any };
  handleSelectParam: (key: string, value: any) => void;
};

const SelectParamField: React.FC<ParamProps> = ({
  param,
  selectedParams,
  handleSelectParam,
}) => {
  let choices = param.choices || [];
  return (
    <TextField
      label={param.name}
      value={selectedParams[param.name] ? param._default : undefined}
      select
      fullWidth
      helperText={param.description}
    >
      {choices.map((choice) => {
        return (
          <MenuItem
            key="env-test"
            value="test"
            onClick={() => {
              handleSelectParam(param.name, choice);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ⚙️
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {choice}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        );
      })}
    </TextField>
  );
};

const TextParamField: React.FC<ParamProps> = ({ param, handleSelectParam }) => {
  return (
    <TextField
      label={param.name}
      value={param._default}
      onChange={(e) => {
        handleSelectParam(param.name, e.target.value);
      }}
      fullWidth
      helperText={param.description}
    />
  );
};
