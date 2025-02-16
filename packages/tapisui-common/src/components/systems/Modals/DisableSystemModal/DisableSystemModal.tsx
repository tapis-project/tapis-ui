import { Button } from 'reactstrap';
import { GenericModal } from '../../../../ui';
import { SubmitWrapper } from '../../../../wrappers';
import { useEffect } from 'react';
import styles from './DisableSystemModal.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { useDisableSystem } from '@tapis/tapisui-hooks/dist/systems';
import { Systems } from '@tapis/tapis-typescript';
import { Alert, AlertTitle } from '@mui/material';

const DisableSystemModal: React.FC<{
  toggle: () => void;
  open: boolean;
  systemId: string;
}> = ({ toggle, open, systemId }) => {
  if (!open) {
    return <></>;
  }

  const { disable, isLoading, error, isSuccess, reset } = useDisableSystem({
    systemId,
  });

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    disable({ systemId });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Disable System"
      body={
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <Alert severity="info">
            <AlertTitle>Permissions Required</AlertTitle>
            Changing the visibility of a system requires <b>MODIFY</b>{' '}
            permissions
          </Alert>
          <Alert severity="warning">
            <AlertTitle>Visibility Change</AlertTitle>
            Disabling a system will make it invisible and unusable to every user
            on this tenant.
          </Alert>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `System ${systemId} is now disabled` : ''}
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
            Disable System
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default DisableSystemModal;
