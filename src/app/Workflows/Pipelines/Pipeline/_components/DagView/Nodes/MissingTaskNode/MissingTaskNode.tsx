import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from './MissingTaskNode.module.scss';
import { StandardHandle } from '../../Handles';
import { Alert, AlertTitle, Tooltip } from '@mui/material';

type NodeType = {
  taskId: string;
  outputs: Array<string>;
  inputs: Array<String>;
  showIO: boolean;
};

const TaskNode: React.FC<NodeProps> = ({ data }) => {
  const {
    taskId,
    inputs = [],
    outputs = [],
    showIO = false,
  } = data as NodeType;

  return (
    <>
      <div className={styles['node']}>
        <div className={styles['body']}>
          <Alert severity="error">
            <AlertTitle>Missing dependency</AlertTitle>
            <p>
              Task '<b>{taskId}</b>' doesn't exist but is specified as a
              dependencies in other task(s) and/or its outputs are referenced
            </p>
            <p>
              To fix this, create a task with an id of '<b>{taskId}</b>' or
              remove it from all other task's dependencies and input
              specifications
            </p>
          </Alert>
        </div>
        <div>
          {inputs.length > 0 && showIO && (
            <div className={styles['io']}>
              {inputs.map((key) => {
                return (
                  <div
                    className={styles['io-item']}
                    style={{ position: 'relative' }}
                  >
                    <div>
                      <StandardHandle
                        id={`input-${taskId}-${key}`}
                        type="target"
                        position={Position.Left}
                      />
                    </div>
                    <div>
                      <Tooltip title={key}>
                        <span>{key}</span>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {outputs.length > 0 && showIO && (
            <div className={styles['io']}>
              {outputs.map((key) => {
                return (
                  <div
                    className={styles['io-item']}
                    style={{ position: 'relative' }}
                  >
                    <div>
                      <StandardHandle
                        id={`output-${taskId}-${key}`}
                        type="source"
                        position={Position.Right}
                      />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tooltip title={key}>
                        <span>{key}</span>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <StandardHandle
        id={`task-${taskId}-source`}
        type="source"
        position={Position.Right}
        style={{ top: '26px' }}
      />
    </>
  );
};

export default TaskNode;
