import React, { useCallback, useState } from 'react';
import {
  Handle,
  Position,
  NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react';
import styles from './EnvironmentNode.module.scss';
import { StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Edit, Delete } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type NodeType = { pipeline: Workflows.Pipeline };

const envImgSrc =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYYthigYhTiUuc_ELgxR0ePiN5wXgL7AVHxA&s';

const EnvironmentNode: React.FC<NodeProps> = ({ id, data }) => {
  const { pipeline } = data as NodeType;
  return (
    <>
      <div className={styles['node']}>
        <div className={styles['header']}>
          <img src={envImgSrc} className={styles['header-img']} />
          <span className={styles['title']}>Environment</span>
        </div>
        <div className={styles['body']}>
          <i className={styles['description']}>
            Pipeline environment variables
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

export default EnvironmentNode;
