import { Button } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../SystemLayoutToolbar';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CreateChildSystemModal.module.scss';
import * as Yup from 'yup';

const CreateChildSystemModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { isLoading, isSuccess, error, reset, createChildSystem } =
    Hooks.useCreateChildSystem();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    sysname: Yup.string()
      .min(1)
      .max(80, 'System name should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('System name is a required field'),
    rootDir: Yup.string()
      .min(1)
      .max(4096, 'Root Directory should not be longer than 4096 characters'),
    effectiveUserId: Yup.string()
      .max(60, 'Effective User ID should not be longer than 60 characters')
      .required('Effective User ID is a required field'),
    parentId: Yup.string().required('Parent ID is a required field'),
  });

  const initialValues = {
    sysname: '',
    rootDir: '/',
    effectiveUserId: useTapisConfig().claims['tapis/username'],
    parentId: String(useLocation().pathname.split('/').pop()),
  };

  const onSubmit = ({
    sysname,
    rootDir,
    effectiveUserId,
    parentId,
  }: {
    sysname: string;
    rootDir: string;
    effectiveUserId: string;
    parentId: string;
  }) => {
    createChildSystem(
      {
        id: sysname,
        effectiveUserId,
        rootDir,
      },
      parentId
    );
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Create New Child System"
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="newsystem-form">
                <FormikInput
                  name="sysname"
                  label="System Name"
                  required={true}
                  description={`System Name`}
                  aria-label="Input"
                />
                <FormikInput
                  name="effectiveUserId"
                  label="Effective User ID"
                  required={true}
                  description={`Effective User ID`}
                  aria-label="Input"
                />
                <FormikInput
                  name="rootDir"
                  label="Root Directory"
                  required={true}
                  description={`Root Directory`}
                  aria-label="Input"
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
          success={isSuccess ? `Successfully created a new child system` : ''}
          reverse={true}
        >
          <Button
            form="newsystem-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create a new child system
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateChildSystemModal;
