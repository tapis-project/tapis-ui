import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './AddOutputModal.module.scss';
import { LoadingButton as Button } from '@mui/lab';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  AlertTitle,
} from '@mui/material';
import { usePatchTask } from 'app/Workflows/_hooks';

type AddOutputModalProps = {
  open: boolean;
  toggle: () => void;
};

const AddOutputModal: React.FC<AddOutputModalProps> = ({
  open,
  toggle,
}) => {
  const {
    task,
    taskPatch,
    setTaskPatch,
    commit,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  } = usePatchTask<Workflows.FunctionTask>();
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="Add output modal"
      aria-describedby="A modal for adding an output to a task"
    >
      <DialogTitle id="alert-dialog-title">Add Output</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully updated task output
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
        <div className={styles['form']}>
          <FormControl
            fullWidth
            margin="dense"
            style={{ marginBottom: '-16px' }}
          >
            <InputLabel size="small" id="environment">
              Runtime environment
            </InputLabel>
            <Select
              size="small"
              label="Runtime environment"
              labelId="environment"
              defaultValue={taskPatch.runtime}
              onChange={(e) => {
                setTaskPatch(task, {
                  runtime: e.target.value as Workflows.EnumRuntimeEnvironment,
                });
              }}
            >
              {Object.values(Workflows.EnumRuntimeEnvironment).map(
                (runtimeEnv) => {
                  return (
                    <MenuItem
                      value={runtimeEnv}
                      selected={runtimeEnv === task.runtime}
                    >
                      {runtimeEnv}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </FormControl>
          <FormHelperText>
            The runtime envrionment in which the function code will be executed
          </FormHelperText>
        </div>
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
          onClick={commit}
          disabled={isSuccess}
          loading={isLoading}
          variant="outlined"
          autoFocus
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOutputModal;
