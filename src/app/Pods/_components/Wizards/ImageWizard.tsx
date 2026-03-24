import React, { useEffect, useCallback, useState } from 'react';
import { Button, ButtonGroup, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import {
  GenericModal,
  SubmitWrapper,
  FMTextField,
  Icon,
} from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import AutoPruneEmptyFields from './Common/AutoPruneEmptyFields';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import styles from './Common/Wizard.module.scss';

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
    tenants: [''],
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
    tenants: Yup.array().of(
      Yup.string()
        .min(1, 'Tenant cannot be empty')
        .max(128, 'Tenant should not be longer than 128 characters')
    ),
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
          disabled={isLoading || Object.keys(formik.values).length === 0}
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
          <TenantsSection formik={formik} />
        </form>
      </FormikProvider>
    </div>
  );
};

export default ImageWizard;
