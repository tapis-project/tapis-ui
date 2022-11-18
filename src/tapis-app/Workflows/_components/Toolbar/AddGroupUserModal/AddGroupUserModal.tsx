import React, { useCallback } from 'react';
import { GenericModal, SectionMessage } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput } from 'tapis-ui/_common';
import { focusManager } from 'react-query';
import * as Yup from 'yup';

type AddGroupUserModalProps = {
  toggle: () => void;
  groupId?: string;
};

const AddGroupUserModal: React.FC<AddGroupUserModalProps> = ({
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
      title="Create User"
      body={
        <div>
          {groupId ? (
            <Formik
              initialValues={{}}
              // validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              <Form id="newgroupuser-form">
                <FormikInput
                  name="username"
                  label="Username"
                  required={true}
                  description={`Creates a user for group ${groupId}`}
                  aria-label="Input"
                />
              </Form>
            </Formik>
          ) : (
            <SectionMessage type="error">Error: <i>groupId</i> not found</SectionMessage>
          )}
        </div>
      }
      footer={
        groupId && (
          <SubmitWrapper
            isLoading={false}
            error={null}
            success={false ? `Successfully added user` : ''}
            reverse={true}
          >
            <Button
              form="newgroupuser-form"
              color="primary"
              disabled={false}
              aria-label="Submit"
              type="submit"
            >
              Create User
            </Button>
          </SubmitWrapper>
        )
      }
    />
  );
};

export default AddGroupUserModal;
