import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal, FormikInput } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../ToolbarModalProps';
import { Form, Formik } from 'formik';
import { FormikSelect } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './SavePodAsTagModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useLocation } from 'react-router-dom';
import { sortPodsById } from '../../Wizards/PodWizardUtils';

const SavePodAsTagModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { claims } = useTapisConfig();
  const effectiveUserId = claims['tapis/username'];
  const { data } = Hooks.useListPods();
  const pods: Array<Pods.PodResponseModel> = data?.result ?? [];

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.savePodAsTag);
  }, [queryClient]);

  const { savePodAsTag, isLoading, error, isSuccess, reset } =
    Hooks.useSavePodAsTag();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    podId: Yup.string().required('Required'),
    template_id: Yup.string().required('Required'),
    tag_id: Yup.string().required('Required'),
    commit_message: Yup.string().required('Required'),
  });

  const podId = useLocation().pathname.split('/')[2];
  var initialPodId = podId ? podId : '';
  const initialValues = {
    podId: initialPodId,
    template_id: '',
    tag_id: '',
    commit_message: '',
  };

  const onSubmit = ({
    podId,
    template_id,
    tag_id,
    commit_message,
  }: {
    podId: string;
    template_id: string;
    tag_id: string;
    commit_message: string;
  }) => {
    savePodAsTag(
      {
        podIdNet: podId,
        newTemplateTagFromPod: {
          commit_message,
          tag: tag_id,
          template_id,
        },
      },
      { onSuccess }
    );
  };

  const sortedPods = sortPodsById(pods);

  return (
    <GenericModal
      toggle={toggle}
      title="Save Pod as Template Tag"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="savepodastag-form">
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
                  {sortedPods.length ? (
                    sortedPods.map((pod) => {
                      return <option key={pod.pod_id}>{pod.pod_id}</option>;
                    })
                  ) : (
                    <i>No pods found</i>
                  )}
                </FormikSelect>
                <FormikInput
                  name="template_id"
                  label="Template ID"
                  required={true}
                  data-testid="template_id"
                  description="The template id to save to"
                />
                <FormikInput
                  name="tag_id"
                  label="Tag ID"
                  required={true}
                  data-testid="tag_id"
                  description="The tag id to use for this template tag"
                />
                <FormikInput
                  name="commit_message"
                  label="Commit Message"
                  required={true}
                  data-testid="commit_message"
                  description="A commit message for this template tag"
                  rows={5}
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
          success={isSuccess ? `Successfully saved pod as template tag` : ''}
          reverse={true}
        >
          {isSuccess && data && (
            <Button
              color="secondary"
              aria-label="Visit Tag"
              type="button"
              style={{ marginRight: '1rem' }}
              onClick={() => {
                // Use data.result.template_id and data.result.tag to construct the link
                const result =
                  (data as unknown as Pods.TemplateTagResponse).result || {};
                const template_id = result.template_id || '';
                const tag = result.tag || '';
                // Split template_id if needed (e.g. postgres:14)
                let inp_template_id = '';
                let input_tag = '';
                if (template_id.includes(':')) {
                  [inp_template_id, input_tag] = template_id.split(':');
                } else {
                  inp_template_id = template_id;
                }
                // tag may be like 2025-07-12-16:41:56
                // Compose the tag path
                window.location.href = `/#/pods/templates/${inp_template_id}/tags/${
                  input_tag ? input_tag + '@' : ''
                }${tag}`;
              }}
            >
              Visit Tag
            </Button>
          )}
          <Button
            form="savepodastag-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Save as Tag
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default SavePodAsTagModal;
