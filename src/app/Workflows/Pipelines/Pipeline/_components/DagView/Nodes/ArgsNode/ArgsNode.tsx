import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from './ArgsNode.module.scss';
import { StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Edit, Delete } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type NodeType = { pipeline: Workflows.Pipeline };

const ArgsNode: React.FC<NodeProps> = ({ data }) => {
  const { pipeline } = data as NodeType;
  return (
    <>
      <div className={styles['node']}>
        <div className={styles['header']}>
          <span className={styles['title']}>Arguments</span>
        </div>
        <div className={styles['body']}>
          <i className={styles['description']}>
            Runtime arguments that can be used as task input
          </i>
        </div>
        <div>
          {Object.entries(pipeline.params!).map(([k, v], i) => {
            return <div className={styles['arg']}>{k}</div>;
          })}
        </div>
      </div>
      {Object.entries(pipeline.params!).map(([k, v], i) => {
        return (
          <StandardHandle
            id={`arg-handle-${k}`}
            type="source"
            position={Position.Right}
            style={{ top: `${81 + i * 25}px` }}
          />
        );
      })}
    </>
  );
};

export default ArgsNode;
