import React, { useCallback, useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { GenericModal } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { focusManager } from 'react-query';
import styles from "./CreateTaskModal.module.scss"
import { Task } from "./_components/forms"
import { TaskTypeSelector } from "./_components"
import { useCreate } from "tapis-hooks/workflows/tasks"

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
  const { create, isLoading, isSuccess, error } = useCreate()
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const [ type, setType ] = useState<string>("")
  // const [ validationSchema, setValidationSchema ] = useState<Yup.ObjectSchema<any>|undefined>(undefined)
  // const [ initialValues, setInitialValues ] = useState<Workflows.ReqTask|undefined>(undefined)
  const onSubmit = (reqTask: Workflows.ReqTask) => {
    create({groupId: groupId!, pipelineId: pipelineId!, reqTask}, {onSuccess});
  }

  return (
    <GenericModal
      toggle={toggle}
      size="lg"
      title="Create Task"
      body={
        <div className={styles["form-container"]}>
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
