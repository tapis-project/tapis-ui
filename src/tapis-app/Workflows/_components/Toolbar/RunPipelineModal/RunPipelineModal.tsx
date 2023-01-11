import React from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput, GenericModal } from 'tapis-ui/_common';
import { useRun } from 'tapis-hooks/workflows/pipelines';
import styles from './RunPipelineModal.module.scss';
import * as Yup from 'yup';

type RunPipelineModalProps = {
  toggle: () => void;
  groupId: string;
  pipelineId: string;
};

const PipelineRunModal: React.FC<RunPipelineModalProps> = ({
  toggle,
  groupId,
  pipelineId,
}) => {
  const { run, isLoading, error, isSuccess } = useRun();

  const validationSchema = Yup.object({
    groupId: Yup.string()
      .min(1)
      .max(255, 'Group id cannot be longer than 255 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('groupId is a required field'),
    pipelineId: Yup.string()
      .min(1)
      .max(255, 'Pipeline id cannot be longer than 255 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('pipelineId is a required field'),
  });

  const initialValues = {
    groupId,
    pipelineId,
  };

  type RunPipelineFormProps = {
    groupId: string;
    pipelineId: string;
  };

  const onSubmit = ({ groupId, pipelineId }: RunPipelineFormProps) => {
    run(
      {
        groupId,
        pipelineId,
        reqRunPipeline: { directives: [] },
      }
      // { onSuccess }
    );
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Run Pipeline"
      body={
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            render={(_) => (
              <Form id="runpipeline-form">
                <div className={styles['grid-2']}>
                  <FormikInput
                    name="groupId"
                    type="text"
                    label={'group id'}
                    required={true}
                    value={groupId}
                    disabled={true}
                    description=""
                    aria-label="Input"
                  />
                  <FormikInput
                    name="pipelineId"
                    type="text"
                    label={'pipeline id'}
                    required={true}
                    description=""
                    value={pipelineId}
                    disabled={true}
                    aria-label="Input"
                  />
                </div>
              </Form>
            )}
          ></Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Pipeline run request submitted` : ''}
          reverse={true}
        >
          <Button
            form="runpipeline-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Run Pipeline
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default PipelineRunModal;
