import { Button, Input, FormGroup, Label } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { useEffect, useCallback, useState } from 'react';
import styles from './CreateClientModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Authenticator as Hooks } from '@tapis/tapisui-hooks';
import { ToolbarModalProps } from '../../AuthenticatorToolbar/ClientToolbar';

const CreateClientModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listClients);
  }, [queryClient]);

  const { createClient, isLoading, error, isSuccess, reset } =
    Hooks.useCreateClient();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    client_id: Yup.string()
      .min(1)
      .max(80, 'Client name should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Only alphanumeric characters, '.', '_', '-' are allowed"
      ),
    description: Yup.string().max(
      2048,
      'Description should not be longer than 2048 characters'
    ),
    callback_url: Yup.string()
      .max(2048, 'Callback URL should not exceed 2048 characters')
      .matches(/^https:\/\//, 'Callack URL must start with https://'),
    display_name: Yup.string().max(
      2048,
      'Display name should not exceed 2048 characters'
    ),
    client_key: Yup.string().max(
      2048,
      'Client key should not exceed 2048 characters'
    ),
  });

  const initialValues = {
    client_id: undefined,
    description: undefined,
    callback_url: undefined,
    display_name: undefined,
    client_key: undefined,
  };

  const onSubmit = ({
    client_id,
    description,
    callback_url,
    display_name,
    client_key,
  }: typeof initialValues) => {
    const normalizedUrl =
      callback_url && !/^https?:\/\//i.test(callback_url)
        ? `https://${callback_url}`
        : callback_url;
    createClient(
      {
        client_id,
        description,
        callback_url: normalizedUrl,
        display_name,
        client_key,
      },
      { onSuccess }
    );
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Create New Client"
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
                  name="client_id"
                  label="Client Name"
                  description="Client name"
                  required={false}
                />
                <FormikInput
                  name="description"
                  label="Description"
                  description="Client description"
                  required={false}
                />
                <FormikInput
                  name="callback_url"
                  label="Callback URL"
                  description="The client callback URL"
                  required={false}
                />
                <FormikInput
                  name="display_name"
                  label="Display Name"
                  description="The display name shown to users"
                  required={false}
                />
                <FormikInput
                  name="client_key"
                  label="Client Key"
                  description="The unique key for the client"
                  required={false}
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
          success={isSuccess ? 'Successfully created a new client' : ''}
          reverse
        >
          <Button
            form="newsystem-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Client
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateClientModal;
