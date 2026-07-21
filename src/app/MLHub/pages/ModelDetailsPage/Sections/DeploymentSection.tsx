import { useState } from 'React';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import {
  DeploymentStrategyReference,
  ModelMetadata,
} from '@mlhub/models-ts-sdk';
import DeploymentDialog from '../../../_components/DeploymentDialog';
import { InfoSection } from './InfoSection';
import { useTapisConfig } from '@tapis/tapisui-hooks';

interface DeploymentSectionProps {
  model: ModelMetadata;
}

export function DeploymentSection({ model }: DeploymentSectionProps) {
  const strategies = model.deployment_strategy_refs;
  const [strat, setStrat] = useState<DeploymentStrategyReference | undefined>(
    undefined
  );
  const { username } = useTapisConfig();

  return (
    <InfoSection>
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
