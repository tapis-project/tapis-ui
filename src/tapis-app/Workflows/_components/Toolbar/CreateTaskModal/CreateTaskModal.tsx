import React, { useCallback, useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { GenericModal, LoadingSpinner } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import styles from './CreateTaskModal.module.scss';
import { Task } from './_components/forms';
import { TaskTypeSelector } from './_components';
import { useCreate } from 'tapis-hooks/workflows/tasks';
import { useDetails } from 'tapis-hooks/workflows/pipelines';
import { default as queryKeys } from 'tapis-hooks/workflows/pipelines/queryKeys';
import { useQueryClient } from 'react-query';

type CreateTaskModalProps = {
  toggle: () => void;
  groupId: string;
  pipelineId: string;
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  toggle,
  groupId,
  pipelineId,
}) => {
  const { create, isLoading, isSuccess, error } = useCreate();
  const {
    data,
    isLoading: isLoadingPipeline,
    error: errorPipeline,
  } = useDetails({ groupId, pipelineId });
  const pipeline: Workflows.Pipeline = data?.result!;

  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(queryKeys.details);
  }, [queryClient]);

  const [type, setType] = useState<string>('');
  const onSubmit = (reqTask: Workflows.ReqTask) => {
    create(
      { groupId: groupId!, pipelineId: pipelineId!, reqTask },
      { onSuccess }
    );
  };

  return (
    <GenericModal
      toggle={toggle}
      size="lg"
      title="Create Task"
      body={
        <div className={styles['form-container']}>
          {isLoadingPipeline ? (
            <LoadingSpinner />
          ) : type ? (
            <Task type={type} pipeline={pipeline} onSubmit={onSubmit} />
          ) : (
            <TaskTypeSelector setType={setType} />
          )}
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading || isLoadingPipeline}
          error={error || errorPipeline}
          success={isSuccess ? `Successfully created task` : ''}
          reverse={true}
        >
          <Button
            form="newtask-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Task
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateTaskModal;
