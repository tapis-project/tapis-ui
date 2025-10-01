import React, { useEffect, useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../../PodToolbar/PodToolbar';
import { Form, Formik } from 'formik';
import { FormikSelect } from '@tapis/tapisui-common';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useLocation } from 'react-router-dom';
import { updateState, useAppDispatch } from '@redux';
import { Tooltip, TextField, Typography } from '@mui/material';
import { FMTextField } from '@tapis/tapisui-common';
import styles from './DeletePodModal.module.scss';
import * as Yup from 'yup';
import { sortPodsById } from '../../Wizards/PodWizardUtils';

const DeletePodModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { claims } = useTapisConfig();
  const effectiveUserId = claims['tapis/username'];
  const { data } = Hooks.useListPods();
  const pods: Array<Pods.PodResponseModel> = data?.result ?? [];
  const dispatch = useAppDispatch();
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
    podId: Yup.string().required('Pod ID is required'),
  });

  const podId = useLocation().pathname.split('/')[2];
  var initialPodId = podId ? podId : '';
  const [confirmText, setConfirmText] = useState('');
  const [selectedPodId, setSelectedPodId] = useState(initialPodId);
  const initialValues = {
    podId: pods.length === 0 ? '' : initialPodId,
  };

  const onSubmit = (
    values: { podId: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    deletePod({ podId: values.podId }, { onSuccess });
    window.location.href = `/#/pods`;
    dispatch(updateState({ podRootTab: 'dashboard' }));
    setConfirmText('');
    resetForm();
  };

  const sortedPods = sortPodsById(pods);

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
            {(formik) => (
              <Form id="newpod-form">
                <FormikSelect
                  name="podId"
                  description="The pod id"
                  label="Pod ID"
                  required={true}
                  data-testid="podId"
                  value={selectedPodId}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                    formik.handleChange(e);
                    setSelectedPodId(e.target.value as string);
                    setConfirmText('');
                  }}
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
                      {sortedPods.map((pod) => (
                        <option key={pod.pod_id} value={pod.pod_id}>
                          {pod.pod_id}
                        </option>
                      ))}
                    </>
                  )}
                </FormikSelect>
                {selectedPodId && (
                  <>
                    <Typography variant="body1" className={styles['pod-info']}>
                      <span>
                        Confirm pod_id of <strong>{selectedPodId}</strong>{' '}
                        before deletion:
                      </span>
                      <br />
                      <br />
                    </Typography>
                    <FMTextField
                      formik={formik}
                      name="confirmText"
                      label={`Type ${selectedPodId}`}
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      disabled={!selectedPodId}
                      description="Pod deletion cannot be undone."
                      variant="filled"
                    />
                  </>
                )}
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
          <Tooltip
            title={
              confirmText !== selectedPodId
                ? 'Confirm the pod_id in order to delete it.'
                : ''
            }
            placement="top"
            arrow
            disableHoverListener={confirmText === selectedPodId}
          >
            <span>
              <Button
                form="newpod-form"
                color="primary"
                disabled={
                  isLoading ||
                  isSuccess ||
                  !selectedPodId ||
                  confirmText !== selectedPodId
                }
                aria-label="Submit"
                type="submit"
              >
                Delete pod
              </Button>
            </span>
          </Tooltip>
        </SubmitWrapper>
      }
    />
  );
};

export default DeletePodModal;
