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
  }, [queryClient]);

  const objId = useLocation().pathname.split('/')[3];

  const initialValues: any = {
    description: '',
    size_limit: '',
  };

  const { updateSnapshot, isLoading, error, isSuccess, reset } =
    Hooks.useUpdateSnapshot(objId);

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    size_limit: Yup.number().min(1).max(20000),
  });

  const onSubmit = ({ snapshot_id = '', description, size_limit }: any) => {
    const updatedSnapshot = {
      snapshot_id,
      description,
      size_limit,
    };

    updateSnapshot(
      { snapshotId: objId, updateSnapshot: updatedSnapshot },
      { onSuccess }
    );
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    setSharedData(formik.values);
  }, [formik.values, setSharedData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        formik.handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [formik]);

  return (
    <div>
      <SubmitWrapper
        className={styles['modal-footer']}
        isLoading={isLoading}
        error={error}
        success={isSuccess ? `Snapshot updated.` : ''}
        reverse={true}
      >
        <Button
          sx={{ mb: '.75rem' }}
          form="edit-snapshot-form"
          color="primary"
          disabled={
            isLoading ||
            !formik.isValid ||
            Object.keys(formik.values).length === 0
          }
          aria-label="Submit"
          type="submit"
          variant="outlined"
        >
          Edit Snapshot
        </Button>
      </SubmitWrapper>

      <FormikProvider value={formik}>
        <form id="edit-snapshot-form" onSubmit={formik.handleSubmit}>
          <AutoPruneEmptyFields validationSchema={validationSchema} />
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
        </form>
      </FormikProvider>
    </div>
  );
};

export default SnapshotWizard;
