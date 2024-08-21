import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './AddInputModal.module.scss';
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

type AddInputModalProps = {
  open: boolean;
  toggle: () => void;
};

type InputSource = 'args' | 'env' | 'task_output' | 'literal';

type InputState = {
  name?: string;
  type?: Workflows.EnumTaskIOType;
  source?: InputSource;
};

const AddInputModal: React.FC<AddInputModalProps> = ({ open, toggle }) => {
  const initialInput: InputState = {
    name: undefined,
    type: undefined,
    source: undefined,
  };
  const [input, setInput] = useState(initialInput);
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
      aria-labelledby="Add input modal"
      aria-describedby="A modal for adding an input to a task"
    >
      <DialogTitle id="alert-dialog-title">Add Input</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully updated task input
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
              <InputLabel htmlFor="input-name">Input name</InputLabel>
              <Input
                id="input-name"
                disabled={
                  !!input.name &&
                  Object.keys(taskPatch.input || {}).includes(input.name)
                }
                onChange={(e) => {
                  setInput({ ...input, name: e.target.value });
                }}
              />
              <FormHelperText>
                The unique identifier for this input. Must be alphanumeric,
                uppercase, and may contain underscores
              </FormHelperText>
            </FormControl>
            {!((input.name || '') in (taskPatch.input || {})) && (
              <Button
                disabled={input.name === undefined}
                onClick={() => {
                  setTaskPatch(task, {
                    input: {
                      ...taskPatch.input,
                      [input.name!]: {
                        value: undefined,
                        value_from: undefined,
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
        {input.name && taskPatch?.input![input.name] !== undefined && (
          <>
            <div className={styles['form']}>
              <FormControl
                fullWidth
                margin="dense"
                style={{ marginBottom: '-16px' }}
              >
                <InputLabel size="small" id="type">
                  Type
                </InputLabel>
                <Select
                  size="small"
                  label="type"
                  labelId="type"
                  onChange={(e) => {
                    setInput({
                      ...input,
                      type: e.target.value as Workflows.EnumTaskIOType,
                    });
                    setTaskPatch(task, {
                      input: {
                        ...taskPatch.input,
                        [input.name!]: {
                          ...taskPatch.input![input.name!],
                          type: e.target.value as Workflows.EnumTaskIOType,
                        },
                      },
                    });
                  }}
                >
                  {Object.values(Workflows.EnumTaskIOType).map((type) => {
                    return <MenuItem value={type}>{type}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormHelperText>
                The data type of this input's value
              </FormHelperText>
            </div>
            <div className={styles['form']}>
              <FormControl
                fullWidth
                margin="dense"
                style={{ marginBottom: '-16px' }}
              >
                <InputLabel size="small" id="source">
                  Input source
                </InputLabel>
                <Select
                  size="small"
                  label="Input source"
                  labelId="source"
                  defaultValue={undefined}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      source: e.target.value as InputSource,
                    });
                    setTaskPatch(task, {
                      input: {
                        ...taskPatch.input,
                        [input.name!]: {
                          ...taskPatch.input![input.name!],
                          value: e.target.value === 'literal' ? '' : undefined,
                          value_from:
                            e.target.value !== 'literal'
                              ? { [e.target.value as string]: '' }
                              : undefined,
                        },
                      },
                    });
                  }}
                >
                  <MenuItem
                    value={'task_output'}
                    disabled={(taskPatch.depends_on || []).length < 1}
                  >
                    task output
                    {(taskPatch.depends_on || []).length < 1 &&
                      ' - (available with 1 or more dependencies)'}
                  </MenuItem>
                  <MenuItem value={'env'}>envrionment variable</MenuItem>
                  <MenuItem value={'args'}>pipeline argument</MenuItem>
                  <MenuItem value={'literal'}>
                    -- provide a literal value --
                  </MenuItem>
                </Select>
              </FormControl>
              <FormHelperText>
                The source of the input's value. Values can come from pipeline
                arguments, environment variables, or task outputs.
              </FormHelperText>
            </div>
            {input.source === 'literal' && (
              <div className={styles['form']}>
                {input.type === Workflows.EnumTaskIOType.String && (
                  <>
                    <FormControl variant="standard">
                      <InputLabel htmlFor="value">Value</InputLabel>
                      <Input
                        id="value"
                        onChange={(e) => {
                          setTaskPatch(task, {
                            input: {
                              ...taskPatch.input,
                              [input.name!]: {
                                ...taskPatch.input![input.name!],
                                value: e.target.value,
                              },
                            },
                          });
                        }}
                      />
                      <FormHelperText>
                        The string value of the input
                      </FormHelperText>
                    </FormControl>
                  </>
                )}
                {input.type === Workflows.EnumTaskIOType.Number && (
                  <>
                    <FormControl variant="standard">
                      <InputLabel htmlFor="value">Value</InputLabel>
                      <Input
                        id="value"
                        type="number"
                        onChange={(e) => {
                          setTaskPatch(task, {
                            input: {
                              ...taskPatch.input,
                              [input.name!]: {
                                ...taskPatch.input![input.name!],
                                value: e.target.value as unknown as number,
                              },
                            },
                          });
                        }}
                      />
                      <FormHelperText>
                        The number value of the input
                      </FormHelperText>
                    </FormControl>
                  </>
                )}
                {input.type === Workflows.EnumTaskIOType.Boolean && (
                  <>
                    <FormControl
                      fullWidth
                      margin="dense"
                      style={{ marginBottom: '-16px' }}
                    >
                      <InputLabel size="small" id="value">
                        Value
                      </InputLabel>
                      <Select
                        size="small"
                        label="Value"
                        labelId="value"
                        onChange={(e) => {
                          setTaskPatch(task, {
                            input: {
                              ...taskPatch.input,
                              [input.name!]: {
                                value: e.target.value as boolean,
                              },
                            },
                          });
                        }}
                      >
                        <MenuItem value={'true'}>true</MenuItem>
                        <MenuItem value={'false'}>false</MenuItem>
                      </Select>
                      <FormHelperText>
                        The boolean value of the input
                      </FormHelperText>
                    </FormControl>
                  </>
                )}
              </div>
            )}
            <div className={styles['form']}>
              {input.source === 'task_output' &&
                (task.depends_on || []).length > 0 && (
                  <>
                    <FormControl
                      fullWidth
                      margin="dense"
                      style={{ marginBottom: '-16px' }}
                    >
                      <InputLabel size="small" id="task-id">
                        Task id
                      </InputLabel>
                      <Select
                        size="small"
                        label="Task id"
                        labelId="task-id"
                        onChange={(e) => {
                          setTaskPatch(task, {
                            input: {
                              ...taskPatch.input,
                              [input.name!]: {
                                ...taskPatch.input![input.name!],
                                value_from: {
                                  [input.source as string]: {
                                    test: e.target.value,
                                  },
                                },
                              },
                            },
                          });
                        }}
                      >
                        {task.depends_on!.map((dep) => {
                          return <MenuItem value={dep.id}>{dep.id}</MenuItem>;
                        })}
                      </Select>
                      <FormHelperText>
                        The boolean value of the input
                      </FormHelperText>
                    </FormControl>
                  </>
                )}
            </div>
            <div className={styles['form']}>
              {input.source !== undefined && input.source !== 'literal' && (
                <FormControl variant="standard">
                  <InputLabel htmlFor="value">Source key</InputLabel>
                  <Input
                    id="value"
                    onChange={(e) => {
                      setTaskPatch(task, {
                        input: {
                          ...taskPatch.input,
                          [input.name!]: {
                            ...taskPatch.input![input.name!],
                            value_from: {
                              [input.source as string]: e.target.value,
                            },
                          },
                        },
                      });
                    }}
                  />
                  <FormHelperText>
                    {`Key in the '${input.source}'`}
                  </FormHelperText>
                </FormControl>
              )}
            </div>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (input.name && taskPatch.input && taskPatch.input[input.name]) {
              delete taskPatch.input[input.name];
              setTaskPatch(task, taskPatch);
            }
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
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddInputModal;
