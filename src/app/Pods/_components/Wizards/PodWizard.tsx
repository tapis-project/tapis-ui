import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { FMTextField } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useAppDispatch, useAppSelector } from '@redux';
import ResourceEditor from './Common/ResourceEditor';
import { DiffResult } from './Common/computeDiff';
import {
  CommandSection,
  EnvVarsSection,
  NetworkingSection,
  VolumeMountsSection,
  ResourcesSection,
} from './PodWizardUtils';

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
  command: Yup.array().of(Yup.string().required('Command cannot be empty')),
  environment_variables: Yup.object().test(
    'env-vars-object',
    'All environment variable keys and values must be non-empty strings and <= 128 chars',
    (obj) => {
      if (!obj) return true;
      return Object.entries(obj).every(
        ([k, v]) =>
          typeof k === 'string' &&
          (k as string).length > 0 &&
          (k as string).length <= 128 &&
          typeof v === 'string' &&
          (v as string).length > 0 &&
          (v as string).length <= 128
      );
    }
  ),
  networking: Yup.object().test(
    'networking-object',
    'Each networking entry must have protocol (<=128 chars) and port (number)',
    (obj) => {
      if (!obj) return true;
      return Object.values(obj).every(
        (v: any) =>
          typeof v === 'object' &&
          typeof v.protocol === 'string' &&
          v.protocol.length > 0 &&
          v.protocol.length <= 128 &&
          (typeof v.port === 'number' ||
            (typeof v.port === 'string' && v.port.length > 0))
      );
    }
  ),
  volume_mounts: Yup.object().test(
    'volume-mounts-object',
    'Each volume mount must have type, mount_path, sub_path (all <=128 chars)',
    (obj) => {
      if (!obj) return true;
      return Object.values(obj).every(
        (v: any) =>
          typeof v === 'object' &&
          typeof v.type === 'string' &&
          v.type.length > 0 &&
          v.type.length <= 128 &&
          typeof v.mount_path === 'string' &&
          v.mount_path.length > 0 &&
          v.mount_path.length <= 128 &&
          (typeof v.sub_path === 'string' ? v.sub_path.length <= 128 : true)
      );
    }
  ),
  template_overrides: Yup.object().nullable(),
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

const DEFAULT_VALUES = {
  pod_id: '',
  description: '',
  command: [],
  image: '',
  template: '',
  time_to_stop_default: '',
  time_to_stop_instance: '',
  environment_variables: {},
  volume_mounts: {},
  template_overrides: {},
  networking: {},
  resources: {
    cpu_request: '',
    cpu_limit: '',
    mem_request: '',
    mem_limit: '',
    gpus: '',
  },
};

const PodWizard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { createPodData } = useAppSelector((state: any) => state.pods);

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getPod);
    queryClient.invalidateQueries(Hooks.queryKeys.getPodDerived);
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const { createPod, isLoading, error, isSuccess, reset } =
    Hooks.useCreatePod();

  const handleSubmit = useCallback(
    (
      prunedValues: Record<string, any>,
      _fullValues: Record<string, any>,
      _diff: DiffResult
    ) => {
      createPod({ newPod: prunedValues as any }, { onSuccess });
    },
    [createPod, onSuccess]
  );

  const formContent = useCallback(
    (formik: any) => (
      <>
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
        <CommandSection formik={formik} />
        <EnvVarsSection formik={formik} />
        <NetworkingSection formik={formik} />
        <VolumeMountsSection formik={formik} />
        <ResourcesSection formik={formik} />
      </>
    ),
    []
  );

  return (
    <ResourceEditor
      currentValues={DEFAULT_VALUES}
      formContent={formContent}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      reset={reset}
      successMessage="Pod created successfully"
      submitLabel="Create Pod"
      mode="create"
      reduxDraftKey="createPodData"
      dispatch={dispatch}
      existingDraft={createPodData}
    />
  );
};

export default PodWizard;
