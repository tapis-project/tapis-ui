import { Button } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../JobsLayoutToolbar';
import { Formik, Form } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { useEffect } from 'react';
import styles from './UnhideJobModal.module.scss';
import * as Yup from 'yup';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';

const UnhideJobModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { unhideJob, isLoading, error, isSuccess, reset } =
    Hooks.useUnhideJob();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    jobUuid: Yup.string(),
  });

  const initialValues = {
    jobUuid: '',
  };

  const onSubmit = ({ jobUuid }: { jobUuid: string }) => {
    unhideJob(jobUuid);
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Unhide a Job"
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="unhideJob-form">
              <FormikInput
                name="jobUuid"
                label="Job Uuid"
                required={true}
                description={`Job Uuid`}
                aria-label="Input"
              />
            </Form>
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully unhid a job` : ''}
          reverse={true}
        >
          <Button
            form="unhideJob-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Unhide job
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UnhideJobModal;
