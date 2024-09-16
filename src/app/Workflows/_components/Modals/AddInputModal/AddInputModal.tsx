import React, { useCallback, useState } from 'react';
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
import { Workflows as Hooks } from '@tapis/tapisui-hooks';

type AddInputModalProps = {
  groupId: string;
  open: boolean;
  toggle: () => void;
};

type InputSource = 'args' | 'env' | 'task_output' | 'secret' | 'literal';

type InputState = {
  id?: string;
  type?: Workflows.EnumTaskIOType;
  source?: InputSource;
  taskId?: string;
  sourceKey?: string;
  literal?: any;
};

const AddInputModal: React.FC<AddInputModalProps> = ({
  open,
  toggle,
  groupId,
}) => {
  const initialInput: InputState = {
    id: undefined,
    type: undefined,
    source: undefined,
    sourceKey: undefined,
    literal: undefined,
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
  const { data } = Hooks.GroupSecrets.useList({ groupId });
  const groupSecrets = data?.result || [];

  const canSubmit = useCallback(() => {
    const preReqsSatisfied =
      input.id !== undefined && input.source && input.type;

    // Check if task output requirements satisfied
    let taskOutputReqsSatisfied = true;
    if (input.source === 'task_output' && !input.taskId) {
      taskOutputReqsSatisfied = false;
    }

    // Check if literal requirements satisfied
    let literalReqsSatisfied = true;
    if (input.source === 'literal' && !input.literal) {
      literalReqsSatisfied = false;
    }

    // Check if a source key is provided for all non-literal sources
    let sourceKeyRequestSatisfied = true;
    if (input.source !== 'literal' && !input.sourceKey) {
      sourceKeyRequestSatisfied = false;
    }

    return (
      preReqsSatisfied &&
      taskOutputReqsSatisfied &&
      literalReqsSatisfied &&
      sourceKeyRequestSatisfied
    );
  }, [input, setInput, task, taskPatch, setTaskPatch]);

  const isValidInput = useCallback(
    (value: string | undefined) => {
      if (!value) {
        return false;
      }
      return !Object.keys(taskPatch.input!).includes(value);
    },
    [input, setInput, taskPatch, setTaskPatch]
  );

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
              <InputLabel htmlFor="input-name">Input id</InputLabel>
              <Input
                id="input-name"
                disabled={
                  !!input.id &&
                  isValidInput(input.id) &&
                  Object.keys(taskPatch.input!).includes(input.id)
                }
                onChange={(e) => {
                  setInput({ ...input, id: e.target.value });
                }}
              />
              <FormHelperText>
                The unique identifier for this input. Must be alphanumeric,
                uppercase, and may contain underscores
              </FormHelperText>
            </FormControl>
            {input.id !== undefined &&
              input.id !== '' &&
              !(input.id in taskPatch.input!) && (
                <Button
                  disabled={input.id === undefined}
                  onClick={() => {
                    setTaskPatch(task, {
                      input: {
                        ...taskPatch.input,
                        [input.id!]: {
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
        {input.id && taskPatch?.input![input.id] !== undefined && (
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
                        [input.id!]: {
                          ...taskPatch.input![input.id!],
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
                        [input.id!]: {
                          ...taskPatch.input![input.id!],
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
                  <MenuItem
                    disabled={groupSecrets.length === 0}
                    value={'secret'}
                  >
                    secret
                  </MenuItem>
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
                          // Set the sourceKey
                          setInput({
                            ...input,
                            literal: e.target.value,
                          });
                          setTaskPatch(task, {
                            input: {
                              ...taskPatch.input,
                              [input.id!]: {
                                ...taskPatch.input![input.id!],
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
                              [input.id!]: {
                                ...taskPatch.input![input.id!],
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
                              [input.id!]: {
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
                          setInput({
                            ...input,
                            taskId: e.target.value as string,
                          });
                          setTaskPatch(task, {
                            input: {
                              ...taskPatch.input,
                              [input.id!]: {
                                ...taskPatch.input![input.id!],
                                value_from: {
                                  [input.source!]: {
                                    task_id: e.target.value as string,
                                    output_id: undefined,
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
                    </FormControl>
                    <FormHelperText>
                      The task from which to grab the output
                    </FormHelperText>
                  </>
                )}
            </div>
            {input.source !== undefined &&
              !['literal', 'secret'].includes(input.source) && (
                <div className={styles['form']}>
                  <FormControl variant="standard">
                    <InputLabel htmlFor="value">Source key</InputLabel>
                    <Input
                      id="value"
                      onChange={(e) => {
                        // Set the sourceKey
                        setInput({
                          ...input,
                          sourceKey: e.target.value,
                        });
                        // Value from if source is not from a task output
                        let valueFrom: Workflows.ValueFrom = {
                          [input.source as string]: e.target.value,
                        };

                        // Value from if source is from a task output
                        if (input.source === 'task_output') {
                          valueFrom = {
                            [input.source]: {
                              task_id: input.taskId!,
                              output_id: e.target.value,
                            },
                          };
                        }

                        setTaskPatch(task, {
                          input: {
                            ...taskPatch.input,
                            [input.id!]: {
                              ...taskPatch.input![input.id!],
                              value_from: valueFrom,
                            },
                          },
                        });
                      }}
                    />
                    <FormHelperText>
                      {`Key in the '${input.source}'`}
                    </FormHelperText>
                  </FormControl>
                </div>
              )}
            {groupSecrets.length > 0 && input.source === 'secret' && (
              <div className={styles['form']}>
                <FormControl variant="standard">
                  <InputLabel htmlFor="value">Secret</InputLabel>
                  <Select
                    size="small"
                    label="type"
                    labelId="type"
                    onChange={(e) => {
                      // Set the sourceKey
                      setInput({
                        ...input,
                        sourceKey: e.target.value as string,
                      });
                      // Value from if source is not from a task output
                      let valueFrom: Workflows.ValueFrom = {
                        secret: {
                          engine: 'tapis-workflows-group-secrets',
                          pk: e.target.value as string,
                        },
                      };
                      setTaskPatch(task, {
                        input: {
                          ...taskPatch.input,
                          [input.id!]: {
                            ...taskPatch.input![input.id!],
                            value_from: valueFrom,
                          },
                        },
                      });
                    }}
                  >
                    {groupSecrets.map((secret) => {
                      return <MenuItem value={secret.id}>{secret.id}</MenuItem>;
                    })}
                  </Select>
                  <FormHelperText>
                    {`Source of the secret data'`}
                  </FormHelperText>
                </FormControl>
              </div>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (
              input.id &&
              taskPatch.input &&
              taskPatch.input[input.id] &&
              !isSuccess
            ) {
              delete taskPatch.input[input.id];
              setTaskPatch(task, taskPatch);
            }
            setInput(initialInput);
            reset();
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          onClick={() => {
            setInput(initialInput);
            commit();
          }}
          disabled={isSuccess || !canSubmit()}
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
