import React, { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { FMTextField } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useAppDispatch, useAppSelector } from '@redux';
import ResourceEditor from './Common/ResourceEditor';
import { DiffResult } from './Common/computeDiff';
import {
  podCreateValidation,
  POD_DEFAULT_VALUES,
  POD_FIELD_TEMPLATES,
} from './podConstants';
import {
  CommandSection,
  EnvVarsSection,
  NetworkingSection,
  VolumeMountsSection,
  ResourcesSection,
} from './PodWizardUtils';

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
      currentValues={POD_DEFAULT_VALUES}
      formContent={formContent}
      validationSchema={podCreateValidation}
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
      fieldTemplates={POD_FIELD_TEMPLATES}
    />
  );
};

export default PodWizard;
