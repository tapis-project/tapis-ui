import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { FMTextField } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import ResourceEditor from './Common/ResourceEditor';
import { DiffResult } from './Common/computeDiff';
import type { FieldTemplate } from './Common/ResourceEditor';

const validationSchema = Yup.object({
  description: Yup.string()
    .min(1)
    .max(2048, 'Description should not be longer than 2048 characters'),
  size_limit: Yup.number().min(1).max(20000),
});

const READ_ONLY_FIELDS = ['volume_id'];

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    label: 'Description',
    field: 'description',
    defaultValue: '',
    description: 'Text description of this volume',
  },
  {
    label: 'Size Limit',
    field: 'size_limit',
    defaultValue: 1024,
    description: 'Limit on volume size in megabytes (MB)',
  },
];

const VolumeWizardEdit: React.FC<{ volume: any }> = ({ volume }) => {
  const objId = volume?.volume_id;

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getVolume);
    queryClient.invalidateQueries(Hooks.queryKeys.listVolumes);
  }, [queryClient]);

  const { updateVolume, isLoading, error, isSuccess, reset } =
    Hooks.useUpdateVolume(objId);

  const handleSubmit = useCallback(
    (
      prunedValues: Record<string, any>,
      _fullValues: Record<string, any>,
      _diff: DiffResult
    ) => {
      const payload = { ...prunedValues };
      delete payload.volume_id;
      updateVolume({ volumeId: objId, updateVolume: payload }, { onSuccess });
    },
    [objId, updateVolume, onSuccess]
  );

  const formContent = useCallback(
    (formik: any) => (
      <>
        <FMTextField
          formik={formik}
          name="volume_id"
          label="Volume ID"
          description="ID for this volume, unique per-tenant"
          disabled
        />
        <FMTextField
          formik={formik}
          name="description"
          label="Description"
          multiline={true}
          description="Description of this volume for future reference"
        />
        <FMTextField
          formik={formik}
          name="size_limit"
          label="Size Limit"
          description="Limit on the size of the volume in megabytes (MB)"
        />
      </>
    ),
    []
  );

  return (
    <ResourceEditor
      currentValues={volume || {}}
      formContent={formContent}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      readOnlyFields={READ_ONLY_FIELDS}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      reset={reset}
      successMessage="Volume updated successfully"
      submitLabel="Update Volume"
      mode="edit"
      fieldTemplates={FIELD_TEMPLATES}
    />
  );
};

export default VolumeWizardEdit;
