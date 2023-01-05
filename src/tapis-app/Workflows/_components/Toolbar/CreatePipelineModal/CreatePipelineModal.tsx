import React, { useCallback } from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { GenericModal } from 'tapis-ui/_common';
import { Workflows } from '@tapis/tapis-typescript';
import { useCreate } from 'tapis-hooks/workflows/pipelines';
import styles from './CreatePipelineModel.module.scss';
import { PipelineForm } from './_components';
import { default as queryKeys } from 'tapis-hooks/workflows/pipelines/queryKeys';
import { useQueryClient } from 'react-query';

type CreatePipelineModalProps = {
  toggle: () => void;
  groupId: string;
};

const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({
  groupId,
  toggle,
}) => {
  const { create, isLoading, isSuccess, error } = useCreate();
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(queryKeys.list);
  }, [queryClient]);

  const onSubmit = (reqPipeline: Workflows.ReqPipeline) => {
    create({ groupId: groupId!, reqPipeline }, { onSuccess });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Create Pipeline"
      size="lg"
      body={
        <div className={styles['pipeline-form-container']}>
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
