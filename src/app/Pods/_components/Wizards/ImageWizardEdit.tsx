import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { FMTextField } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import ResourceEditor from './Common/ResourceEditor';
import { DiffResult } from './Common/computeDiff';

const validationSchema = Yup.object({
  description: Yup.string()
    .min(1)
    .max(2048, 'Description should not be longer than 2048 characters'),
  tenants: Yup.string(),
});

const READ_ONLY_FIELDS = ['image'];

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
        <FMTextField
          formik={formik}
          name="tenants"
          label="Tenants"
          description="Tenants allowed to use this image"
        />
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
    />
  );
};

export default ImageWizardEdit;
