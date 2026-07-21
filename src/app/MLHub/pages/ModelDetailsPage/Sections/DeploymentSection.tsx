import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import { ModelMetadata } from '@mlhub/models-ts-sdk';
import { useDeploymentDialog } from '../DeploymentDialog';
import { InfoSection } from './InfoSection';

interface DeploymentSectionProps {
  model: ModelMetadata;
}

export function DeploymentSection({ model }: DeploymentSectionProps) {
  const { openDeploy } = useDeploymentDialog();
  const strategies = model.deployment_strategy_refs;

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
              key={strategy.strategy_id ?? index}
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
              onClick={() => openDeploy(strategy)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openDeploy(strategy);
                }
              }}
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
                  {strategy.strategy_id && (
                    <Chip
                      label={strategy.strategy_id}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                  {strategy.endpoint && (
                    <Typography variant="caption" color="text.secondary">
                      {strategy.endpoint}
                    </Typography>
                  )}
                </Box>

                <Button
                  startIcon={<RocketLaunchIcon fontSize="small" />}
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeploy(strategy);
                  }}
                  sx={{ minWidth: 'auto' }}
                >
                  Deploy
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No deployment strategies configured.
        </Typography>
      )}
    </InfoSection>
  );
}
