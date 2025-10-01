import React, { useState } from 'react';
import { Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import styles from './EnvironmentNode.module.scss';
import { HiddenHandle, StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { ErrorOutline, Add, DeleteOutline } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { AddPipelineEnvVarModal } from '../../../../../../_components/Modals/AddPipelineEnvVarModal';
import { LoadingButton } from '@mui/lab';
import { FaBeer } from 'react-icons/fa';

type NodeType = {
  groupId: string;
  pipeline: Workflows.Pipeline;
  showIO: boolean;
  // Env vars that are referenced in other tasks either correctly or erroneously
  referencedKeys: Array<string>;
  onClickAdd: () => void;
};

const envImgSrc =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYYthigYhTiUuc_ELgxR0ePiN5wXgL7AVHxA&s';

const EnvVar: React.FC<{
  groupId: string;
  pipeline: Workflows.Pipeline;
  envVarKey: string;
}> = ({ groupId, pipeline, envVarKey }) => {
  const env = pipeline.env || {};
  const { patch, isLoading, isSuccess, isError, error, reset, invalidate } =
    Hooks.Pipelines.usePatch();
  return (
    <div
      className={styles['io-item']}
      style={{
        display: isSuccess ? 'none' : 'inherit',
        position: 'relative',
      }}
    >
      <StandardHandle
        id={`env-${envVarKey}`}
        type="source"
        position={Position.Right}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <LoadingButton
          loading={isLoading}
          onClick={() => {
            let modifiedEnv: typeof env = {};
            Object.keys(env).map((k) => {
              if (envVarKey !== k) {
                modifiedEnv[k] = env[k];
              }
            });
            patch(
              {
                pipelineId: pipeline.id!,
                groupId,
                reqPatchPipeline: {
                  env: modifiedEnv,
                },
              },
              {
                onSuccess: () => {
                  invalidate();
                },
              }
            );
          }}
          sx={{
            color: '#666666',
            cursor: 'pointer',
            '&:hover': {
              color: 'red',
            },
          }}
        >
          <DeleteOutline />
        </LoadingButton>
        <div />
        <div>
          <div style={{ textAlign: 'right' }}>
            <Tooltip title={envVarKey}>
              <span>{envVarKey}</span>
            </Tooltip>
          </div>
          <div
            className={styles['io-item-type']}
            style={{ textAlign: 'right' }}
          >
            {env[envVarKey].type}
          </div>
          <div>{env[envVarKey].description}</div>
        </div>
      </div>
    </div>
  );
};

const EnvironmentNode: React.FC<NodeProps> = ({ data }) => {
  const { pipeline, referencedKeys, showIO, groupId } = data as NodeType;
  const env = pipeline.env || {};
  const keys = Object.keys(env);
  // References from tasks to env variables that do not exist
  const missingRefs = referencedKeys.filter((k) => !keys.includes(k));
  const [modal, setModal] = useState<string | undefined>(undefined);

  return (
    <>
      <HiddenHandle
        key={`env-layout-target`}
        id={`env-layout-target`}
        type="target"
        position={Position.Left}
        style={{ top: '26px' }}
      />
      <HiddenHandle
        key={`env-layout-top-source`}
        id={`env-layout-top-source`}
        type="source"
        position={Position.Top}
      />
      <div key="env-node" className={styles['node']}>
        <div className={styles['body']}>
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
              <img src={envImgSrc} className={styles['header-img']} />
              <Tooltip title="Static data accessible to all tasks in this pipeline">
                <span className={styles['title']}>Environment</span>
              </Tooltip>
            </div>
            <div />
            <div style={{ marginTop: '3px' }}>
              <Add
                sx={{
                  color: '#666666',
                  '&:hover': {
                    cursor: 'pointer',
                    color: '#999999',
                  },
                }}
                fontSize="large"
                onClick={() => setModal('addenvvar')}
              />
            </div>
          </div>
        </div>
        <div>
          {keys.length > 0 && (
            <div className={styles['io']}>
              {keys.map((key) => {
                return (
                  <EnvVar
                    key={key}
                    groupId={groupId}
                    pipeline={pipeline}
                    envVarKey={key}
                  />
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
                        id={`env-${key}`}
                        type="source"
                        position={Position.Right}
                      />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tooltip
                        title={`Envrionment variable '${key}' is referenced by some task(s) but does not exist. Either add this envrionment variable or remove the task input(s) that references it.`}
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
      </div>
      <HiddenHandle
        key={`env-layout-bottom-target`}
        id={`env-layout-bottom-target`}
        type="target"
        position={Position.Bottom}
      />
      <HiddenHandle
        key={`env-layout-source`}
        id={`env-layout-source`}
        type="source"
        position={Position.Right}
        style={{ top: '26px' }}
      />
      <AddPipelineEnvVarModal
        pipeline={pipeline}
        groupId={groupId}
        open={modal === 'addenvvar'}
        toggle={() => {
          setModal(undefined);
        }}
      />
    </>
  );
};

export default EnvironmentNode;
