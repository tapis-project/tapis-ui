import React, { useCallback } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  AlertTitle,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as Yup from 'yup';
import { Form, Formik, FieldArray } from 'formik';
import { FormikInput, SectionHeader } from '@tapis/tapisui-common';
import { Delete } from '@mui/icons-material';
import styles from './RunPipelineModal.module.scss';
import { useQueryClient } from 'react-query';

type RunPipelineModalProps = {
  open: boolean;
  toggle: () => void;
  groupId: string;
  pipelineId: string;
  pipeline: Workflows.Pipeline;
};

const PipelineRunModal: React.FC<RunPipelineModalProps> = ({
  open,
  toggle,
  groupId,
  pipelineId,
  pipeline,
}) => {
  const { run, isError, isLoading, error, isSuccess, reset } =
    Hooks.Pipelines.useRun();

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

  type RunPipelineOnSubmitProps = {
    groupId: string;
    pipelineId: string;
    params: Array<{ key: string; value: string }>;
  };

  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.Pipelines.queryKeys.details);
    queryClient.invalidateQueries(Hooks.PipelineRuns.queryKeys.list);
    queryClient.invalidateQueries(Hooks.PipelineRuns.queryKeys.details);
  }, [queryClient]);

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
      },
      {
        onSuccess,
      }
    );
  };

  const pipelineParams = pipeline.params || {};

  const initialValues = {
    groupId,
    pipelineId,
    params: Object.entries(pipelineParams).map(([key, _]) => {
      return { key, value: '' };
    }),
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">Run pipeline</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully started pipeline '{pipeline.id}'
          </Alert>
        )}
        {isError && error && (
          <Alert
            severity="error"
            style={{ marginTop: '8px' }}
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}
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
                    <span>Arguments</span>
                  </SectionHeader>
                  <div id="parameters">
                    <FieldArray
                      name="params"
                      render={(arrayHelpers) => {
                        return (
                          <div>
                            <div className={styles['key-vals']}>
                              {values.params &&
                                values.params.length > 0 &&
                                values.params.map((param, i) => {
                                  return (
                                    <div key={i} className={styles['key-val']}>
                                      <div className={styles['grid-2']}>
                                        <FormikInput
                                          id={`params.${i}.key`}
                                          name={`params.${i}.key`}
                                          label={'key'}
                                          required={true}
                                          description={
                                            pipelineParams[param.key]
                                              ?.description || ''
                                          }
                                          aria-label="Input"
                                          disabled={
                                            pipelineParams[param.key]
                                              ?.required || false
                                          }
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
                                      {!pipelineParams[param.key]?.required && (
                                        <Button
                                          type="button"
                                          disabled={false}
                                          onClick={() => arrayHelpers.remove(i)}
                                          startIcon={<Delete />}
                                          color="error"
                                        >
                                          Delete
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
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
                              + Add Arg
                            </Button>
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>
              </Form>
            )}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={() => {
            reset();
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </LoadingButton>
        <LoadingButton
          form="runpipeline-form"
          type="submit"
          variant="outlined"
          color="primary"
          loading={isLoading}
          disabled={isSuccess}
          autoFocus
        >
          Run Pipeline
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default PipelineRunModal;
