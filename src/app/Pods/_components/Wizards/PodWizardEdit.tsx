import React, { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { Typography } from '@mui/material';
import { FMTextField } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useAppDispatch, useAppSelector } from '@redux';
import ResourceEditor from './Common/ResourceEditor';
import { DiffResult } from './Common/computeDiff';
import {
  podEditValidation,
  POD_READ_ONLY_FIELDS,
  POD_FIELD_TEMPLATES,
} from './podConstants';
import {
  CommandSection,
  EnvVarsSection,
  NetworkingSection,
  VolumeMountsSection,
  ResourcesSection,
} from './PodWizardUtils';

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
      validationSchema={podEditValidation}
      onSubmit={handleSubmit}
      readOnlyFields={POD_READ_ONLY_FIELDS}
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
      fieldTemplates={POD_FIELD_TEMPLATES}
    />
  );
};

export default PodWizardEdit;
