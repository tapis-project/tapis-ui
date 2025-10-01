import { Button, Input, FormGroup, Label } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { useEffect, useCallback, useState } from 'react';
import styles from './CreateClientModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Authenticator as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { ToolbarModalProps } from '../../AuthenticatorToolbar/ClientToolbar';
import { Authenticator } from '@tapis/tapis-typescript';
import { useUpdateClient } from '@tapis/tapisui-hooks/dist/authenticator';

type UpdateClientModalProps = {
  client: Authenticator.Client;
  toggle: () => void;
};

const UpdateClientModal: React.FC<UpdateClientModalProps> = ({
  toggle,
  client,
}) => {
  const { claims, accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listClients);
  }, [queryClient]);

  const { updateClient, isLoading, error, isSuccess, reset } =
    useUpdateClient();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    clientId: Yup.string(),
    callback_url: Yup.string(),
    display_name: Yup.string(),
  });

  const initialValues = {
    clientId: client.client_id!,
    callback_url: client.callback_url!,
    display_name: client.display_name!,
  };

  const onSubmit = (values: {
    clientId: string;
    callback_url: string;
    display_name: string;
  }) => {
    updateClient(
      {
        clientId: values.clientId,
        callback_url: values.callback_url,
        display_name: values.display_name,
      },
      {
        onSuccess: () => {
          onSuccess();
          toggle();
        },
      }
    );
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Update Client"
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
          success={isSuccess ? 'Successfully updated the client' : ''}
          reverse
        >
          <Button
            form="newsystem-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Update Client
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UpdateClientModal;
