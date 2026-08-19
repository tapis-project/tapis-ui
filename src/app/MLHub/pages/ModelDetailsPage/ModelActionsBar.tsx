import { useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import ArchiveIcon from '@mui/icons-material/Archive';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

import { ModelMetadata } from '@mlhub/models-ts-sdk';
import DeploymentDialog from '../../_components/DeploymentDialog';

interface ModelActionsBarProps {
  model: ModelMetadata;
}

type ActionDialog = 'delete' | 'archive' | 'deploy' | null;

export function ModelActionsBar({ model }: ModelActionsBarProps) {
  const [activeDialog, setActiveDialog] = useState<ActionDialog>(null);

  const handleEdit = useCallback(() => {
    // Open editor
  }, []);

  return (
    <>
      {/* Action Buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Tooltip title="Edit model details">
          <Button
            startIcon={<DriveFileRenameOutlineIcon />}
            onClick={handleEdit}
            variant="outlined"
            size="small"
          >
            Edit
          </Button>
        </Tooltip>

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
