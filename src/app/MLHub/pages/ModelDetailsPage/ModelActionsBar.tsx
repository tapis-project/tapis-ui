import { useState } from 'react';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import { ModelMetadata } from '@mlhub/models-ts-sdk';
import DeploymentDialog from '../../_components/DeploymentDialog';

interface ModelActionsBarProps {
  model: ModelMetadata;
}

type ActionDialog = 'deploy' | null;

export function ModelActionsBar({ model }: ModelActionsBarProps) {
  const [activeDialog, setActiveDialog] = useState<ActionDialog>(null);

  return (
    <>
      {/* Action Buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Tooltip title="Deploy this model">
          <Button
            startIcon={<RocketLaunchIcon />}
            onClick={() => setActiveDialog('deploy')}
            variant="outlined"
            size="small"
          >
            Deploy
          </Button>
        </Tooltip>
      </Stack>

      {/** Deploy Model dialog */}
      <DeploymentDialog
        open={activeDialog === 'deploy'}
        defaultModel={model}
        onClose={() => setActiveDialog(null)}
        author={model.author}
      />
    </>
  );
}
