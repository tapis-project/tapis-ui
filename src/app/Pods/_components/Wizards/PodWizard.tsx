import React, { useEffect, useCallback, useState } from 'react';
import {
  Button,
  MenuItem,
  Collapse,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import {
  SubmitWrapper,
  FMTextField,
  FMSelect,
  JSONEditor,
} from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import AutoPruneEmptyFields from './Common/AutoPruneEmptyFields';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import styles from './Common/Wizard.module.scss';

export enum PodProtocolEnum {
  http = 'http',
  tcp = 'tcp',
  postgres = 'postgres',
  local_only = 'local_only',
}

export enum PodVolumeEnum {
  tapisvolume = 'tapisvolume',
  tapissnapshot = 'tapissnapshot',
  pvc = 'pvc',
}

const podProtocols = Object.values(PodProtocolEnum);
const podVolumeTypes = Object.values(PodVolumeEnum);

export type PodWizardProps = {
  sharedData: any;
  setSharedData: any;
};

const PodWizard: React.FC<PodWizardProps> = ({ sharedData, setSharedData }) => {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState<'form' | 'json'>('form');
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getPod);
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const initialValues: any = {
    pod_id: '',
    description: '',
    command: '',
    image: '',
    template: '',
    time_to_stop_default: '',
    time_to_stop_instance: '',
    environment_variables: [],
    volume_mounts: [],
    networking: [],
    resources: {
      cpu_request: '',
      cpu_limit: '',
      mem_request: '',
      mem_limit: '',
      gpus: '',
    },
  };

  // Validation schema (adapted from CreatePodModal)
  const validationSchema = Yup.object({
    pod_id: Yup.string()
      .min(1)
      .max(80, 'Pod id should not be longer than 80 characters')
      .matches(
        /^[a-z0-9]+$/,
        'Must contain only lowercase alphanumeric characters'
      )
      .required('Pod ID is a required field'),
    image: Yup.string()
      .min(1)
      .max(128, 'Pod Image should not be longer than 128 characters'),
    template: Yup.string()
      .min(1)
      .max(128, 'Pod Template should not be longer than 128 characters'),
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    command: Yup.string(),
    environment_variables: Yup.array().of(
      Yup.object({
        key: Yup.string()
          .min(1)
          .max(128, 'Key should not be longer than 128 characters')
          .required('Key is required'),
        value: Yup.string()
          .min(1)
          .max(128, 'Value should not be longer than 128 characters')
          .required('Value is required'),
      })
    ),
    volume_mounts: Yup.array().of(
      Yup.object({
        id: Yup.string()
          .min(1)
          .max(128, 'ID should not be longer than 128 characters')
          .required('ID is required'),
        type: Yup.string()
          .min(1)
          .max(128, 'Type should not be longer than 128 characters')
          .required('Type is required'),
        mount_path: Yup.string()
          .min(1)
          .max(128, 'Mount path should not be longer than 128 characters')
          .required('Mount path is required'),
        sub_path: Yup.string()
          .min(0)
          .max(128, 'Sub path should not be longer than 128 characters'),
      })
    ),
    networking: Yup.array().of(
      Yup.object({
        id: Yup.string()
          .min(1)
          .max(128, 'ID should not be longer than 128 characters'),
        protocol: Yup.string()
          .min(1)
          .max(128, 'Protocol should not be longer than 128 characters'),
        port: Yup.string()
          .min(1)
          .max(128, 'Port should not be longer than 128 characters'),
      })
    ),
    resources: Yup.object({
      cpu_request: Yup.string()
        .min(0)
        .max(128, 'CPU request should not be longer than 128 characters'),
      cpu_limit: Yup.string()
        .min(0)
        .max(128, 'CPU limit should not be longer than 128 characters'),
      mem_request: Yup.string()
        .min(0)
        .max(128, 'Memory request should not be longer than 128 characters'),
      mem_limit: Yup.string()
        .min(0)
        .max(128, 'Memory limit should not be longer than 128 characters'),
      gpus: Yup.string()
        .min(0)
        .max(128, 'GPUs should not be longer than 128 characters'),
    }),
    time_to_stop_default: Yup.string(),
    time_to_stop_instance: Yup.string(),
  });

  // Transform functions for env vars, networking, volume mounts
  type EnvVarType = { key: string; value: string };
  type NetworkingType = { id: string; protocol: string; port: string };

  type VolumeMountsType = {
    id: string;
    type: string;
    mount_path: string;
    sub_path: string;
  };

  const { createPod, isLoading, error, isSuccess, reset } =
    Hooks.useCreatePod();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = (
    {
      pod_id,
      description,
      command,
      image,
      template,
      time_to_stop_default,
      time_to_stop_instance,
      environment_variables,
      networking,
      volume_mounts,
      resources,
    }: any,
    { setSubmitting }: any
  ) => {
    const newPod = {
      pod_id,
      description: description ? description : undefined,
      command: command ? JSON.parse(command) : undefined,
      template: template ? template : undefined,
      image: image ? image : undefined,
      time_to_stop_default: time_to_stop_default
        ? time_to_stop_default
        : undefined,
      time_to_stop_instance: time_to_stop_instance
        ? time_to_stop_instance
        : undefined,
      environment_variables:
        environment_variables && environment_variables.length > 0
          ? environment_variables
          : undefined,
      networking: networking && networking.length > 0 ? networking : undefined,
      volume_mounts:
        volume_mounts && volume_mounts.length > 0 ? volume_mounts : undefined,
      resources: resources ? resources : undefined,
    };
    createPod({ newPod }, { onSuccess });
    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    setSharedData(formik.values);
  }, [formik.values, setSharedData]);

  return (
    <div>
      <FormControlLabel
        control={
          <Switch
            checked={editMode === 'json'}
            onChange={() => setEditMode(editMode === 'json' ? 'form' : 'json')}
            color="primary"
          />
        }
        label={editMode === 'json' ? 'JSON Editor' : 'Form Editor'}
        style={{ marginBottom: 16 }}
      />
      {editMode === 'json' ? (
        <JSONEditor
          style={{ width: '100%', fontSize: 12, lineHeight: 1 }}
          renderNewlinesInError
          obj={formik.values}
          actions={[
            {
              name: 'Create Pod',
              disableOnError: true,
              disableOnUndefined: true,
              disableOnIsLoading: true,
              disableOnSuccess: true,
              error:
                error !== null
                  ? {
                      title: 'Error',
                      message: error.message,
                    }
                  : undefined,
              result: isSuccess
                ? {
                    success: isSuccess,
                    message: 'Successfully created pod',
                  }
                : undefined,
              isLoading,
              isSuccess,
              actionFn: (obj: any) => {
                if (obj !== undefined) {
                  createPod(
                    { newPod: obj },
                    {
                      onSuccess: (data: any) => {
                        onSuccess();
                      },
                    }
                  );
                }
              },
            },
          ]}
          onCloseError={() => {
            reset();
          }}
          onCloseSuccess={() => {
            reset();
          }}
        />
      ) : (
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Pod created.` : ''}
          reverse={true}
        >
          <Button
            sx={{ mb: '.75rem' }}
            form="create-pod-form"
            color="primary"
            disabled={isLoading || Object.keys(formik.values).length === 0}
            aria-label="Submit"
            type="submit"
            variant="outlined"
          >
            Submit Pod
          </Button>
        </SubmitWrapper>
      )}
      {editMode !== 'json' && (
        <FormikProvider value={formik}>
          <form id="create-pod-form" onSubmit={formik.handleSubmit}>
            <AutoPruneEmptyFields validationSchema={validationSchema} />
            <FMTextField
              formik={formik}
              name="pod_id"
              label="Pod ID"
              description="ID for this pod, unique per-tenant"
            />
            <FMTextField
              formik={formik}
              name="description"
              label="Description"
              multiline={true}
              description="Description of this pod for future reference"
            />
            <FMTextField
              formik={formik}
              name="image"
              label="Image"
              description="Docker image to use, must be on allowlist. ex. mongo:6.0"
            />
            <FMTextField
              formik={formik}
              name="template"
              label="Template"
              description="Pods template to use."
            />
            <FMTextField
              formik={formik}
              name="command"
              label="Command"
              description='Pod Command - Overwrites docker image. ex. ["sleep", "5000"]'
            />
            <FMTextField
              formik={formik}
              name="time_to_stop_default"
              label="Time To Stop - Default"
              description="Default TTS - Seconds until pod is stopped, set each time pod is started"
            />
            <FMTextField
              formik={formik}
              name="time_to_stop_instance"
              label="Time To Stop - Instance"
              description="Instance TTS - Seconds until pod is stopped, for only current 'run'"
            />
            {/* Environment Variables */}
            <FieldArray
              name="environment_variables"
              render={(arrayHelpers) => (
                <div>
                  <div className={styles['key-val-env-vars']}>
                    {formik.values.environment_variables &&
                      formik.values.environment_variables.length > 0 &&
                      formik.values.environment_variables.map(
                        (_: any, i: any) => (
                          <div key={i} className={styles['key-val-env-var']}>
                            <FMTextField
                              formik={formik}
                              name={`environment_variables.${i}.key`}
                              label="Key"
                              description="Environment variable key"
                            />
                            <FMTextField
                              formik={formik}
                              name={`environment_variables.${i}.value`}
                              label="Value"
                              description="Environment variable value"
                            />
                            <Button
                              variant="outlined"
                              className={styles['remove-button']}
                              type="button"
                              color="error"
                              onClick={() => arrayHelpers.remove(i)}
                              size="medium"
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      )}
                  </div>
                  <Button
                    type="button"
                    className={styles['add-button']}
                    onClick={() => arrayHelpers.push({ key: '', value: '' })}
                  >
                    + Add "environment_variable" object
                  </Button>
                </div>
              )}
            />
            {/* Networking */}
            <FieldArray
              name="networking"
              render={(arrayHelpers) => (
                <div>
                  <div className={styles['key-val-env-vars']}>
                    {formik.values.networking &&
                      formik.values.networking.length > 0 &&
                      formik.values.networking.map((_: any, i: any) => (
                        <div key={i} className={styles['key-val-env-var']}>
                          <FMTextField
                            formik={formik}
                            name={`networking.${i}.id`}
                            label="ID"
                            description="Networking key (default sets main url)"
                          />
                          <FMSelect
                            formik={formik}
                            name={`networking.${i}.protocol`}
                            label="Protocol"
                            labelId={''}
                            description="Network protocol"
                          >
                            <MenuItem disabled value={''}>
                              Select a network protocol
                            </MenuItem>
                            {podProtocols.map((value) => (
                              <MenuItem key={value} value={value}>
                                {value}
                              </MenuItem>
                            ))}
                          </FMSelect>
                          <FMTextField
                            formik={formik}
                            name={`networking.${i}.port`}
                            label="Port"
                            description="Port to route"
                          />
                          <Button
                            variant="outlined"
                            className={styles['remove-button']}
                            type="button"
                            color="error"
                            onClick={() => arrayHelpers.remove(i)}
                            size="medium"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    type="button"
                    className={styles['add-button']}
                    onClick={() =>
                      arrayHelpers.push({ id: '', protocol: '', port: '' })
                    }
                  >
                    + Add "networking" object
                  </Button>
                </div>
              )}
            />
            {/* Volume Mounts */}
            <FieldArray
              name="volume_mounts"
              render={(arrayHelpers) => (
                <div>
                  <div className={styles['key-val-env-vars']}>
                    {formik.values.volume_mounts &&
                      formik.values.volume_mounts.length > 0 &&
                      formik.values.volume_mounts.map((_: any, i: any) => (
                        <div key={i} className={styles['key-val-env-var']}>
                          <FMTextField
                            formik={formik}
                            name={`volume_mounts.${i}.id`}
                            label="ID"
                            description="Name of tapisvolume/snapshot; unique name for pvc"
                          />
                          <FMSelect
                            formik={formik}
                            name={`volume_mounts.${i}.type`}
                            label="Type"
                            labelId={''}
                            description="Volume type to use"
                          >
                            <MenuItem disabled value={''}>
                              Select a volume type
                            </MenuItem>
                            {podVolumeTypes.map((value) => (
                              <MenuItem key={value} value={value}>
                                {value}
                              </MenuItem>
                            ))}
                          </FMSelect>
                          <FMTextField
                            formik={formik}
                            name={`volume_mounts.${i}.mount_path`}
                            label="Mount Path"
                            description="Path to mount volume in pod"
                          />
                          <FMTextField
                            formik={formik}
                            name={`volume_mounts.${i}.sub_path`}
                            label="Sub Path"
                            description="Path from volume to mount"
                          />
                          <Button
                            variant="outlined"
                            className={styles['remove-button']}
                            type="button"
                            color="error"
                            onClick={() => arrayHelpers.remove(i)}
                            size="medium"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    type="button"
                    className={styles['add-button']}
                    onClick={() =>
                      arrayHelpers.push({
                        id: '',
                        type: '',
                        mount_path: '',
                        sub_path: '',
                      })
                    }
                  >
                    + Add "volume_mount" object
                  </Button>
                </div>
              )}
            />
            {/* Compute Resources */}
            <div
              id={`compute_resources`}
              className={styles['grid-5']}
              style={{ marginTop: 16 }}
            >
              <FMTextField
                formik={formik}
                name="resources.cpu_limit"
                label="CPU Limit"
                description={'millicpus'}
              />
              <FMTextField
                formik={formik}
                name="resources.cpu_request"
                label="CPU Request"
                description={'millicpus'}
              />
              <FMTextField
                formik={formik}
                name="resources.mem_limit"
                label="Memory Limit"
                description={'megabytes'}
              />
              <FMTextField
                formik={formik}
                name="resources.mem_request"
                label="Memory Request"
                description={'megabytes'}
              />
              <FMTextField
                formik={formik}
                name="resources.gpus"
                label="GPUs"
                description={'integers'}
              />
            </div>
          </form>
        </FormikProvider>
      )}
    </div>
  );
};

export default PodWizard;
