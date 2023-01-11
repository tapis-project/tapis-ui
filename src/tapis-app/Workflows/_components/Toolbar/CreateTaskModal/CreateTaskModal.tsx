import React, { useCallback, useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { GenericModal } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import styles from './CreateTaskModal.module.scss';
import { Task } from './_components/forms';
import { TaskTypeSelector } from './_components';
import { useCreate } from 'tapis-hooks/workflows/tasks';
import { default as queryKeys } from 'tapis-hooks/workflows/pipelines/queryKeys';
import { useQueryClient } from 'react-query';

type CreateTaskModalProps = {
  toggle: () => void;
  groupId?: string;
  pipelineId?: string;
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  toggle,
  groupId,
  pipelineId,
}) => {
  const { create, isLoading, isSuccess, error } = useCreate();
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(queryKeys.details);
  }, [queryClient]);

  const [type, setType] = useState<string>('');
  // const [ validationSchema, setValidationSchema ] = useState<Yup.ObjectSchema<any>|undefined>(undefined)
  // const [ initialValues, setInitialValues ] = useState<Workflows.ReqTask|undefined>(undefined)
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
          {type ? (
            <Task type={type} onSubmit={onSubmit} />
          ) : (
            <TaskTypeSelector setType={setType} />
          )}
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
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
