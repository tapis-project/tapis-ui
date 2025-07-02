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
import { Tooltip } from '@mui/material';

type NodeType = { pipeline: Workflows.Pipeline };

const envImgSrc =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYYthigYhTiUuc_ELgxR0ePiN5wXgL7AVHxA&s';

const EnvironmentNode: React.FC<NodeProps> = ({ id, data }) => {
  const { pipeline } = data as NodeType;
  const params = pipeline.params || {}
  return (
    <>
      <div className={styles['node']}>
        <div className={styles['body']}>
          <div className={styles['header']}>
            <img src={envImgSrc} className={styles['header-img']} />
            <span className={styles['title']}>Environment</span>
          </div>
        </div>
        <div>
          {
            Object.keys(params).length > 0 && (
              <div className={styles['io']}>
                {
                  Object.keys(params).map((key) => {
                    // let param = pipeline.params![key];
                    return (
                      <div
                        className={styles['io-item']}
                        style={{position: "relative"}}
                      >
                        <div>
                          <StandardHandle id={`arg-${key}`} type="source" position={Position.Right} />
                        </div>
                        <div>
                          <Tooltip title={key}>
                            <span>{key}</span>
                          </Tooltip>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )
          }
        </div>
      </div>
      <StandardHandle
        id={`env-handle-${pipeline.id}`}
        type="source"
        position={Position.Right}
        style={{top: "26px"}}
      />
    </>
  );
};

export default EnvironmentNode;
