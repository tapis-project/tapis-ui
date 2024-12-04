import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from './ArgsNode.module.scss';
import { StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Edit, Delete } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type NodeType = { pipeline: Workflows.Pipeline };

const argImageSrc =
  'data:image/png;base64,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';

const ArgsNode: React.FC<NodeProps> = ({ data }) => {
  const { pipeline } = data as NodeType;
  return (
    <>
      <div className={styles['node']}>
        <div className={styles['header']}>
          <img src={argImageSrc} className={styles['header-img']} />
          <span className={styles['title']}>Arguments</span>
        </div>
        <div className={styles['body']}>
          <i className={styles['description']}>
            Runtime arguments that can be used as task input
          </i>
        </div>
      </div>
      <StandardHandle
        id={`env-handle-${pipeline.id}`}
        type="source"
        position={Position.Right}
      />
    </>
  );
};

export default ArgsNode;
