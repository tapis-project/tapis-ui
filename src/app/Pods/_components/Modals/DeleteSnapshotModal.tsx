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

const DeleteSnapshotModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { data } = Hooks.useListSnapshots(); //{search: `owner.like.${''}`,}
  const snapshots: Array<Pods.SnapshotResponseModel> = data?.result ?? [];

  // Allows the pod list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listSnapshots);
    history.push('/pods/snapshots');
    dispatch(updateState({ snapshotRootTab: 'dashboard' }));
  }, [queryClient, history]);

  const { deleteSnapshot, isLoading, error, isSuccess, reset } =
    Hooks.useDeleteSnapshot();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    snapshotId: Yup.string().required('Snapshot ID is required'),
    confirmSnapshotName: Yup.string()
      .oneOf([Yup.ref('snapshotId'), null], 'Snapshot name must match')
      .required('Please confirm the snapshot name'),
  });

  const location = useLocation();
  const snapshotIdFromLocation = location.pathname.split('/')[3] || '';

  const initialValues = {
    snapshotId: snapshotIdFromLocation,
    confirmSnapshotName: '',
  };

  const onSubmit = (
    { snapshotId }: { snapshotId: string },
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
    deleteSnapshot({ snapshotId }, { onSuccess });
    resetForm();
    setFieldValue('snapshotId', '');
    setTouched({
      snapshotId: false,
      confirmSnapshotName: false,
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Snapshot"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="deleteSnapshot-form">
                <FormikSelect
                  name="snapshotId"
                  description="The snapshot id"
                  label="Snapshot ID"
                  required={true}
                  data-testid="snapshotId"
                >
                  <option disabled value={''}>
                    Select a snapshot to delete
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
                  name="confirmSnapshotName"
                  label="Confirm Snapshot Name"
                  description="Please type the snapshot name to confirm"
                  required={true}
                  data-testid="confirmSnapshotName"
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
          success={isSuccess ? `Successfully deleted a snapshot` : ''}
          reverse={true}
        >
          <Button
            form="deleteSnapshot-form"
            color="primary"
            disabled={isLoading}
            aria-label="Submit"
            type="submit"
          >
            Delete snapshot
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteSnapshotModal;
