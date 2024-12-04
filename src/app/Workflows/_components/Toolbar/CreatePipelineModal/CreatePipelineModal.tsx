import React, { useCallback } from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { GenericModal } from '@tapis/tapisui-common';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './CreatePipelineModel.module.scss';
import { PipelineForm } from './_components';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { useQueryClient } from 'react-query';

type BaseEnvVarType = {
  id: string;
  valueType: 'value' | 'source';
};

type LiteralEnvVarType = BaseEnvVarType & {
  value: string | number;
};

type SourceEnvVarType = {
  source: string;
  sourceKey: string;
};

export type EnvVarType = LiteralEnvVarType & SourceEnvVarType;

export type ReqPipelineTransform = Omit<Workflows.ReqPipeline, 'env'> & {
  env: Array<EnvVarType>;
};

type CreatePipelineModalProps = {
  toggle: () => void;
  groupId: string;
};

const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({
  groupId,
  toggle,
}) => {
  const { create, isLoading, isSuccess, error } = Hooks.Pipelines.useCreate();
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.Pipelines.queryKeys.list);
  }, [queryClient]);

  type EnvVarsTransformFn = (envVars: Array<EnvVarType>) => {
    [key: string]: object;
  };

  const envVarsArrayToInputObject: EnvVarsTransformFn = (envVars) => {
    const env: { [key: string]: object } = {};
    envVars.forEach((envVar) => {
      switch (envVar.valueType) {
        case 'value':
          env[envVar.id] = {
            type: 'string',
            value: envVar.value,
          };
          break;
        case 'source':
          env[envVar.id] = {
            type: 'string',
            value_from: { [envVar.source]: envVar.sourceKey },
          };
          break;
      }
    });
    return env;
  };

  const onSubmit = (reqPipeline: ReqPipelineTransform) => {
    let modifiedReqPipeline: Omit<Workflows.ReqPipeline, 'env'> & {
      env: { [key: string]: object };
    } = {
      ...reqPipeline,
      env: envVarsArrayToInputObject(reqPipeline.env),
    };

    create(
      {
        groupId: groupId!,
        reqPipeline: modifiedReqPipeline as Workflows.ReqPipeline,
      },
      { onSuccess }
    );
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Create Pipeline"
      size="lg"
      body={
        <div className={styles['form-container']}>
          <PipelineForm onSubmit={onSubmit} groupId={groupId} />
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created pipeline` : ''}
          reverse={true}
        >
          <Button
            form="newpipeline-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Pipeline
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreatePipelineModal;
