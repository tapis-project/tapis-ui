import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from './ToolbarModalProps';
import { Form, Formik } from 'formik';
import { FormikSelect, FormikInput } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './PodModals.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useLocation, useHistory } from 'react-router-dom';
import { useAppSelector, updateState, useAppDispatch } from '@redux';

const DeleteImageModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { data } = Hooks.useListImages();
  const images: Array<any> = data?.result ?? [];

  const queryClient = useQueryClient();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listImages);
    queryClient.invalidateQueries(Hooks.queryKeys.getImage);
    history.push('/pods/images');
    dispatch(updateState({ imageRootTab: 'dashboard' }));
  }, [queryClient, history]);

  const { deleteImage, isLoading, error, isSuccess, reset } =
    Hooks.useDeleteImage();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    imageId: Yup.string().required('Image ID is required'),
    confirmImageName: Yup.string()
      .oneOf([Yup.ref('imageId'), null], 'Image name must match')
      .required('Please confirm the image name'),
  });

  const location = useLocation();
  const imageIdFromLocation = location.pathname.split('/')[3] || '';

  const initialValues = {
    imageId: imageIdFromLocation,
    confirmImageName: '',
  };

  const onSubmit = (
    { imageId }: { imageId: string },
    {
      setFieldValue,
      resetForm,
      setTouched,
    }: {
      setFieldValue: (field: string, value: any) => void;
      resetForm: () => void;
      setTouched: (touched: { [field: string]: boolean }) => void;
    }
  ) => {
    deleteImage({ imageId }, { onSuccess });
    resetForm();
    setFieldValue('imageId', '');
    setTouched({
      imageId: false,
      confirmImageName: false,
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Image"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="deleteImage-form">
                <FormikSelect
                  name="imageId"
                  description="The image id"
                  label="Image ID"
                  required={true}
                  data-testid="imageId"
                >
                  <option disabled value={''}>
                    Select an image to delete
                  </option>
                  {images.length ? (
                    images.map((image: any) => {
                      return <option key={image.image}>{image.image}</option>;
                    })
                  ) : (
                    <i>No images found</i>
                  )}
                </FormikSelect>
                <FormikInput
                  name="confirmImageName"
                  label="Confirm Image Name"
                  description="Please type the image name to confirm"
                  required={true}
                  data-testid="confirmImageName"
                />
              </Form>
            )}
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully deleted image` : ''}
          reverse={true}
        >
          <Button
            form="deleteImage-form"
            color="primary"
            disabled={isLoading}
            aria-label="Submit"
            type="submit"
          >
            Delete image
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteImageModal;
