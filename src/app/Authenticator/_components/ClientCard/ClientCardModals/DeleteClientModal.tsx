import { Button } from 'reactstrap';
import { Authenticator, Systems } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { Form, Formik } from 'formik';
import { FormikSelect } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './DeleteClientModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Authenticator as Hooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import {
  useDeleteClients,
  useListClients,
} from '@tapis/tapisui-hooks/dist/authenticator';
import { ToolbarModalProps } from 'app/Systems/_components/SystemToolbar/SystemToolbar';

type DeleteClientModalProps = {
  client: Authenticator.Client;
  toggle: () => void;
};

const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  client,
  toggle,
}) => {
  const { claims, accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listClients);
  }, [queryClient]);

  const { deleteClients, isLoading, error, isSuccess, reset } =
    useDeleteClients();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    clientId: Yup.string(),
  });

  const initialValues = {
    clientId: client.client_id!,
  };

  const onSubmit = ({ clientId }: { clientId: string }) => {
    deleteClients(clientId, {
      onSuccess: () => {
        onSuccess();
        toggle();
      },
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Client"
      body={
        <div className={styles['modal-settings']}>
          <Formik<{ clientId: string }>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="newclient-form">
              <FormikSelect
                name="clientId"
                description="The client id"
                label="Client ID"
                required={true}
                data-testid="clientId"
              >
                <option disabled selected value={client.client_id}>
                  {client.client_id}
                </option>
              </FormikSelect>
            </Form>
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully deleted a client` : ''}
          reverse={true}
        >
          <Button
            form="newclient-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Delete client
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteClientModal;
