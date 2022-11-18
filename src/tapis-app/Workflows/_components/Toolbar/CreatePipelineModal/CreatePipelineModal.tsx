import React, { useCallback } from 'react';
import { GenericModal } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput } from 'tapis-ui/_common';
import { focusManager } from 'react-query';
import * as Yup from 'yup';

type CreatePipelineModalProps = {
  toggle: () => void;
  groupId?: string;
};

const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({
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
      title="Create Pipeline"
      body={
        <div>
          <Formik
            initialValues={{}}
            // validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="newpipeline-form">
              <FormikInput
                name="pipelineId"
                label="Pipeline name"
                required={true}
                description={`Creates a pipeline for group ${groupId}`}
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
          success={false ? `Successfully created pipeline` : ''}
          reverse={true}
        >
          <Button
            form="newpipeline-form"
            color="primary"
            disabled={false}
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
