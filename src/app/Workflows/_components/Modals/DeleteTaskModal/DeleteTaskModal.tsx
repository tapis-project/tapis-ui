import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { LoadingButton as Button } from '@mui/lab';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  AlertTitle,
} from '@mui/material';
import { usePatchTask } from 'app/Workflows/_hooks';

type DeleteTaskModalProps = {
  open: boolean;
  toggle: () => void;
  onDelete?: () => void;
};

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  open,
  toggle,
  onDelete,
}) => {
  const { task, groupId, pipelineId, dependentTasks } =
    usePatchTask<Workflows.Task>();
  const { remove, isLoading, isError, isSuccess, error, reset } =
    Hooks.Tasks.useDelete();

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Delete task "{task.id}"?
      </DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully deleted task '{task.id}'
          </Alert>
        )}
        {isError && error && (
          <Alert
            severity="error"
            style={{ marginTop: '8px' }}
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}
        {dependentTasks.length > 0 && (
          <Alert severity="warning" style={{ marginBottom: '8px' }}>
            This task is required by {dependentTasks.length} other task
            {dependentTasks.length > 1 ? 's' : ''} in this pipeline: [{' '}
            {dependentTasks.map((d) => `${d.id} `)}].
            <br />
            Running this workflow after this task is deleted will result in an
            immediate failure.
          </Alert>
        )}
        <DialogContentText id="alert-dialog-description">
          Deleting a task is an irrevocable action. Are you sure you want to
          continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset();
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          color="error"
          loading={isLoading}
          disabled={isSuccess}
          onClick={() => {
            remove(
              { groupId, pipelineId, taskId: task.id! },
              { onSuccess: onDelete }
            );
          }}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTaskModal;