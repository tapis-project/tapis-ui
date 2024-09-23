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

import { useDispatch } from 'react-redux';

const VolumePermissionModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { data } = Hooks.useListVolumes(); // Assuming there's a hook to list volumes
  const volumes: Array<Pods.VolumeResponseModel> = data?.result ?? [];

  const queryClient = useQueryClient();
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const volumeIdFromLocation = location.pathname.split('/')[3] || '';

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getVolumePermissions);
  }, [queryClient, history]);

  const { setVolumePermission, isLoading, error, isSuccess, reset } =
    Hooks.useSetVolumePermission(volumeIdFromLocation);

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    volumeId: Yup.string().required('Volume ID is required'),
    username: Yup.string().required('Username is required'),
    permissionLevel: Yup.string().required('Permission level is required'),
  });

  const initialValues = {
    volumeId: volumeIdFromLocation,
    username: '',
    permissionLevel: '',
  };

  const onSubmit = (
    {
      volumeId,
      username,
      permissionLevel,
    }: { volumeId: string; username: string; permissionLevel: string },
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
    setVolumePermission(
      { volumeId, setPermission: { user: username, level: permissionLevel } },
      { onSuccess }
    );
    resetForm();
    setFieldValue('volumeId', '');
    setTouched({
      volumeId: false,
      username: false,
      permissionLevel: false,
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Set Volume Permission"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="setVolumePermission-form">
                <FormikSelect
                  name="volumeId"
                  description="The volume id"
                  label="Volume ID"
                  required={true}
                  data-testid="volumeId"
                >
                  <option disabled value={''}>
                    Select a volume
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
                  name="username"
                  label="Username"
                  description="Enter the username"
                  required={true}
                  data-testid="username"
                />
                <FormikInput
                  name="permissionLevel"
                  label="Permission Level"
                  description="Enter the permission level"
                  required={true}
                  data-testid="permissionLevel"
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
          success={isSuccess ? `Successfully set volume permission` : ''}
          reverse={true}
        >
          <Button
            form="setVolumePermission-form"
            color="primary"
            disabled={isLoading}
            aria-label="Submit"
            type="submit"
          >
            Set Permission
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default VolumePermissionModal;
