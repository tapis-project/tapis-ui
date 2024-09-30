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

export type SnapshotWizardProps = {
  sharedData: any;
  setSharedData: any;
};

const SnapshotWizard: React.FC<SnapshotWizardProps> = ({
  sharedData,
  setSharedData,
}) => {
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getSnapshot);
    queryClient.invalidateQueries(Hooks.queryKeys.listSnapshots);
  }, [queryClient]);

  const initialValues: any = {
    snapshot_id: '',
    description: '',
    size_limit: '',
    source_volume_id: '',
    source_volume_path: '',
  };

  const { createSnapshot, isLoading, error, isSuccess, reset } =
    Hooks.useCreateSnapshot();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    snapshot_id: Yup.string()
      .min(1)
      .max(128, 'Snapshot ID should not be longer than 128 characters')
      .required('Snapshot ID is required'),
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    size_limit: Yup.number().min(1).max(20000).required(),
    source_volume_id: Yup.string()
      .min(1)
      .max(128, 'Source Volume ID should not be longer than 128 characters')
      .required('Source Volume ID is required'),
    source_volume_path: Yup.string()
      .min(1)
      .max(2048, 'Source Volume Path should not be longer than 2048 characters')
      .required('Source Volume Path is required'),
  });

  const onSubmit = (
    {
      snapshot_id = '',
      description,
      size_limit,
      source_volume_id,
      source_volume_path,
    }: any,
    { setSubmitting }: any
  ) => {
    const newSnapshot = {
      snapshot_id,
      description,
      size_limit,
      source_volume_id,
      source_volume_path,
    };

    createSnapshot({ newSnapshot }, { onSuccess });
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
        success={isSuccess ? `Snapshot created.` : ''}
        reverse={true}
      >
        <Button
          sx={{ mb: '.75rem' }}
          form="create-snapshot-form"
          color="primary"
          disabled={isLoading || Object.keys(formik.values).length === 0}
          aria-label="Submit"
          type="submit"
          variant="outlined"
        >
          Submit Snapshot
        </Button>
      </SubmitWrapper>

      <FormikProvider value={formik}>
        <form id="create-snapshot-form" onSubmit={formik.handleSubmit}>
          <AutoPruneEmptyFields validationSchema={validationSchema} />
          <FMTextField
            formik={formik}
            name="snapshot_id"
            label="Snapshot ID"
            description="ID for this snapshot, unique per-tenant"
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
          <FMTextField
            formik={formik}
            name="source_volume_id"
            label="Source Volume ID"
            description="The volume_id to use as source of snapshot."
          />
          <FMTextField
            formik={formik}
            name="source_volume_path"
            label="Source Volume Path"
            description="The path to the volume to use as source of snapshot."
          />
        </form>
      </FormikProvider>
    </div>
  );
};

export default SnapshotWizard;
