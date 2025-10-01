import React, { useCallback, useState } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from './ArgsNode.module.scss';
import { HiddenHandle, StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Alert, AlertTitle, TextField, Tooltip } from '@mui/material';
import { Publish } from '@mui/icons-material';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { LoadingButton } from '@mui/lab';

type NodeType = {
  groupId: string;
  pipeline: Workflows.Pipeline;
  showIO: boolean;
  // Params that are referenced in other tasks either correctly or erroneously
  referencedKeys: Array<string>;
};

const argImageSrc = 'https://static.thenounproject.com/png/365795-200.png';
type ArgState = {
  [key: string]: string | number | undefined;
};

type RunPipelineOnSubmitProps = {
  groupId: string;
  pipelineId: string;
  params: Array<{ key: string; value: string }>;
};

const ArgsNode: React.FC<NodeProps> = ({ id, data }) => {
  // const params = pipeline.params || {};
  const { pipeline, groupId, referencedKeys, showIO } = data as NodeType;
  const initialState: ArgState = {};
  const [argState, setArgState] = useState(initialState);
  const { run, isLoading, isError, error, invalidate, reset, isSuccess } =
    Hooks.Pipelines.useRun();

  const onSubmit = ({
    groupId,
    pipelineId,
    params,
  }: RunPipelineOnSubmitProps) => {
    const modifiedParams: { [key: string]: object } = {};
    // Transform params to the type expected in reqRunPipeline
    params.forEach((param) => {
      modifiedParams[param.key] = {
        value: param.value,
      };
    });

    run(
      {
        groupId,
        pipelineId,
        reqRunPipeline: { args: modifiedParams },
      },
      {
        onSuccess: () => {
          setArgState(initialState);
          invalidate();
        },
      }
    );
  };

  const canSubmit = useCallback(() => {
    // No args are required so we can submit
    if (referencedKeys.length === 0) {
      return true;
    }

    if (argState === initialState) {
      return false;
    }

    for (let k of referencedKeys) {
      if (!argState[k]) {
        return false;
      }
    }

    return true;
  }, [argState, setArgState]);

  const isSecretField = (key: string) => {
    return (
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret')
    );
  };

  return (
    <>
      <HiddenHandle
        key={`args-layout-target`}
        id={`args-layout-target`}
        type="target"
        position={Position.Left}
      />
      <HiddenHandle
        key={`${id}-layout-top-source`}
        id={`${id}-layout-top-source`}
        type="source"
        position={Position.Top}
      />
      <div key="args-node" className={styles['node']}>
        <div className={styles['body']}>
          <div className={styles['header']}>
            <img src={argImageSrc} className={styles['header-img']} />
            <span className={styles['title']}>Submit</span>
          </div>
        </div>
        <div>
          {isSuccess && (
            <Alert
              severity="success"
              onClose={() => {
                reset();
              }}
            >
              Successfully submitted pipeline
            </Alert>
          )}
          {isError && error && (
            <Alert
              severity="error"
              onClose={() => {
                reset();
              }}
            >
              <AlertTitle>Error submitting pipeline</AlertTitle>
              {error.message}
            </Alert>
          )}
          {referencedKeys.length > 0 && showIO && (
            <div className={styles['io']}>
              {referencedKeys.map((key) => {
                return (
                  <div
                    className={`${styles['io-item']} ${styles['io-item-warning']}`}
                    style={{ position: 'relative' }}
                  >
                    <div>
                      <StandardHandle
                        id={`arg-${key}`}
                        type="source"
                        position={Position.Right}
                      />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <TextField
                        fullWidth
                        defaultValue={''}
                        required
                        autoComplete="off"
                        // type={isSecretField(key) ? 'password' : undefined}
                        size="small"
                        margin="none"
                        label={key}
                        variant="outlined"
                        error={
                          JSON.stringify(argState) !==
                            JSON.stringify(initialState) && !argState[key]
                        }
                        helperText={
                          (argState[key] === undefined ||
                            argState[key] === '') &&
                          JSON.stringify(argState) !==
                            JSON.stringify(initialState)
                            ? `Missing value for argument ${key}`
                            : ''
                        }
                        FormHelperTextProps={{
                          sx: {
                            color: 'error.main',
                            p: 0,
                            m: 0,
                            marginTop: '4px',
                            textWrap: 'wrap',
                          },
                        }}
                        onChange={(e) => {
                          let value = e.target.value;
                          setArgState({
                            ...argState,
                            [key]: value,
                          });
                        }}
                        sx={{
                          '& label.MuiInputLabel-asterisk': {
                            color: 'red',
                          },
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={styles['footer']}>
          <LoadingButton
            size="small"
            startIcon={<Publish />}
            disabled={!canSubmit()}
            loading={isLoading}
            onClick={() => {
              let params = Object.keys(argState).map((key) => {
                return {
                  key,
                  value: argState[key] as string,
                };
              });
              onSubmit({
                groupId,
                pipelineId: pipeline.id!,
                params,
              });
            }}
          >
            Submit
          </LoadingButton>
        </div>
      </div>
      <HiddenHandle
        key={`${id}-layout-bottom-target`}
        id={`${id}-layout-bottom-target`}
        type="target"
        position={Position.Bottom}
      />
      <HiddenHandle
        key={`args-layout-source`}
        id={`args-layout-source`}
        type="source"
        position={Position.Right}
      />
    </>
  );
};

export default ArgsNode;
