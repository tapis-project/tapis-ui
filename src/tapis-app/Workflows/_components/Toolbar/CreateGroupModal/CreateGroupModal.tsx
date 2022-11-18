import React, { useCallback } from 'react';
import { GenericModal } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput } from 'tapis-ui/_common';
import { focusManager } from 'react-query';
import * as Yup from 'yup';

type CreateGroupModalProps = {
  toggle: () => void;
};

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ toggle }) => {
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
      title="Create Group"
      body={
        <div>
          <Formik
            initialValues={{}}
            // validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="newgroup-form">
              <FormikInput
                name="groupid"
                label="Group ID"
                required={true}
                description={`Creates a new group`}
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
          success={false ? `Successfully created group` : ''}
          reverse={true}
        >
          <Button
            form="newgroup-form"
            color="primary"
            disabled={false}
            aria-label="Submit"
            type="submit"
          >
            Create Group
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateGroupModal;
