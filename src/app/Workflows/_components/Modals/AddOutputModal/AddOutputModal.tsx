import React, { useState } from 'react';
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
  Input,
} from '@mui/material';
import { usePatchTask } from 'app/Workflows/_hooks';

type AddOutputModalProps = {
  open: boolean;
  toggle: () => void;
};

type OutputState = {
  id?: string;
  type?: string;
};

const AddOutputModal: React.FC<AddOutputModalProps> = ({ open, toggle }) => {
  const initialOutput: OutputState = {
    id: undefined,
    type: undefined,
  };
  const [output, setOutput] = useState(initialOutput);

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
          <>
            <FormControl variant="standard">
              <InputLabel htmlFor="output-name">Ouput id</InputLabel>
              <Input
                id="output-name"
                disabled={
                  !!output.id &&
                  Object.keys(taskPatch.output || {}).includes(output.id)
                }
                onChange={(e) => {
                  setOutput({ ...output, id: e.target.value });
                }}
              />
              <FormHelperText>
                The unique identifier for this output. Must be alphanumeric,
                uppercase, and may contain underscores
              </FormHelperText>
            </FormControl>
            {!((output.id || '') in (taskPatch.output || {})) && (
              <Button
                disabled={output.id === undefined}
                onClick={() => {
                  setTaskPatch(task, {
                    output: {
                      ...taskPatch.output,
                      [output.id!]: {
                        type: undefined,
                      },
                    },
                  });
                }}
              >
                Continue
              </Button>
            )}
          </>
        </div>
        {output.id && taskPatch?.output![output.id] !== undefined && (
          <div className={styles['form']}>
            <FormControl
              fullWidth
              margin="dense"
              style={{ marginBottom: '-16px' }}
            >
              <InputLabel htmlFor="output-type">Type</InputLabel>
              <Input
                id="output-type"
                onChange={(e) => {
                  setOutput({
                    ...output,
                    type: e.target.value as string,
                  });
                  setTaskPatch(task, {
                    output: {
                      ...taskPatch.output,
                      [output.id!]: {
                        ...taskPatch.output![output.id!],
                        type: e.target.value as string,
                      },
                    },
                  });
                }}
              />
            </FormControl>
            <FormHelperText>
              The data type of the output. This is entierly free form to allow
              workflow developers to implement their own type checking.
            </FormHelperText>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (
              output.id &&
              taskPatch.output &&
              taskPatch.output[output.id] &&
              !isSuccess
            ) {
              delete taskPatch.output[output.id];
              setTaskPatch(task, taskPatch);
            }
            setOutput(initialOutput);
            reset();
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          onClick={() => {
            setOutput(initialOutput);
            commit();
          }}
          disabled={isSuccess}
          loading={isLoading}
          variant="outlined"
          autoFocus
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOutputModal;
