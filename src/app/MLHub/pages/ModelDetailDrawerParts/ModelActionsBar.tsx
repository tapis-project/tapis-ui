import { useState } from 'react';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import { Model } from '@mlhub/models-ts-sdk';
import DeploymentDialog from '../../_components/DeploymentDialog';
import { derivedMetadataFor, modelAuthorFor } from '../../modelMetadata';

interface ModelActionsBarProps {
  model: Model;
}

type ActionDialog = 'deploy' | null;

export function ModelActionsBar({ model }: ModelActionsBarProps) {
  const [activeDialog, setActiveDialog] = useState<ActionDialog>(null);
  const canDeploy = derivedMetadataFor(model).deployment_strategies.length > 0;

  return (
    <>
      {/* Action Buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Tooltip
          title={
            canDeploy
              ? 'Deploy this model'
              : 'No deployment strategy is available for this model'
          }
        >
          <span>
            <Button
              startIcon={<RocketLaunchIcon />}
              onClick={() => setActiveDialog('deploy')}
              variant="outlined"
              size="small"
              disabled={!canDeploy}
            >
              Deploy
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/** Deploy Model dialog */}
      {canDeploy && (
        <DeploymentDialog
          open={activeDialog === 'deploy'}
          defaultModel={model}
          onClose={() => setActiveDialog(null)}
          author={modelAuthorFor(model)}
        />
      )}
    </>
  );
}
