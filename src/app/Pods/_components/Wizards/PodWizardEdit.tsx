import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Typography } from '@mui/material';
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
    ),
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
  arguments: Yup.array().of(Yup.string()).nullable(),
  secret_map: Yup.object().nullable(),
  template_overrides: Yup.object().nullable(),
  time_to_stop_ts: Yup.string().nullable(),
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

const READ_ONLY_FIELDS = ['pod_id', 'image', 'template'];

const PodWizardEdit: React.FC<{ pod: any }> = ({ pod }) => {
  const dispatch = useAppDispatch();
  const { updatePodData } = useAppSelector((state: any) => state.pods);
  const objId = pod?.pod_id;

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getPod);
    queryClient.invalidateQueries(Hooks.queryKeys.getPodDerived);
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const { updatePod, isLoading, error, isSuccess, reset } =
    Hooks.useUpdatePod(objId);

  const handleSubmit = useCallback(
    (
      prunedValues: Record<string, any>,
      _fullValues: Record<string, any>,
      _diff: DiffResult
    ) => {
      // Strip read-only fields that the API doesn't accept on update
      const payload = { ...prunedValues };
      delete payload.pod_id;
      delete payload.image;
      delete payload.template;
      updatePod({ podId: objId, updatePod: payload }, { onSuccess });
    },
    [objId, updatePod, onSuccess]
  );

  const formContent = useCallback(
    (formik: any) => (
      <>
        <FMTextField
          formik={formik}
          name="pod_id"
          label="Pod ID"
          description="ID for this pod, unique per-tenant"
          disabled
        />
        <FMTextField
          formik={formik}
          name="image"
          label="Image"
          description="Docker image to use, must be on allowlist. ex. mongo:6.0"
          disabled
        />
        <FMTextField
          formik={formik}
          name="template"
          label="Template"
          description="Pods template to use."
          disabled
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
        <FMTextField
          formik={formik}
          name="time_to_stop_ts"
          label="Time To Stop - Timestamp"
          description="Server-computed stop timestamp (read-only)"
          disabled
        />
        <CommandSection formik={formik} />
        <EnvVarsSection formik={formik} />
        <NetworkingSection formik={formik} />
        <VolumeMountsSection formik={formik} />
        <ResourcesSection formik={formik} />
        {formik.values.secret_map &&
          Object.keys(formik.values.secret_map).length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                Secret Map
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: 'block' }}
              >
                Edit via JSON tab
              </Typography>
            </>
          )}
        {formik.values.template_overrides &&
          Object.keys(formik.values.template_overrides).length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                Template Overrides
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: 'block' }}
              >
                Edit via JSON tab
              </Typography>
            </>
          )}
      </>
    ),
    []
  );

  return (
    <ResourceEditor
      currentValues={pod || {}}
      formContent={formContent}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      readOnlyFields={READ_ONLY_FIELDS}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      reset={reset}
      successMessage="Pod updated successfully"
      submitLabel="Update Pod"
      mode="edit"
      reduxDraftKey="updatePodData"
      dispatch={dispatch}
      existingDraft={updatePodData}
    />
  );
};

export default PodWizardEdit;
