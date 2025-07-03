import React, { useState } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from './MissingTaskNode.module.scss';
import { StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Edit, Delete } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { TaskUpdateProvider } from 'app/Workflows/_context';
import { DeleteTaskModal } from 'app/Workflows/_components/Modals';
import { Alert, AlertTitle, Tooltip } from '@mui/material';

type NodeType = {
  taskId: string;
  outputs: Array<string>;
  inputs: Array<String>;
};

const TaskNode: React.FC<NodeProps> = ({ data }) => {
  const { taskId, inputs = [], outputs = [] } = data as NodeType;
  return (
    <>
      <div className={styles['node']}>
        <div className={styles['body']}>
          <Alert severity="error">
            <AlertTitle>Missing dependency</AlertTitle>
            <p>
              Task '<b>{taskId}</b>' doesn't exist but is specified as a
              dependencies in other task(s)
            </p>
            <p>
              To fix this, create a task with an id of '<b>{taskId}</b>' or
              remove it from all other task's dependencies
            </p>
          </Alert>
        </div>
        <div>
          {inputs.length > 0 && (
            <div className={styles['io']}>
              {Object.keys(inputs).map((key) => {
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
          {outputs.length > 0 && (
            <div className={styles['io']}>
              {Object.keys(outputs).map((key) => {
                return (
                  <div
                    className={styles['io-item']}
                    style={{ position: 'relative' }}
                  >
                    <div>
                      <StandardHandle
                        id={`input-${taskId}-${key}`}
                        type="target"
                        position={Position.Right}
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
