import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Button, ButtonGroup, Typography } from '@mui/material';
import { FieldArray } from 'formik';
import { FMTextField, Icon } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import ResourceEditor from './Common/ResourceEditor';
import { DiffResult } from './Common/computeDiff';
import type { FieldTemplate } from './Common/ResourceEditor';

const validationSchema = Yup.object({
  description: Yup.string()
    .min(1)
    .max(2048, 'Description should not be longer than 2048 characters'),
  tenants: Yup.array().of(
    Yup.string()
      .min(1, 'Tenant cannot be empty')
      .max(128, 'Tenant should not be longer than 128 characters')
  ),
});

const READ_ONLY_FIELDS = ['image'];

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    label: 'Description',
    field: 'description',
    defaultValue: '',
    description: 'Text description of this image',
  },
  {
    label: 'Tenants',
    field: 'tenants',
    defaultValue: [''],
    description: 'Tenants allowed to use this image',
  },
];

const TenantsSection = ({ formik }: any) => (
  <FieldArray
    name="tenants"
    render={(arrayHelpers) => (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '.5rem',
          }}
        >
          <Typography variant="subtitle1">Tenants</Typography>
          <Button
            type="button"
            variant="outlined"
            onClick={() => arrayHelpers.push('')}
            style={{
              height: 30,
              fontSize: 11,
              marginLeft: 'auto',
              padding: '0px 8px',
            }}
          >
            + Tenant
          </Button>
        </div>
        {formik.values.tenants &&
          formik.values.tenants.map((t: string, i: number) => (
            <ButtonGroup
              key={i}
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'bottom',
                marginBottom: '.8rem',
                height: 40,
              }}
            >
              <FMTextField
                formik={formik}
                name={`tenants.${i}`}
                label={`Tenant ${i}`}
                value={t}
                style={{ minWidth: 180, flex: 1 }}
                InputProps={{
                  sx: {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    height: 40,
                    boxSizing: 'border-box',
                  },
                }}
              />
              <Button
                type="button"
                color="error"
                variant="outlined"
                onClick={() => arrayHelpers.remove(i)}
                sx={{
                  minWidth: 36,
                  maxWidth: 36,
                  height: 40,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeft: 'none',
                }}
                aria-label="Remove tenant"
              >
                <Icon name="trash" />
              </Button>
            </ButtonGroup>
          ))}
      </div>
    )}
  />
);

const ImageWizardEdit: React.FC<{ image: any }> = ({ image }) => {
  const imageId = image?.image;

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getImage);
    queryClient.invalidateQueries(Hooks.queryKeys.listImages);
  }, [queryClient]);

  const { updateImage, isLoading, error, isSuccess, reset } =
    Hooks.useUpdateImage(imageId);

  const handleSubmit = useCallback(
    (
      prunedValues: Record<string, any>,
      _fullValues: Record<string, any>,
      _diff: DiffResult
    ) => {
      const payload = { ...prunedValues };
      delete payload.image;
      updateImage({ imageId, updateImage: payload }, { onSuccess });
    },
    [imageId, updateImage, onSuccess]
  );

  const formContent = useCallback(
    (formik: any) => (
      <>
        <FMTextField
          formik={formik}
          name="image"
          label="Image"
          description="Image identifier"
          disabled
        />
        <FMTextField
          formik={formik}
          name="description"
          label="Description"
          multiline={true}
          description="Description of this image"
        />
        <TenantsSection formik={formik} />
      </>
    ),
    []
  );

  return (
    <ResourceEditor
      currentValues={image || {}}
      formContent={formContent}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      readOnlyFields={READ_ONLY_FIELDS}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      reset={reset}
      successMessage="Image updated successfully"
      submitLabel="Update Image"
      mode="edit"
      fieldTemplates={FIELD_TEMPLATES}
    />
  );
};

export default ImageWizardEdit;
