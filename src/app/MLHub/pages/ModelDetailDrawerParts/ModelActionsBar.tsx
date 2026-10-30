import { useState } from 'react';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import { Model } from '@mlhub/models-ts-sdk';
import DeploymentDialog from '../../_components/DeploymentDialog';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { modelAuthorFor } from '../../modelMetadata';

interface ModelActionsBarProps {
  model: Model;
}

type ActionDialog = 'deploy' | null;

export function ModelActionsBar({ model }: ModelActionsBarProps) {
  const [activeDialog, setActiveDialog] = useState<ActionDialog>(null);
  const deploymentOptionsQuery =
    Hooks.Models.useListExternalModelDeploymentOptions({
      externalModelId: model.external_model_id,
      includeCount: true,
    });
  const canDeploy = (deploymentOptionsQuery.data?.result ?? []).some(
    (option) => option.available
  );

  return (
    <>
      {/* Action Buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'flex-end', mr: 2 }}
      >
        <Tooltip
          title={
            canDeploy
              ? 'Deploy this model'
              : deploymentOptionsQuery.isLoading
              ? 'Loading deployment options'
              : 'No available deployment option is configured for this model'
          }
        >
          <span>
            <Button
              startIcon={<RocketLaunchIcon />}
              onClick={() => setActiveDialog('deploy')}
              variant="outlined"
              size="small"
              sx={{ borderRadius: '2px', height: 32, minHeight: 32, px: 2 }}
              disabled={!canDeploy || deploymentOptionsQuery.isLoading}
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
