import React from 'react';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput, Collapse } from 'tapis-ui/_common';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import { useList } from 'tapis-hooks/workflows/archives';
import styles from '../CreatePipelineModel.module.scss';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';

type FormProps = {
  onSubmit: (reqPipeline: Workflows.ReqPipeline) => void;
  groupId: string;
};

const initialValues: Workflows.ReqPipeline = {
  id: '',
  description: '',
  type: Workflows.EnumPipelineType.Workflow,
  archive_ids: [],
  execution_profile: {
    max_retries: 0,
    max_exec_time: 3600,
    invocation_mode: Workflows.EnumInvocationMode.Async,
    retry_policy: Workflows.EnumRetryPolicy.ExponentialBackoff,
  },
};

const baseValidationSchema = {
  id: Yup.string()
    .min(1)
    .max(255)
    .required('An pipeline requires an id')
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Must contain only alphanumeric characters and the following: '.', '_', '-'"
    ),
  type: Yup.string()
    .oneOf(Object.values(Workflows.EnumPipelineType))
    .required('type is required'),
  description: Yup.string().min(1).max(1024),
  archive_ids: Yup.array().of(Yup.string()),
  execution_profile: Yup.object({
    max_retries: Yup.number().min(-1).max(1000),
    max_exec_time: Yup.number().min(0),
    retry_policy: Yup.string().oneOf(Object.values(Workflows.EnumRetryPolicy)),
    invocation_mode: Yup.string().oneOf(
      Object.values(Workflows.EnumInvocationMode)
    ),
  }),
  tasks: Yup.array(),
};

const validationSchema = Yup.object({
  ...baseValidationSchema,
});

const PipelineForm: React.FC<FormProps> = ({ groupId, onSubmit }) => {
  const { data, isLoading, error } = useList({ groupId }); // Fetch the archives
  const archives = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={onSubmit}
        render={({ values }) => (
          <Form id="newpipeline-form">
            <FormikInput
              name="id"
              label="Pipeline id"
              required={true}
              description={``}
              aria-label="Input"
            />
            <FormikInput
              name="description"
              label="Description"
              required={false}
              description={``}
              aria-label="Input"
              type="textarea"
              value=""
            />
            <FormikInput
              name="type"
              label=""
              value={Workflows.EnumPipelineType.Workflow}
              required={true}
              description={``}
              aria-label="Input"
              type="hidden"
            />
            {/* Support only exists for single archive pipeline for now */}
            <FormikSelect
              name="archive_ids[0]"
              label={'Archive'}
              required={false}
              description={
                'The archive to which pipeline results will be persisted'
              }
              disabled={archives.length === 0}
            >
              <option disabled selected={true} value={''}>
                {archives.length > 0
                  ? ' -- select an option -- '
                  : ' -- no archives availalble -- '}
              </option>
              {Object.values(archives).map((archive) => {
                return <option value={archive.id}>{archive.id}</option>;
              })}
            </FormikSelect>
            <div className={styles['execution-profile']}>
              <Collapse title="Execution Profile">
                <FormikInput
                  name="execution_profile.max_retries"
                  label="Max retries"
                  required={false}
                  description={`How many times the pipeline will run after failing`}
                  aria-label="Input"
                  type="number"
                  disabled
                />
                <FormikInput
                  name="execution_profile.max_exec_time"
                  label="Max execution time"
                  required={false}
                  description={`Max lifetime the pipeline is allowed to run`}
                  aria-label="Input"
                  type="number"
                  disabled
                />
                <FormikSelect
                  name="execution_profile.invocation_mode"
                  label={'Invocation mode'}
                  required={false}
                  description={
                    "Affects task execution concurrency. Option 'sync' results serial task execution."
                  }
                  disabled
                >
                  {/* TODO enable sync invo mode when implemented */}
                  {Object.values(Workflows.EnumInvocationMode).map((mode) => {
                    return (
                      <option
                        value={mode}
                        disabled={mode === Workflows.EnumInvocationMode.Sync}
                      >
                        {mode}
                      </option>
                    );
                  })}
                </FormikSelect>
                <FormikSelect
                  name="execution_profile.retry_policy"
                  label={'Retry policy'}
                  required={false}
                  description={'Backoff algorithm'}
                  disabled
                >
                  {Object.values(Workflows.EnumRetryPolicy).map((policy) => {
                    return <option value={policy}>{policy}</option>;
                  })}
                </FormikSelect>
              </Collapse>
            </div>
          </Form>
        )}
      />
    </QueryWrapper>
  );
};

export default PipelineForm;
