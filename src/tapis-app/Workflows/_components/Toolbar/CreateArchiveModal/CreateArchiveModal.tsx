import React, { useCallback } from 'react';
import { GenericModal } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput } from 'tapis-ui/_common';
import { focusManager } from 'react-query';
import * as Yup from 'yup';

type CreateArchiveModalProps = {
  toggle: () => void;
  groupId?: string;
};

const CreateArchiveModal: React.FC<CreateArchiveModalProps> = ({
  toggle,
  groupId,
}) => {
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onSubmit = () => {
    alert('subitted');
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Create Archive"
      body={
        <div>
          <Formik
            initialValues={{}}
            // validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="newarchive-form">
              <FormikInput
                name="archiveId"
                label="Archive name"
                required={true}
                description={`Creates a archive for group ${groupId}`}
                aria-label="Input"
              />
            </Form>
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={false}
          error={null}
          success={false ? `Successfully created archive` : ''}
          reverse={true}
        >
          <Button
            form="newarchive-form"
            color="primary"
            disabled={false}
            aria-label="Submit"
            type="submit"
          >
            Create Archive
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateArchiveModal;
