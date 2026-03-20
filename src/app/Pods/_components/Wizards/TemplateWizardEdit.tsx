import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Typography } from '@mui/material';
import { FMTextField } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import ResourceEditor from './Common/ResourceEditor';
import { DiffResult } from './Common/computeDiff';
import type { FieldTemplate } from './Common/ResourceEditor';

const validationSchema = Yup.object({
  description: Yup.string()
    .min(1)
    .max(2048, 'Description should not be longer than 2048 characters'),
  metatags: Yup.array().of(Yup.string()),
});

const READ_ONLY_FIELDS = ['template_id'];

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    label: 'Description',
    field: 'description',
    defaultValue: '',
    description: 'Text description of this template',
  },
  {
    label: 'Metatags',
    field: 'metatags',
    defaultValue: ['custom'],
    description: 'Tags to categorize this template',
  },
];

const TemplateWizardEdit: React.FC<{ template: any }> = ({ template }) => {
  const objId = template?.template_id;

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getTemplate);
    queryClient.invalidateQueries(Hooks.queryKeys.listTemplates);
    queryClient.invalidateQueries(Hooks.queryKeys.listTemplatesAndTags);
  }, [queryClient]);

  const { updateTemplate, isLoading, error, isSuccess, reset } =
    Hooks.useUpdateTemplate(objId ?? '');

  const handleSubmit = useCallback(
    (
      prunedValues: Record<string, any>,
      _fullValues: Record<string, any>,
      _diff: DiffResult
    ) => {
      const payload = { ...prunedValues };
      delete payload.template_id;
      updateTemplate(
        { templateId: objId, updateTemplate: payload },
        { onSuccess }
      );
    },
    [objId, updateTemplate, onSuccess]
  );

  const formContent = useCallback(
    (formik: any) => (
      <>
        <FMTextField
          formik={formik}
          name="template_id"
          label="Template ID"
          description="ID for this template, unique per-tenant"
          disabled
        />
        <FMTextField
          formik={formik}
          name="description"
          label="Description"
          multiline={true}
          description="Description of this template"
        />
        {formik.values.metatags &&
          Array.isArray(formik.values.metatags) &&
          formik.values.metatags.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                Metatags
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
      currentValues={template || {}}
      formContent={formContent}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      readOnlyFields={READ_ONLY_FIELDS}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      reset={reset}
      successMessage="Template updated successfully"
      submitLabel="Update Template"
      mode="edit"
      fieldTemplates={FIELD_TEMPLATES}
    />
  );
};

export default TemplateWizardEdit;
