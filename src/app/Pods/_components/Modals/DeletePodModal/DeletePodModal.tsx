import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../../PodToolbar/PodToolbar';
import { Form, Formik } from 'formik';
import { FormikSelect } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './DeletePodModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useLocation } from 'react-router-dom';

const DeletePodModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { claims } = useTapisConfig();
  const effectiveUserId = claims['tapis/username'];
  const { data } = Hooks.useListPods(); //{search: `owner.like.${''}`,}
  const pods: Array<Pods.PodResponseModel> = data?.result ?? [];

  //Allows the pod list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const { deletePod, isLoading, error, isSuccess, reset } =
    Hooks.useDeletePod();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    podId: Yup.string(),
  });

  const podId = useLocation().pathname.split('/')[2];
  // If location podId is not in pods, use empty string
  //const initialPodId = podId && pods.some((pod) => pod.pod_id === podId) ? podId : '';
  var initialPodId = podId ? podId : '';
  const initialValues = {
    podId: pods.length === 0 ? '' : initialPodId,
  };
  // console.log('podId', podId);
  // console.log('initialPodId', initialPodId);

  const onSubmit = (
    values: { podId: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    deletePod({ podId: values.podId }, { onSuccess });
    window.location.href = `/#/pods`;
    resetForm();
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Pod"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
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
                  {pods.length === 0 ? (
                    <option disabled value={''} key="no-pods">
                      No pods found
                    </option>
                  ) : (
                    <>
                      <option disabled value={''} key="default">
                        Select a pod to delete
                      </option>
                      {pods.map((pod) => (
                        <option key={pod.pod_id} value={pod.pod_id}>
                          {pod.pod_id}
                        </option>
                      ))}
                    </>
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
