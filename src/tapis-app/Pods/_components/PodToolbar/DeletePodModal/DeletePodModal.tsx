import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../PodToolbar';
import { Form, Formik } from 'formik';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { useDeletePod, useList } from 'tapis-hooks/pods';
import { useEffect, useCallback } from 'react';
import styles from './DeletePodModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { default as queryKeys } from 'tapis-hooks/pods/queryKeys';
import { useTapisConfig } from 'tapis-hooks';

const DeletePodModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { claims } = useTapisConfig();
  const effectiveUserId = claims['sub'].substring(
    0,
    claims['sub'].lastIndexOf('@')
  );
  const { data } = useList({ search: `owner.like.${effectiveUserId}` }); //{search: `owner.like.${''}`,}
  const pods: Array<Pods.PodResponseModel> = data?.result ?? [];

  //Allows the pod list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(queryKeys.list);
  }, [queryClient]);

  const { deletePod, isLoading, error, isSuccess, reset } = useDeletePod();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    podId: Yup.string(),
  });

  const initialValues = {
    podId: '',
  };

  const onSubmit = ({ podId }: { podId: string }) => {
    deletePod(podId, { onSuccess });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Pod"
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="newpod-form">
                <FormikSelect
                  name="podId"
                  description="The pod id"
                  label="Pod ID"
                  required={true}
                  data-testid="podId"
                >
                  <option disabled value={''}>
                    Select a pod to delete
                  </option>
                  {pods.length ? (
                    pods.map((pod) => {
                      return <option>{pod.pod_id}</option>;
                    })
                  ) : (
                    <i>No pods found</i>
                  )}
                </FormikSelect>
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
          success={isSuccess ? `Successfully deleted a pod` : ''}
          reverse={true}
        >
          <Button
            form="newpod-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Delete pod
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default DeletePodModal;
