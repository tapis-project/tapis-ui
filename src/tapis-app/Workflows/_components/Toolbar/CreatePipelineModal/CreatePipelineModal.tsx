import React, { useCallback } from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { GenericModal } from 'tapis-ui/_common';
import { Workflows } from '@tapis/tapis-typescript';
import { useCreate } from 'tapis-hooks/workflows/pipelines';
import { focusManager } from 'react-query';
import styles from './CreatePipelineModel.module.scss';
import { PipelineForm } from './_components';

type CreatePipelineModalProps = {
  toggle: () => void;
  groupId: string;
};

const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({
  groupId,
  toggle,
}) => {
  const { create, isLoading, isSuccess, error } = useCreate();
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

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
