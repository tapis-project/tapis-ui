import React, { useState } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from './TaskNode.module.scss';
import { HiddenHandle, StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import {
  DeleteOutline,
  ErrorOutline,
  OpenWith,
  WarningAmber,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { TaskUpdateProvider } from 'app/Workflows/_context';
import { DeleteTaskModal } from 'app/Workflows/_components/Modals';
import { FormHelperText, TextField, Tooltip } from '@mui/material';
import {
  resolveFunctionTaskRuntimeImage,
  resolveImageBuildTaskImage,
} from 'app/Workflows/utils';

type NodeType = {
  task: Workflows.Task;
  tasks: Array<Workflows.Task>;
  groupId: string;
  pipeline: Workflows.Pipeline;
  showIO: boolean;
  // Task outputs that are referenced in other tasks either correctly or erroneously
  referencedKeys: Array<string>;
};

const resolveNodeImage = (task: Workflows.Task) => {
  switch (task.type) {
    case Workflows.EnumTaskType.Function:
      return resolveFunctionTaskRuntimeImage(task.runtime!);
    case Workflows.EnumTaskType.TapisJob:
      return 'data:image/png;base64,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';
    case Workflows.EnumTaskType.Template:
      return 'data:image/png;base64,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';
    case Workflows.EnumTaskType.ImageBuild:
      return resolveImageBuildTaskImage(task.builder!);
    default:
      return 'https://t3.ftcdn.net/jpg/06/54/14/70/360_F_654147004_3mnMUDadkASxqC2xJyhkuFuG0QMPIqMR.jpg';
  }
};

type InputValidation =
  | {
      type: 'success';
    }
  | {
      type: 'warning' | 'error';
      message: string;
      context: 'input' | 'inputType';
    };

// Returns null if no error and a string (error) when there is an error
const validateTaskInput = (
  key: string,
  input: Workflows.SpecWithValue,
  pipeline: Workflows.Pipeline
): InputValidation => {
  // ValueFrom objects should only have one key, therefore we will validate
  // the first one we find and return the result
  let sourceType = undefined;
  let env = pipeline.env || {};
  let params = pipeline.params || {};

  let envKey = input.value_from?.env;
  if (envKey !== undefined) {
    if (env[envKey] === undefined) {
      return {
        type: 'error',
        message: `This input is referencing an environment variable that does not exist (${envKey})`,
        context: 'input',
      };
    }
    sourceType = env[envKey].type as string;
  }

  let paramKey = input.value_from?.args;
  if (paramKey !== undefined) {
    if (params[paramKey] === undefined) {
      return {
        type: 'warning',
        message: `This value must be provided at runtime (${paramKey})`,
        context: 'input',
      };
    }
    sourceType = params[paramKey].type as string;
  }

  let taskOutput = input.value_from?.task_output;
  if (taskOutput !== undefined) {
    let taskId = taskOutput.task_id;
    let outputId = taskOutput.output_id;
    let filteredTasks = pipeline.tasks!.filter((t) => {
      return t.id === taskId;
    });

    if (filteredTasks.length < 1) {
      return {
        type: 'error',
        message: `This input is referencing an output of a task that does not exist (${taskId})`,
        context: 'input',
      };
    }

    let task = filteredTasks[0];
    let outputs = Object.keys(task.output || {});
    if (outputs === undefined || !outputs.includes(outputId)) {
      return {
        type: 'error',
        message: `Output '${outputId}' does not exist on task '${taskId}'`,
        context: 'input',
      };
    }

    sourceType = (task.output![outputId] as any).type;
  }

  if (input.type !== sourceType) {
    return {
      type: 'warning',
      message: `The value for input '${key}' is expected to be of type '${input.type}' but is receiving a value with type '${sourceType}'`,
      context: 'inputType',
    };
  }

  return { type: 'success' };
};

const TaskNode: React.FC<NodeProps> = ({ data }) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const history = useHistory();
  let { task, tasks, groupId, pipeline, showIO, referencedKeys } =
    data as NodeType;
  let inputs = task.input || {};
  let outputs = task.output || {};

  // References from inputs of other tasks to outputs from this task that do not exist
  const missingRefs = referencedKeys.filter(
    (k) => !Object.keys(outputs).includes(k)
  );
  return (
    <>
      <HiddenHandle
        key={`task-${task.id}-layout-target`}
        id={`task-${task.id}-layout-target`}
        type="target"
        position={Position.Left}
        style={{ top: '26px' }}
      />
      <div key={`task-node-${task.id}`}>
        <TaskUpdateProvider
          task={task}
          tasks={tasks}
          groupId={groupId}
          pipelineId={pipeline.id!}
        >
          <StandardHandle
            key={`task-${task.id}-target`}
            id={`task-${task.id}-target`}
            type="target"
            position={Position.Left}
            style={{ top: '26px' }}
          />
          <div className={styles['node']}>
            <div
              className={styles['header']}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  width: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <img
                  src={resolveNodeImage(task)}
                  className={styles['header-img']}
                />
                <Tooltip title={task.id}>
                  <span className={styles['title']}>{task.id}</span>
                </Tooltip>
              </div>
              <div />
              <div style={{ marginTop: '3px' }}>
                <DeleteOutline
                  className={styles['action']}
                  sx={{
                    color: '#666666',
                    '&:hover': {
                      color: 'red',
                    },
                  }}
                  fontSize="large"
                  onClick={() => {
                    setModal('delete');
                  }}
                />
              </div>
            </div>
            {task.description && (
              <div className={styles['body']}>
                <p className={styles['description']}>{task.description}</p>
              </div>
            )}
            <div>
              {Object.keys(inputs).length > 0 && showIO && (
                <div className={styles['io']}>
                  {Object.keys(inputs).map((key) => {
                    let validation = validateTaskInput(
                      key,
                      inputs[key],
                      pipeline
                    );
                    let type = inputs[key].type;
                    let required = inputs[key].required;
                    let description = inputs[key].description;
                    let value = inputs[key].value;
                    return (
                      <div
                        key={`task-node-${task.id}-input-${key}`}
                        className={styles['io-item']}
                        style={{ position: 'relative' }}
                      >
                        <div>
                          <StandardHandle
                            key={`input-${task.id}-${key}`}
                            id={`input-${task.id}-${key}`}
                            type="target"
                            position={Position.Left}
                          />
                        </div>
                        <div>
                          {value ? (
                            <div>
                              <TextField
                                className={styles['io-text-field']}
                                defaultValue={value as string}
                                size="small"
                                margin="none"
                                disabled
                                label={key}
                                variant="outlined"
                                onChange={() => {}}
                              />
                              <FormHelperText>{type}</FormHelperText>
                              <FormHelperText>{description}</FormHelperText>
                            </div>
                          ) : (
                            <div>
                              {validation.type === 'error' &&
                                validation.context === 'input' && (
                                  <Tooltip title={validation.message}>
                                    <ErrorOutline
                                      fontSize="small"
                                      sx={{ color: 'red', marginRight: '4px' }}
                                    />
                                  </Tooltip>
                                )}
                              {validation.type === 'warning' &&
                                validation.context === 'input' && (
                                  <Tooltip title={validation.message}>
                                    <WarningAmber
                                      fontSize="small"
                                      color="warning"
                                      sx={{ marginRight: '4px' }}
                                    />
                                  </Tooltip>
                                )}
                              <Tooltip title={key}>
                                <span style={{ lineHeight: '20px' }}>
                                  {key}{' '}
                                  {required && (
                                    <span style={{ color: 'red' }}>*</span>
                                  )}
                                </span>
                              </Tooltip>
                              <div className={styles['io-item-type']}>
                                {validation.type === 'warning' &&
                                  validation.context === 'inputType' && (
                                    <Tooltip title={validation.message}>
                                      <WarningAmber
                                        fontSize="small"
                                        color="warning"
                                        sx={{ marginRight: '4px' }}
                                      />
                                    </Tooltip>
                                  )}
                                {type}
                              </div>
                              {description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {Object.keys(outputs).length > 0 && showIO && (
                <div className={styles['io']}>
                  {Object.keys(outputs).map((key) => {
                    let output: any = outputs[key];
                    return (
                      <div
                        className={styles['io-item']}
                        style={{ position: 'relative' }}
                      >
                        <div style={{ textAlign: 'right' }}>
                          <Tooltip title={key}>
                            <span>{key}</span>
                          </Tooltip>
                          <div className={styles['io-item-type']}>
                            {output.type}
                          </div>
                        </div>
                        <StandardHandle
                          id={`output-${task.id}-${key}`}
                          type="source"
                          position={Position.Right}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {missingRefs.length > 0 && showIO && (
                <div className={styles['io']}>
                  {missingRefs.map((key) => {
                    return (
                      <div
                        className={`${styles['io-item']} ${styles['io-item-error']}`}
                        style={{ position: 'relative' }}
                      >
                        <div>
                          <StandardHandle
                            id={`output-${task.id}-${key}`}
                            type="source"
                            position={Position.Right}
                          />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Tooltip
                            title={`Output '${key}' is referenced by some task(s) but does not exist. Either add this output or remove the task input(s) that references it.`}
                          >
                            <div>
                              <span>{key}</span>
                              <ErrorOutline
                                fontSize="small"
                                sx={{ marginLeft: '8px', color: 'red' }}
                              />
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={styles['footer']}>
              <OpenWith
                className={styles['action']}
                sx={{
                  color: '#666666',
                  transform: 'rotate(45deg)',
                  '&:hover': {
                    color: '#999999',
                  },
                }}
                fontSize="large"
                onClick={() => {
                  history.push(
                    `/workflows/pipelines/${groupId}/${pipeline.id}/tasks/${task.id}`
                  );
                }}
              />
            </div>
          </div>
          <DeleteTaskModal
            open={modal === 'delete'}
            toggle={() => setModal(undefined)}
          />
          <StandardHandle
            id={`task-${task.id}-source`}
            type="source"
            position={Position.Right}
            style={{ top: '26px' }}
          />
        </TaskUpdateProvider>
      </div>
    </>
  );
};

export default TaskNode;
