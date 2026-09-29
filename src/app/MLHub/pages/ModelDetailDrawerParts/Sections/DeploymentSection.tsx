import { useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import {
  DeploymentOption,
  DeploymentStrategyReference,
  Model,
} from '@mlhub/models-ts-sdk';
import DeploymentDialog from '../../../_components/DeploymentDialog';
import { InfoSection } from './InfoSection';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { derivedMetadataFor } from '../../../modelMetadata';

interface DeploymentSectionProps {
  model: Model;
}

export function DeploymentSection({ model }: DeploymentSectionProps) {
  const strategies = derivedMetadataFor(model).deployment_strategies;
  const [strat, setStrat] = useState<DeploymentStrategyReference | undefined>(
    undefined
  );
  const { username } = useTapisConfig();
  const deploymentOptionsQuery =
    Hooks.Models.useListExternalModelDeploymentOptions({
      externalModelId: model.external_model_id,
      includeCount: true,
    });
  const deploymentOptions = deploymentOptionsQuery.data?.result ?? [];

  return (
    <InfoSection>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }} variant="h6">
        Deployment options
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
        Compatible runtime, target, and deployment modality combinations for
        this model.
      </Typography>
      {deploymentOptionsQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : deploymentOptionsQuery.isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to load deployment options.
        </Alert>
      ) : deploymentOptions.length ? (
        <Stack spacing={1.25}>
          {deploymentOptions.map((option) => (
            <DeploymentOptionCard key={option.id} option={option} />
          ))}
        </Stack>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          No deployment options are currently available for this model.
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>How deployment strategies are determined</AlertTitle>
        We calculate deployment methods for models by analyzing their metadata -
        architecture, I/O specification, and runtime requirements - against our
        catalog of known deployment strategies. Only strategies with matching
        capabilities are shown here.
      </Alert>
      {strategies && strategies.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {strategies.map((strategy, index) => (
            <Box
              key={strategy.name ?? index}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.shadows[1],
                },
              }}
              onClick={() => setStrat(strategy)}
              role="button"
              tabIndex={0}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {strategy.name}
                  </Typography>
                  {strategy.name && (
                    <Chip
                      label={strategy.name}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>

                <Button
                  startIcon={<RocketLaunchIcon fontSize="small" />}
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStrat(strategy);
                  }}
                  sx={{ minWidth: 'auto' }}
                >
                  Deploy
                </Button>
              </Box>
            </Box>
          ))}
          <DeploymentDialog
            open={strat !== undefined}
            onClose={() => setStrat(undefined)}
            author={username}
            defaultModel={model}
            defaultStratRef={strat}
          />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No deployment strategies configured.
        </Typography>
      )}
    </InfoSection>
  );
}

function DeploymentOptionCard({ option }: { option: DeploymentOption }) {
  const target = option.hpc_cluster_queue;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: option.available ? 'divider' : 'warning.light',
        borderLeft: '3px solid',
        borderLeftColor: option.available ? 'success.main' : 'warning.main',
        p: 1.5,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
            {option.serving_runtime}
          </Typography>
          <Chip
            label={option.deployment_target_type}
            size="small"
            variant="outlined"
          />
          <Chip
            color={option.available ? 'success' : 'warning'}
            label={option.available ? 'Available' : 'Unavailable'}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {option.supported_deployment_modalities.map((modality) => (
            <Chip key={modality} label={modality} size="small" />
          ))}
        </Stack>
      </Stack>
      {target && (
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
          {target.hpc_cluster_name} · {target.batch_scheduler_queue_name} ·{' '}
          {target.data_center}
          {!target.hpc_cluster_enabled || !target.batch_scheduler_queue_enabled
            ? ' · target disabled'
            : ''}
        </Typography>
      )}
    </Box>
  );
}
