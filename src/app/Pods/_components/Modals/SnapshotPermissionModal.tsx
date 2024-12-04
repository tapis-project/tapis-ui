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

const SnapshotPermissionModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { data } = Hooks.useListSnapshots(); // Assuming there's a hook to list snapshots
  const snapshots: Array<Pods.SnapshotResponseModel> = data?.result ?? [];

  const queryClient = useQueryClient();
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const snapshotIdFromLocation = location.pathname.split('/')[3] || '';

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getSnapshotPermissions);
  }, [queryClient, history]);

  const { setSnapshotPermission, isLoading, error, isSuccess, reset } =
    Hooks.useSetSnapshotPermission(snapshotIdFromLocation);

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    snapshotId: Yup.string().required('Snapshot ID is required'),
    username: Yup.string().required('Username is required'),
    permissionLevel: Yup.string().required('Permission level is required'),
  });

  const initialValues = {
    snapshotId: snapshotIdFromLocation,
    username: '',
    permissionLevel: '',
  };

  const onSubmit = (
    {
      snapshotId,
      username,
      permissionLevel,
    }: { snapshotId: string; username: string; permissionLevel: string },
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
    setSnapshotPermission(
      { snapshotId, setPermission: { user: username, level: permissionLevel } },
      { onSuccess }
    );
    resetForm();
    setFieldValue('snapshotId', '');
    setTouched({
      snapshotId: false,
      username: false,
      permissionLevel: false,
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Set Snapshot Permission"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="setSnapshotPermission-form">
                <FormikSelect
                  name="snapshotId"
                  description="The snapshot id"
                  label="Snapshot ID"
                  required={true}
                  data-testid="snapshotId"
                >
                  <option disabled value={''}>
                    Select a snapshot
                  </option>
                  {snapshots.length ? (
                    snapshots.map((snapshot) => {
                      return (
                        <option key={snapshot.snapshot_id}>
                          {snapshot.snapshot_id}
                        </option>
                      );
                    })
                  ) : (
                    <i>No snapshots found</i>
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
          success={isSuccess ? `Successfully set snapshot permission` : ''}
          reverse={true}
        >
          <Button
            form="setSnapshotPermission-form"
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

export default SnapshotPermissionModal;
