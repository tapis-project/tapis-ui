import React from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik, FieldArray } from 'formik';
import {
  FormikInput,
  GenericModal,
  Icon,
  SectionHeader,
} from 'tapis-ui/_common';
import { useRun } from 'tapis-hooks/workflows/pipelines';
import styles from './RunPipelineModal.module.scss';
import * as Yup from 'yup';
// import { Workflows } from '@tapis/tapis-typescript';

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
    params: Yup.array().of(
      Yup.object({
        key: Yup.string()
          .required('Key is required')
          .matches(
            /^[a-zA-Z0-9_]+$/g,
            'Key must contain only alphanumeric characters and underscores'
          ),
        value: Yup.string().min(1).required('Value is required'),
      })
    ),
  });

  const initialValues = {
    groupId,
    pipelineId,
    params: [],
  };

  type RunPipelineOnSubmitProps = {
    groupId: string;
    pipelineId: string;
    params: Array<{ key: string; value: string }>;
  };

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
            render={({ values }) => (
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
                <div className={styles['section-container']}>
                  <SectionHeader>
                    <span>Parameters</span>
                  </SectionHeader>
                  <div id="parameters">
                    <FieldArray
                      name="params"
                      render={(arrayHelpers) => (
                        <div>
                          <div className={styles['key-vals']}>
                            {values.params &&
                              values.params.length > 0 &&
                              values.params.map((_, i) => (
                                <div key={i} className={styles['key-val']}>
                                  {`param #${i + 1}`}
                                  <div className={styles['grid-2']}>
                                    <FormikInput
                                      id={`params.${i}.key`}
                                      name={`params.${i}.key`}
                                      label="key"
                                      required={true}
                                      description={`Parameter key`}
                                      aria-label="Input"
                                      value=""
                                    />
                                    <FormikInput
                                      id={`params.${i}.value`}
                                      name={`params.${i}.value`}
                                      label="value"
                                      required
                                      description={`Parameter value`}
                                      aria-label="Input"
                                      value=""
                                    />
                                  </div>
                                  <Button
                                    className={styles['remove-button']}
                                    type="button"
                                    color="danger"
                                    disabled={false}
                                    onClick={() => arrayHelpers.remove(i)}
                                    size="sm"
                                  >
                                    <Icon name="trash" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                          <Button
                            type="button"
                            className={styles['add-button']}
                            onClick={() => {
                              arrayHelpers.push({
                                key: '',
                                value: '',
                              });
                            }}
                          >
                            + Add Parameter
                          </Button>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </Form>
            )}
          />
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
