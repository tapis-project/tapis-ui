import { Button } from 'reactstrap';
import { GenericModal } from '../../../../ui';
import { SubmitWrapper } from '../../../../wrappers';
import { useEffect } from 'react';
import styles from './RemoveCredentialModal.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Alert, AlertTitle } from '@mui/material';
import { useQueryClient } from 'react-query';

const RemoveCredentialModal: React.FC<{
  toggle: () => void;
  open: boolean;
  systemId: string;
}> = ({ toggle, open, systemId }) => {
  const { remove, isLoading, error, isSuccess, reset } =
    Hooks.useRemoveCredential();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  if (!open) {
    return <></>;
  }

  const onSubmit = () => {
    remove(
      { systemId },
      {
        onSuccess: () => {
          // Clear cached file listing data so the auth check
          // (!!data from useList) sees undefined immediately.
          // We set query data to undefined rather than invalidating/resetting
          // because a refetch could still succeed temporarily for TMS_KEYS
          // systems where credential revocation is not instant.
          const queryCache = queryClient.getQueryCache();
          queryCache.findAll({
            predicate: (query) => {
              const key = query.queryKey;
              return Array.isArray(key) && key[0] === 'files/list';
            },
          }).forEach((query) => {
            queryClient.setQueryData(query.queryKey, undefined);
          });
        },
      }
    );
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Remove Credentials"
      body={
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <Alert severity="warning">
            <AlertTitle>Remove Credentials</AlertTitle>
            This will remove all stored credentials for your user account on
            system <b>{systemId}</b> from the Security Kernel.
          </Alert>
          <Alert severity="error">
            <AlertTitle>Caution</AlertTitle>
            After removing credentials you will no longer be able to perform
            file operations or run jobs on this system until new credentials are
            registered.
          </Alert>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={
            isSuccess ? `Credentials removed for system ${systemId}` : ''
          }
          reverse={true}
        >
          <Button
            color="danger"
            onClick={onSubmit}
            disabled={isLoading || isSuccess}
            aria-label="Submit"
          >
            Remove Credentials
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default RemoveCredentialModal;
