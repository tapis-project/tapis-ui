import React, { useEffect, useCallback, useState } from 'react';
import { Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import {
  GenericModal,
  SubmitWrapper,
  FMTextField,
} from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import AutoPruneEmptyFields from './Common/AutoPruneEmptyFields';
import { useFormik, FormikProvider } from 'formik';
import styles from './Common/Wizard.module.scss';

export type ImageWizardProps = {
  sharedData: any;
  setSharedData: any;
};

const ImageWizard: React.FC<ImageWizardProps> = ({
  sharedData,
  setSharedData,
}) => {
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getImage);
    queryClient.invalidateQueries(Hooks.queryKeys.listImages);
  }, [queryClient]);

  const initialValues: any = {
    image_id: '',
    description: '',
    tenants: '',
  };

  const { createImage, isLoading, error, isSuccess, reset } =
    Hooks.useCreateImage();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    image_id: Yup.string()
      .min(1)
      .max(128, 'Image ID should not be longer than 128 characters')
      .required('Image ID is required'),
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    tenants: Yup.number().min(1).max(20000).required(),
  });

  const onSubmit = (
    { image_id = '', description, tenants }: any,
    { setSubmitting }: any
  ) => {
    const newImage = {
      image: image_id,
      description,
      tenants,
    };

    createImage({ newImage }, { onSuccess });
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
        success={isSuccess ? `Image created.` : ''}
        reverse={true}
      >
        <Button
          sx={{ mb: '.75rem' }}
          form="create-image-form"
          color="primary"
          disabled={true} //{isLoading || Object.keys(formik.values).length === 0}
          aria-label="Submit"
          type="submit"
          variant="outlined"
        >
          Submit Image
        </Button>
      </SubmitWrapper>

      <FormikProvider value={formik}>
        <form id="create-image-form" onSubmit={formik.handleSubmit}>
          <AutoPruneEmptyFields validationSchema={validationSchema} />
          <FMTextField
            formik={formik}
            name="image_id"
            label="Image ID"
            // description = {JSON.stringify(requiredKeys, null, 2)}
            description="ID for this image, unique per-tenant"
          />
          <FMTextField
            formik={formik}
            name="description"
            label="Description"
            multiline={true}
            description="Description of this image for future reference"
          />
          <FMTextField
            formik={formik}
            name="tenants"
            label="Tenants"
            description="The tenants that can use this image"
          />
        </form>
      </FormikProvider>
    </div>
  );
};

export default ImageWizard;
