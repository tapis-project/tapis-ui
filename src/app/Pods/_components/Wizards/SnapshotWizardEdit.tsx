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

const READ_ONLY_FIELDS = [
  'snapshot_id',
  'source_volume_id',
  'source_volume_path',
];

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    label: 'Description',
    field: 'description',
    defaultValue: '',
    description: 'Text description of this snapshot',
  },
  {
    label: 'Size Limit',
    field: 'size_limit',
    defaultValue: 1024,
    description: 'Limit on snapshot size in megabytes (MB)',
  },
];

const SnapshotWizardEdit: React.FC<{ snapshot: any }> = ({ snapshot }) => {
  const objId = snapshot?.snapshot_id;

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getSnapshot);
    queryClient.invalidateQueries(Hooks.queryKeys.listSnapshots);
  }, [queryClient]);

  const { updateSnapshot, isLoading, error, isSuccess, reset } =
    Hooks.useUpdateSnapshot(objId);

  const handleSubmit = useCallback(
    (
      prunedValues: Record<string, any>,
      _fullValues: Record<string, any>,
      _diff: DiffResult
    ) => {
      const payload = { ...prunedValues };
      delete payload.snapshot_id;
      delete payload.source_volume_id;
      delete payload.source_volume_path;
      updateSnapshot(
        { snapshotId: objId, updateSnapshot: payload },
        { onSuccess }
      );
    },
    [objId, updateSnapshot, onSuccess]
  );

  const formContent = useCallback(
    (formik: any) => (
      <>
        <FMTextField
          formik={formik}
          name="snapshot_id"
          label="Snapshot ID"
          description="ID for this snapshot, unique per-tenant"
          disabled
        />
        <FMTextField
          formik={formik}
          name="source_volume_id"
          label="Source Volume ID"
          description="The volume used as source of this snapshot"
          disabled
        />
        <FMTextField
          formik={formik}
          name="source_volume_path"
          label="Source Volume Path"
          description="The path within the source volume"
          disabled
        />
        <FMTextField
          formik={formik}
          name="description"
          label="Description"
          multiline={true}
          description="Description of this snapshot for future reference"
        />
        <FMTextField
          formik={formik}
          name="size_limit"
          label="Size Limit"
          description="Limit on the size of the snapshot in megabytes (MB)"
        />
      </>
    ),
    []
  );

  return (
    <ResourceEditor
      currentValues={snapshot || {}}
      formContent={formContent}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      readOnlyFields={READ_ONLY_FIELDS}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      reset={reset}
      successMessage="Snapshot updated successfully"
      submitLabel="Update Snapshot"
      mode="edit"
      fieldTemplates={FIELD_TEMPLATES}
    />
  );
};

export default SnapshotWizardEdit;
