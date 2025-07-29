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
import {
  useListClients,
  useUpdateClient,
} from '@tapis/tapisui-hooks/dist/authenticator';
import { Edit, Hub, Visibility } from '@mui/icons-material';
import { Divider } from '@mui/material';

type ClientDetailModal = {
  client: Authenticator.Client;
  toggle: () => void;
};

const ClientDetailModal: React.FC<ClientDetailModal> = ({ toggle, client }) => {
  const { claims, accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listClients);
  }, [queryClient]);

  const { data, isLoading, error, isSuccess } = useListClients();

  return (
    <GenericModal
      toggle={toggle}
      title="Client Details"
      body={
        <div className={styles['modal-settings']}>
          <div className={styles['card-line']}>
            <span className={styles['muted']}>client_id: </span>
            <span>{client.client_id}</span>
          </div>
          <div className={styles['card-line']}>
            <span className={styles['muted']}>client_key: </span>
            <span>{client.client_key}</span>
          </div>
          <div className={styles['card-line']}>
            <span className={styles['muted']}>callback_url: </span>
            <span>{client.callback_url}</span>
          </div>
          <div className={styles['card-line']}>
            <span className={styles['muted']}>description: </span>
            <span>{client.description}</span>
          </div>
          <div className={styles['card-line']}>
            <span className={styles['muted']}>last update: </span>
            <span>{client.last_update_time}</span>
          </div>
          <div className={styles['card-line']}>
            <span className={styles['muted']}>created: </span>
            <span>{client.create_time}</span>
          </div>
        </div>
      }
    />
  );
};

export default ClientDetailModal;
