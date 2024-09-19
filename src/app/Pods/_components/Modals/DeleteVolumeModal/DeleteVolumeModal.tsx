import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../ToolbarModalProps';
import { Form, Formik } from 'formik';
import { FormikSelect, FormikInput } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './DeletePodModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useLocation, useHistory } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { updateState } from '../../../redux/podsSlice';

const DeleteVolumeModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { data } = Hooks.useListVolumes(); //{search: `owner.like.${''}`,}
  const volumes: Array<Pods.VolumeResponseModel> = data?.result ?? [];

  // Allows the pod list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const history = useHistory();
  const dispatch = useDispatch();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listVolumes);
    history.push('/pods/volumes');
    dispatch(updateState({ volumeRootTab: 'dashboard' }));
  }, [queryClient, history]);

  const { deleteVolume, isLoading, error, isSuccess, reset } =
    Hooks.useDeleteVolume();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    volumeId: Yup.string().required('Volume ID is required'),
    confirmVolumeName: Yup.string()
      .oneOf([Yup.ref('volumeId'), null], 'Volume name must match')
      .required('Please confirm the volume name'),
  });

  const location = useLocation();
  const volumeIdFromLocation = location.pathname.split('/')[3] || '';

  const initialValues = {
    volumeId: volumeIdFromLocation,
    confirmVolumeName: '',
  };

  const onSubmit = (
    { volumeId }: { volumeId: string },
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
    deleteVolume({ volumeId }, { onSuccess });
    resetForm();
    setFieldValue('volumeId', '');
    setTouched({
      volumeId: false,
      confirmVolumeName: false,
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Volume"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="deleteVolume-form">
                <FormikSelect
                  name="volumeId"
                  description="The volume id"
                  label="Volume ID"
                  required={true}
                  data-testid="volumeId"
                >
                  <option disabled value={''}>
                    Select a volume to delete
                  </option>
                  {volumes.length ? (
                    volumes.map((volume) => {
                      return (
                        <option key={volume.volume_id}>
                          {volume.volume_id}
                        </option>
                      );
                    })
                  ) : (
                    <i>No volumes found</i>
                  )}
                </FormikSelect>
                <FormikInput
                  name="confirmVolumeName"
                  label="Confirm Volume Name"
                  description="Please type the volume name to confirm"
                  required={true}
                  data-testid="confirmVolumeName"
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
          success={isSuccess ? `Successfully deleted a volume` : ''}
          reverse={true}
        >
          <Button
            form="deleteVolume-form"
            color="primary"
            disabled={isLoading}
            aria-label="Submit"
            type="submit"
          >
            Delete volume
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteVolumeModal;
