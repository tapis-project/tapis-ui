import { Button } from 'reactstrap';
import { GenericModal } from '../../../../ui';
import { SubmitWrapper } from '../../../../wrappers';
import { useEffect } from 'react';
import styles from './UnShareSystemPublicModal.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Alert, AlertTitle } from '@mui/material';
import { Systems } from '@tapis/tapis-typescript';

const UnShareSystemPublicModal: React.FC<{
  system: Systems.TapisSystem;
  toggle: () => void;
  open: boolean;
}> = ({ toggle, open, system }) => {
  if (!open) {
    return <></>;
  }
  const queryString = window.location.href;
  const systemId = queryString.substring(queryString.indexOf('systems/') + 8);

  const { unShareSystemPublic, isLoading, error, isSuccess, reset } =
    Hooks.useUnShareSystemPublic();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    unShareSystemPublic(systemId);
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Make System Private"
      body={
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <Alert severity="info">
            <AlertTitle>Permissions Required</AlertTitle>
            Changing the visibility of a system requires <b>MODIFY</b>{' '}
            permissions
          </Alert>
          <Alert severity="warning">
            <AlertTitle>Visibility change</AlertTitle>
            Making a system private will prevent users from accessing or running
            jobs on this system unless the have been granted explicit permission
            to do so.
          </Alert>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `System ${system.id} is now private` : ''}
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
            Make private
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UnShareSystemPublicModal;
