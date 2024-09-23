import React, { useEffect, useCallback, useState } from 'react';
import { Button, MenuItem } from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import {
  GenericModal,
  SubmitWrapper,
  FMTextField,
  FMSelect,
} from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import AutoPruneEmptyFields from './Common/AutoPruneEmptyFields';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import styles from './Common/Wizard.module.scss';

export type PodWizardProps = {
  sharedData: any;
  setSharedData: any;
};

const PodWizardEdit: React.FC<PodWizardProps> = ({
  sharedData,
  setSharedData,
}) => {
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getPod);
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const objId = useLocation().pathname.split('/')[2];

  const initialValues: any = {
    description: '',
    command: '',
  };

  const validationSchema = Yup.object({
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    command: Yup.string(),
    time_to_stop_default: Yup.number().min(-1),
    time_to_stop_instance: Yup.number().min(-1),
    environment_variables: Yup.array().of(
      Yup.object().shape({
        key: Yup.string().required(),
        value: Yup.string(),
      })
    ),
    networking: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        protocol: Yup.string(),
        port: Yup.string(),
      })
    ),
    volume_mounts: Yup.array().of(
      Yup.object().shape({
        mount_path: Yup.string(),
        volume_id: Yup.string(),
      })
    ),
    resources: Yup.object().shape({
      cpu_request: Yup.number().min(0),
      cpu_limit: Yup.number().min(0),
      mem_request: Yup.number().min(0),
      mem_limit: Yup.number().min(0),
      gpus: Yup.number().min(0),
    }),
  });

  enum PodProtocolEnum {
    http = 'http',
    tcp = 'tcp',
    postgres = 'postgres',
    local_only = 'local_only',
  }

  enum PodVolumeEnum {
    tapisvolume = 'tapisvolume',
    tapissnapshot = 'tapissnapshot',
    pvc = 'pvc',
  }

  /// Environment Variables area
  //////////////////////////////
  type EnvVarType = {
    key: string;
    value: string;
  };

  type EnvVarsTransformFn = (envVars: Array<EnvVarType>) => {
    [key: string]: string;
  };

  const envVarsArrayToInputObject: EnvVarsTransformFn = (envVars) => {
    if (!envVars) {
      console.warn('envVars is undefined');
      return {};
    }

    const env: { [key: string]: string } = {};
    envVars.forEach((envVar) => {
      env[envVar.key] = envVar.value;
    });
    console.log(env);
    return env;
  };
  /// Networking area
  ///////////////////
  type NetworkingType = {
    id: string;
    protocol: PodProtocolEnum;
    port: string;
  };

  type NetworkingTransformFn = (envVars: Array<NetworkingType>) => {
    [key: string]: object;
  };

  const networkingArrayToInputObject: NetworkingTransformFn = (
    networkingArray
  ) => {
    if (!networkingArray) {
      console.warn('networkingArray is undefined');
      return {};
    }

    const env: { [key: string]: object } = {};
    networkingArray.forEach((networkingArray) => {
      env[networkingArray.id] = {
        protocol: networkingArray.protocol,
        port: networkingArray.port,
      };
    });
    console.log(env);
    return env;
  };

  /// Volume Mounts area
  ///////////////////
  type VolumeMountsType = {
    id: string;
    type: PodProtocolEnum;
    mount_path: string;
    sub_path: string;
  };

  type volumeMountsTransformFn = (volumes: Array<VolumeMountsType>) => {
    [key: string]: object;
  };

  const volume_mountsArrayToInputObject: volumeMountsTransformFn = (
    volumes
  ) => {
    if (!volumes) {
      console.warn('volumes is undefined');
      return {};
    }

    const formatted_volumes: { [key: string]: object } = {};
    volumes.forEach((volume) => {
      formatted_volumes[volume.id] = {
        type: volume.type,
        mount_path: volume.mount_path,
        sub_path: volume.sub_path,
      };
    });
    console.log(formatted_volumes);
    return formatted_volumes;
  };

  const { updatePod, isLoading, error, isSuccess, reset } =
    Hooks.useUpdatePod(objId);

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = (
    {
      description,
      command,
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
      description,
      command: command ? JSON.parse(command) : undefined,
      time_to_stop_default,
      time_to_stop_instance,
      environment_variables: envVarsArrayToInputObject(environment_variables),
      networking: networkingArrayToInputObject(networking),
      volume_mounts: volume_mountsArrayToInputObject(volume_mounts),
      resources,
    };

    updatePod({ podId: objId, updatePod: newPod }, { onSuccess });
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
      <SubmitWrapper
        className={styles['modal-footer']}
        isLoading={isLoading}
        error={error}
        success={isSuccess ? `Pod Updated.` : ''}
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
          Update Pod
        </Button>
      </SubmitWrapper>

      <FormikProvider value={formik}>
        <form id="create-pod-form" onSubmit={formik.handleSubmit}>
          <AutoPruneEmptyFields validationSchema={validationSchema} />
          <FMTextField
            formik={formik}
            name="description"
            label="Description"
            multiline={true}
            description="Description of this pod for future reference"
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
            description="Default TTS - Seconds until pod is stopped, default for all instances"
          />
          <FMTextField
            formik={formik}
            name="time_to_stop_instance"
            label="Time To Stop - Instance"
            description="Instance TTS - Seconds until pod is stopped, for current instance"
          />
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
                            description="desc1replace!"
                          />
                          <FMTextField
                            formik={formik}
                            name={`environment_variables.${i}.value`}
                            label="Value"
                            description="desc2replace!"
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
                          description="desc3replace!"
                        />
                        <FMTextField
                          formik={formik}
                          name={`networking.${i}.protocol`}
                          label="Protocol"
                          description="desc4replace!"
                        />
                        <FMSelect
                          formik={formik}
                          name={`networking.${i}.protocol`}
                          label="protocol2"
                          children={<MenuItem value={10}>Ten</MenuItem>}
                          description={''}
                          labelId={''}
                        />
                        <FMTextField
                          formik={formik}
                          name={`networking.${i}.port`}
                          label="Port"
                          description="desc5replace!"
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
                          name={`volume_mounts.${i}.mount_path`}
                          label="Mount Path"
                          description="desc6replace!"
                        />
                        <FMTextField
                          formik={formik}
                          name={`volume_mounts.${i}.volume_id`}
                          label="Volume ID"
                          description="desc7replace!"
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
                    arrayHelpers.push({ mount_path: '', volume_id: '' })
                  }
                >
                  + Add "volume_mount" object
                </Button>
              </div>
            )}
          />
          <FMTextField
            formik={formik}
            name="resources.cpu_request"
            label="CPU Request"
            description="CPU request for the pod"
          />
          <FMTextField
            formik={formik}
            name="resources.cpu_limit"
            label="CPU Limit"
            description="CPU limit for the pod"
          />
          <FMTextField
            formik={formik}
            name="resources.mem_request"
            label="Memory Request"
            description="Memory request for the pod"
          />
          <FMTextField
            formik={formik}
            name="resources.mem_limit"
            label="Memory Limit"
            description="Memory limit for the pod"
          />
          <FMTextField
            formik={formik}
            name="resources.gpus"
            label="GPUs"
            description="Number of GPUs for the pod"
          />
        </form>
      </FormikProvider>
    </div>
  );
};

export default PodWizardEdit;
