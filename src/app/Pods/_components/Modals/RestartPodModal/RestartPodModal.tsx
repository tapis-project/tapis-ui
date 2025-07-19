import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../ToolbarModalProps';
import { Form, Formik } from 'formik';
import { FormikSelect } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './RestartPodModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { useTapisConfig, Pods as Hooks } from '@tapis/tapisui-hooks';
import { useLocation } from 'react-router-dom';
import { Switch, FormControlLabel, FormHelperText } from '@mui/material';
import { sortPodsById } from '../../Wizards/PodWizardUtils';

const RestartPodModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { claims } = useTapisConfig();
  const effectiveUserId = claims['tapis/username'];
  const { data } = Hooks.useListPods(); //{search: `owner.like.${''}`,}
  const pods: Array<Pods.PodResponseModel> = data?.result ?? [];

  //Allows the pod list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const { restartPod, isLoading, error, isSuccess, reset } =
    Hooks.useRestartPod();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    podId: Yup.string().required('Select which pod to restart'),
    grabLatestTemplateTag: Yup.boolean(),
  });

  const podId = useLocation().pathname.split('/')[2];
  var initialPodId = podId ? podId : '';
  const initialValues = {
    podId: initialPodId,
    grabLatestTemplateTag: false,
  };

  const onSubmit = ({
    podId,
    grabLatestTemplateTag,
  }: {
    podId: string;
    grabLatestTemplateTag: boolean;
  }) => {
    restartPod({ podId, grabLatestTemplateTag }, { onSuccess });
  };

  const sortedPods = sortPodsById(pods);

  return (
    <GenericModal
      toggle={toggle}
      title="Restart Pod"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, errors, touched }) => {
              const selectedPod = pods.find(
                (pod) => pod.pod_id === values.podId
              );
              const hasTemplate = selectedPod && selectedPod.template;
              let templateInfo = '';
              if (hasTemplate) {
                templateInfo = `Pod '${
                  selectedPod.pod_id
                }' is using template:tag@version of:\n ${
                  selectedPod.template || ''
                }`;
              }
              return (
                <Form id="newpod-form">
                  <FormikSelect
                    name="podId"
                    description="The pod id"
                    label="Pod ID"
                    required={true}
                    data-testid="podId"
                  >
                    <option disabled value={''}>
                      Select a pod to restart
                    </option>
                    {pods.length ? (
                      sortedPods.map((pod) => {
                        return <option key={pod.pod_id}>{pod.pod_id}</option>;
                      })
                    ) : (
                      <i>No pods found</i>
                    )}
                  </FormikSelect>
                  {hasTemplate && (
                    <>
                      <div
                        style={{
                          marginTop: 8,
                          marginBottom: 8,
                          fontSize: '0.95em',
                          color: '#555',
                        }}
                      >
                        {templateInfo}
                      </div>
                      <div style={{ marginTop: 8, marginLeft: 0 }}>
                        {touched.grabLatestTemplateTag &&
                          errors.grabLatestTemplateTag && (
                            <FormHelperText error>
                              {errors.grabLatestTemplateTag}
                            </FormHelperText>
                          )}
                        <FormControlLabel
                          labelPlacement="start"
                          control={
                            <Switch
                              checked={values.grabLatestTemplateTag}
                              onChange={(_, checked) =>
                                setFieldValue('grabLatestTemplateTag', checked)
                              }
                              name="grabLatestTemplateTag"
                              color="primary"
                            />
                          }
                          label="Fetch latest version of template tag."
                        />
                      </div>
                    </>
                  )}
                </Form>
              );
            }}
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully restarted a pod` : ''}
          reverse={true}
        >
          <Button
            form="newpod-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Restart pod
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default RestartPodModal;
