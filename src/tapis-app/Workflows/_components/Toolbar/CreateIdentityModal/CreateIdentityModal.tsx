import React, { useCallback } from 'react';
import { GenericModal } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik } from 'formik';
import { FormikInput } from 'tapis-ui/_common';
import { focusManager } from 'react-query';

type CreateIdentityModalProps = {
  toggle: () => void;
  groupId?: string;
};

const CreateIdentityModal: React.FC<CreateIdentityModalProps> = ({ toggle, groupId }) => {
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
      title="Create Identity"
      body={
        <div>
          <Formik
            initialValues={{}}
            // validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="newidentity-form">
              <FormikInput
                name="identity"
                label="Identity"
                required={true}
                description={`Creates a new identity`}
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
          success={false ? `Successfully created identity` : ''}
          reverse={true}
        >
          <Button
            form="newidentity-form"
            color="primary"
            disabled={false}
            aria-label="Submit"
            type="submit"
          >
            Create Identity
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateIdentityModal;
