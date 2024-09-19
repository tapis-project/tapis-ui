import React, { useEffect, useCallback, useState } from 'react';
import { FormikProvider } from 'formik';
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
import { useFormik } from 'formik';
import styles from './Common/Wizard.module.scss';
import { siLK } from '@mui/material/locale';

export type VolumeWizardProps = {
  sharedData: any;
  setSharedData: any;
};

const VolumeWizard: React.FC<VolumeWizardProps> = ({
  sharedData,
  setSharedData,
}) => {
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getVolume);
    queryClient.invalidateQueries(Hooks.queryKeys.listVolumes);
  }, [queryClient]);

  const initialValues: any = {
    volume_id: '',
    description: '',
    size_limit: '',
  };

  const { createVolume, isLoading, error, isSuccess, reset } =
    Hooks.useCreateVolume();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    volume_id: Yup.string()
      .min(1)
      .max(128, 'Volume ID should not be longer than 128 characters')
      .required('Volume ID is required'),
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    size_limit: Yup.number().min(1).max(20000).required(),
  });

  const onSubmit = (
    { volume_id = '', description, size_limit }: any,
    { setSubmitting }: any
  ) => {
    const newVolume = {
      volume_id,
      description,
      size_limit,
    };

    createVolume({ newVolume }, { onSuccess });
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
        success={isSuccess ? `Volume created.` : ''}
        reverse={true}
      >
        <Button
          sx={{ mb: '.75rem' }}
          form="create-volume-form"
          color="primary"
          disabled={isLoading || Object.keys(formik.values).length === 0}
          aria-label="Submit"
          type="submit"
          variant="outlined"
        >
          Submit Volume
        </Button>
      </SubmitWrapper>

      <FormikProvider value={formik}>
        <form id="create-volume-form" onSubmit={formik.handleSubmit}>
          <AutoPruneEmptyFields validationSchema={validationSchema} />
          <FMTextField
            formik={formik}
            name="volume_id"
            label="Volume ID"
            // description = {JSON.stringify(requiredKeys, null, 2)}
            description="ID for this volume, unique per-tenant"
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
        </form>
      </FormikProvider>
    </div>
  );
};

export default VolumeWizard;
