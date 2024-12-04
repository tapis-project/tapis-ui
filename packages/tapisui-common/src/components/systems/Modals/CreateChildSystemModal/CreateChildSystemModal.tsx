import { Button } from 'reactstrap';
import { GenericModal } from '../../../../ui';
import { SubmitWrapper } from '../../../../wrappers';
import { Form, Formik } from 'formik';
import { FormikInput } from '../../../../ui-formik/FieldWrapperFormik/fields';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { useEffect } from 'react';
import styles from './CreateChildSystemModal.module.scss';
import * as Yup from 'yup';
import { Systems } from '@tapis/tapis-typescript';

const CreateChildSystemModal: React.FC<{
  system: Systems.TapisSystem;
  open: boolean;
  toggle: () => void;
}> = ({ open, toggle, system }) => {
  if (!open) {
    return <></>;
  }
  const { isLoading, isSuccess, error, reset, createChildSystem } =
    Hooks.useCreateChildSystem();
  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    systemId: Yup.string()
      .min(1)
      .max(80, 'System id should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('System id is a required field'),
    rootDir: Yup.string()
      .min(1)
      .max(4096, 'Root Directory should not be longer than 4096 characters'),
    effectiveUserId: Yup.string()
      .max(60, 'Effective User ID should not be longer than 60 characters')
      .required('Effective User ID is a required field'),
    parentId: Yup.string().required('Parent ID is a required field'),
  });

  const initialValues = {
    systemId: '',
    rootDir: system.rootDir ?? '',
    effectiveUserId: system.isDynamicEffectiveUser
      ? '${apiUserId}'
      : system.effectiveUserId!,
    parentId: system.id!,
  };

  const onSubmit = ({
    systemId,
    rootDir,
    effectiveUserId,
    parentId,
  }: {
    systemId: string;
    rootDir: string;
    effectiveUserId: string;
    parentId: string;
  }) => {
    createChildSystem(
      {
        id: systemId,
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
                  name="systemId"
                  label="System Id"
                  required={true}
                  description={`A unique identifier for this child system`}
                  aria-label="Input"
                />
                <FormikInput
                  name="effectiveUserId"
                  label="Effective User Id"
                  required={true}
                  description={
                    "Effective User Id is the user that Tapis will use to perform operations on your systems host. A value of '${apiUserId}' which resolves to the username of the user making the request"
                  }
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
