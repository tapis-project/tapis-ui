import { useCallback, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import ArchiveIcon from '@mui/icons-material/Archive';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DataObjectIcon from '@mui/icons-material/DataObject';

import type {
  DeploymentStrategyReference,
  ModelMetadata,
} from '@mlhub/models-ts-sdk';

interface ModelActionsBarProps {
  model: ModelMetadata;
}

type ActionDialog = 'delete' | 'archive' | 'deploy' | null;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
}

export function ModelActionsBar({ model }: ModelActionsBarProps) {
  const [activeDialog, setActiveDialog] = useState<ActionDialog>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpen = (dialog: ActionDialog) => {
    if (dialog === 'deploy') {
      setSelectedStrategy(model.deployment_strategy_refs[0]?.name ?? '');
    }
    setActiveDialog(dialog);
  };

  const handleClose = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const showNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info') => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleDelete = useCallback(() => {
    handleClose();
    showNotification(`Model "${model.name}" has been deleted.`, 'success');
  }, [handleClose, model.name, showNotification]);

  const handleArchive = useCallback(() => {
    handleClose();
    showNotification(`Model "${model.name}" has been archived.`, 'info');
  }, [handleClose, model.name, showNotification]);

  const handleDeploy = useCallback(() => {
    handleClose();
    showNotification(
      `Model "${model.name}" deployed using strategy "${selectedStrategy}".`,
      'success'
    );
  }, [handleClose, model.name, selectedStrategy, showNotification]);

  const handleEdit = useCallback(() => {
    showNotification(`Opening editor for "${model.name}"...`, 'info');
  }, [model.name, showNotification]);

  const handleViewAnnotations = useCallback(() => {
    alert('View Annotations');
  }, []);

  return (
    <>
      {/* Action Buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Tooltip title="View model annotations">
          <Button
            startIcon={<DataObjectIcon />}
            onClick={handleViewAnnotations}
            variant="contained"
            size="small"
          >
            View Annotations
          </Button>
        </Tooltip>

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
            startIcon={<CloudUploadIcon />}
            onClick={() => handleOpen('deploy')}
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

      {/* Deploy Dialog */}
      <DeployDialog
        open={activeDialog === 'deploy'}
        modelName={model.name}
        strategies={model.deployment_strategy_refs}
        selectedStrategy={selectedStrategy}
        onChangeStrategy={setSelectedStrategy}
        onClose={handleClose}
        onConfirm={handleDeploy}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DeleteIcon sx={{ color: 'error.main' }} />
          Delete Model
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mt: 2 }}>
          Are you sure you want to delete <strong>{modelName}</strong>? This
          action cannot be undone and will permanently remove the model and all
          associated artifacts.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
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

/* ------------------------------------------------------------------ */
/*  Deploy Dialog                                                     */
/* ------------------------------------------------------------------ */

interface DeployDialogProps {
  open: boolean;
  modelName: string;
  strategies: DeploymentStrategyReference[];
  selectedStrategy: string;
  onChangeStrategy: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function DeployDialog({
  open,
  modelName,
  strategies,
  selectedStrategy,
  onChangeStrategy,
  onClose,
  onConfirm,
}: DeployDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircleIcon sx={{ color: 'success.main' }} />
          Deploy Model
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mt: 2, mb: 2 }} color="text.secondary">
          Select a deployment strategy for <strong>{modelName}</strong>.
        </Typography>

        <Divider sx={{ my: 2 }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          disabled={!selectedStrategy}
        >
          Deploy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
