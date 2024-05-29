import { useCallback } from 'react';
import { Button } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { focusManager } from 'react-query';
import { useEffect } from 'react';
import * as Yup from 'yup';

const CreateDirModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId,
  path,
}) => {
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const { mkdir, isLoading, error, isSuccess, reset } = Hooks.useMkdir();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    dirname: Yup.string()
      .min(1)
      .max(255, 'Directory name cannot be longer than 255 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('Directory name is a required field'),
  });

  const initialValues = {
    dirname: '',
  };

  const onSubmit = ({ dirname }: { dirname: string }) =>
    mkdir(systemId ?? '', `${path ?? '/'}${dirname}`, { onSuccess });

  return (
    <GenericModal
      toggle={toggle}
      title="Create Directory"
      body={
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="newdirectory-form">
              <FormikInput
                name="dirname"
                label="Directory name"
                required={true}
                description={`Creates a directory in ${systemId}/${path}`}
                aria-label="Input"
              />
            </Form>
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created directory` : ''}
          reverse={true}
        >
          <Button
            form="newdirectory-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create directory
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateDirModal;
