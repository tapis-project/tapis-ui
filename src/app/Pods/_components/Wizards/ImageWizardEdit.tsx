import React, { useEffect, useCallback } from 'react';
import { Button } from '@mui/material';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { SubmitWrapper, FMTextField, JSONEditor } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import AutoPruneEmptyFields from './Common/AutoPruneEmptyFields';
import { useFormik, FormikProvider } from 'formik';
import styles from './Common/Wizard.module.scss';

const ImageWizardEdit: React.FC<{ image: any }> = ({ image }) => {
  const imageId = image?.image;

  const initialValues: any = {};

  const validationSchema = Yup.object({
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    tenants: Yup.string(),
  });

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getImage);
    queryClient.invalidateQueries(Hooks.queryKeys.listImages);
  }, [queryClient]);

  const { updateImage, isLoading, error, isSuccess, reset } =
    Hooks.useUpdateImage(imageId);

  const onSubmit = (values: any, { setSubmitting }: any) => {
    const updateFields: any = {};
    Object.entries(values).forEach(([key, val]) => {
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '')
      ) {
        return;
      }
      updateFields[key] = val;
    });
    updateImage({ imageId, updateImage: updateFields }, { onSuccess });
    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  return (
    <div>
      <JSONEditor
        style={{
          width: '100%',
          fontSize: 12,
          lineHeight: 1,
        }}
        renderNewlinesInError
        obj={formik.values}
        actions={[
          {
            name: 'Update Image',
            disableOnError: true,
            disableOnUndefined: true,
            disableOnIsLoading: true,
            disableOnSuccess: true,
            error:
              error !== null
                ? {
                    title: 'Error',
                    message: error.message,
                  }
                : undefined,
            result: isSuccess
              ? {
                  success: isSuccess,
                  message: 'Successfully updated image',
                }
              : undefined,
            isLoading,
            isSuccess,
            actionFn: (obj: any) => {
              if (obj !== undefined) {
                updateImage({ imageId, updateImage: obj }, { onSuccess });
              }
            },
          },
        ]}
        onCloseError={() => {
          reset();
        }}
        onCloseSuccess={() => {
          reset();
        }}
      />
    </div>
  );
};

export default ImageWizardEdit;
