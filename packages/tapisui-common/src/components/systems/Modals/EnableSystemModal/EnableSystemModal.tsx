import { Button } from 'reactstrap';
import { GenericModal } from '../../../../ui';
import { SubmitWrapper } from '../../../../wrappers';
import { useEffect } from 'react';
import styles from './EnableSystemModal.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { Alert, AlertTitle } from '@mui/material';

const EnableSystemModal: React.FC<{
  toggle: () => void;
  open: boolean;
  systemId: string;
}> = ({ toggle, open, systemId }) => {
  if (!open) {
    return <></>;
  }

  const { enable, isLoading, error, isSuccess, reset } = Hooks.useEnableSystem({
    systemId,
  });

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    enable({ systemId });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Enable System"
      body={
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <Alert severity="info">
            <AlertTitle>Permissions Required</AlertTitle>
            Changing the visibility of a system requires <b>MODIFY</b>{' '}
            permissions
          </Alert>
          <Alert severity="warning">
            <AlertTitle>Visibility Change</AlertTitle>
            Enabling a system will make it visible to every user on this tenant.
          </Alert>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `System ${systemId} is now enabled` : ''}
          reverse={true}
        >
          <Button
            form="newsystem-form"
            color="primary"
            onClick={onSubmit}
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Enable System
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default EnableSystemModal;
