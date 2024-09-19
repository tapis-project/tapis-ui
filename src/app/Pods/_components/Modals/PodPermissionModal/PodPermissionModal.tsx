import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../ToolbarModalProps';
import { Form, Formik } from 'formik';
import { FormikSelect, FormikInput } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './PodPermissionModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useLocation, useHistory } from 'react-router-dom';

import { useDispatch } from 'react-redux';

const PodPermissionModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { data } = Hooks.useListPods(); // Assuming there's a hook to list pods
  const pods: Array<Pods.PodResponseModel> = data?.result ?? [];

  const queryClient = useQueryClient();
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const podIdFromLocation = location.pathname.split('/')[3] || '';

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getPodPermissions);
  }, [queryClient, history]);

  const { setPodPermission, isLoading, error, isSuccess, reset } =
    Hooks.useSetPodPermission(podIdFromLocation);

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    podId: Yup.string().required('Pod ID is required'),
    username: Yup.string().required('Username is required'),
    permissionLevel: Yup.string().required('Permission level is required'),
  });

  const initialValues = {
    podId: podIdFromLocation,
    username: '',
    permissionLevel: '',
  };

  const onSubmit = (
    {
      podId,
      username,
      permissionLevel,
    }: { podId: string; username: string; permissionLevel: string },
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
    setPodPermission(
      { podId, setPermission: { user: username, level: permissionLevel } },
      { onSuccess }
    );
    resetForm();
    setFieldValue('podId', '');
    setTouched({
      podId: false,
      username: false,
      permissionLevel: false,
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Set Pod Permission"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="setPodPermission-form">
                <FormikSelect
                  name="podId"
                  description="The pod id"
                  label="Pod ID"
                  required={true}
                  data-testid="podId"
                >
                  <option disabled value={''}>
                    Select a pod
                  </option>
                  {pods.length ? (
                    pods.map((pod) => {
                      return <option key={pod.pod_id}>{pod.pod_id}</option>;
                    })
                  ) : (
                    <i>No pods found</i>
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
          success={isSuccess ? `Successfully set pod permission` : ''}
          reverse={true}
        >
          <Button
            form="setPodPermission-form"
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

export default PodPermissionModal;
