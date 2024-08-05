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
            Vaues provided at runtime that can be used as task input
          </i>
        </div>
      </div>
      {pipeline.env &&
        Object.entries(pipeline.env).map(([varName, value]) => {
          return (
            <StandardHandle
              id={varName}
              type="source"
              position={Position.Bottom}
            />
          );
        })}
    </>
  );
};

export default ArgsNode;
