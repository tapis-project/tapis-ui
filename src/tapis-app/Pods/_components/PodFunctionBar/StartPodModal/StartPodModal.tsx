import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../PodFunctionBar';
import { Form, Formik } from 'formik';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { useStartPod, useList } from 'tapis-hooks/pods';
import { useEffect, useCallback } from 'react';
import styles from './StartPodModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { default as queryKeys } from 'tapis-hooks/pods/queryKeys';
import { useTapisConfig } from 'tapis-hooks';
import { useLocation } from 'react-router-dom';

const StartPodModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
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

  const { startPod, isLoading, error, isSuccess, reset } = useStartPod();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    podId: Yup.string().required('Required'),
  });

  const podId = useLocation().pathname.split('/')[2];

  const initialValues = {
    podId: podId,
  };

  const onSubmit = ({ podId }: { podId: string }) => {
    startPod(podId, { onSuccess });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Start Pod"
      backdrop={true}
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
                    Select a pod to start
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
          success={isSuccess ? `Successfully started a pod` : ''}
          reverse={true}
        >
          <Button
            form="newpod-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Start pod
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default StartPodModal;
