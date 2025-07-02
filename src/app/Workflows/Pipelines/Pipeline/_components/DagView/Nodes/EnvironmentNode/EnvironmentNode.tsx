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

type NodeType = { 
  pipeline: Workflows.Pipeline
  // Env vars that are referenced in other tasks either correctly or erroneously
  referencedKeys: Array<string> 
};

const envImgSrc =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYYthigYhTiUuc_ELgxR0ePiN5wXgL7AVHxA&s';

const EnvironmentNode: React.FC<NodeProps> = ({ data }) => {
  const { pipeline, referencedKeys } = data as NodeType;
  const keys = Object.keys(pipeline.env || {})
  // References from tasks to env variables that do not exist
  const missingRefs = referencedKeys.filter((k) => !keys.includes(k))

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
            missingRefs.length > 0 && (
              <div className={styles['io']}>
                {
                  keys.map((key) => {
                    return (
                      <div
                        className={styles['io-item']}
                        style={{position: "relative"}}
                      >
                        <div>
                          <StandardHandle id={`env-${key}`} type="source" position={Position.Right} />
                        </div>
                        <div style={{textAlign: "right"}}>
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
          {
            missingRefs.length > 0 && (
              <div className={styles['io']}>
                {
                  missingRefs.map((key) => {
                    return (
                      <div
                        className={`${styles['io-item']} ${styles['io-item-error']}`}
                        style={{position: "relative"}}
                      >
                        <div>
                          <StandardHandle id={`env-${key}`} type="source" position={Position.Right} />
                        </div>
                        <div style={{textAlign: "right"}}>
                          <Tooltip title={`Envrionment variable '${key}' is referenced by some task(s) but does not exist. Either add this envrionment variable or remove that task input that references it.`}>
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
    </>
  );
};

export default EnvironmentNode;
