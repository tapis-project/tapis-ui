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

  const handleOpen = (dialog: ActionDialog) => {
    setActiveDialog(dialog);
  };

  const handleClose = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const handleDelete = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleArchive = useCallback(() => {
    handleClose();
  }, [handleClose]);

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

        <Tooltip title="Archive this model">
          <Button
            startIcon={<ArchiveIcon />}
            onClick={() => handleOpen('archive')}
            variant="outlined"
            color="warning"
            size="small"
          >
            Archive
          </Button>
        </Tooltip>

        <Tooltip title="Delete this model permanently">
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => handleOpen('delete')}
            variant="outlined"
            color="error"
            size="small"
          >
            Delete
          </Button>
        </Tooltip>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={activeDialog === 'delete'}
        modelName={model.name}
        onClose={handleClose}
        onConfirm={handleDelete}
      />

      {/* Archive Confirmation Dialog */}
      <ArchiveConfirmDialog
        open={activeDialog === 'archive'}
        modelName={model.name}
        onClose={handleClose}
        onConfirm={handleArchive}
      />

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

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Dialog                                        */
/* ------------------------------------------------------------------ */

interface ConfirmDialogProps {
  open: boolean;
  modelName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmDialog({
  open,
  modelName,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const [nameInput, setNameInput] = useState('');

  const handleClose = useCallback(() => {
    setNameInput('');
    onClose();
  }, [onClose]);

  const matches = nameInput === modelName;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DeleteIcon sx={{ color: 'error.main' }} />
          Delete Model
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mt: 2 }}>
          Are you sure you want to delete <strong>{modelName}</strong>? This
          action cannot be undone. Deleting the model will not remove associated
          artifacts, but will orphan any deployments and agents associated with
          it.
        </DialogContentText>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            label="Type model name to confirm"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={modelName}
            slotProps={{
              input: {
                startAdornment: (
                  <DeleteIcon sx={{ color: 'error.main', mr: 1 }} />
                ),
              },
            }}
          />
          {!matches && nameInput.length > 0 && (
            <FormHelperText error>
              Name must match exactly: "{modelName}"
            </FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={!matches}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ArchiveConfirmDialog({
  open,
  modelName,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ArchiveIcon sx={{ color: 'warning.main' }} />
          Archive Model
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mt: 2 }}>
          Are you sure you want to archive <strong>{modelName}</strong>? The
          model will be read-only and will no longer appear in active listings.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Archive
        </Button>
      </DialogActions>
    </Dialog>
  );
}
