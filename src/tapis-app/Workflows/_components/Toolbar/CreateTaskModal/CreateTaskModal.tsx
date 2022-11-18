import React, { useCallback } from 'react';
import { GenericModal } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput } from 'tapis-ui/_common';
import { focusManager } from 'react-query';
import * as Yup from 'yup';

type CreateTaskModalProps = {
  toggle: () => void;
  groupId?: string;
  pipelineId?: string;
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  toggle,
  groupId,
}) => {
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onSubmit = () => {
    alert('subitted');
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Create Task"
      body={
        <div>
          <Formik
            initialValues={{}}
            // validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="newtask-form">
              <FormikInput
                name="taskId"
                label="Task name"
                required={true}
                description={`Creates a task for group ${groupId}`}
                aria-label="Input"
              />
            </Form>
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={false}
          error={null}
          success={false ? `Successfully created task` : ''}
          reverse={true}
        >
          <Button
            form="newtask-form"
            color="primary"
            disabled={false}
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
